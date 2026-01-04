import { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { loginValidator, registerValidator } from '#validators/auth'

export default class AuthController {
  async register({ request, response, auth }: HttpContext) {
    const payload = await registerValidator.validate(request.all())
    
    const user = await User.create({
      email: payload.email,
      password: payload.password,
      fullName: payload.fullName,
    })

    await auth.use('web').login(user)

    return response.ok({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
    })
  }

  async login({ request, response, auth }: HttpContext) {
    const { email, password } = await loginValidator.validate(request.all())

    try {
      const user = await User.verifyCredentials(email, password)
      await auth.use('web').login(user)

      return response.ok({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
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
    
    const user = auth.getUserOrFail()

    return response.ok({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
    })
  }
}

