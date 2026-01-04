import { HttpContext } from '@adonisjs/core/http'
import PdfMetadata from '#models/pdf_metadatum'
import { randomUUID } from 'node:crypto'

export default class PdfMetadataController {
  /**
   * Get PDF metadata for current store
   * Requires X-Store-Code header
   */
  async index({ storeId, response }: HttpContext) {
    if (!storeId) {
      return response.badRequest({ message: 'Store context required' })
    }

    const metadata = await PdfMetadata.query()
      .where('store_id', storeId)
      .orderBy('created_at', 'desc')
      .first()

    return response.ok(metadata || null)
  }

  /**
   * Create or update PDF metadata
   */
  async store({ request, storeId, response, auth }: HttpContext) {
    if (!storeId) {
      return response.badRequest({ message: 'Store context required' })
    }

    await auth.check()
    const user = await auth.getUserOrFail()

    const { pageCount, title, fileName, metadata } = request.only([
      'pageCount',
      'title',
      'fileName',
      'metadata',
    ])

    // Delete old metadata for this store
    await PdfMetadata.query().where('store_id', storeId).delete()

    // Create new metadata
    const pdfMetadata = await PdfMetadata.create({
      id: randomUUID(),
      storeId,
      pageCount: pageCount || 0,
      title: title || null,
      fileName: fileName || null,
      metadata: metadata || null,
    })

    return response.ok(pdfMetadata)
  }
}
