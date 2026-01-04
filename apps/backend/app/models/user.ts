import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, manyToMany, hasMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import type { ManyToMany, HasMany } from '@adonisjs/lucid/types/relations'
import { randomUUID } from 'node:crypto'
import Role from './role.js'
import UserStore from './user_store.js'
import QuestionSetResult from './question_set_result.js'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true, prepare: () => randomUUID() })
  declare id: string

  @column()
  declare email: string

  @column()
  declare name: string | null

  @column({ serializeAs: null })
  declare password: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @manyToMany(() => Role, {
    pivotTable: 'user_roles',
    pivotForeignKey: 'user_id',
    pivotRelatedForeignKey: 'role_id',
  })
  declare roles: ManyToMany<typeof Role>

  @hasMany(() => UserStore)
  declare stores: HasMany<typeof UserStore>

  @hasMany(() => QuestionSetResult)
  declare questionSetResults: HasMany<typeof QuestionSetResult>
}
