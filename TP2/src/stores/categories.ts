import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  GetCategory,
  CategoryRegistrationData,
  UpdateCategoryProfile,
  ListCategoriesParams,
  ApiError,
} from '@/types/categories'
import * as categoriesService from '@/api/categories.service'

export const useCategoriesStore = defineStore('categories', () => {
  // State
  const items = ref<GetCategory[]>([])
  const currentCategory = ref<GetCategory | null>(null)
  const loading = ref(false)
  const error = ref<ApiError | null>(null)
  const total = ref(0)
  const currentPage = ref(1)
  const perPage = ref(10)

  // Getters
  const categoriesCount = computed(() => items.value.length)
  const hasCategories = computed(() => items.value.length > 0)
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => error.value !== null)

  // Actions

  /**
   * Fetch categories list with filters
   */
  const fetchCategories = async (params?: ListCategoriesParams) => {
    loading.value = true
    error.value = null

    try {
      const categories = await categoriesService.listCategories(params)
      items.value = categories
      
      // Update pagination state
      if (params?.page) currentPage.value = params.page
      if (params?.per_page) perPage.value = params.per_page
      
      return categories
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
    total.value = 0
    currentPage.value = 1
    perPage.value = 10
  }

  return {
    // State
    items,
    currentCategory,
    loading,
    error,
    total,
    currentPage,
    perPage,
    
    // Getters
    categoriesCount,
    hasCategories,
    isLoading,
    hasError,
    
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
