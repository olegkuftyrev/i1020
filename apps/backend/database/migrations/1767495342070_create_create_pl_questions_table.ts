import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pl_questions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()
      table.string('question_id', 100).unique().notNullable()
      table.string('label', 500).notNullable()
      table.text('explanation').notNullable()
      table.string('formula', 500).notNullable()
      table.string('a1', 500).notNullable()
      table.string('a2', 500).notNullable()
      table.string('a3', 500).notNullable()
      table.string('a4', 500).notNullable()
      table.string('correct_answer', 500).notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
