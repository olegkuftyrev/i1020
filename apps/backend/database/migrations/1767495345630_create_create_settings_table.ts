import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'settings'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()
      table.string('store_id').nullable().references('id').inTable('stores').onDelete('CASCADE')
      table.string('key', 200).notNullable()
      table.text('value').notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).nullable()

      table.unique(['store_id', 'key'])
      table.index('key')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
