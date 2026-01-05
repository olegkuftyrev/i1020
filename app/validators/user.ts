import vine from '@vinejs/vine'

export const userSchema = vine.object({
  name: vine.string().minLength(3).maxLength(50),
  email: vine.string().trim().email().unique({ table: 'users', column: 'email' }),
  password: vine.string().minLength(6).maxLength(32),
})

/**
 * Validator to validate the payload when creating
 * a new user.
 */
export const createUserValidator = vine.compile(userSchema)

/**
 * Validator to validate the payload when updating
 * an existing user.
 */
export const updateUserValidator = vine.compile(userSchema)

/**
 * Validator for updating user profile (without password)
 */
export const updateProfileSchema = vine.object({
  name: vine.string().minLength(3).maxLength(50),
  email: vine.string().trim().email(),
  role: vine.enum(['associate', 'manager', 'admin']),
})

export const updateProfileValidator = vine.compile(updateProfileSchema)

/**
 * Validator for updating user password
 */
export const updatePasswordSchema = vine.object({
  password: vine.string().minLength(6).maxLength(32),
  password_confirmation: vine.string().confirmed(),
})

export const updatePasswordValidator = vine.compile(updatePasswordSchema)

/**
 * Validator for updating user theme
 */
export const updateThemeSchema = vine.object({
  theme: vine.enum(['dark', 'light', 'system', 'iron-man']),
})

export const updateThemeValidator = vine.compile(updateThemeSchema)
