import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'gems'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()
      table.string('store_id').notNullable().references('id').inTable('stores').onDelete('CASCADE')
      table.integer('count').notNullable()
      table.integer('taste_of_food').notNullable()
      table.integer('accuracy_of_order').notNullable()
      table.json('raw_json').nullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).nullable()

      table.index(['store_id', 'created_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
