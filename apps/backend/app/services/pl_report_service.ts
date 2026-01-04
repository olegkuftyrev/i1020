import PlReport from '#models/pl_report'
import auditService from '#services/audit_service'
import { randomUUID } from 'node:crypto'

/**
 * Service for PlReport operations
 * Enforces storeId requirement to prevent multi-tenant bugs
 */
export class PlReportService {
  /**
   * Find reports for a store (storeId is required)
   */
  async findByStore(
    storeId: string,
    filters?: {
      year?: number
      period?: number
      limit?: number
      offset?: number
    }
  ) {
    let query = PlReport.query()
      .where('store_id', storeId)
      .whereNull('deleted_at') // Soft delete

    if (filters?.year) {
      query = query.where('year', filters.year)
    }

    if (filters?.period) {
      query = query.where('period', filters.period)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.offset(filters.offset)
    }

    return query.orderBy('year', 'desc').orderBy('period', 'desc')
  }

  /**
   * Find single report (storeId is required)
   */
  async findById(storeId: string, reportId: string) {
    return PlReport.query()
      .where('id', reportId)
      .where('store_id', storeId) // CRITICAL: Always filter by storeId
      .whereNull('deleted_at')
      .first()
  }

  /**
   * Create report (storeId is required)
   */
  async create(
    storeId: string,
    data: {
      year: number
      period: number
      periodString: string
      currency?: string
      fileName?: string
      lineItems: Record<string, any>
      summaryData: Record<string, any>
      // Normalized fields
      laborPct?: number
      cogsPct?: number
      netSales?: number
      cpPct?: number
      transactions?: number
    },
    userId: string
  ) {
    const report = await PlReport.create({
      id: randomUUID(),
      storeId,
      year: data.year,
      period: data.period,
      periodString: data.periodString,
      currency: data.currency || 'USD',
      fileName: data.fileName || null,
      lineItems: data.lineItems,
      summaryData: data.summaryData,
      laborPct: data.laborPct || null,
      cogsPct: data.cogsPct || null,
      netSales: data.netSales || null,
      cpPct: data.cpPct || null,
      transactions: data.transactions || null,
    })

    // Audit log
    await auditService.log({
      storeId,
      userId,
      action: 'create',
      entity: 'PlReport',
      entityId: report.id,
      payload: { year: data.year, period: data.period },
    })

    return report
  }

  /**
   * Soft delete report (storeId is required)
   */
  async delete(storeId: string, reportId: string, userId: string) {
    const report = await this.findById(storeId, reportId)
    if (!report) {
      throw new Error('Report not found')
    }

    const { DateTime } = await import('luxon')
    report.deletedAt = DateTime.now()
    await report.save()

    // Audit log
    await auditService.log({
      storeId,
      userId,
      action: 'delete',
      entity: 'PlReport',
      entityId: reportId,
    })

    return report
  }
}

export default new PlReportService()

