import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'products'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()
      table.string('product_number', 100).unique().notNullable()
      table.string('product_name', 500).notNullable()
      table.string('unit', 50).notNullable()
      table.string('w38', 100).notNullable()
      table.string('w39', 100).notNullable()
      table.string('w40', 100).notNullable()
      table.string('w41', 100).notNullable()
      table.string('conversion', 100).nullable()
      table.string('group', 200).nullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).nullable()

      table.index('product_number')
      table.index('group')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
