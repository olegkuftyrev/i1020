# Security & Multi-Tenant Best Practices

## 1. Store Access Control

**NEVER trust X-Store-Code header without verification!**

Every request that requires store context must:
1. Extract `X-Store-Code` header
2. Resolve `storeId` from code (with caching)
3. Verify user has access via `UserStore` or is `ADMIN`

### Usage

```typescript
// In routes
router.get('/api/pl-reports', [PlReportController, 'index'])
  .use(middleware.auth())
  .use(middleware.storeAccess()) // Validates X-Store-Code and access

// In controller
async index({ storeId, response }: HttpContext) {
  // storeId is guaranteed to be valid and user has access
  const reports = await plReportService.findByStore(storeId)
  return response.ok(reports)
}
```

## 2. Never Forget storeId

**CRITICAL**: All queries to store-owned models MUST include `where('store_id', storeId)`

### ✅ Correct - Using Services

```typescript
// Use services that enforce storeId
const reports = await plReportService.findByStore(storeId, { year: 2024 })
```

### ❌ Wrong - Direct Model Access

```typescript
// NEVER do this - missing storeId filter!
const reports = await PlReport.query().where('year', 2024)
```

### Service Pattern

All store-owned data access goes through services:
- `PlReportService` - enforces `storeId` requirement
- `GemService` - enforces `storeId` requirement
- `SettingService` - enforces `storeId` requirement

## 3. Indexes

All store-owned queries are indexed:

- `PlReport`: `@@index([storeId, year, period])`
- `Gem`: `@@index([storeId, createdAt])`
- `QuestionSetResult`: `@@index([storeId, completedAt])` + `@@index([userId, completedAt])`

## 4. Uniqueness Constraints

**ALWAYS include storeId in unique constraints:**

```typescript
// ✅ Correct
table.unique(['store_id', 'year', 'period'])

// ❌ Wrong - breaks multi-tenant
table.unique(['year', 'period'])
```

## 5. Audit Logging

All important actions are logged:

```typescript
await auditService.log({
  storeId,
  userId,
  action: 'create',
  entity: 'PlReport',
  entityId: report.id,
  payload: { year: 2024, period: 1 },
})
```

## 6. Soft Delete

Critical entities use soft delete:

- `PlReport` - has `deletedAt` field
- Always filter: `.whereNull('deleted_at')`

## 7. Normalized Fields

P&L reports have normalized fields for fast queries:

- `laborPct`, `cogsPct`, `netSales`, `cpPct`, `transactions`

Use these for aggregations instead of parsing JSON.

## 8. Store Code Cache

Store code → storeId mapping is cached (15 min TTL):

```typescript
import storeCacheService from '#services/store_cache_service'

const store = await storeCacheService.getStoreByCode(code)
// Cache is invalidated when store is updated
```

## 9. Rate Limiting

Import endpoints are rate-limited:

```typescript
router.post('/api/pl-reports/import', [PlReportController, 'import'])
  .use(middleware.auth())
  .use(middleware.storeAccess())
  .use(middleware.rateLimit({ maxRequests: 10, windowMs: 60000 })) // 10 per minute
```

## Code Review Checklist

- [ ] All store-owned queries include `where('store_id', storeId)`
- [ ] X-Store-Code header is validated via `storeAccess` middleware
- [ ] Unique constraints include `storeId`
- [ ] Important actions are audit logged
- [ ] Soft delete is used for critical entities
- [ ] Rate limiting on heavy operations
- [ ] Services enforce `storeId` requirement

