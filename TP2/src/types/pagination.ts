/**
 * Pagination metadata returned by API v1.0.1
 */
export interface PaginationMeta {
  total: number
  page: number
  per_page: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

/**
 * Paginated response structure from API v1.0.1
 * All list endpoints now return data + pagination metadata
 */
export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationMeta
}
