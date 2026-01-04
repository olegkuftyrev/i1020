import { BaseCommand, args, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import User from '#models/user'

export default class ListUsers extends BaseCommand {
  static commandName = 'list:users'
  static description = 'List all users in the database'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    try {
      const users = await User.all()
      
      if (users.length === 0) {
        this.logger.info('No users found in the database')
        return
      }

      this.logger.info(`Found ${users.length} user(s):\n`)
      
      users.forEach((user) => {
        this.logger.info(`ID: ${user.id}`)
        this.logger.info(`Email: ${user.email}`)
        this.logger.info(`Full Name: ${user.fullName || 'N/A'}`)
        this.logger.info(`Created At: ${user.createdAt.toISO()}`)
        this.logger.info('---')
      })
    } catch (error: any) {
      this.logger.error(`Error: ${error.message}`)
      if (error.message.includes('relation "users" does not exist')) {
        this.logger.warn('Users table does not exist. Run migrations first: npm run db:migrate')
      }
    }
  }
}

