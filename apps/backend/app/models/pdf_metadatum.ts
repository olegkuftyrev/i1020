import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { randomUUID } from 'node:crypto'
import Store from './store.js'

export default class PdfMetadata extends BaseModel {
  @column({ isPrimary: true, prepare: () => randomUUID() })
  declare id: string

  @column()
  declare storeId: string

  @column()
  declare pageCount: number

  @column()
  declare title: string | null

  @column()
  declare fileName: string | null

  @column({
    prepare: (value: any) => (value ? JSON.stringify(value) : null),
    consume: (value: string) => (value ? JSON.parse(value) : null),
  })
  declare metadata: Record<string, any> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Store, {
    foreignKey: 'storeId',
  })
  declare store: BelongsTo<typeof Store>
}
