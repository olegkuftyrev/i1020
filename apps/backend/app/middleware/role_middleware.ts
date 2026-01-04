import { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class RoleMiddleware {
  async handle(ctx: HttpContext, next: NextFn, options: { roles: string[] }) {
    await ctx.auth.check()
    const user = await ctx.auth.getUserOrFail()
    await user.load('roles')

    const userRoles = user.roles.map((role) => role.slug)
    const hasRequiredRole = options.roles.some((role) => userRoles.includes(role))

    if (!hasRequiredRole) {
      return ctx.response.forbidden({
        message: 'Insufficient permissions',
      })
    }

    await next()
  }
}

