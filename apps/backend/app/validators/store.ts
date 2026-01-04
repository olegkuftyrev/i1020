import vine from '@vinejs/vine'

export const createStoreValidator = vine.compile(
  vine.object({
    code: vine.string().minLength(1).maxLength(50),
    name: vine.string().minLength(2).maxLength(255),
    timezone: vine.string().maxLength(100).optional(),
    isActive: vine.boolean().optional(),
  })
)

export const updateStoreValidator = vine.compile(
  vine.object({
    code: vine.string().minLength(1).maxLength(50).optional(),
    name: vine.string().minLength(2).maxLength(255).optional(),
    timezone: vine.string().maxLength(100).optional(),
    isActive: vine.boolean().optional(),
  })
)
