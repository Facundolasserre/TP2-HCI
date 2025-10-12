import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PaginationMeta } from '@/types/pagination'
import type {
  PantryItem,
  PantryItemArray,
  PantryItemCreate,
  PantryItemUpdate,
  PantryItemsListParams
} from '@/types/pantry'
import * as pantryItemsService from '@/api/pantry-items.service'

export const usePantryItemsStore = defineStore('pantryItems', () => {
  // State
  const items = ref<PantryItem[]>([])
  const currentItem = ref<PantryItem | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentPantryId = ref<number | null>(null)
  
  // Pagination state
  const pagination = ref<PaginationMeta>({
    total: 0,
    page: 1,
    per_page: 10,
    total_pages: 0,
    has_next: false,
    has_prev: false,
  })

  // Computed getters for pagination
  const total = computed(() => pagination.value.total)
  const currentPage = computed(() => pagination.value.page)
  const perPage = computed(() => pagination.value.per_page)
  const totalPages = computed(() => pagination.value.total_pages)
  const hasNextPage = computed(() => pagination.value.has_next)
  const hasPrevPage = computed(() => pagination.value.has_prev)

  // Getters
  const itemsCount = computed(() => items.value.length)
  const hasItems = computed(() => items.value.length > 0)
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => error.value !== null)

  // Group items by product category
  const itemsByCategory = computed(() => {
    const grouped = new Map<string, PantryItem[]>()
    
    items.value.forEach(item => {
      const categoryName = item.product.category?.name || 'Sin categoría'
      if (!grouped.has(categoryName)) {
        grouped.set(categoryName, [])
      }
      grouped.get(categoryName)!.push(item)
    })
    
    return grouped
  })

  // Actions

  /**
   * Fetch items from a pantry with filters
   */
  const fetchItems = async (pantryId: number, params?: PantryItemsListParams) => {
    loading.value = true
    error.value = null
    currentPantryId.value = pantryId

    try {
      const response = await pantryItemsService.getItems(pantryId, params)
      // API v1.0.1 returns { data: [...], pagination: {...} }
      items.value = response.data
      pagination.value = response.pagination
      
      console.log('✓ Pantry items loaded:', response.data.length)
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Error al cargar los productos de la despensa'
      console.error('✗ Error fetching pantry items:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Add an item to a pantry
   */
  const addItem = async (pantryId: number, data: PantryItemCreate) => {
    loading.value = true
    error.value = null

    try {
      const item = await pantryItemsService.addItem(pantryId, data)
      items.value.push(item)
      currentItem.value = item
      
      console.log('✓ Pantry item added:', item.id)
      return item
    } catch (err: any) {
      error.value = err.message || 'Error al agregar el producto a la despensa'
      console.error('✗ Error adding pantry item:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update a pantry item
   */
  const updateItem = async (pantryId: number, itemId: number, data: PantryItemUpdate) => {
    loading.value = true
    error.value = null

    try {
      const item = await pantryItemsService.updateItem(pantryId, itemId, data)
      
      // Update in items array
      const index = items.value.findIndex(i => i.id === itemId)
      if (index !== -1) {
        items.value[index] = item
      }
      
      // Update current item if it's the same
      if (currentItem.value?.id === itemId) {
        currentItem.value = item
      }
      
      console.log('✓ Pantry item updated:', item.id)
      return item
    } catch (err: any) {
      error.value = err.message || 'Error al actualizar el producto'
      console.error('✗ Error updating pantry item:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Remove an item from a pantry
   */
  const removeItem = async (pantryId: number, itemId: number) => {
    loading.value = true
    error.value = null

    try {
      await pantryItemsService.removeItem(pantryId, itemId)
      
      // Remove from items array
      items.value = items.value.filter(i => i.id !== itemId)
      
      // Clear current item if it's the same
      if (currentItem.value?.id === itemId) {
        currentItem.value = null
      }
      
      console.log('✓ Pantry item removed:', itemId)
    } catch (err: any) {
      error.value = err.message || 'Error al eliminar el producto'
      console.error('✗ Error removing pantry item:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Refresh items (useful after move-to-pantry operations)
   */
  const refreshItems = async () => {
    if (currentPantryId.value !== null) {
      await fetchItems(currentPantryId.value, {
        page: currentPage.value,
        per_page: perPage.value
      })
    }
  }

  /**
   * Clear error
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * Clear current item
   */
  const clearCurrentItem = () => {
    currentItem.value = null
  }

  /**
   * Clear all data (for logout or changing pantry)
   */
  const clearAll = () => {
    items.value = []
    currentItem.value = null
    loading.value = false
    error.value = null
    pagination.value = {
      total: 0,
      page: 1,
      per_page: 10,
      total_pages: 0,
      has_next: false,
      has_prev: false,
    }
    currentPantryId.value = null
  }

  return {
    // State
    items,
    currentItem,
    loading,
    error,
    pagination,
    currentPantryId,
    
    // Pagination computed getters
    total,
    currentPage,
    perPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    
    // Getters
    itemsCount,
    hasItems,
    isLoading,
    hasError,
    itemsByCategory,
    
    // Actions
    fetchItems,
    addItem,
    updateItem,
    removeItem,
    refreshItems,
    clearError,
    clearCurrentItem,
    clearAll
  }
})
