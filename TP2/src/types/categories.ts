// Types based on OpenAPI 3.0 specification for Categories API

/**
 * Data required to register/create a new category
 */
export interface CategoryRegistrationData {
  name: string // Max 50 characters
  metadata?: Record<string, any> // Optional metadata object
}

/**
 * Complete category data returned from API
 */
export interface GetCategory {
  id: number
  name: string
  metadata?: Record<string, any>
  createdAt: string // Format: YYYY-mm-dd
  updatedAt: string // Format: YYYY-mm-dd
}

/**
 * Data for updating a category profile
 */
export interface UpdateCategoryProfile {
  name?: string // Max 50 characters
  metadata?: Record<string, any>
}

/**
 * Response type for list categories endpoint
 */
export interface ArrayOfCategories {
  categories: GetCategory[]
  total?: number
  page?: number
  perPage?: number
}

/**
 * Query parameters for listing categories
 */
export interface ListCategoriesParams {
  name?: string // Filter by name
  page?: number // Default: 1
  per_page?: number // Default: 10
  order?: 'ASC' | 'DESC' // Default: ASC
  sort_by?: 'name' | 'createdAt' | 'updatedAt' // Default: createdAt
}

/**
 * API Error response
 */
export interface ApiError {
  message: string
  code?: string
  status?: number
}
