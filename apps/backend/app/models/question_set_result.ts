import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { randomUUID } from 'node:crypto'
import Store from './store.js'
import User from './user.js'

export default class QuestionSetResult extends BaseModel {
  @column({ isPrimary: true, prepare: () => randomUUID() })
  declare id: string

  @column()
  declare storeId: string

  @column()
  declare userId: string

  @column()
  declare questionSetId: string

  @column({
    prepare: (value: any) => JSON.stringify(value),
    consume: (value: string) => (value ? JSON.parse(value) : null),
  })
  declare answers: Record<string, any>

  @column()
  declare score: number

  @column()
  declare totalQuestions: number

  @column.dateTime({ autoCreate: true })
  declare completedAt: DateTime

  @belongsTo(() => Store, {
    foreignKey: 'storeId',
  })
  declare store: BelongsTo<typeof Store>

  @belongsTo(() => User, {
    foreignKey: 'userId',
  })
  declare user: BelongsTo<typeof User>
}
