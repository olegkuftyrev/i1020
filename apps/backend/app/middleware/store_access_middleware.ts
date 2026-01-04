import { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import Store from '#models/store'
import UserStore from '#models/user_store'
import storeCacheService from '#services/store_cache_service'

export default class StoreAccessMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    await ctx.auth.check()
    const user = await ctx.auth.getUserOrFail()
    await user.load('roles')

    const userRoles = user.roles.map((role) => role.slug)
    const isAdmin = userRoles.includes('admin')

    // Get store code from header
    const storeCode = ctx.request.header('x-store-code')

    if (!storeCode) {
      return ctx.response.badRequest({
        message: 'X-Store-Code header is required',
      })
    }

    // Resolve storeId from code (with caching)
    const store = await storeCacheService.getStoreByCode(storeCode)
    if (!store) {
      return ctx.response.notFound({
        message: 'Store not found',
      })
    }

    // Check access: admin has access to all stores, others need UserStore
    if (!isAdmin) {
      const userStore = await UserStore.query()
        .where('user_id', user.id)
        .where('store_id', store.id)
        .first()

      if (!userStore) {
        return ctx.response.forbidden({
          message: 'Access denied to this store',
        })
      }
    }

    // Attach store to context for use in controllers
    ctx.store = store
    ctx.storeId = store.id

    await next()
  }
}

declare module '@adonisjs/core/http' {
  interface HttpContext {
    store?: Store
    storeId?: string
  }
}

