import { BaseCommand, args, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import User from '#models/user'

export default class CreateUser extends BaseCommand {
  static commandName = 'create:user'
  static description = 'Create a new user'

  static options: CommandOptions = {
    startApp: true,
  }

  @args.string({ description: 'User email' })
  declare email: string

  @args.string({ description: 'User password' })
  declare password: string

  @flags.string({ description: 'User name', flagName: 'name' })
  declare name: string

  async run() {
    try {
      const user = await User.create({
        email: this.email,
        password: this.password,
        name: this.name || null,
      })

      this.logger.success('User created successfully!')
      this.logger.info(`ID: ${user.id}`)
      this.logger.info(`Email: ${user.email}`)
      this.logger.info(`Name: ${user.name || 'N/A'}`)
      this.logger.info(`Password: ${this.password}`)
    } catch (error: any) {
      if (error.code === '23505') {
        this.logger.error(`User with email "${this.email}" already exists`)
      } else {
        this.logger.error(`Error: ${error.message}`)
      }
    }
  }
}

