import type { GetUser } from './user'
import type { Product } from './shopping-lists'

/**
 * Pantry - Complete pantry entity from API
 * Source: OpenAPI definitions/Pantry
 */
export interface Pantry {
  id: number
  name: string
  metadata: object | null
  createdAt: string
  updatedAt: string
  owner: GetUser
  sharedWith: GetUser[] | null
}

/**
 * PantryCreate - Data to create a new pantry
 * Source: OpenAPI definitions/PantryCreate
 * Constraints: name maxLength 50, metadata nullable
 */
export interface PantryCreate {
  name: string
  metadata?: object | null
}

/**
 * PantryUpdate - Data to update a pantry
 * Source: OpenAPI definitions/PantryUpdate
 * Constraints: name maxLength 50, metadata nullable
 */
export interface PantryUpdate {
  name?: string
  metadata?: object | null
}

/**
 * ArrayOfPantries - Array of pantries from API
 * Source: OpenAPI definitions/ArrayOfPantries
 */
export type ArrayOfPantries = Pantry[]

/**
 * PantryItem - Item in a pantry with product reference
 * Source: OpenAPI definitions/PantryItem
 */
export interface PantryItem {
  id: number
  quantity: number
  unit: string
  metadata: object | null
  product: Product
  createdAt: string
  updatedAt: string
}

/**
 * PantryItemArray - Array of pantry items
 * Source: OpenAPI definitions/PantryItemArray
 */
export type PantryItemArray = PantryItem[]

/**
 * PantryItemCreate - Data to create a new pantry item
 * Source: OpenAPI /api/pantries/{id}/items POST body
 */
export interface PantryItemCreate {
  product_id: number
  quantity: number
  unit: string
  metadata?: object | null
}

/**
 * PantryItemUpdate - Data to update a pantry item
 * Source: OpenAPI /api/pantries/{id}/items/{item_id} PUT body
 */
export interface PantryItemUpdate {
  quantity?: number
  unit?: string
  metadata?: object | null
}

/**
 * Pantry list query parameters
 * Source: OpenAPI /api/pantries GET parameters
 */
export interface PantriesListParams {
  name?: string
  owner?: boolean // true=owned by me, false=shared with me, undefined=all
  page?: number
  per_page?: number
  sort_by?: 'name' | 'owner' | 'createdAt' | 'updatedAt'
  order?: 'ASC' | 'DESC'
}

/**
 * Pantry items list query parameters
 * Source: OpenAPI /api/pantries/{id}/items GET parameters
 */
export interface PantryItemsListParams {
  page?: number
  per_page?: number
  sort_by?: 'name' | 'quantity' | 'unit' | 'productName'
  order?: 'ASC' | 'DESC'
  search?: string
  category_id?: number
}

/**
 * Share pantry request body
 * Source: OpenAPI /api/pantries/{id}/share POST body
 */
export interface SharePantryRequest {
  email: string
}

/**
 * Validation functions
 */
export function isValidPantryName(name: string): boolean {
  return name.length > 0 && name.length <= 50
}

export function isValidQuantity(quantity: number): boolean {
  return quantity > 0 && Number.isFinite(quantity)
}

export function isValidUnit(unit: string): boolean {
  return unit.length > 0 && unit.length <= 50
}

export function isValidMetadata(metadata: any): boolean {
  if (metadata === null || metadata === undefined) return true
  try {
    // Check if it's a plain object
    return typeof metadata === 'object' && !Array.isArray(metadata)
  } catch {
    return false
  }
}

/**
 * Validation messages
 */
export const ValidationMessages = {
  NAME_REQUIRED: 'El nombre es requerido',
  NAME_TOO_LONG: 'El nombre no puede superar los 50 caracteres',
  QUANTITY_REQUIRED: 'La cantidad es requerida',
  QUANTITY_INVALID: 'La cantidad debe ser un número positivo',
  UNIT_REQUIRED: 'La unidad es requerida',
  UNIT_TOO_LONG: 'La unidad no puede superar los 50 caracteres',
  METADATA_INVALID: 'Los metadatos deben ser un objeto JSON válido',
  PRODUCT_REQUIRED: 'El producto es requerido',
  EMAIL_REQUIRED: 'El email es requerido',
  EMAIL_INVALID: 'El formato del email es inválido'
} as const
