import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'question_sets'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()
      table.string('name', 200).notNullable()
      table.boolean('show_answers').defaultTo(true).notNullable()
      table.boolean('show_formula').defaultTo(true).notNullable()
      table.boolean('show_explanation').defaultTo(true).notNullable()
      table.json('question_ids').notNullable() // Array of strings
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
