import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { randomUUID } from 'node:crypto'

export default class PlQuestion extends BaseModel {
  @column({ isPrimary: true, prepare: () => randomUUID() })
  declare id: string

  @column()
  declare questionId: string

  @column()
  declare label: string

  @column()
  declare explanation: string

  @column()
  declare formula: string

  @column()
  declare a1: string

  @column()
  declare a2: string

  @column()
  declare a3: string

  @column()
  declare a4: string

  @column()
  declare correctAnswer: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
