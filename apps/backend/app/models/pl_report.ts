import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { randomUUID } from 'node:crypto'
import Store from './store.js'

export default class PlReport extends BaseModel {
  @column({ isPrimary: true, prepare: () => randomUUID() })
  declare id: string

  @column()
  declare storeId: string

  @column()
  declare year: number

  @column()
  declare period: number

  @column()
  declare periodString: string

  @column()
  declare currency: string

  @column()
  declare fileName: string | null

  @column({
    prepare: (value: any) => JSON.stringify(value),
    consume: (value: string) => (value ? JSON.parse(value) : null),
  })
  declare lineItems: Record<string, any>

  @column({
    prepare: (value: any) => JSON.stringify(value),
    consume: (value: string) => (value ? JSON.parse(value) : null),
  })
  declare summaryData: Record<string, any>

  // Normalized fields for fast queries
  @column()
  declare laborPct: number | null

  @column()
  declare cogsPct: number | null

  @column()
  declare netSales: number | null

  @column()
  declare cpPct: number | null

  @column()
  declare transactions: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare deletedAt: DateTime | null

  @belongsTo(() => Store, {
    foreignKey: 'storeId',
  })
  declare store: BelongsTo<typeof Store>
}
