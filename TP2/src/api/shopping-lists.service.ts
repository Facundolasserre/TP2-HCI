import { get, post, put, del } from './http'
import type {
  ShoppingList,
  ShoppingListsArray,
  ShoppingListCreate,
  ShoppingListUpdate,
  ListShoppingListsParams,
  ShareRequest,
  PurchaseRequest,
  ListItemArray,
  User,
} from '@/types/shopping-lists'

// Endpoints discovered from OpenAPI spec
const SHOPPING_LISTS_ENDPOINT = '/api/shopping-lists'

/**
 * Validate shopping list name
 */
const validateName = (name: string): void => {
  if (!name || !name.trim()) {
    throw new Error('El nombre es requerido')
  }
  if (name.length > 100) {
    throw new Error('El nombre no puede exceder los 100 caracteres')
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
 * Validate and sanitize list parameters
 */
const validateListParams = (params?: ListShoppingListsParams): ListShoppingListsParams => {
  const validated: ListShoppingListsParams = {
    page: params?.page ?? 1,
    per_page: params?.per_page ?? 10,
    sort_by: params?.sort_by ?? 'name',
    order: params?.order ?? 'ASC',
  }

  // Validate page and per_page
  if (validated.page! < 1) {
    throw new Error('El parámetro page debe ser mayor o igual a 1')
  }
  if (validated.per_page! < 1) {
    throw new Error('El parámetro per_page debe ser mayor o igual a 1')
  }

  // Add optional filters
  if (params?.name && params.name.trim()) {
    validated.name = params.name.trim()
  }
  if (params?.owner !== undefined) {
    validated.owner = params.owner
  }
  if (params?.recurring !== undefined) {
    validated.recurring = params.recurring
  }

  return validated
}

/**
 * Validate email format
 */
const validateEmail = (email: string): void => {
  if (!email || !email.trim()) {
    throw new Error('El email es requerido')
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new Error('El formato del email es inválido')
  }
}

/**
 * Create a new shopping list
 * POST /api/shopping-lists
 */
export const createList = async (
  data: ShoppingListCreate
): Promise<ShoppingList> => {
  // Validate input
  validateName(data.name)
  validateMetadata(data.metadata)

  const response = await post<ShoppingList>(SHOPPING_LISTS_ENDPOINT, data)
  return response
}

/**
 * List shopping lists with optional filters, pagination and sorting
 * GET /api/shopping-lists
 */
export const listLists = async (
  params?: ListShoppingListsParams
): Promise<ShoppingListsArray> => {
  // Validate and set defaults
  const validatedParams = validateListParams(params)

  // Build query string
  const queryParams = new URLSearchParams()
  
  if (validatedParams.name) {
    queryParams.append('name', validatedParams.name)
  }
  if (validatedParams.owner !== undefined) {
    queryParams.append('owner', validatedParams.owner.toString())
  }
  if (validatedParams.recurring !== undefined) {
    queryParams.append('recurring', validatedParams.recurring.toString())
  }
  queryParams.append('page', validatedParams.page!.toString())
  queryParams.append('per_page', validatedParams.per_page!.toString())
  queryParams.append('sort_by', validatedParams.sort_by!)
  queryParams.append('order', validatedParams.order!)

  const url = `${SHOPPING_LISTS_ENDPOINT}?${queryParams.toString()}`
  
  const response = await get<any>(url)
  
  // Handle different response formats
  if (Array.isArray(response)) {
    return response as ShoppingListsArray
  } else if (response.lists && Array.isArray(response.lists)) {
    return response.lists as ShoppingListsArray
  } else {
    return []
  }
}

/**
 * Get a single shopping list by ID
 * GET /api/shopping-lists/{id}
 */
export const getListById = async (id: number): Promise<ShoppingList> => {
  if (!id || id < 1) {
    throw new Error('ID de lista inválido')
  }

  const url = `${SHOPPING_LISTS_ENDPOINT}/${id}`
  const response = await get<ShoppingList>(url)
  return response
}

/**
 * Update a shopping list
 * PUT /api/shopping-lists/{id}
 */
export const updateList = async (
  id: number,
  data: ShoppingListUpdate
): Promise<ShoppingList> => {
  if (!id || id < 1) {
    throw new Error('ID de lista inválido')
  }

  // Validate fields if provided
  if (data.name !== undefined) {
    validateName(data.name)
  }
  validateMetadata(data.metadata)

  const url = `${SHOPPING_LISTS_ENDPOINT}/${id}`
  const response = await put<ShoppingList>(url, data)
  return response
}

/**
 * Delete a shopping list
 * DELETE /api/shopping-lists/{id}
 */
export const deleteList = async (id: number): Promise<void> => {
  if (!id || id < 1) {
    throw new Error('ID de lista inválido')
  }

  const url = `${SHOPPING_LISTS_ENDPOINT}/${id}`
  await del<void>(url)
}

/**
 * Purchase a shopping list (mark as purchased and create history entry)
 * POST /api/shopping-lists/{id}/purchase
 */
export const purchaseList = async (
  id: number,
  data?: PurchaseRequest
): Promise<ShoppingList> => {
  if (!id || id < 1) {
    throw new Error('ID de lista inválido')
  }

  const url = `${SHOPPING_LISTS_ENDPOINT}/${id}/purchase`
  const response = await post<ShoppingList>(url, data || {})
  return response
}

/**
 * Reset shopping list (mark all items as not purchased)
 * POST /api/shopping-lists/{id}/reset
 * Returns ListItemArray with updated items
 */
export const resetList = async (id: number): Promise<ListItemArray> => {
  if (!id || id < 1) {
    throw new Error('ID de lista inválido')
  }

  const url = `${SHOPPING_LISTS_ENDPOINT}/${id}/reset`
  const response = await post<ListItemArray>(url)
  return response
}

/**
 * Move purchased items to pantry
 * POST /api/shopping-lists/{id}/move-to-pantry
 */
export const moveToPantry = async (id: number): Promise<void> => {
  if (!id || id < 1) {
    throw new Error('ID de lista inválido')
  }

  const url = `${SHOPPING_LISTS_ENDPOINT}/${id}/move-to-pantry`
  await post<void>(url)
}

/**
 * Share shopping list with another user by email
 * POST /api/shopping-lists/{id}/share
 */
export const shareList = async (
  id: number,
  email: string
): Promise<void> => {
  if (!id || id < 1) {
    throw new Error('ID de lista inválido')
  }

  validateEmail(email)

  const url = `${SHOPPING_LISTS_ENDPOINT}/${id}/share`
  const data: ShareRequest = { email }
  await post<void>(url, data)
}

/**
 * Get users with access to a shared list
 * GET /api/shopping-lists/{id}/shared-users
 */
export const getSharedUsers = async (id: number): Promise<User[]> => {
  if (!id || id < 1) {
    throw new Error('ID de lista inválido')
  }

  const url = `${SHOPPING_LISTS_ENDPOINT}/${id}/shared-users`
  const response = await get<User[]>(url)
  return response
}

/**
 * Revoke access to a shared list
 * DELETE /api/shopping-lists/{id}/share/{user_id}
 */
export const revokeShare = async (
  id: number,
  userId: number
): Promise<void> => {
  if (!id || id < 1) {
    throw new Error('ID de lista inválido')
  }
  if (!userId || userId < 1) {
    throw new Error('ID de usuario inválido')
  }

  const url = `${SHOPPING_LISTS_ENDPOINT}/${id}/share/${userId}`
  await del<void>(url)
}

// Export all functions
export default {
  createList,
  listLists,
  getListById,
  updateList,
  deleteList,
  purchaseList,
  resetList,
  moveToPantry,
  shareList,
  getSharedUsers,
  revokeShare,
}
