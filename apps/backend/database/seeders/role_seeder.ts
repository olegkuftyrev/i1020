import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Role from '#models/role'

export default class extends BaseSeeder {
  async run() {
    await Role.updateOrCreateMany('slug', [
      {
        name: 'Associate',
        slug: 'associate',
        description: 'Regular user',
      },
      {
        name: 'Manager',
        slug: 'manager',
        description: 'Store owners',
      },
      {
        name: 'Admin',
        slug: 'admin',
        description: 'God/root',
      },
    ])
  }
}
