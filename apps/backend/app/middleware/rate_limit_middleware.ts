import { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

/**
 * Simple in-memory rate limiter
 * For production, use Redis-based solution
 */
class RateLimiter {
  private requests = new Map<string, { count: number; resetAt: number }>()

  check(key: string, config: RateLimitConfig): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now()
    const record = this.requests.get(key)

    if (!record || record.resetAt < now) {
      // New window
      this.requests.set(key, {
        count: 1,
        resetAt: now + config.windowMs,
      })
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetAt: now + config.windowMs,
      }
    }

    if (record.count >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: record.resetAt,
      }
    }

    record.count++
    this.requests.set(key, record)

    return {
      allowed: true,
      remaining: config.maxRequests - record.count,
      resetAt: record.resetAt,
    }
  }
}

const rateLimiter = new RateLimiter()

export default class RateLimitMiddleware {
  async handle(ctx: HttpContext, next: NextFn, options: RateLimitConfig) {
    const user = ctx.auth.user
    const key = user ? `user:${user.id}` : `ip:${ctx.request.ip()}`

    const result = rateLimiter.check(key, options)

    if (!result.allowed) {
      return ctx.response.tooManyRequests({
        message: 'Rate limit exceeded',
        retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
      })
    }

    // Add rate limit headers
    ctx.response.header('X-RateLimit-Limit', options.maxRequests.toString())
    ctx.response.header('X-RateLimit-Remaining', result.remaining.toString())
    ctx.response.header('X-RateLimit-Reset', new Date(result.resetAt).toISOString())

    await next()
  }
}

