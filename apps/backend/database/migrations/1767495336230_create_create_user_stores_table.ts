import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_stores'

  async up() {
    if (await this.schema.hasTable(this.tableName)) {
      return
    }
    
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()
      table.string('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.string('store_id').notNullable().references('id').inTable('stores').onDelete('CASCADE')
      table.enum('role', ['ASSOCIATE', 'MANAGER', 'ADMIN']).defaultTo('ASSOCIATE').notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable()

      table.unique(['user_id', 'store_id'])
      table.index(['store_id', 'role'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
