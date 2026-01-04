import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pl_reports'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Normalized metrics for fast queries without JSON parsing
      table.decimal('labor_pct', 10, 4).nullable()
      table.decimal('cogs_pct', 10, 4).nullable()
      table.decimal('net_sales', 15, 2).nullable()
      table.decimal('cp_pct', 10, 4).nullable()
      table.integer('transactions').nullable()
      
      table.index(['store_id', 'labor_pct'])
      table.index(['store_id', 'net_sales'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('labor_pct')
      table.dropColumn('cogs_pct')
      table.dropColumn('net_sales')
      table.dropColumn('cp_pct')
      table.dropColumn('transactions')
    })
  }
}
