import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  Product,
  ProductRegistrationData,
  ProductUpdateData,
  ProductsListParams,
  ApiError,
} from '@/types/products'
import type { PaginationMeta } from '@/types/pagination'
import * as productsService from '@/api/products.service'

export const useProductsStore = defineStore('products', () => {
  // State
  const items = ref<Product[]>([])
  const currentProduct = ref<Product | null>(null)
  const loading = ref(false)
  const error = ref<ApiError | null>(null)
  
  // Pagination state (from API v1.0.1)
  const pagination = ref<PaginationMeta>({
    total: 0,
    page: 1,
    per_page: 10,
    total_pages: 0,
    has_next: false,
    has_prev: false
  })
  
  // Filters state
  const filters = ref<ProductsListParams>({
    name: undefined,
    category_id: undefined,
    pantry_id: undefined,
    page: 1,
    per_page: 10,
    order: 'ASC',
    sort_by: 'name',
  })

  // Getters
  const productsCount = computed(() => items.value.length)
  const hasProducts = computed(() => items.value.length > 0)
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => error.value !== null)
  const total = computed(() => pagination.value.total)
  const currentPage = computed(() => pagination.value.page)
  const perPage = computed(() => pagination.value.per_page)
  const totalPages = computed(() => pagination.value.total_pages)
  const hasNextPage = computed(() => pagination.value.has_next)
  const hasPrevPage = computed(() => pagination.value.has_prev)
  
  /**
   * Get products grouped by category
   */
  const productsByCategory = computed(() => {
    const grouped = new Map<string, Product[]>()
    
    items.value.forEach((product) => {
      const categoryName = product.category?.name || 'Sin categoría'
      if (!grouped.has(categoryName)) {
        grouped.set(categoryName, [])
      }
      grouped.get(categoryName)!.push(product)
    })
    
    return grouped
  })

  // Actions

  /**
   * Fetch products list with filters and pagination (API v1.0.1)
   */
  const fetchProducts = async (params?: ProductsListParams) => {
    loading.value = true
    error.value = null

    try {
      const response = await productsService.listProducts(params)
      const products = response.data
      
      // Only update items if we got products back, or if we explicitly have no filters
      // This prevents losing locally created items if API returns empty
      const hasNoFilters = !params?.name && !params?.category_id && !params?.pantry_id
      
      if (products.length > 0 || hasNoFilters || items.value.length === 0) {
        items.value = products
      } else {
        console.warn('⚠️ API returned empty array but we have local items. Keeping local items.')
      }
      
      // Update pagination from API response
      pagination.value = response.pagination
      
      // Update filters state
      if (params) {
        filters.value = { ...filters.value, ...params }
      }
      
      return response
    } catch (err) {
      error.value = err as ApiError
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch a single product by ID
   */
  const fetchProductById = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      const product = await productsService.getProduct(id)
      currentProduct.value = product
      return product
    } catch (err) {
      error.value = err as ApiError
      currentProduct.value = null
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Create a new product
   */
  const createProduct = async (data: ProductRegistrationData) => {
    loading.value = true
    error.value = null

    try {
      const newProduct = await productsService.createProduct(data)
      
      // Add to local state
      items.value.unshift(newProduct)
      
      return newProduct
    } catch (err) {
      error.value = err as ApiError
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update a product
   */
  const updateProduct = async (id: number, data: ProductUpdateData) => {
    loading.value = true
    error.value = null

    // Store original state for rollback
    const originalItems = [...items.value]
    const originalCurrent = currentProduct.value

    try {
      const updatedProduct = await productsService.updateProduct(id, data)
      
      // Update with real data from server
      const index = items.value.findIndex((prod) => prod.id === id)
      if (index !== -1) {
        items.value[index] = updatedProduct
      }
      if (currentProduct.value?.id === id) {
        currentProduct.value = updatedProduct
      }
      
      return updatedProduct
    } catch (err) {
      // Rollback on error
      items.value = originalItems
      currentProduct.value = originalCurrent
      error.value = err as ApiError
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete a product (with optimistic UI)
   */
  const deleteProduct = async (id: number) => {
    loading.value = true
    error.value = null

    // Store original state for rollback
    const originalItems = [...items.value]
    const index = items.value.findIndex((prod) => prod.id === id)

    // Optimistic delete
    if (index !== -1) {
      items.value.splice(index, 1)
    }
    if (currentProduct.value?.id === id) {
      currentProduct.value = null
    }

    try {
      await productsService.deleteProduct(id)
      // Success - optimistic update is already applied
    } catch (err) {
      // Rollback on error
      items.value = originalItems
      error.value = err as ApiError
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update filters
   */
  const updateFilters = (newFilters: Partial<ProductsListParams>) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  /**
   * Reset filters to default
   */
  const resetFilters = () => {
    filters.value = {
      name: undefined,
      category_id: undefined,
      pantry_id: undefined,
      page: 1,
      per_page: 10,
      order: 'ASC',
      sort_by: 'name',
    }
  }

  /**
   * Clear error
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * Reset store state
   */
  const reset = () => {
    items.value = []
    currentProduct.value = null
    loading.value = false
    error.value = null
    pagination.value = {
      total: 0,
      page: 1,
      per_page: 10,
      total_pages: 0,
      has_next: false,
      has_prev: false
    }
    resetFilters()
  }

  return {
    // State
    items,
    currentProduct,
    loading,
    error,
    pagination,
    filters,
    
    // Getters
    productsCount,
    hasProducts,
    isLoading,
    hasError,
    total,
    currentPage,
    perPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    productsByCategory,
    
    // Actions
    fetchProducts,
    fetchProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    updateFilters,
    resetFilters,
    clearError,
    reset,
  }
})
