import { ProductData } from './pdfParser'
import { useAuthStore } from '@/src/stores/authStore'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'

export interface PdfMetadata {
  id: string
  storeId: string
  pageCount: number
  title: string | null
  fileName: string | null
  metadata: Record<string, any> | null
  createdAt: string
  updatedAt: string
}

/**
 * Get store code from Zustand store
 * Uses the first store from user's stores array
 * If store object is not loaded, fetches it from API
 */
async function getStoreCodeFromStore(): Promise<string | null> {
  try {
    const state = useAuthStore.getState()
    const user = state.user
    
    if (!user) {
      console.warn('No user in auth store')
      return null
    }
    
    if (!user.stores || user.stores.length === 0) {
      console.warn('User has no stores:', user)
      return null
    }
    
    // Get first store
    const userStore = user.stores[0]
    
    // Try to get code from store object
    if (userStore.store?.code) {
      return userStore.store.code
    }
    
    // If store object is not loaded but we have storeId, fetch it from API
    if (userStore.storeId) {
      console.warn('Store object not loaded, fetching from API...', userStore.storeId)
      try {
        const response = await fetch(`${API_URL}/api/stores/${userStore.storeId}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (response.ok) {
          const store = await response.json()
          // Update the store in Zustand store
          if (store.code) {
            // Update user stores in Zustand
            const updatedUser = {
              ...user,
              stores: user.stores.map((us) => 
                us.id === userStore.id 
                  ? { ...us, store: { ...store } }
                  : us
              ),
            }
            useAuthStore.getState().setUser(updatedUser)
            return store.code
          }
        }
      } catch (e) {
        console.error('Failed to fetch store from API:', e)
      }
    }
    
    console.warn('Could not get store code. User stores:', user.stores)
    return null
  } catch (e) {
    console.error('Error getting store code:', e)
    return null
  }
}

/**
 * Get headers with store code (synchronous version for immediate use)
 * Note: This may return headers without X-Store-Code if store is not loaded
 */
function getHeadersSync(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  
  try {
    const state = useAuthStore.getState()
    const user = state.user
    
    if (user?.stores && user.stores.length > 0) {
      const userStore = user.stores[0]
      if (userStore.store?.code) {
        headers['X-Store-Code'] = userStore.store.code
      }
    }
  } catch (e) {
    console.error('Error getting store code synchronously:', e)
  }
  
  return headers
}

/**
 * Get headers with store code (async version that fetches if needed)
 */
async function getHeaders(): Promise<HeadersInit> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  
  const storeCode = await getStoreCodeFromStore()
  if (storeCode) {
    headers['X-Store-Code'] = storeCode
  }
  
  return headers
}

/**
 * Fetch products from API
 */
export async function productsFetcher(url: string): Promise<ProductData[]> {
  console.log('Fetching products from API...')
  const headers = await getHeaders()
  console.log('Headers for products fetch:', headers)
  
  const response = await fetch(`${API_URL}/api/products`, {
    credentials: 'include',
    headers,
  })

  console.log('Products API response status:', response.status, response.statusText)

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Failed to fetch products:', response.status, errorText)
    throw new Error(`Failed to fetch products: ${response.statusText}`)
  }

  const data = await response.json()
  console.log('Products fetched:', data?.length || 0, 'items')
  return data || []
}

/**
 * Fetch PDF metadata from API
 */
export async function pdfMetadataFetcher(url: string): Promise<PdfMetadata | null> {
  const headers = await getHeaders()
  const response = await fetch(`${API_URL}/api/pdf-metadata`, {
    credentials: 'include',
    headers,
  })

  if (!response.ok) {
    if (response.status === 404) {
      return null
    }
    throw new Error('Failed to fetch PDF metadata')
  }

  const data = await response.json()
  return data
}

/**
 * Sync products to database
 */
export async function syncProducts(
  products: ProductData[],
  pdfMetadata: {
    pageCount: number
    title?: string | null
    fileName?: string | null
    metadata?: Record<string, any> | null
  }
): Promise<void> {
  // Sync products
  console.log('Syncing products:', {
    count: products.length,
    sample: products[0],
    allProducts: products.slice(0, 3), // First 3 for debugging
  })
  
  // Prepare products data for API (ensure correct field names)
  const productsForApi = products.map(p => ({
    productNumber: p.productNumber,
    productName: p.productName,
    unit: p.unit,
    w38: p.w38,
    w39: p.w39,
    w40: p.w40,
    w41: p.w41,
    conversion: p.conversion || null,
    group: p.group || null,
  }))
  
  console.log('Products prepared for API:', {
    count: productsForApi.length,
    sample: productsForApi[0],
  })
  
  const productsHeaders = await getHeaders()
  console.log('Headers for products sync:', productsHeaders)
  
  const productsResponse = await fetch(`${API_URL}/api/products/sync`, {
    method: 'POST',
    credentials: 'include',
    headers: productsHeaders,
    body: JSON.stringify({ products: productsForApi }),
  })

  if (!productsResponse.ok) {
    const errorText = await productsResponse.text()
    let errorData
    try {
      errorData = JSON.parse(errorText)
    } catch {
      errorData = { message: errorText || 'Unknown error' }
    }
    console.error('Products sync error:', {
      status: productsResponse.status,
      statusText: productsResponse.statusText,
      error: errorData,
      productsCount: products.length,
    })
    throw new Error(errorData.message || `Failed to sync products: ${productsResponse.statusText}`)
  }

  // Sync PDF metadata
  const metadataHeaders = await getHeaders()
  const storeCode = await getStoreCodeFromStore()
  
  if (!storeCode) {
    const errorMsg = 'Store code is required. Please ensure you have access to a store.'
    console.error('Store code missing:', { user: useAuthStore.getState().user })
    throw new Error(errorMsg)
  }

  console.log('Syncing PDF metadata with store code:', storeCode)

  const metadataResponse = await fetch(`${API_URL}/api/pdf-metadata`, {
    method: 'POST',
    credentials: 'include',
    headers: metadataHeaders,
    body: JSON.stringify({
      pageCount: pdfMetadata.pageCount,
      title: pdfMetadata.title || null,
      fileName: pdfMetadata.fileName || null,
      metadata: pdfMetadata.metadata || null,
    }),
  })

  if (!metadataResponse.ok) {
    const errorText = await metadataResponse.text()
    let errorData
    try {
      errorData = JSON.parse(errorText)
    } catch {
      errorData = { message: errorText || 'Unknown error' }
    }
    console.error('PDF metadata sync error:', {
      status: metadataResponse.status,
      statusText: metadataResponse.statusText,
      error: errorData,
    })
    throw new Error(errorData.message || `Failed to sync PDF metadata: ${metadataResponse.statusText}`)
  }
}

