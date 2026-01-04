import Store from '#models/store'

interface CacheEntry {
  storeId: string
  store: Store
  expiresAt: number
}

/**
 * In-memory cache for storeCode -> storeId mapping
 * Cache TTL: 15 minutes
 */
class StoreCacheService {
  private cache = new Map<string, CacheEntry>()
  private readonly TTL = 15 * 60 * 1000 // 15 minutes in milliseconds

  /**
   * Get store by code with caching
   */
  async getStoreByCode(code: string): Promise<Store | null> {
    // Check cache first
    const cached = this.cache.get(code)
    if (cached && cached.expiresAt > Date.now()) {
      return cached.store
    }

    // Fetch from database
    const store = await Store.findBy('code', code)
    if (!store) {
      return null
    }

    // Cache it
    this.cache.set(code, {
      storeId: store.id,
      store,
      expiresAt: Date.now() + this.TTL,
    })

    return store
  }

  /**
   * Invalidate cache for a store code
   * Call this when store is updated/deleted
   */
  invalidate(code: string) {
    this.cache.delete(code)
  }

  /**
   * Invalidate all cache entries for a store
   */
  invalidateByStoreId(storeId: string) {
    for (const [code, entry] of this.cache.entries()) {
      if (entry.storeId === storeId) {
        this.cache.delete(code)
      }
    }
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear()
  }
}

export default new StoreCacheService()

