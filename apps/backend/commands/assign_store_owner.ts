import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import User from '#models/user'
import Store from '#models/store'
import UserStore from '#models/user_store'
import db from '@adonisjs/lucid/services/db'
import { randomUUID } from 'node:crypto'

export default class AssignStoreOwner extends BaseCommand {
  static commandName = 'assign:store-owner'
  static description = 'Assign user as owner of store 1020'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    try {
      // Find first user (or user with id=1 if exists)
      const user = await User.query().first()
      if (!user) {
        this.logger.error('No users found. Please create a user first.')
        return
      }

      this.logger.info(`Found user: ${user.email} (ID: ${user.id})`)

      // Find or create store with code "1020"
      // First check if stores table has 'code' column
      let store = null
      try {
        store = await Store.findBy('code', '1020')
      } catch (error: any) {
        if (error.message?.includes('column "code" does not exist')) {
          this.logger.warning('Stores table does not have "code" column yet. Please run migrations first.')
          this.logger.info('Trying to find store by name instead...')
          store = await Store.query().where('name', 'like', '%1020%').first()
        } else {
          throw error
        }
      }
      
      if (!store) {
        this.logger.info('Store 1020 not found. Creating...')
        // Check what columns exist
        const columns = await db.rawQuery(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'stores'
        `)
        const columnNames = columns.rows.map((r: any) => r.column_name)
        this.logger.info(`Available columns: ${columnNames.join(', ')}`)
        
        // Create store with available columns using query builder
        // Check if id is integer or string
        const idIsInteger = columnNames.includes('id') && 
          (await db.rawQuery(`
            SELECT data_type 
            FROM information_schema.columns 
            WHERE table_name = 'stores' AND column_name = 'id'
          `)).rows[0]?.data_type === 'integer'
        
        const now = new Date()
        const storeData: any = {
          code: '1020',
          name: 'Store 1020',
          created_at: now,
          updated_at: now,
        }
        
        // Add owner_id if column exists (old schema)
        if (columnNames.includes('owner_id')) {
          // Check if owner_id is integer (old schema) or string (new schema)
          const ownerIdType = (await db.rawQuery(`
            SELECT data_type 
            FROM information_schema.columns 
            WHERE table_name = 'stores' AND column_name = 'owner_id'
          `)).rows[0]?.data_type
          
          if (ownerIdType === 'integer') {
            // Try to convert user.id to integer if possible
            const userIdInt = parseInt(user.id)
            if (!isNaN(userIdInt)) {
              storeData.owner_id = userIdInt
            } else {
              // Use user.id as string if conversion fails
              storeData.owner_id = user.id
            }
          } else {
            storeData.owner_id = user.id
          }
        }
        
        // Add optional columns if they exist
        if (columnNames.includes('timezone')) {
          storeData.timezone = 'America/Los_Angeles'
        }
        if (columnNames.includes('is_active')) {
          storeData.is_active = true
        }
        
        const result = await db.table('stores').insert(storeData).returning('id')
        const storeId = result[0].id
        store = await Store.find(storeId)
        this.logger.success(`Store 1020 created (ID: ${store.id})`)
      } else {
        this.logger.info(`Found store 1020 (ID: ${store.id})`)
      }

      // Check if user_stores table exists
      const tableExists = await db.rawQuery(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'user_stores'
        )
      `)
      
      if (!tableExists.rows[0].exists) {
        this.logger.warning('user_stores table does not exist. Creating it...')
        // Check types of user_id and store_id
        const userIdType = (await db.rawQuery(`
          SELECT data_type 
          FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'id'
        `)).rows[0]?.data_type || 'integer'
        
        const storeIdType = (await db.rawQuery(`
          SELECT data_type 
          FROM information_schema.columns 
          WHERE table_name = 'stores' AND column_name = 'id'
        `)).rows[0]?.data_type || 'integer'
        
        this.logger.info(`User ID type: ${userIdType}, Store ID type: ${storeIdType}`)
        
        // Create user_stores table without foreign keys first
        await db.rawQuery(`
          CREATE TABLE IF NOT EXISTS user_stores (
            id VARCHAR(255) PRIMARY KEY,
            user_id ${userIdType === 'integer' ? 'INTEGER' : 'VARCHAR(255)'} NOT NULL,
            store_id ${storeIdType === 'integer' ? 'INTEGER' : 'VARCHAR(255)'} NOT NULL,
            role VARCHAR(20) NOT NULL DEFAULT 'ASSOCIATE',
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            UNIQUE(user_id, store_id)
          )
        `)
        this.logger.info('user_stores table created')
      }
      
      // Check if UserStore relationship already exists
      let existingUserStore
      try {
        existingUserStore = await UserStore.query()
          .where('user_id', user.id)
          .where('store_id', store.id.toString())
          .first()
      } catch (error: any) {
        // If model doesn't work, use raw query
        const result = await db.rawQuery(`
          SELECT * FROM user_stores 
          WHERE user_id = ? AND store_id = ?
        `, [user.id, store.id])
        existingUserStore = result.rows[0] || null
      }

      if (existingUserStore) {
        // Update role to MANAGER if not already
        if (existingUserStore.role !== 'MANAGER' && existingUserStore.role !== 'ADMIN') {
          try {
            existingUserStore.role = 'MANAGER'
            await existingUserStore.save()
          } catch {
            await db.rawQuery(`
              UPDATE user_stores 
              SET role = 'MANAGER' 
              WHERE user_id = ? AND store_id = ?
            `, [user.id, store.id])
          }
          this.logger.success(`Updated UserStore relationship: ${user.email} is now MANAGER of store 1020`)
        } else {
          this.logger.info(`User ${user.email} is already ${existingUserStore.role} of store 1020`)
        }
      } else {
        // Create UserStore relationship
        try {
          await UserStore.create({
            id: randomUUID(),
            userId: user.id,
            storeId: store.id.toString(),
            role: 'MANAGER',
          })
        } catch {
          // Use raw insert with proper types
          const userIdValue = typeof user.id === 'string' && !isNaN(parseInt(user.id)) 
            ? parseInt(user.id) 
            : user.id
          await db.table('user_stores').insert({
            id: randomUUID(),
            user_id: userIdValue,
            store_id: store.id,
            role: 'MANAGER',
            created_at: new Date(),
          })
        }
        this.logger.success(`User ${user.email} is now MANAGER of store 1020`)
      }

      this.logger.info('✅ Assignment completed successfully!')
    } catch (error: any) {
      this.logger.error(`Error: ${error.message}`)
      if (error.stack) {
        this.logger.error(error.stack)
      }
    }
  }
}
