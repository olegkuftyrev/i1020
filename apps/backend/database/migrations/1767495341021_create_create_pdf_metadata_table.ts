import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pdf_metadata'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()
      table.string('store_id').notNullable().references('id').inTable('stores').onDelete('CASCADE')
      table.integer('page_count').defaultTo(0).notNullable()
      table.string('title', 500).nullable()
      table.string('file_name', 500).nullable()
      table.json('metadata').nullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).nullable()

      table.index(['store_id', 'created_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
