// Types based on OpenAPI 3.0 specification for Products API

import type { GetCategory } from './categories'

/**
 * Complete product data returned from API
 */
export interface Product {
  id: number
  name: string // Max 50 characters
  metadata?: Record<string, any> | null
  createdAt: string // Format: YYYY-mm-dd HH:MM:SS
  updatedAt: string // Format: YYYY-mm-dd HH:MM:SS
  category?: GetCategory | null
}

/**
 * Alias for GetProduct (used in some API responses)
 */
export type GetProduct = Product

/**
 * Data required to create a new product
 */
export interface ProductRegistrationData {
  name: string // Required, max 50 characters
  category?: {
    id: number
  }
  metadata?: Record<string, any> | null
}

/**
 * Data for updating a product (same as creation)
 */
export type ProductUpdateData = ProductRegistrationData

/**
 * Response type for list products endpoint
 */
export interface ArrayOfProducts {
  products?: Product[]
  total?: number
  page?: number
  perPage?: number
}

/**
 * Query parameters for listing products
 */
export interface ProductsListParams {
  name?: string // Filter by product name
  category_id?: number // Filter by category ID
  pantry_id?: number // Filter by pantry ID (products in specific pantry)
  page?: number // Default: 1
  per_page?: number // Default: 10
  order?: 'ASC' | 'DESC' // Default: ASC
  sort_by?: 'name' | 'categoryName' | 'createdAt' | 'updatedAt' // Default: name
}

/**
 * Validation error messages (Spanish)
 */
export const ValidationMessages = {
  NAME_REQUIRED: 'El nombre del producto es requerido',
  NAME_TOO_LONG: 'El nombre no puede exceder los 50 caracteres',
  NAME_INVALID: 'El nombre debe contener al menos un carácter válido',
  CATEGORY_INVALID: 'La categoría seleccionada no es válida',
  METADATA_INVALID: 'El campo metadata debe ser un objeto JSON válido',
  PAGE_INVALID: 'El número de página debe ser mayor o igual a 1',
  PER_PAGE_INVALID: 'El número de resultados por página debe ser mayor o igual a 1',
} as const

/**
 * Validate product name
 */
export const isValidProductName = (name: string): boolean => {
  if (!name || typeof name !== 'string') {
    return false
  }
  const trimmed = name.trim()
  return trimmed.length > 0 && trimmed.length <= 50
}

/**
 * Validate category ID
 */
export const isValidCategoryId = (categoryId?: number): boolean => {
  if (categoryId === undefined || categoryId === null) {
    return true // Optional field
  }
  return Number.isInteger(categoryId) && categoryId > 0
}

/**
 * Validate pantry ID
 */
export const isValidPantryId = (pantryId?: number): boolean => {
  if (pantryId === undefined || pantryId === null) {
    return true // Optional field
  }
  return Number.isInteger(pantryId) && pantryId > 0
}

/**
 * Validate metadata object
 */
export const isValidMetadata = (metadata?: any): boolean => {
  if (metadata === undefined || metadata === null) {
    return true // Optional field
  }
  return typeof metadata === 'object' && !Array.isArray(metadata)
}

/**
 * Validate pagination parameters
 */
export const isValidPagination = (page?: number, perPage?: number): boolean => {
  if (page !== undefined && (!Number.isInteger(page) || page < 1)) {
    return false
  }
  if (perPage !== undefined && (!Number.isInteger(perPage) || perPage < 1)) {
    return false
  }
  return true
}

/**
 * API Error response
 */
export interface ApiError {
  message: string
  code?: string
  status?: number
}

/**
 * Helper to get validation error message
 */
export const getValidationError = (
  data: Partial<ProductRegistrationData>
): string | null => {
  if (!isValidProductName(data.name || '')) {
    if (!data.name || !data.name.trim()) {
      return ValidationMessages.NAME_REQUIRED
    }
    if (data.name.length > 50) {
      return ValidationMessages.NAME_TOO_LONG
    }
    return ValidationMessages.NAME_INVALID
  }

  if (data.category?.id !== undefined && !isValidCategoryId(data.category.id)) {
    return ValidationMessages.CATEGORY_INVALID
  }

  if (data.metadata !== undefined && !isValidMetadata(data.metadata)) {
    return ValidationMessages.METADATA_INVALID
  }

  return null
}
