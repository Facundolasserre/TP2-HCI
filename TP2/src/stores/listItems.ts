import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PaginationMeta } from '@/types/pagination'
import type {
  ListItem,
  ListItemArray,
  ListItemCreate,
  ListItemUpdate,
  ListItemsParams,
  ApiError,
} from '@/types/shopping-lists'
import * as listItemsService from '@/api/list-items.service'
import { useShoppingListsStore } from './shoppingLists'

export const useListItemsStore = defineStore('listItems', () => {
  // State
  const items = ref<ListItem[]>([])
  const loading = ref(false)
  const error = ref<ApiError | null>(null)
  const currentListId = ref<number | null>(null)
  
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
  
  const purchasedItems = computed(() => items.value.filter(item => item.purchased))
  const pendingItems = computed(() => items.value.filter(item => !item.purchased))
  const purchasedCount = computed(() => purchasedItems.value.length)
  const pendingCount = computed(() => pendingItems.value.length)

  // Actions

  /**
   * Fetch items for a shopping list with filters
   */
  const fetchItems = async (listId: number, params?: ListItemsParams) => {
    loading.value = true
    error.value = null
    currentListId.value = listId

    try {
      const response = await listItemsService.getItems(listId, params)
      // API v1.0.1 returns { data: [...], pagination: {...} }
      items.value = response.data
      pagination.value = response.pagination
      
      // Update completed status in shopping lists store
      const allPurchased = response.data.every(item => item.purchased)
      const hasItems = response.data.length > 0
      const isCompleted = hasItems && allPurchased
      
      const shoppingListsStore = useShoppingListsStore()
      shoppingListsStore.setListCompletedStatus(listId, isCompleted)
      
      return response.data
    } catch (err: any) {
      error.value = err as ApiError
      
      // If backend not available, use mock data
      if (err.status === 0 || err.code === 'ERR_NETWORK') {
        console.warn('⚠️ Backend not available - using mock items data for development')
        
        items.value = [
          {
            id: 1,
            quantity: 2,
            unit: 'kg',
            metadata: {},
            purchased: false,
            product: {
              id: 1,
              name: 'Tomatoes',
              category: { id: 1, name: 'Vegetables' },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 2,
            quantity: 1,
            unit: 'unit',
            metadata: {},
            purchased: false,
            product: {
              id: 2,
              name: 'Milk',
              category: { id: 2, name: 'Dairy' },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ] as ListItem[]
        
        error.value = null
        return items.value
      }
      
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Add a new item to a shopping list
   */
  const addItem = async (listId: number, data: ListItemCreate) => {
    loading.value = true
    error.value = null

    try {
      const newItem = await listItemsService.addItem(listId, data)
      
      // Add to local state if we're viewing this list
      if (currentListId.value === listId) {
        items.value.push(newItem)
        
        // Update completed status (adding an item makes the list incomplete)
        const shoppingListsStore = useShoppingListsStore()
        shoppingListsStore.setListCompletedStatus(listId, false)
      }
      
      return newItem
    } catch (err) {
      error.value = err as ApiError
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update an item in a shopping list (with optimistic UI)
   */
  const updateItem = async (
    listId: number,
    itemId: number,
    data: ListItemUpdate
  ) => {
    loading.value = true
    error.value = null

    // Store original state for rollback
    const originalItems = [...items.value]
    
    // Optimistic update
    const index = items.value.findIndex((item) => item.id === itemId)
    if (index !== -1) {
      items.value[index] = { ...items.value[index], ...data }
    }

    try {
      const updatedItem = await listItemsService.updateItem(listId, itemId, data)
      
      // Update with real data from server
      if (index !== -1) {
        items.value[index] = updatedItem
      }
      
      return updatedItem
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
   * Toggle purchased status of an item (with optimistic UI)
   */
  const togglePurchased = async (
    listId: number,
    itemId: number,
    purchased: boolean
  ) => {
    loading.value = true
    error.value = null

    // Store original state for rollback
    const originalItems = [...items.value]
    
    // Optimistic update
    const index = items.value.findIndex((item) => item.id === itemId)
    if (index !== -1) {
      items.value[index] = { ...items.value[index], purchased }
    }

    try {
      const updatedItem = await listItemsService.togglePurchased(listId, itemId, purchased)
      
      // Update with real item data from server
      if (index !== -1) {
        items.value[index] = updatedItem
      }
      
      // Check if all items in the current list are now purchased
      const allPurchased = items.value.every(item => item.purchased)
      const hasItems = items.value.length > 0
      const isCompleted = hasItems && allPurchased
      
      // Update the completed status in shopping lists store
      const shoppingListsStore = useShoppingListsStore()
      shoppingListsStore.setListCompletedStatus(listId, isCompleted)
      
      console.log('📋 List completed status updated:', {
        listId,
        completed: isCompleted,
        allPurchased,
        totalItems: items.value.length,
        purchasedCount: items.value.filter(item => item.purchased).length
      })
      
      return updatedItem
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
   * Remove an item from a shopping list (with optimistic UI)
   */
  const removeItem = async (listId: number, itemId: number) => {
    loading.value = true
    error.value = null

    // Store original state for rollback
    const originalItems = [...items.value]
    const index = items.value.findIndex((item) => item.id === itemId)

    // Optimistic delete
    if (index !== -1) {
      items.value.splice(index, 1)
    }

    try {
      await listItemsService.removeItem(listId, itemId)
      // Success - optimistic update is already applied
      
      // Update completed status after deletion
      const allPurchased = items.value.every(item => item.purchased)
      const hasItems = items.value.length > 0
      const isCompleted = hasItems && allPurchased
      
      const shoppingListsStore = useShoppingListsStore()
      shoppingListsStore.setListCompletedStatus(listId, isCompleted)
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
   * Filter items locally (useful for client-side filtering)
   */
  const filterItems = (filters: {
    purchased?: boolean
    categoryId?: number
    search?: string
  }) => {
    return items.value.filter((item) => {
      // Filter by purchased status
      if (filters.purchased !== undefined && item.purchased !== filters.purchased) {
        return false
      }

      // Filter by category
      if (filters.categoryId !== undefined && item.product.category?.id !== filters.categoryId) {
        return false
      }

      // Filter by search term (product name)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        return item.product.name.toLowerCase().includes(searchLower)
      }

      return true
    })
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
    loading.value = false
    error.value = null
    currentListId.value = null
    pagination.value = {
      total: 0,
      page: 1,
      per_page: 10,
      total_pages: 0,
      has_next: false,
      has_prev: false,
    }
  }

  return {
    // State
    items,
    loading,
    error,
    currentListId,
    pagination,
    
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
    purchasedItems,
    pendingItems,
    purchasedCount,
    pendingCount,
    
    // Actions
    fetchItems,
    addItem,
    updateItem,
    togglePurchased,
    removeItem,
    filterItems,
    clearError,
    reset,
  }
})
