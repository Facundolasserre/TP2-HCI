import httpClient from './http'
import type {
  PantryItem,
  PantryItemArray,
  PantryItemCreate,
  PantryItemUpdate,
  PantryItemsListParams
} from '@/types/pantry'
import {
  isValidQuantity,
  isValidUnit,
  isValidMetadata,
  ValidationMessages
} from '@/types/pantry'

/**
 * Pantry Items Service
 * Implements all Pantry Item endpoints from OpenAPI spec
 * Source: /api/pantries/{id}/items routes in swagger
 */

/**
 * Add an item to a pantry
 * POST /api/pantries/{id}/items
 * Requires: bearerAuth
 * Body: { product_id, quantity, unit, metadata? }
 * Validation: product_id required, quantity > 0, unit required, metadata optional/nullable
 */
export async function addItem(pantryId: number, data: PantryItemCreate): Promise<PantryItem> {
  // Client-side validation
  if (!data.product_id) {
    throw new Error(ValidationMessages.PRODUCT_REQUIRED)
  }

  if (!data.quantity || !isValidQuantity(data.quantity)) {
    throw new Error(ValidationMessages.QUANTITY_INVALID)
  }

  if (!data.unit || !isValidUnit(data.unit)) {
    throw new Error(ValidationMessages.UNIT_REQUIRED)
  }

  if (data.metadata !== undefined && data.metadata !== null && !isValidMetadata(data.metadata)) {
    throw new Error(ValidationMessages.METADATA_INVALID)
  }

  // Transform to API format: { product: { id }, quantity, unit, metadata }
  const requestBody = {
    product: { id: data.product_id },
    quantity: data.quantity,
    unit: data.unit,
    metadata: data.metadata
  }

  const response = await httpClient.post<PantryItem>(
    `/api/pantries/${pantryId}/items`,
    requestBody
  )
  console.log('✓ Pantry item added:', response.data.id)
  return response.data
}

/**
 * Get items from a pantry with optional filters, pagination, sorting
 * GET /api/pantries/{id}/items
 * Requires: bearerAuth
 * Query params: page, per_page, sort_by, order, search, category_id
 */
export async function getItems(pantryId: number, params?: PantryItemsListParams): Promise<PantryItemArray> {
  const response = await httpClient.get<PantryItemArray>(
    `/api/pantries/${pantryId}/items`,
    { params }
  )
  console.log('✓ Pantry items fetched:', response.data.length)
  return response.data
}

/**
 * Update a pantry item
 * PUT /api/pantries/{id}/items/{item_id}
 * Requires: bearerAuth
 * Body: { quantity?, unit?, metadata? }
 * Validation: quantity > 0 if provided, unit string if provided, metadata valid if provided
 */
export async function updateItem(
  pantryId: number,
  itemId: number,
  data: PantryItemUpdate
): Promise<PantryItem> {
  // Client-side validation
  if (data.quantity !== undefined && !isValidQuantity(data.quantity)) {
    throw new Error(ValidationMessages.QUANTITY_INVALID)
  }

  if (data.unit !== undefined && !isValidUnit(data.unit)) {
    throw new Error(ValidationMessages.UNIT_REQUIRED)
  }

  if (data.metadata !== undefined && data.metadata !== null && !isValidMetadata(data.metadata)) {
    throw new Error(ValidationMessages.METADATA_INVALID)
  }

  const response = await httpClient.put<PantryItem>(
    `/api/pantries/${pantryId}/items/${itemId}`,
    data
  )
  console.log('✓ Pantry item updated:', itemId)
  return response.data
}

/**
 * Remove an item from a pantry
 * DELETE /api/pantries/{id}/items/{item_id}
 * Requires: bearerAuth
 * Returns: void
 */
export async function removeItem(pantryId: number, itemId: number): Promise<void> {
  await httpClient.delete(`/api/pantries/${pantryId}/items/${itemId}`)
  console.log('✓ Pantry item removed:', itemId)
}

export default {
  addItem,
  getItems,
  updateItem,
  removeItem
}
