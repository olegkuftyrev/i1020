import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'question_set_results'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()
      table.string('store_id').notNullable().references('id').inTable('stores').onDelete('CASCADE')
      table.string('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.string('question_set_id', 100).notNullable()
      table.json('answers').notNullable()
      table.integer('score').notNullable()
      table.integer('total_questions').notNullable()
      table.timestamp('completed_at', { useTz: true }).defaultTo(this.now()).notNullable()

      table.index(['store_id', 'completed_at'])
      table.index(['user_id', 'completed_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
