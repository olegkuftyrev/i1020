import User from '#models/user'
import {
  updateProfileValidator,
  updatePasswordValidator,
  updateThemeValidator,
} from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import { errors } from '@vinejs/vine'

export default class ProfileController {
  /**
   * Show the profile settings page.
   */
  async show({ inertia }: HttpContext) {
    return inertia.render('settings/profile')
  }

  /**
   * Update user profile.
   */
  async update({ request, auth, response, session }: HttpContext) {
    try {
      const user = auth.user!

      // Validate request data
      const data = await request.validateUsing(updateProfileValidator)

      // Check if email is unique (excluding current user)
      if (data.email !== user.email) {
        const existingUser = await User.findBy('email', data.email)
        if (existingUser && existingUser.id !== user.id) {
          session.flash('errors', {
            email: 'This email is already taken.',
          })
          return response.redirect().back()
        }
      }

      // Update user
      user.name = data.name
      user.email = data.email
      if (data.role) {
        user.role = data.role
      }
      await user.save()

      session.flash('success', 'Profile updated successfully!')

      return response.redirect().back()
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        session.flash('errors', error.messages)
        return response.redirect().back()
      }

      session.flash('errors', {
        email: 'Something went wrong. Please try again.',
      })
      return response.redirect().back()
    }
  }

  /**
   * Update user password.
   */
  async updatePassword({ request, auth, response, session }: HttpContext) {
    try {
      const user = auth.user!

      // Validate request data
      const data = await request.validateUsing(updatePasswordValidator)

      // Update password (will be automatically hashed by withAuthFinder mixin)
      user.password = data.password
      await user.save()

      session.flash('success', 'Password updated successfully!')

      return response.redirect().back()
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        session.flash('errors', error.messages)
        return response.redirect().back()
      }

      session.flash('errors', {
        password: 'Something went wrong. Please try again.',
      })
      return response.redirect().back()
    }
  }

  /**
   * Update user theme.
   */
  async updateTheme({ request, auth, response, session }: HttpContext) {
    try {
      const user = auth.user!

      // Validate request data
      const data = await request.validateUsing(updateThemeValidator)

      // Update theme
      user.theme = data.theme
      await user.save()

      session.flash('success', 'Theme updated successfully!')

      return response.redirect().back()
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        session.flash('errors', error.messages)
        return response.redirect().back()
      }

      session.flash('errors', {
        theme: 'Something went wrong. Please try again.',
      })
      return response.redirect().back()
    }
  }
}
