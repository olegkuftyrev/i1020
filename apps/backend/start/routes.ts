/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

const AuthController = () => import('#controllers/auth_controller')
const StoresController = () => import('#controllers/stores_controller')
const ProductsController = () => import('#controllers/products_controller')
const PdfMetadataController = () => import('#controllers/pdf_metadata_controller')

router.get('/', async ({ response }) => {
  return response.ok({ message: 'It works!' })
})

// Auth routes
router.group(() => {
  router.post('/register', [AuthController, 'register']).use(middleware.guest())
  router.post('/login', [AuthController, 'login']).use(middleware.guest())
  router.post('/logout', [AuthController, 'logout']).use(middleware.auth())
  router.get('/me', [AuthController, 'me']).use(middleware.auth())
}).prefix('/api/auth')

// Stores routes
router.group(() => {
  router.get('/', [StoresController, 'index']).use(middleware.auth())
  router.get('/:id', [StoresController, 'show']).use(middleware.auth())
  router.post('/', [StoresController, 'store'])
    .use(middleware.auth())
    .use(middleware.role({ roles: ['manager', 'admin'] }))
  router.put('/:id', [StoresController, 'update']).use(middleware.auth())
  router.delete('/:id', [StoresController, 'destroy']).use(middleware.auth())
}).prefix('/api/stores')

// Products routes (global, not store-specific)
router.group(() => {
  router.get('/', [ProductsController, 'index']).use(middleware.auth())
  router.get('/:id', [ProductsController, 'show']).use(middleware.auth())
  router.post('/sync', [ProductsController, 'sync']).use(middleware.auth())
}).prefix('/api/products')

// PDF Metadata routes (store-specific)
router.group(() => {
  router.get('/', [PdfMetadataController, 'index'])
    .use(middleware.auth())
    .use(middleware.storeAccess())
  router.post('/', [PdfMetadataController, 'store'])
    .use(middleware.auth())
    .use(middleware.storeAccess())
}).prefix('/api/pdf-metadata')
