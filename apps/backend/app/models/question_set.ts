import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { randomUUID } from 'node:crypto'

export default class QuestionSet extends BaseModel {
  @column({ isPrimary: true, prepare: () => randomUUID() })
  declare id: string

  @column()
  declare name: string

  @column()
  declare showAnswers: boolean

  @column()
  declare showFormula: boolean

  @column()
  declare showExplanation: boolean

  @column({
    prepare: (value: string[]) => JSON.stringify(value),
    consume: (value: string) => (value ? JSON.parse(value) : []),
  })
  declare questionIds: string[]

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
