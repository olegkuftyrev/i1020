import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pl_reports'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()
      table.string('store_id').notNullable().references('id').inTable('stores').onDelete('CASCADE')
      table.integer('year').notNullable()
      table.integer('period').notNullable()
      table.string('period_string', 50).notNullable()
      table.string('currency', 10).defaultTo('USD').notNullable()
      table.string('file_name', 500).nullable()
      table.json('line_items').notNullable()
      table.json('summary_data').notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).nullable()

      table.unique(['store_id', 'year', 'period'])
      table.index(['store_id', 'year', 'period'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
