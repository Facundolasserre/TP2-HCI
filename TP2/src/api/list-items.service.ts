import { get, post, put, patch, del } from './http'
import type { PaginatedResponse } from '@/types/pagination'
import type {
  ListItem,
  ListItemArray,
  ListItemCreate,
  ListItemUpdate,
  ListItemsParams,
  TogglePurchasedRequest,
} from '@/types/shopping-lists'

// Base endpoint for list items
const getListItemsEndpoint = (listId: number) => `/api/shopping-lists/${listId}/items`

/**
 * Validate quantity
 */
const validateQuantity = (quantity: number): void => {
  if (quantity === undefined || quantity === null) {
    throw new Error('La cantidad es requerida')
  }
  if (typeof quantity !== 'number' || isNaN(quantity)) {
    throw new Error('La cantidad debe ser un número válido')
  }
  if (quantity <= 0) {
    throw new Error('La cantidad debe ser mayor a 0')
  }
}

/**
 * Validate unit
 */
const validateUnit = (unit: string): void => {
  if (!unit || !unit.trim()) {
    throw new Error('La unidad es requerida')
  }
}

/**
 * Validate product ID
 */
const validateProductId = (productId: number): void => {
  if (!productId || productId < 1) {
    throw new Error('ID de producto inválido')
  }
}

/**
 * Validate metadata JSON
 */
const validateMetadata = (metadata?: any): void => {
  if (metadata === undefined || metadata === null) {
    return // Optional field
  }
  
  if (typeof metadata !== 'object' || Array.isArray(metadata)) {
    throw new Error('El campo metadata debe ser un objeto')
  }
}

/**
 * Validate and sanitize list items parameters
 */
const validateListItemsParams = (params?: ListItemsParams): ListItemsParams => {
  const validated: ListItemsParams = {
    page: params?.page ?? 1,
    per_page: params?.per_page ?? 10,
    sort_by: params?.sort_by ?? 'createdAt',
    order: params?.order ?? 'DESC',
  }

  // Validate page and per_page
  if (validated.page! < 1) {
    throw new Error('El parámetro page debe ser mayor o igual a 1')
  }
  if (validated.per_page! < 1) {
    throw new Error('El parámetro per_page debe ser mayor o igual a 1')
  }

  // Add optional filters
  if (params?.purchased !== undefined) {
    validated.purchased = params.purchased
  }
  if (params?.pantry_id) {
    validated.pantry_id = params.pantry_id
  }
  if (params?.category_id) {
    validated.category_id = params.category_id
  }
  if (params?.search && params.search.trim()) {
    validated.search = params.search.trim()
  }

  return validated
}

/**
 * Add an item to a shopping list
 * POST /api/shopping-lists/{id}/items
 */
export const addItem = async (
  listId: number,
  data: ListItemCreate
): Promise<ListItem> => {
  if (!listId || listId < 1) {
    throw new Error('ID de lista inválido')
  }

  // Validate input
  validateProductId(data.product.id)
  validateQuantity(data.quantity)
  validateUnit(data.unit)
  validateMetadata(data.metadata)

  const url = getListItemsEndpoint(listId)
  const response = await post<{ item: ListItem }>(url, data)
  
  // Backend returns { item: ListItem }, we need to extract the item
  return response.item
}

/**
 * Get items from a shopping list with optional filters
 * GET /api/shopping-lists/{id}/items
 */
export const getItems = async (
  listId: number,
  params?: ListItemsParams
): Promise<PaginatedResponse<ListItem>> => {
  if (!listId || listId < 1) {
    throw new Error('ID de lista inválido')
  }

  // Validate and set defaults
  const validatedParams = validateListItemsParams(params)

  const url = getListItemsEndpoint(listId)
  
  // API v1.0.1 returns { data: [...], pagination: {...} }
  const response = await get<PaginatedResponse<ListItem>>(url, { params: validatedParams })
  return response
}

/**
 * Update a list item (quantity, unit, metadata)
 * PUT /api/shopping-lists/{id}/items/{item_id}
 */
export const updateItem = async (
  listId: number,
  itemId: number,
  data: ListItemUpdate
): Promise<ListItem> => {
  if (!listId || listId < 1) {
    throw new Error('ID de lista inválido')
  }
  if (!itemId || itemId < 1) {
    throw new Error('ID de ítem inválido')
  }

  // Validate fields if provided
  if (data.quantity !== undefined) {
    validateQuantity(data.quantity)
  }
  if (data.unit !== undefined) {
    validateUnit(data.unit)
  }
  validateMetadata(data.metadata)

  const url = `${getListItemsEndpoint(listId)}/${itemId}`
  const response = await put<ListItem>(url, data)
  return response
}

/**
 * Toggle purchased status of a list item
 * PATCH /api/shopping-lists/{id}/items/{item_id}
 */
export const togglePurchased = async (
  listId: number,
  itemId: number,
  purchased: boolean
): Promise<ListItem> => {
  if (!listId || listId < 1) {
    throw new Error('ID de lista inválido')
  }
  if (!itemId || itemId < 1) {
    throw new Error('ID de ítem inválido')
  }

  const url = `${getListItemsEndpoint(listId)}/${itemId}`
  const data: TogglePurchasedRequest = { purchased }
  const response = await patch<ListItem>(url, data)
  return response
}

/**
 * Delete a list item
 * DELETE /api/shopping-lists/{id}/items/{item_id}
 */
export const removeItem = async (
  listId: number,
  itemId: number
): Promise<void> => {
  if (!listId || listId < 1) {
    throw new Error('ID de lista inválido')
  }
  if (!itemId || itemId < 1) {
    throw new Error('ID de ítem inválido')
  }

  const url = `${getListItemsEndpoint(listId)}/${itemId}`
  await del<void>(url)
}

// Export all functions
export default {
  addItem,
  getItems,
  updateItem,
  togglePurchased,
  removeItem,
}
