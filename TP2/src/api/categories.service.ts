import { get, post, put, del } from './http'
import type {
  CategoryRegistrationData,
  GetCategory,
  UpdateCategoryProfile,
  ArrayOfCategories,
  ListCategoriesParams,
} from '@/types/categories'

const CATEGORIES_ENDPOINT = '/api/categories'

/**
 * Validate and sanitize list parameters
 */
const validateListParams = (params?: ListCategoriesParams): ListCategoriesParams => {
  const validated: ListCategoriesParams = {
    page: params?.page ?? 1,
    per_page: params?.per_page ?? 10,
    order: params?.order ?? 'ASC',
    sort_by: params?.sort_by ?? 'createdAt',
  }

  // Validate page and per_page
  if (validated.page! < 1) {
    throw new Error('El parámetro page debe ser mayor o igual a 1')
  }
  if (validated.per_page! < 1) {
    throw new Error('El parámetro per_page debe ser mayor o igual a 1')
  }

  // Add optional name filter
  if (params?.name && params.name.trim()) {
    validated.name = params.name.trim()
  }

  return validated
}

/**
 * Validate category name
 */
const validateCategoryName = (name: string): void => {
  if (!name || !name.trim()) {
    throw new Error('El nombre es requerido')
  }
  if (name.length > 50) {
    throw new Error('El nombre no puede exceder los 50 caracteres')
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
 * Create a new category
 * POST /api/categories
 */
export const createCategory = async (
  data: CategoryRegistrationData
): Promise<GetCategory> => {
  // Validate input
  validateCategoryName(data.name)
  validateMetadata(data.metadata)

  const response = await post<GetCategory>(CATEGORIES_ENDPOINT, data)
  return response
}

/**
 * List categories with optional filters, pagination and sorting
 * GET /api/categories
 */
export const listCategories = async (
  params?: ListCategoriesParams
): Promise<GetCategory[]> => {
  // Validate and set defaults
  const validatedParams = validateListParams(params)

  // Build query string
  const queryParams = new URLSearchParams()
  
  if (validatedParams.name) {
    queryParams.append('name', validatedParams.name)
  }
  queryParams.append('page', validatedParams.page!.toString())
  queryParams.append('per_page', validatedParams.per_page!.toString())
  queryParams.append('order', validatedParams.order!)
  queryParams.append('sort_by', validatedParams.sort_by!)

  const url = `${CATEGORIES_ENDPOINT}?${queryParams.toString()}`
  
  // The API returns ArrayOfCategories, but we'll handle both formats
  const response = await get<any>(url)
  
  // Handle different response formats
  if (Array.isArray(response)) {
    return response as GetCategory[]
  } else if (response.categories && Array.isArray(response.categories)) {
    return response.categories as GetCategory[]
  } else {
    return []
  }
}

/**
 * Get a single category by ID
 * GET /api/categories/{categoryId}
 */
export const getCategoryById = async (id: number): Promise<GetCategory> => {
  if (!id || id < 1) {
    throw new Error('ID de categoría inválido')
  }

  const url = `${CATEGORIES_ENDPOINT}/${id}`
  const response = await get<GetCategory>(url)
  return response
}

/**
 * Update a category
 * PUT /api/categories/{id}
 */
export const updateCategory = async (
  id: number,
  data: UpdateCategoryProfile
): Promise<GetCategory> => {
  if (!id || id < 1) {
    throw new Error('ID de categoría inválido')
  }

  // Validate fields if provided
  if (data.name !== undefined) {
    validateCategoryName(data.name)
  }
  validateMetadata(data.metadata)

  const url = `${CATEGORIES_ENDPOINT}/${id}`
  const response = await put<GetCategory>(url, data)
  return response
}

/**
 * Delete a category
 * DELETE /api/categories/{id}
 */
export const deleteCategory = async (id: number): Promise<void> => {
  if (!id || id < 1) {
    throw new Error('ID de categoría inválido')
  }

  const url = `${CATEGORIES_ENDPOINT}/${id}`
  await del<void>(url)
}

// Export all functions
export default {
  createCategory,
  listCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
}
