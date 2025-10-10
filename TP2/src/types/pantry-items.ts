// Types based on OpenAPI 3.0 specification for Pantry Items API

import type { Product } from './products'

/**
 * Pantry item with product details
 * From swagger: PantryItem definition
 */
export interface PantryItem {
  id: number
  quantity: number
  unit: string
  metadata?: Record<string, any> | null
  product: Product
  createdAt: string // Format: YYYY-mm-dd HH:MM:SS
  updatedAt: string // Format: YYYY-mm-dd HH:MM:SS
}

/**
 * Response type for list pantry items endpoint
 * From swagger: PantryItemArray definition
 */
export type PantryItemArray = PantryItem[]

/**
 * Data required to create a new pantry item
 * POST /api/pantries/{id}/items
 */
export interface PantryItemCreate {
  product_id: number // Required
  quantity: number // Required
  unit: string // Required
  metadata?: Record<string, any> | null // Optional
}

/**
 * Data for updating a pantry item
 * PUT /api/pantries/{id}/items/{item_id}
 */
export interface PantryItemUpdate {
  quantity?: number
  unit?: string
  metadata?: Record<string, any> | null
}

/**
 * Query parameters for listing pantry items
 * GET /api/pantries/{id}/items
 */
export interface PantryItemsListParams {
  q?: string // Search query for product name
  page?: number // Default: 1
  per_page?: number // Default: 10
}

/**
 * Validation error messages (Spanish)
 */
export const ValidationMessages = {
  PRODUCT_ID_REQUIRED: 'El producto es requerido',
  QUANTITY_REQUIRED: 'La cantidad es requerida',
  QUANTITY_INVALID: 'La cantidad debe ser un número mayor a 0',
  UNIT_REQUIRED: 'La unidad es requerida',
  UNIT_INVALID: 'La unidad debe ser una cadena de texto válida',
  METADATA_INVALID: 'El campo metadata debe ser un objeto JSON válido',
} as const

/**
 * Validate product_id
 */
export const isValidProductId = (productId?: number): boolean => {
  if (productId === undefined || productId === null) {
    return false
  }
  return Number.isInteger(productId) && productId > 0
}

/**
 * Validate quantity
 */
export const isValidQuantity = (quantity?: number): boolean => {
  if (quantity === undefined || quantity === null) {
    return false
  }
  return typeof quantity === 'number' && quantity > 0
}

/**
 * Validate unit string
 */
export const isValidUnit = (unit?: string): boolean => {
  if (!unit || typeof unit !== 'string') {
    return false
  }
  return unit.trim().length > 0
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
 * Helper to get validation error message for create
 */
export const getCreateValidationError = (
  data: Partial<PantryItemCreate>
): string | null => {
  if (!isValidProductId(data.product_id)) {
    return ValidationMessages.PRODUCT_ID_REQUIRED
  }

  if (!isValidQuantity(data.quantity)) {
    if (data.quantity === undefined || data.quantity === null) {
      return ValidationMessages.QUANTITY_REQUIRED
    }
    return ValidationMessages.QUANTITY_INVALID
  }

  if (!isValidUnit(data.unit)) {
    if (!data.unit) {
      return ValidationMessages.UNIT_REQUIRED
    }
    return ValidationMessages.UNIT_INVALID
  }

  if (data.metadata !== undefined && !isValidMetadata(data.metadata)) {
    return ValidationMessages.METADATA_INVALID
  }

  return null
}

/**
 * Helper to get validation error message for update
 */
export const getUpdateValidationError = (
  data: Partial<PantryItemUpdate>
): string | null => {
  if (data.quantity !== undefined && !isValidQuantity(data.quantity)) {
    return ValidationMessages.QUANTITY_INVALID
  }

  if (data.unit !== undefined && !isValidUnit(data.unit)) {
    return ValidationMessages.UNIT_INVALID
  }

  if (data.metadata !== undefined && !isValidMetadata(data.metadata)) {
    return ValidationMessages.METADATA_INVALID
  }

  return null
}
