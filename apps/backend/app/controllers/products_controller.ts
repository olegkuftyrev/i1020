import { HttpContext } from '@adonisjs/core/http'
import Product from '#models/product'

export default class ProductsController {
  /**
   * Get all products (global, not store-specific)
   */
  async index({ response }: HttpContext) {
    const products = await Product.query().orderBy('product_number', 'asc')
    return response.ok(products)
  }

  /**
   * Get single product
   */
  async show({ params, response }: HttpContext) {
    const product = await Product.findOrFail(params.id)
    return response.ok(product)
  }

  /**
   * Create or update products (bulk sync)
   */
  async sync({ request, response }: HttpContext) {
    try {
      const products = request.input('products', [])
      
      console.log('ProductsController.sync called with', products?.length || 0, 'products')
      
      if (!Array.isArray(products)) {
        console.error('Products is not an array:', typeof products, products)
        return response.badRequest({ message: 'Products must be an array' })
      }
      
      if (products.length === 0) {
        console.warn('Empty products array received')
        return response.badRequest({ message: 'Products array is empty' })
      }
      
      console.log('First product sample:', products[0])
      
      const results = []
      const errors = []
      
      for (let i = 0; i < products.length; i++) {
        const productData = products[i]
        try {
          // Validate required fields
          if (!productData.productNumber) {
            console.warn(`Skipping product ${i} without productNumber:`, productData)
            errors.push({ index: i, error: 'Missing productNumber', data: productData })
            continue
          }
          
          console.log(`Syncing product ${i + 1}/${products.length}:`, productData.productNumber)
          
          const product = await Product.updateOrCreate(
            { productNumber: productData.productNumber },
            {
              productName: productData.productName || '',
              unit: productData.unit || '',
              w38: productData.w38 || '0',
              w39: productData.w39 || '0',
              w40: productData.w40 || '0',
              w41: productData.w41 || '0',
              conversion: productData.conversion || null,
              group: productData.group || null,
            }
          )
          
          console.log(`Product ${productData.productNumber} saved with ID:`, product.id)
          results.push(product)
        } catch (error: any) {
          console.error(`Error syncing product ${i}:`, productData, error.message, error.stack)
          errors.push({ index: i, error: error.message, data: productData })
          // Continue with next product instead of failing entire batch
        }
      }

      console.log(`Sync completed: ${results.length} successful, ${errors.length} errors`)
      
      if (errors.length > 0) {
        console.error('Errors during sync:', errors)
      }

      return response.ok({
        message: 'Products synced successfully',
        count: results.length,
        errors: errors.length > 0 ? errors : undefined,
      })
    } catch (error: any) {
      console.error('Error in sync products:', error, error.stack)
      return response.internalServerError({ 
        message: 'Failed to sync products',
        error: error.message 
      })
    }
  }
}
