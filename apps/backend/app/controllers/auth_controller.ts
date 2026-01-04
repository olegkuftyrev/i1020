import { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Role from '#models/role'
import UserStore from '#models/user_store'
import { loginValidator, registerValidator } from '#validators/auth'

export default class AuthController {
  async register({ request, response, auth }: HttpContext) {
    const payload = await registerValidator.validate(request.all())
    
    const user = await User.create({
      email: payload.email,
      password: payload.password,
      name: payload.name,
    })

    // Assign associate role by default
    const associateRole = await Role.findByOrFail('slug', 'associate')
    await user.related('roles').attach([associateRole.id])

    await auth.use('web').login(user)

    return response.ok({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })
  }

  async login({ request, response, auth }: HttpContext) {
    const { email, password } = await loginValidator.validate(request.all())

    try {
      const user = await User.verifyCredentials(email, password)
      await user.load('roles')
      await auth.use('web').login(user)

      return response.ok({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          roles: user.roles.map((role) => ({
            id: role.id,
            name: role.name,
            slug: role.slug,
          })),
        },
      })
    } catch {
      return response.unauthorized({
        message: 'Invalid credentials',
      })
    }
  }

  async logout({ response, auth }: HttpContext) {
    await auth.use('web').logout()

    return response.ok({
      message: 'Logout successful',
    })
  }

  async me({ response, auth }: HttpContext) {
    await auth.check()
    
    const user = await auth.getUserOrFail()
    await user.load('roles')
    
    // Load user stores with store details
    const userStores = await UserStore.query()
      .where('user_id', user.id)
      .preload('store')

    // Ensure store is loaded for each userStore
    const storesData = await Promise.all(
      userStores.map(async (userStore) => {
        // If store is not loaded, load it
        if (!userStore.store) {
          await userStore.load('store')
        }
        
        return {
          id: userStore.id,
          storeId: userStore.storeId,
          role: userStore.role,
          store: userStore.store ? {
            id: userStore.store.id,
            code: userStore.store.code,
            name: userStore.store.name,
            timezone: userStore.store.timezone,
            isActive: userStore.store.isActive,
          } : null,
        }
      })
    )

    return response.ok({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles.map((role) => ({
          id: role.id,
          name: role.name,
          slug: role.slug,
        })),
        stores: storesData,
      },
    })
  }
}

