"use client"

import { useState, useRef, useMemo, useEffect } from "react"
import useSWR from "swr"
import { toast } from "sonner"
import type { ProductData } from "@/src/utils/pdfParser"
import { ProductsTable } from "@/src/components/ProductsTable"
import { productsFetcher, pdfMetadataFetcher, syncProducts } from "@/src/utils/productsApi"
import { Dropzone } from "@/components/ui/dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, AlertCircle, Check, ChevronDown, ChevronUp } from "lucide-react"
import { User } from "@/src/lib/api"
import { useAuthStore } from "@/src/stores/authStore"

interface StoresContentProps {
  user: User | null
  isLoading: boolean
}

function getAnomalyLevel(product: ProductData): 'none' | 'anomaly' | 'extreme' {
  const w38 = parseFloat(product.w38) || 0
  const w39 = parseFloat(product.w39) || 0
  const w40 = parseFloat(product.w40) || 0
  const w41 = parseFloat(product.w41) || 0
  
  const values = [w38, w39, w40, w41]
  const max = Math.max(...values)
  const min = Math.min(...values)
  const difference = max - min
  
  if (difference > 3) {
    return 'extreme'
  } else if (difference > 1) {
    return 'anomaly'
  }
  
  return 'none'
}

export function StoresContent({ user: userProp, isLoading: userLoading }: StoresContentProps) {
  // Get user from store as well (in case prop is not updated)
  const storeUser = useAuthStore((state) => state.user)
  const user = userProp || storeUser
  
  const [isParsing, setIsParsing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [forceShowDropzone, setForceShowDropzone] = useState(false)
  const replaceFileInputRef = useRef<HTMLInputElement>(null)
  const [isCardExpanded, setIsCardExpanded] = useState(false)

  // Log user stores for debugging
  useEffect(() => {
    if (user?.stores) {
      console.log('User stores in StoresContent:', user.stores)
      user.stores.forEach((userStore, index) => {
        console.log(`Store ${index}:`, {
          id: userStore.id,
          storeId: userStore.storeId,
          role: userStore.role,
          store: userStore.store,
        })
      })
    }
  }, [user])

  // Load products from database using SWR
  const { data: products = [], mutate: mutateProducts, isLoading: isLoadingProducts, error: productsError } = useSWR<ProductData[]>(
    '/products',
    productsFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      onError: (error) => {
        console.error('SWR error loading products:', error)
      },
      onSuccess: (data) => {
        console.log('SWR products loaded successfully:', data?.length || 0, 'items')
      },
    }
  )
  
  // Log products when they change
  useEffect(() => {
    console.log('Products state changed:', {
      count: products.length,
      isLoading: isLoadingProducts,
      error: productsError,
      sample: products[0],
    })
  }, [products, isLoadingProducts, productsError])

  // Load PDF metadata from database
  const { data: pdfMetadata, mutate: mutatePdfMetadata } = useSWR(
    '/products/metadata/pdf',
    pdfMetadataFetcher,
    {
      revalidateOnFocus: false,
    }
  )

  const loading = isLoadingProducts || isParsing || userLoading

  // Simple logic: if file exists, show file info, otherwise show dropzone
  const hasFile = !!pdfMetadata?.fileName
  const showDropzone = !hasFile || forceShowDropzone

  // Handle file upload and parsing
  const handleFileSelect = async (file: File) => {
    // Check if it's a PDF
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      toast.error('Please upload a PDF file')
      setError('Please upload a PDF file')
      return
    }

    // Reset force show dropzone
    setForceShowDropzone(false)

    // Show loading toast
    const toastId = toast.loading('Загрузка файла...', {
      description: `Обработка ${file.name}`,
    })

    try {
      setIsParsing(true)
      setError(null)

      console.log('Starting PDF parsing from uploaded file...')
      
      // Create a FileReader to read the file
      const fileReader = new FileReader()
      
      fileReader.onload = async (e) => {
        try {
          toast.loading('Чтение файла...', {
            id: toastId,
            description: `Парсинг PDF файла`,
          })

          const arrayBuffer = e.target?.result as ArrayBuffer
          if (!arrayBuffer) {
            throw new Error('Failed to read file')
          }

          // Dynamically import PDF parser to avoid SSR issues
          const { parsePDF, parseProductRows, applyConversionData } = await import("@/src/utils/pdfParser")

          // Parse PDF from ArrayBuffer
          const data = await parsePDF(arrayBuffer)
          console.log('PDF parsed, pages:', data.pageCount, 'rows:', data.rows.length)

          toast.loading('Парсинг данных...', {
            id: toastId,
            description: `Найдено ${data.rows.length} строк`,
          })

          // Parse products from rows
          const parsedProducts = parseProductRows(data.rows)
          console.log('Products parsed:', parsedProducts.length)

          // Apply conversion data
          const productsWithConversion = applyConversionData(parsedProducts)
          console.log('Conversion data applied, total products:', productsWithConversion.length)

          toast.loading('Сохранение в базу данных...', {
            id: toastId,
            description: `Обработано ${productsWithConversion.length} продуктов`,
          })

          // Save to database
          console.log('Saving to database...')
          console.log('User:', user)
          console.log('User stores:', user?.stores)
          if (user?.stores && user.stores.length > 0) {
            console.log('First store:', user.stores[0])
            console.log('Store object:', user.stores[0].store)
            console.log('Store code:', user.stores[0].store?.code)
          }
          
          await syncProducts(productsWithConversion, {
            pageCount: data.pageCount,
            title: data.storeTitle || data.metadata?.Title,
            fileName: file.name,
            metadata: data.metadata,
          })
          console.log('Saved to database successfully')

          // Revalidate SWR cache to get fresh data
          console.log('Revalidating SWR cache...')
          // Force revalidation with fresh data
          try {
            const freshProducts = await productsFetcher('/products')
            console.log('Fresh products fetched:', freshProducts?.length || 0, 'items')
            await mutateProducts(freshProducts, { revalidate: false }) // Update cache with fresh data
            console.log('SWR cache updated with', freshProducts?.length || 0, 'products')
          } catch (err) {
            console.error('Error fetching fresh products:', err)
            // Fallback to regular revalidation
            await mutateProducts()
          }
          await mutatePdfMetadata()
          setForceShowDropzone(false)
          console.log('SWR cache revalidated')

          // Show success toast
          toast.success('Файл успешно обновлен', {
            id: toastId,
            description: `Загружено ${productsWithConversion.length} продуктов из ${file.name}`,
          })
        } catch (err: any) {
          const errorMessage = err.message || err.response?.data?.error || 'Failed to parse PDF'
          setError(errorMessage)
          console.error('PDF parsing error:', err)
          toast.error('Ошибка при обработке файла', {
            id: toastId,
            description: errorMessage,
          })
        } finally {
          setIsParsing(false)
        }
      }

      fileReader.onerror = () => {
        const errorMsg = 'Failed to read file'
        setError(errorMsg)
        setIsParsing(false)
        toast.error('Ошибка чтения файла', {
          id: toastId,
          description: 'Не удалось прочитать файл',
        })
      }

      // Read file as ArrayBuffer
      fileReader.readAsArrayBuffer(file)
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to process file'
      setError(errorMessage)
      console.error('File upload error:', err)
      setIsParsing(false)
      toast.error('Ошибка при загрузке файла', {
        id: toastId,
        description: errorMessage,
      })
    }
  }

  // Count rows by color across all products
  const colorCounts = useMemo(() => {
    let yellowCount = 0
    let redCount = 0
    let regularCount = 0

    products.forEach(product => {
      const anomalyLevel = getAnomalyLevel(product)
      if (anomalyLevel === 'extreme') {
        redCount++
      } else if (anomalyLevel === 'anomaly') {
        yellowCount++
      } else {
        regularCount++
      }
    })

    return { yellowCount, redCount, regularCount }
  }, [products])

  // Set initial expanded state based on whether there are red or yellow rows
  useEffect(() => {
    if (colorCounts.redCount > 0 || colorCounts.yellowCount > 0) {
      setIsCardExpanded(true)
    } else {
      setIsCardExpanded(false)
    }
  }, [colorCounts.redCount, colorCounts.yellowCount])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="rounded-xl border border-primary/20 bg-card/40 backdrop-blur-sm p-6 md:p-8 shadow-lg">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-foreground">
            $1000 Usage
          </h2>
          <div className="h-1 w-24 bg-primary/60 rounded-full mb-6"></div>
          
          {/* File upload section */}
          <div className="mb-6">
            {showDropzone && (
              <label className="block text-sm font-medium text-foreground mb-2">
                Upload PDF File
              </label>
            )}
            
            {showDropzone ? (
              <>
                <Dropzone
                  onFileSelect={handleFileSelect}
                  accept=".pdf,application/pdf"
                  disabled={isParsing}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Drag and drop a PDF file here, or click to browse. The file will be parsed and product data will be saved to the database.
                </p>
              </>
            ) : null}
          </div>
          
          {productsError && (
            <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-yellow-400 mb-1">Warning</h4>
                  <p className="text-sm text-yellow-300">
                    Failed to load products from database. You can still upload a new PDF file.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => mutateProducts()}
                    className="mt-2"
                  >
                    Retry
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          )}
          
          {!loading && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Total Products: {products.length}</span>
                {pdfMetadata && (
                  <span>Pages: {pdfMetadata.pageCount || 0}</span>
                )}
                {pdfMetadata?.title && (
                  <span>Title: {pdfMetadata.title}</span>
                )}
              </div>

              {/* Color Counts Card */}
              {products.length > 0 && (
                <Card className="border-primary/20 bg-card/60">
                  <CardHeader 
                    className="cursor-pointer hover:bg-card/20 transition-colors"
                    onClick={() => setIsCardExpanded(!isCardExpanded)}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-bold text-foreground">Manual Validation required</CardTitle>
                      {isCardExpanded ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </CardHeader>
                  {isCardExpanded && (
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
                          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-1">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            <span>Critical</span>
                          </div>
                          <div className="text-2xl font-bold text-red-500 text-center">{colorCounts.redCount}</div>
                          <p className="text-xs text-muted-foreground text-center mt-2">
                            AVG &gt; 3 Between 4 weeks
                          </p>
                        </div>
                        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
                          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-1">
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                            <span>Attention Required</span>
                          </div>
                          <div className="text-2xl font-bold text-yellow-500 text-center">{colorCounts.yellowCount}</div>
                          <p className="text-xs text-muted-foreground text-center mt-2">
                            AVG 1-3 Between 4 weeks
                          </p>
                        </div>
                        <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
                          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-1">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>No discrepancies</span>
                          </div>
                          <div className="text-2xl font-bold text-green-500 text-center">{colorCounts.regularCount}</div>
                          <p className="text-xs text-muted-foreground text-center mt-2">
                            AVG ≤ 1 Between 4 weeks
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-primary/20">
                        <p className="text-sm text-muted-foreground mb-2">
                          <strong>How it works:</strong> The system compares the weekly values across 4 weeks for each product. 
                          It calculates the average (AVG) between the weekly values.
                        </p>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p><strong className="text-red-400">Critical</strong> indicate extreme variations (AVG &gt; 3)</p>
                          <p><strong className="text-yellow-400">Attention Required</strong> indicate moderate variations (AVG 1-3)</p>
                          <p><strong className="text-green-400">No discrepancies</strong> show consistent values (AVG ≤ 1)</p>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              )}
              
              {products.length > 0 ? (
                <ProductsTable 
                  data={products}
                  onDataChange={mutateProducts}
                  onReplaceFile={handleFileSelect}
                />
              ) : (
                <div className="rounded-lg border border-primary/20 bg-card/60 p-6">
                  <p className="text-muted-foreground">
                    No products found. Please upload a PDF file to get started.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Buttons at bottom */}
        <div className="flex justify-center items-center gap-3 mt-6">
          <Button
            onClick={() => {
              replaceFileInputRef.current?.click()
            }}
            variant="outline"
            size="lg"
          >
            Replace
          </Button>
          <input
            ref={replaceFileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                handleFileSelect(file)
              }
              if (replaceFileInputRef.current) {
                replaceFileInputRef.current.value = ''
              }
            }}
            className="hidden"
          />
          <Button variant="outline" size="lg">
            View Reports
          </Button>
        </div>

      </div>
    </div>
  )
}
