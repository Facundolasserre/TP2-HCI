import { get, post, put, del } from './http'
import type {
  Product,
  ProductRegistrationData,
  ProductUpdateData,
  ProductsListParams,
  ValidationMessages,
} from '@/types/products'
import {
  isValidProductName,
  isValidCategoryId,
  isValidPantryId,
  isValidMetadata,
  isValidPagination,
  getValidationError,
} from '@/types/products'

const PRODUCTS_ENDPOINT = '/api/products'

/**
 * Validate and sanitize list parameters
 */
const validateListParams = (params?: ProductsListParams): ProductsListParams => {
  const validated: ProductsListParams = {
    page: params?.page ?? 1,
    per_page: params?.per_page ?? 10,
    order: params?.order ?? 'ASC',
    sort_by: params?.sort_by ?? 'name',
  }

  // Validate pagination
  if (!isValidPagination(validated.page, validated.per_page)) {
    throw new Error('Parámetros de paginación inválidos')
  }

  // Add optional filters
  if (params?.name && params.name.trim()) {
    validated.name = params.name.trim()
  }

  if (params?.category_id && isValidCategoryId(params.category_id)) {
    validated.category_id = params.category_id
  }

  if (params?.pantry_id && isValidPantryId(params.pantry_id)) {
    validated.pantry_id = params.pantry_id
  }

  return validated
}

/**
 * Create a new product
 * POST /api/products
 */
export const createProduct = async (
  data: ProductRegistrationData
): Promise<Product> => {
  // Validate input
  const validationError = getValidationError(data)
  if (validationError) {
    throw new Error(validationError)
  }

  const response = await post<Product>(PRODUCTS_ENDPOINT, data)
  return response
}

/**
 * List products with optional filters, pagination and sorting
 * GET /api/products
 */
export const listProducts = async (
  params?: ProductsListParams
): Promise<Product[]> => {
  // Validate and set defaults
  const validatedParams = validateListParams(params)

  // Build query string
  const queryParams = new URLSearchParams()
  
  if (validatedParams.name) {
    queryParams.append('name', validatedParams.name)
  }
  
  if (validatedParams.category_id) {
    queryParams.append('category_id', validatedParams.category_id.toString())
  }
  
  if (validatedParams.pantry_id) {
    queryParams.append('pantry_id', validatedParams.pantry_id.toString())
  }
  
  queryParams.append('page', validatedParams.page!.toString())
  queryParams.append('per_page', validatedParams.per_page!.toString())
  queryParams.append('order', validatedParams.order!)
  queryParams.append('sort_by', validatedParams.sort_by!)

  const url = `${PRODUCTS_ENDPOINT}?${queryParams.toString()}`
  
  // The API returns an array directly
  const response = await get<any>(url)
  
  console.log('Raw API response for listProducts:', response)
  console.log('Response type:', typeof response)
  console.log('Is array?', Array.isArray(response))
  if (response && typeof response === 'object') {
    console.log('Response keys:', Object.keys(response))
  }
  
  // Handle different response formats
  if (Array.isArray(response)) {
    console.log('✓ Format: Direct array, length:', response.length)
    return response as Product[]
  } else if (response && response.products && Array.isArray(response.products)) {
    console.log('✓ Format: Object with products property, length:', response.products.length)
    return response.products as Product[]
  } else if (response && response.data && Array.isArray(response.data)) {
    console.log('✓ Format: Object with data property, length:', response.data.length)
    return response.data as Product[]
  } else if (response && response.result && Array.isArray(response.result)) {
    console.log('✓ Format: Object with result property, length:', response.result.length)
    return response.result as Product[]
  } else if (response && response.items && Array.isArray(response.items)) {
    console.log('✓ Format: Object with items property, length:', response.items.length)
    return response.items as Product[]
  } else {
    console.error('❌ Unknown response format, returning empty array. Response:', response)
    return []
  }
}

/**
 * Get a single product by ID
 * GET /api/products/{id}
 */
export const getProduct = async (id: number): Promise<Product> => {
  if (!id || id < 1) {
    throw new Error('ID de producto inválido')
  }

  const url = `${PRODUCTS_ENDPOINT}/${id}`
  const response = await get<Product>(url)
  return response
}

/**
 * Update a product
 * PUT /api/products/{id}
 */
export const updateProduct = async (
  id: number,
  data: ProductUpdateData
): Promise<Product> => {
  if (!id || id < 1) {
    throw new Error('ID de producto inválido')
  }

  // Validate input
  const validationError = getValidationError(data)
  if (validationError) {
    throw new Error(validationError)
  }

  const url = `${PRODUCTS_ENDPOINT}/${id}`
  const response = await put<Product>(url, data)
  return response
}

/**
 * Delete a product
 * DELETE /api/products/{id}
 */
export const deleteProduct = async (id: number): Promise<void> => {
  if (!id || id < 1) {
    throw new Error('ID de producto inválido')
  }

  const url = `${PRODUCTS_ENDPOINT}/${id}`
  await del<void>(url)
}

// Export all functions
export default {
  createProduct,
  listProducts,
  getProduct,
  updateProduct,
  deleteProduct,
}
