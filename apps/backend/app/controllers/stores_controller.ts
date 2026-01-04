import { HttpContext } from '@adonisjs/core/http'
import Store from '#models/store'
import UserStore from '#models/user_store'
import { createStoreValidator, updateStoreValidator } from '#validators/store'
import storeCacheService from '#services/store_cache_service'
import auditService from '#services/audit_service'

export default class StoresController {
  /**
   * Get list of stores
   * - Associates: only stores they have access to via UserStore
   * - Managers: stores where they are MANAGER or ADMIN
   * - Admins: all stores
   */
  async index({ request, response, auth }: HttpContext) {
    await auth.check()
    const user = await auth.getUserOrFail()
    await user.load('roles')

    const userRoles = user.roles.map((role) => role.slug)
    const isAdmin = userRoles.includes('admin')

    let query = Store.query().preload('users')

    // Filter by role
    if (!isAdmin) {
      // Get stores where user has access via UserStore
      const userStoreIds = await UserStore.query()
        .where('user_id', user.id)
        .select('store_id')
      
      const storeIds = userStoreIds.map((us) => us.storeId)
      query = query.whereIn('id', storeIds)
    }

    // Pagination
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const stores = await query.paginate(page, limit)

    return response.ok(stores)
  }

  /**
   * Get single store
   */
  async show({ params, response, auth }: HttpContext) {
    await auth.check()
    const user = await auth.getUserOrFail()
    await user.load('roles')

    const store = await Store.findOrFail(params.id)
    await store.load('users')

    const userRoles = user.roles.map((role) => role.slug)
    const isAdmin = userRoles.includes('admin')
    
    // Check if user has access via UserStore
    const userStore = await UserStore.query()
      .where('user_id', user.id)
      .where('store_id', store.id)
      .first()

    if (!isAdmin && !userStore) {
      return response.forbidden({ message: 'Access denied' })
    }

    return response.ok(store)
  }

  /**
   * Create new store
   * Only managers and admins can create stores
   */
  async store({ request, response, auth }: HttpContext) {
    await auth.check()
    const user = await auth.getUserOrFail()
    await user.load('roles')

    const userRoles = user.roles.map((role) => role.slug)
    const isAdmin = userRoles.includes('admin')
    const isManager = userRoles.includes('manager')

    if (!isAdmin && !isManager) {
      return response.forbidden({ message: 'Only managers and admins can create stores' })
    }

    const payload = await createStoreValidator.validate(request.all())

    const store = await Store.create({
      code: payload.code,
      name: payload.name,
      timezone: payload.timezone || 'America/Los_Angeles',
      isActive: payload.isActive !== undefined ? payload.isActive : true,
    })

    // Create UserStore relationship with MANAGER role
    await UserStore.create({
      userId: user.id,
      storeId: store.id,
      role: isAdmin ? 'ADMIN' : 'MANAGER',
    })

    await store.load('users')

    // Invalidate cache
    storeCacheService.invalidate(store.code)

    // Audit log
    await auditService.log({
      storeId: store.id,
      userId: user.id,
      action: 'create',
      entity: 'Store',
      entityId: store.id,
    })

    return response.created(store)
  }

  /**
   * Update store
   * Only user with MANAGER or ADMIN role for this store, or global admin
   */
  async update({ params, request, response, auth }: HttpContext) {
    await auth.check()
    const user = await auth.getUserOrFail()
    await user.load('roles')

    const store = await Store.findOrFail(params.id)

    const userRoles = user.roles.map((role) => role.slug)
    const isAdmin = userRoles.includes('admin')
    
    const userStore = await UserStore.query()
      .where('user_id', user.id)
      .where('store_id', store.id)
      .first()

    const canUpdate = isAdmin || (userStore && ['MANAGER', 'ADMIN'].includes(userStore.role))

    if (!canUpdate) {
      return response.forbidden({ message: 'Only manager or admin can update store' })
    }

    const payload = await updateStoreValidator.validate(request.all())

    store.merge(payload)
    await store.save()
    await store.load('users')

    // Invalidate cache if code changed
    if (payload.code) {
      storeCacheService.invalidate(store.code)
    }

    // Audit log
    await auditService.log({
      storeId: store.id,
      userId: user.id,
      action: 'update',
      entity: 'Store',
      entityId: store.id,
      payload: payload,
    })

    return response.ok(store)
  }

  /**
   * Delete store
   * Only admin can delete
   */
  async destroy({ params, response, auth }: HttpContext) {
    await auth.check()
    const user = await auth.getUserOrFail()
    await user.load('roles')

    const store = await Store.findOrFail(params.id)

    const userRoles = user.roles.map((role) => role.slug)
    const isAdmin = userRoles.includes('admin')

    if (!isAdmin) {
      return response.forbidden({ message: 'Only admin can delete store' })
    }

    await store.delete()

    return response.ok({ message: 'Store deleted successfully' })
  }
}
