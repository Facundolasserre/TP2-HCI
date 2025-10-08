import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
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
  const total = ref(0)
  const currentPage = ref(1)
  const perPage = ref(10)
  const currentPantryId = ref<number | null>(null)

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
      const pantryItems = await pantryItemsService.getItems(pantryId, params)
      items.value = pantryItems
      
      // Update pagination state
      if (params?.page) currentPage.value = params.page
      if (params?.per_page) perPage.value = params.per_page
      
      console.log('✓ Pantry items loaded:', pantryItems.length)
      return pantryItems
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
    total.value = 0
    currentPage.value = 1
    perPage.value = 10
    currentPantryId.value = null
  }

  return {
    // State
    items,
    currentItem,
    loading,
    error,
    total,
    currentPage,
    perPage,
    currentPantryId,
    
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
