import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'

const dbConfig = defineConfig({
  connection: 'postgres',
  connections: {
    postgres: {
      client: 'pg',
      connection: {
        host: env.get('DB_HOST', 'localhost'),
        port: env.get('DB_PORT', 5432),
        user: env.get('DB_USER', 'postgres'),
        password: env.get('DB_PASSWORD', ''),
        database: env.get('DB_DATABASE', 'i1020'),
      },
      migrations: {
        naturalSort: true,
        paths: ['./database/migrations'],
      },
      seeders: {
        paths: ['./database/seeders'],
      },
      debug: false,
    },
  },
})

export default dbConfig

