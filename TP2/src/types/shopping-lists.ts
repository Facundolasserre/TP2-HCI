// Types generated from OpenAPI 3.0 specification for Shopping Lists API

import type { GetCategory } from './categories'

/**
 * User definition (from OpenAPI definitions.User)
 */
export interface User {
  id: number
  email: string
  name: string
  surname: string
  metadata?: Record<string, any>
  createdAt?: string
  updatedAt?: string
}

/**
 * Product definition (from OpenAPI definitions.Product)
 */
export interface Product {
  id: number
  name: string
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
  category: GetCategory
  pantry?: any
}

/**
 * Shopping List (from OpenAPI definitions.ShoppingList)
 * Note: The 'completed' field is computed client-side based on lastPurchasedAt
 */
export interface ShoppingList {
  id: number
  name: string // maxLength: 100
  description?: string
  recurring?: boolean
  metadata?: Record<string, any>
  owner: User
  sharedWith: User[]
  completed?: boolean // Client-side computed: approximated from lastPurchasedAt
  lastPurchasedAt?: string | null
  createdAt: string
  updatedAt: string
}

/**
 * Shopping Lists Array (from OpenAPI definitions.ShoppingListsArray)
 */
export type ShoppingListsArray = ShoppingList[]

/**
 * Data for creating a shopping list (from OpenAPI definitions.ShoppingListCreate)
 * Validations:
 * - name: required, maxLength 100
 * - description: required (can be empty string) - API v1.0.1 requires this field
 * - recurring: optional boolean
 * - metadata: optional object
 */
export interface ShoppingListCreate {
  name: string // required, maxLength: 100
  description: string // required in API v1.0.1 (can be empty string)
  recurring?: boolean
  metadata?: Record<string, any>
}

/**
 * Data for updating a shopping list (from OpenAPI definitions.ShoppingListUpdate)
 */
export interface ShoppingListUpdate {
  name?: string // maxLength: 100
  description?: string
  recurring?: boolean
  metadata?: Record<string, any>
}

/**
 * Query parameters for listing shopping lists
 * From swagger: GET /api/shopping-lists
 */
export interface ListShoppingListsParams {
  name?: string
  owner?: boolean // Filter by ownership
  recurring?: boolean // Filter recurring lists
  page?: number // Default: 1
  per_page?: number // Default: 10
  sort_by?: 'name' | 'owner' | 'createdAt' | 'updatedAt' | 'lastPurchasedAt' // Default: name
  order?: 'ASC' | 'DESC' // Default: ASC
}

/**
 * Share request body
 */
export interface ShareRequest {
  email: string
}

/**
 * Purchase request body
 */
export interface PurchaseRequest {
  metadata?: Record<string, any>
}

/**
 * List Item (from OpenAPI definitions.ListItem)
 */
export interface ListItem {
  id: number
  quantity: number
  unit: string
  metadata?: Record<string, any> | null
  purchased: boolean
  lastPurchasedAt?: string | null
  createdAt: string
  updatedAt: string
  product: Product
}

/**
 * List Item Array (from OpenAPI definitions.ListItemArray)
 */
export type ListItemArray = ListItem[]

/**
 * Data for creating a list item (from OpenAPI definitions.ListItemCreate)
 * Validations:
 * - product.id: required
 * - quantity: required, number
 * - unit: required, string
 * - metadata: optional object
 */
export interface ListItemCreate {
  product: {
    id: number
  }
  quantity: number // required, default: 1
  unit: string // required, default: "kg"
  metadata?: Record<string, any> | null
}

/**
 * Data for updating a list item (from OpenAPI definitions.ListItemUpdate)
 */
export interface ListItemUpdate {
  quantity?: number
  unit?: string
  metadata?: Record<string, any> | null
}

/**
 * Query parameters for listing items
 * From swagger: GET /api/shopping-lists/{id}/items
 */
export interface ListItemsParams {
  purchased?: boolean
  page?: number // Default: 1
  per_page?: number // Default: 10
  sort_by?: 'updatedAt' | 'createdAt' | 'lastPurchasedAt' | 'productName' // Default: createdAt
  order?: 'ASC' | 'DESC' // Default: DESC
  pantry_id?: number
  category_id?: number
  search?: string // Product name search
}

/**
 * Toggle purchased request body
 */
export interface TogglePurchasedRequest {
  purchased: boolean
}

/**
 * API Error response
 */
export interface ApiError {
  message: string
  code?: string
  status?: number
}
