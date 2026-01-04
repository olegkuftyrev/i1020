import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { randomUUID } from 'node:crypto'

export default class Product extends BaseModel {
  @column({ isPrimary: true, prepare: () => randomUUID() })
  declare id: string

  @column()
  declare productNumber: string

  @column()
  declare productName: string

  @column()
  declare unit: string

  @column()
  declare w38: string

  @column()
  declare w39: string

  @column()
  declare w40: string

  @column()
  declare w41: string

  @column()
  declare conversion: string | null

  @column()
  declare group: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
