import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  GetCategory,
  CategoryRegistrationData,
  UpdateCategoryProfile,
  ListCategoriesParams,
  ApiError,
} from '@/types/categories'
import type { PaginationMeta } from '@/types/pagination'
import * as categoriesService from '@/api/categories.service'

export const useCategoriesStore = defineStore('categories', () => {
  // State
  const items = ref<GetCategory[]>([])
  const currentCategory = ref<GetCategory | null>(null)
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

  // Getters
  const categoriesCount = computed(() => items.value.length)
  const hasCategories = computed(() => items.value.length > 0)
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => error.value !== null)
  const total = computed(() => pagination.value.total)
  const currentPage = computed(() => pagination.value.page)
  const perPage = computed(() => pagination.value.per_page)
  const totalPages = computed(() => pagination.value.total_pages)
  const hasNextPage = computed(() => pagination.value.has_next)
  const hasPrevPage = computed(() => pagination.value.has_prev)

  // Actions

  /**
   * Fetch categories list with filters (API v1.0.1 returns paginated response)
   */
  const fetchCategories = async (params?: ListCategoriesParams) => {
    loading.value = true
    error.value = null

    try {
      const response = await categoriesService.listCategories(params)
      items.value = response.data
      pagination.value = response.pagination
      
      return response
    } catch (err) {
      error.value = err as ApiError
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch a single category by ID
   */
  const fetchCategoryById = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      const category = await categoriesService.getCategoryById(id)
      currentCategory.value = category
      return category
    } catch (err) {
      error.value = err as ApiError
      currentCategory.value = null
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Create a new category
   */
  const createCategory = async (data: CategoryRegistrationData) => {
    loading.value = true
    error.value = null

    try {
      const newCategory = await categoriesService.createCategory(data)
      
      // Add to local state
      items.value.unshift(newCategory)
      
      return newCategory
    } catch (err) {
      error.value = err as ApiError
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update a category (with optimistic UI)
   */
  const updateCategory = async (id: number, data: UpdateCategoryProfile) => {
    loading.value = true
    error.value = null

    // Store original state for rollback
    const originalItems = [...items.value]
    const originalCurrent = currentCategory.value

    // Optimistic update
    const index = items.value.findIndex((cat) => cat.id === id)
    if (index !== -1) {
      items.value[index] = { ...items.value[index], ...data }
    }
    if (currentCategory.value?.id === id) {
      currentCategory.value = { ...currentCategory.value, ...data }
    }

    try {
      const updatedCategory = await categoriesService.updateCategory(id, data)
      
      // Update with real data from server
      if (index !== -1) {
        items.value[index] = updatedCategory
      }
      if (currentCategory.value?.id === id) {
        currentCategory.value = updatedCategory
      }
      
      return updatedCategory
    } catch (err) {
      // Rollback on error
      items.value = originalItems
      currentCategory.value = originalCurrent
      error.value = err as ApiError
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete a category (with optimistic UI)
   */
  const deleteCategory = async (id: number) => {
    loading.value = true
    error.value = null

    // Store original state for rollback
    const originalItems = [...items.value]
    const index = items.value.findIndex((cat) => cat.id === id)

    // Optimistic delete
    if (index !== -1) {
      items.value.splice(index, 1)
    }
    if (currentCategory.value?.id === id) {
      currentCategory.value = null
    }

    try {
      await categoriesService.deleteCategory(id)
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
    currentCategory.value = null
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
  }

  return {
    // State
    items,
    currentCategory,
    loading,
    error,
    pagination,
    
    // Getters
    categoriesCount,
    hasCategories,
    isLoading,
    hasError,
    total,
    currentPage,
    perPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    
    // Actions
    fetchCategories,
    fetchCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    clearError,
    reset,
  }
})
