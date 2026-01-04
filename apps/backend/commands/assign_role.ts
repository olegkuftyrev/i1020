import { BaseCommand, args, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import User from '#models/user'
import Role from '#models/role'

export default class AssignRole extends BaseCommand {
  static commandName = 'assign:role'
  static description = 'Assign a role to a user'

  static options: CommandOptions = {
    startApp: true,
  }

  @args.string({ description: 'User email' })
  declare email: string

  @args.string({ description: 'Role slug (associate, manager, admin)' })
  declare roleSlug: string

  @flags.boolean({ description: 'Remove role instead of adding', flagName: 'remove' })
  declare remove: boolean

  async run() {
    try {
      const user = await User.findByOrFail('email', this.email)
      const role = await Role.findByOrFail('slug', this.roleSlug)

      await user.load('roles')

      if (this.remove) {
        const hasRole = user.roles.some((r) => r.slug === role.slug)
        if (!hasRole) {
          this.logger.error(`User "${this.email}" does not have role "${this.roleSlug}"`)
          return
        }
        await user.related('roles').detach([role.id])
        this.logger.success(`Role "${role.name}" removed from user "${this.email}"`)
      } else {
        const hasRole = user.roles.some((r) => r.slug === role.slug)
        if (hasRole) {
          this.logger.warning(`User "${this.email}" already has role "${this.roleSlug}"`)
          return
        }
        await user.related('roles').attach([role.id])
        this.logger.success(`Role "${role.name}" assigned to user "${this.email}"`)
      }

      await user.load('roles')
      this.logger.info(`Current roles: ${user.roles.map((r) => r.slug).join(', ')}`)
    } catch (error: any) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        this.logger.error(`User or role not found`)
      } else {
        this.logger.error(`Error: ${error.message}`)
      }
    }
  }
}
