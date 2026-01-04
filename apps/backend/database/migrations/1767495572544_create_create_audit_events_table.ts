import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'audit_events'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()
      table.string('store_id').nullable().references('id').inTable('stores').onDelete('CASCADE')
      table.string('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.string('action', 50).notNullable() // 'create', 'update', 'delete', 'import', etc.
      table.string('entity', 50).notNullable() // 'PlReport', 'Setting', 'Store', etc.
      table.string('entity_id', 100).nullable()
      table.json('payload').nullable()
      table.timestamp('created_at', { useTz: true }).notNullable()

      table.index(['store_id', 'created_at'])
      table.index(['user_id', 'created_at'])
      table.index(['entity', 'entity_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
