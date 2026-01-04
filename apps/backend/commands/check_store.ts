import { BaseCommand, args } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import Store from '#models/store'
import UserStore from '#models/user_store'
import PlReport from '#models/pl_report'
import Gem from '#models/gem'
import PdfMetadata from '#models/pdf_metadatum'
import Setting from '#models/setting'

export default class CheckStore extends BaseCommand {
  static commandName = 'check:store'
  static description = 'Check store information and related data'
  static options: CommandOptions = {
    startApp: true,
  }

  @args.string({ description: 'Store code or ID' })
  declare storeCode: string

  async run() {
    try {
      this.logger.info(`🔍 Поиск стора ${this.storeCode}...\n`)

      // Ищем стор по коду или ID
      let store = await Store.findBy('code', this.storeCode)
      if (!store) {
        store = await Store.find(this.storeCode)
      }

      if (!store) {
        this.logger.error(`❌ Стор ${this.storeCode} не найден в базе данных`)
        return
      }

      this.logger.info('✅ Стор найден:')
      this.logger.info(`   ID: ${store.id}`)
      this.logger.info(`   Code: ${store.code}`)
      this.logger.info(`   Name: ${store.name}`)
      this.logger.info(`   Timezone: ${store.timezone}`)
      this.logger.info(`   Is Active: ${store.isActive}`)
      this.logger.info(`   Created At: ${store.createdAt.toISO()}`)
      this.logger.info(`   Updated At: ${store.updatedAt.toISO()}`)
      this.logger.info('')

      // Пользователи, связанные со стором
      const userStores = await UserStore.query()
        .where('store_id', store.id)
        .preload('user')

      this.logger.info(`👥 Пользователи (${userStores.length}):`)
      if (userStores.length > 0) {
        for (const us of userStores) {
          await us.load('user')
          this.logger.info(`   - User ID: ${us.userId}, Role: ${us.role}`)
          if (us.user) {
            this.logger.info(`     Email: ${us.user.email}`)
          }
        }
      } else {
        this.logger.info('   Нет связанных пользователей')
      }
      this.logger.info('')

      // PL Reports
      let plReports: PlReport[] = []
      try {
        plReports = await PlReport.query()
          .where('store_id', store.id)
          .orderBy('year', 'desc')
          .orderBy('period', 'desc')
      } catch (error: any) {
        if (error.message.includes('does not exist')) {
          this.logger.info('   ⚠️  Таблица pl_reports не существует (миграции не выполнены)')
        }
      }

      this.logger.info(`📊 PL Reports (${plReports.length}):`)
      if (plReports.length > 0) {
        const recentReports = plReports.slice(0, 10)
        for (const report of recentReports) {
          this.logger.info(`   - ${report.year}-${report.period} (${report.periodString})`)
          this.logger.info(`     Currency: ${report.currency}, File: ${report.fileName || 'N/A'}`)
          if (report.netSales !== null) {
            this.logger.info(`     Net Sales: ${report.netSales}`)
          }
        }
        if (plReports.length > 10) {
          this.logger.info(`   ... и еще ${plReports.length - 10} отчетов`)
        }
      } else if (plReports.length === 0) {
        this.logger.info('   Нет отчетов')
      }
      this.logger.info('')

      // Gems
      let gems: Gem[] = []
      try {
        gems = await Gem.query()
          .where('store_id', store.id)
          .orderBy('created_at', 'desc')
      } catch (error: any) {
        if (error.message.includes('does not exist')) {
          this.logger.info('   ⚠️  Таблица gems не существует (миграции не выполнены)')
        }
      }

      this.logger.info(`💎 Gems (${gems.length}):`)
      if (gems.length > 0) {
        const recentGems = gems.slice(0, 5)
        for (const gem of recentGems) {
          this.logger.info(
            `   - Count: ${gem.count}, Taste: ${gem.tasteOfFood}, Accuracy: ${gem.accuracyOfOrder}`
          )
          this.logger.info(`     Created: ${gem.createdAt.toISO()}`)
        }
        if (gems.length > 5) {
          this.logger.info(`   ... и еще ${gems.length - 5} записей`)
        }
      } else if (gems.length === 0) {
        this.logger.info('   Нет записей')
      }
      this.logger.info('')

      // PDF Metadata
      let pdfs: PdfMetadata[] = []
      try {
        pdfs = await PdfMetadata.query()
          .where('store_id', store.id)
          .orderBy('created_at', 'desc')
      } catch (error: any) {
        if (error.message.includes('does not exist')) {
          this.logger.info('   ⚠️  Таблица pdf_metadata не существует (миграции не выполнены)')
        }
      }

      this.logger.info(`📄 PDF Metadata (${pdfs.length}):`)
      if (pdfs.length > 0) {
        const recentPdfs = pdfs.slice(0, 5)
        for (const pdf of recentPdfs) {
          this.logger.info(`   - File: ${pdf.fileName || 'N/A'}`)
          this.logger.info(`     Pages: ${pdf.pageCount}, Title: ${pdf.title || 'N/A'}`)
          this.logger.info(`     Created: ${pdf.createdAt.toISO()}`)
        }
        if (pdfs.length > 5) {
          this.logger.info(`   ... и еще ${pdfs.length - 5} файлов`)
        }
      } else if (pdfs.length === 0) {
        this.logger.info('   Нет файлов')
      }
      this.logger.info('')

      // Settings
      let settings: Setting[] = []
      try {
        settings = await Setting.query().where('store_id', store.id)
      } catch (error: any) {
        if (error.message.includes('does not exist')) {
          this.logger.info('   ⚠️  Таблица settings не существует (миграции не выполнены)')
        }
      }

      this.logger.info(`⚙️  Settings (${settings.length}):`)
      if (settings.length > 0) {
        for (const setting of settings) {
          this.logger.info(`   - ${setting.key}: ${setting.value}`)
        }
      } else if (settings.length === 0) {
        this.logger.info('   Нет настроек')
      }
      this.logger.info('')

      // Статистика
      this.logger.info('📈 Статистика:')
      this.logger.info(`   PL Reports: ${plReports.length}`)
      this.logger.info(`   Gems: ${gems.length}`)
      this.logger.info(`   PDFs: ${pdfs.length}`)
      this.logger.info(`   Settings: ${settings.length}`)
      this.logger.info(`   Users: ${userStores.length}`)
    } catch (error: any) {
      this.logger.error(`❌ Ошибка: ${error.message}`)
      if (error.stack) {
        this.logger.error(error.stack)
      }
    }
  }
}

