import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import { randomUUID } from 'node:crypto'
import UserStore from './user_store.js'
import PlReport from './pl_report.js'
import Gem from './gem.js'
import PdfMetadata from './pdf_metadatum.js'
import Setting from './setting.js'
import User from './user.js'

export default class Store extends BaseModel {
  @column({ isPrimary: true, prepare: () => randomUUID() })
  declare id: string

  @column()
  declare code: string

  @column()
  declare name: string

  @column()
  declare timezone: string

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => UserStore)
  declare userStores: HasMany<typeof UserStore>

  @hasMany(() => PlReport)
  declare plReports: HasMany<typeof PlReport>

  @hasMany(() => Gem)
  declare gems: HasMany<typeof Gem>

  @hasMany(() => PdfMetadata)
  declare pdfs: HasMany<typeof PdfMetadata>

  @hasMany(() => Setting)
  declare settings: HasMany<typeof Setting>

  @manyToMany(() => User, {
    pivotTable: 'user_stores',
    pivotForeignKey: 'store_id',
    pivotRelatedForeignKey: 'user_id',
  })
  declare users: ManyToMany<typeof User>
}
