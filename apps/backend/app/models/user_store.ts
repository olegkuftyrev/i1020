import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { randomUUID } from 'node:crypto'
import User from './user.js'
import Store from './store.js'

export default class UserStore extends BaseModel {
  @column({ isPrimary: true, prepare: () => randomUUID() })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare storeId: string

  @column()
  declare role: 'ASSOCIATE' | 'MANAGER' | 'ADMIN'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => User, {
    foreignKey: 'userId',
  })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Store, {
    foreignKey: 'storeId',
  })
  declare store: BelongsTo<typeof Store>
}
