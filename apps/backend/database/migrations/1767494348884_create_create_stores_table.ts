import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'stores'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()
      table.string('code', 50).unique().notNullable()
      table.string('name', 255).notNullable()
      table.string('timezone', 100).defaultTo('America/Los_Angeles').notNullable()
      table.boolean('is_active').defaultTo(true).notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
