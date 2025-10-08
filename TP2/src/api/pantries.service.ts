import httpClient from './http'
import type {
  Pantry,
  PantryCreate,
  PantryUpdate,
  ArrayOfPantries,
  PantriesListParams,
  SharePantryRequest
} from '@/types/pantry'
import type { GetUser } from '@/types/user'
import {
  isValidPantryName,
  isValidMetadata,
  ValidationMessages
} from '@/types/pantry'

const BASE_PATH = '/api/pantries'

/**
 * Pantries Service
 * Implements all Pantry endpoints from OpenAPI spec
 * Source: /api/pantries routes in swagger
 */

/**
 * Create a new pantry
 * POST /api/pantries
 * Requires: bearerAuth
 * Validation: name required (≤50), metadata optional/nullable
 */
export async function createPantry(data: PantryCreate): Promise<Pantry> {
  // Client-side validation
  if (!data.name || !isValidPantryName(data.name)) {
    throw new Error(ValidationMessages.NAME_REQUIRED)
  }
  
  if (data.name.length > 50) {
    throw new Error(ValidationMessages.NAME_TOO_LONG)
  }

  if (data.metadata !== undefined && data.metadata !== null && !isValidMetadata(data.metadata)) {
    throw new Error(ValidationMessages.METADATA_INVALID)
  }

  const response = await httpClient.post<Pantry>(BASE_PATH, data)
  console.log('✓ Pantry created:', response.data.name)
  return response.data
}

/**
 * List pantries with optional filters, pagination, sorting
 * GET /api/pantries
 * Requires: bearerAuth
 * Query params: name, owner (boolean), page, per_page, sort_by, order
 */
export async function listPantries(params?: PantriesListParams): Promise<ArrayOfPantries> {
  const response = await httpClient.get<ArrayOfPantries>(BASE_PATH, { params })
  console.log('✓ Pantries fetched:', response.data.length)
  return response.data
}

/**
 * Get a single pantry by ID
 * GET /api/pantries/{id}
 * Requires: bearerAuth
 * Returns: Pantry with owner and sharedWith populated
 */
export async function getPantry(id: number): Promise<Pantry> {
  const response = await httpClient.get<Pantry>(`${BASE_PATH}/${id}`)
  console.log('✓ Pantry fetched:', response.data.name)
  return response.data
}

/**
 * Update a pantry
 * PUT /api/pantries/{id}
 * Requires: bearerAuth, owner permission
 * Validation: name optional (≤50), metadata optional/nullable
 */
export async function updatePantry(id: number, data: PantryUpdate): Promise<Pantry> {
  // Client-side validation
  if (data.name !== undefined) {
    if (!data.name || !isValidPantryName(data.name)) {
      throw new Error(ValidationMessages.NAME_REQUIRED)
    }
    if (data.name.length > 50) {
      throw new Error(ValidationMessages.NAME_TOO_LONG)
    }
  }

  if (data.metadata !== undefined && data.metadata !== null && !isValidMetadata(data.metadata)) {
    throw new Error(ValidationMessages.METADATA_INVALID)
  }

  const response = await httpClient.put<Pantry>(`${BASE_PATH}/${id}`, data)
  console.log('✓ Pantry updated:', response.data.name)
  return response.data
}

/**
 * Delete a pantry
 * DELETE /api/pantries/{id}
 * Requires: bearerAuth, owner permission
 * Returns: void
 */
export async function deletePantry(id: number): Promise<void> {
  await httpClient.delete(`${BASE_PATH}/${id}`)
  console.log('✓ Pantry deleted:', id)
}

/**
 * Share a pantry with another user by email
 * POST /api/pantries/{id}/share
 * Requires: bearerAuth, owner permission
 * Body: { email: string }
 * Returns: GetUser (the user who was granted access)
 */
export async function sharePantry(id: number, email: string): Promise<GetUser> {
  if (!email || !email.includes('@')) {
    throw new Error(ValidationMessages.EMAIL_INVALID)
  }

  const body: SharePantryRequest = { email }
  const response = await httpClient.post<GetUser>(`${BASE_PATH}/${id}/share`, body)
  console.log('✓ Pantry shared with:', email)
  return response.data
}

/**
 * List users with access to a pantry
 * GET /api/pantries/{id}/shared-users
 * Requires: bearerAuth
 * Returns: Array of GetUser (users who have access)
 */
export async function listShares(id: number): Promise<GetUser[]> {
  const response = await httpClient.get<GetUser[]>(`${BASE_PATH}/${id}/shared-users`)
  console.log('✓ Shared users fetched:', response.data.length)
  return response.data
}

/**
 * Revoke access from a user
 * DELETE /api/pantries/{id}/share/{user_id}
 * Requires: bearerAuth, owner permission
 * Returns: void
 */
export async function revokeShare(id: number, userId: number): Promise<void> {
  await httpClient.delete(`${BASE_PATH}/${id}/share/${userId}`)
  console.log('✓ Share revoked for user:', userId)
}

export default {
  createPantry,
  listPantries,
  getPantry,
  updatePantry,
  deletePantry,
  sharePantry,
  listShares,
  revokeShare
}
