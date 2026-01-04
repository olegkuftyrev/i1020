import AuditEvent from '#models/audit_event'
import { randomUUID } from 'node:crypto'

/**
 * Service for audit logging
 * Centralized place to log all important actions
 */
export class AuditService {
  async log(params: {
    storeId?: string | null
    userId: string
    action: string
    entity: string
    entityId?: string | null
    payload?: Record<string, any>
  }) {
    return AuditEvent.create({
      id: randomUUID(),
      storeId: params.storeId || null,
      userId: params.userId,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId || null,
      payload: params.payload || null,
    })
  }
}

export default new AuditService()

