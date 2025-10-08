import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  ShoppingList,
  ShoppingListsArray,
  ShoppingListCreate,
  ShoppingListUpdate,
  ListShoppingListsParams,
  User,
  ApiError,
} from '@/types/shopping-lists'
import * as shoppingListsService from '@/api/shopping-lists.service'

export const useShoppingListsStore = defineStore('shoppingLists', () => {
  // State
  const items = ref<ShoppingList[]>([])
  const currentList = ref<ShoppingList | null>(null)
  const sharedUsers = ref<User[]>([])
  const loading = ref(false)
  const error = ref<ApiError | null>(null)
  const total = ref(0)
  const currentPage = ref(1)
  const perPage = ref(10)

  // Getters
  const listsCount = computed(() => items.value.length)
  const hasLists = computed(() => items.value.length > 0)
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => error.value !== null)

  // Actions

  /**
   * Fetch shopping lists with filters
   */
  const fetchLists = async (params?: ListShoppingListsParams) => {
    loading.value = true
    error.value = null

    try {
      const lists = await shoppingListsService.listLists(params)
      items.value = lists
      
      // Update pagination state
      if (params?.page) currentPage.value = params.page
      if (params?.per_page) perPage.value = params.per_page
      
      return lists
    } catch (err: any) {
      error.value = err as ApiError
      
      // If it's a network error (status 0), use mock data for development
      if (err.status === 0 || err.code === 'ERR_NETWORK') {
        console.warn('⚠️ Backend not available - using mock data for development')
        
        // Mock data for development
        items.value = [
          {
            id: 1,
            name: 'Weekly Groceries',
            description: 'Supermarket shopping list',
            recurring: true,
            metadata: { icon: 'shopping_cart.svg', color: '#6B7CFF' },
            owner: { id: 1, email: 'user@example.com', name: 'John', surname: 'Doe' },
            sharedWith: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 2,
            name: 'Party Supplies',
            description: 'Items for weekend party',
            recurring: false,
            metadata: { icon: 'family.svg', color: '#FF6B9D' },
            owner: { id: 1, email: 'user@example.com', name: 'John', surname: 'Doe' },
            sharedWith: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ] as ShoppingList[]
        
        // Clear error since we're using mock data
        error.value = null
        
        return items.value
      }
      
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch a single shopping list by ID
   */
  const fetchListById = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      const list = await shoppingListsService.getListById(id)
      currentList.value = list
      return list
    } catch (err: any) {
      error.value = err as ApiError
      currentList.value = null
      
      // If backend not available, use mock data
      if (err.status === 0 || err.code === 'ERR_NETWORK') {
        console.warn('⚠️ Backend not available - using mock data for development')
        
        const mockList: ShoppingList = {
          id,
          name: 'Mock List',
          description: 'This is mock data (backend not available)',
          recurring: false,
          metadata: { icon: 'shopping_cart.svg', color: '#6B7CFF' },
          owner: { id: 1, email: 'user@example.com', name: 'John', surname: 'Doe' },
          sharedWith: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        
        currentList.value = mockList
        error.value = null
        return mockList
      }
      
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Create a new shopping list
   */
  const createList = async (data: ShoppingListCreate) => {
    loading.value = true
    error.value = null

    try {
      const newList = await shoppingListsService.createList(data)
      
      // Add to local state
      items.value.unshift(newList)
      
      return newList
    } catch (err) {
      error.value = err as ApiError
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update a shopping list (with optimistic UI)
   */
  const updateList = async (id: number, data: ShoppingListUpdate) => {
    loading.value = true
    error.value = null

    // Store original state for rollback
    const originalItems = [...items.value]
    const originalCurrent = currentList.value

    // Optimistic update
    const index = items.value.findIndex((list) => list.id === id)
    if (index !== -1) {
      items.value[index] = { ...items.value[index], ...data }
    }
    if (currentList.value?.id === id) {
      currentList.value = { ...currentList.value, ...data }
    }

    try {
      const updatedList = await shoppingListsService.updateList(id, data)
      
      // Update with real data from server
      if (index !== -1) {
        items.value[index] = updatedList
      }
      if (currentList.value?.id === id) {
        currentList.value = updatedList
      }
      
      return updatedList
    } catch (err) {
      // Rollback on error
      items.value = originalItems
      currentList.value = originalCurrent
      error.value = err as ApiError
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete a shopping list (with optimistic UI)
   */
  const deleteList = async (id: number) => {
    loading.value = true
    error.value = null

    // Store original state for rollback
    const originalItems = [...items.value]
    const index = items.value.findIndex((list) => list.id === id)

    // Optimistic delete
    if (index !== -1) {
      items.value.splice(index, 1)
    }
    if (currentList.value?.id === id) {
      currentList.value = null
    }

    try {
      await shoppingListsService.deleteList(id)
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
   * Purchase a shopping list
   */
  const purchaseList = async (id: number, metadata?: Record<string, any>) => {
    loading.value = true
    error.value = null

    try {
      const updatedList = await shoppingListsService.purchaseList(id, { metadata })
      
      // Update in state
      const index = items.value.findIndex((list) => list.id === id)
      if (index !== -1) {
        items.value[index] = updatedList
      }
      if (currentList.value?.id === id) {
        currentList.value = updatedList
      }
      
      return updatedList
    } catch (err) {
      error.value = err as ApiError
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Reset shopping list (mark all items as not purchased)
   */
  const resetList = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      const updatedItems = await shoppingListsService.resetList(id)
      
      // Refresh current list if it's the one being reset
      if (currentList.value?.id === id) {
        await fetchListById(id)
      }
      
      return updatedItems
    } catch (err) {
      error.value = err as ApiError
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Move purchased items to pantry
   */
  const moveToPantry = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      await shoppingListsService.moveToPantry(id)
      
      // Refresh current list if it's the one being modified
      if (currentList.value?.id === id) {
        await fetchListById(id)
      }
    } catch (err) {
      error.value = err as ApiError
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Share shopping list with another user
   */
  const shareList = async (id: number, email: string) => {
    loading.value = true
    error.value = null

    try {
      await shoppingListsService.shareList(id, email)
      
      // Refresh shared users list
      await fetchSharedUsers(id)
      
      // Refresh current list to get updated sharedWith
      if (currentList.value?.id === id) {
        await fetchListById(id)
      }
    } catch (err) {
      error.value = err as ApiError
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Get users with access to a shared list
   */
  const fetchSharedUsers = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      const users = await shoppingListsService.getSharedUsers(id)
      sharedUsers.value = users
      return users
    } catch (err) {
      error.value = err as ApiError
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Revoke access to a shared list
   */
  const revokeShare = async (id: number, userId: number) => {
    loading.value = true
    error.value = null

    try {
      await shoppingListsService.revokeShare(id, userId)
      
      // Remove user from local state
      sharedUsers.value = sharedUsers.value.filter(u => u.id !== userId)
      
      // Refresh current list to get updated sharedWith
      if (currentList.value?.id === id) {
        await fetchListById(id)
      }
    } catch (err) {
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
    currentList.value = null
    sharedUsers.value = []
    loading.value = false
    error.value = null
    total.value = 0
    currentPage.value = 1
    perPage.value = 10
  }

  return {
    // State
    items,
    currentList,
    sharedUsers,
    loading,
    error,
    total,
    currentPage,
    perPage,
    
    // Getters
    listsCount,
    hasLists,
    isLoading,
    hasError,
    
    // Actions
    fetchLists,
    fetchListById,
    createList,
    updateList,
    deleteList,
    purchaseList,
    resetList,
    moveToPantry,
    shareList,
    fetchSharedUsers,
    revokeShare,
    clearError,
    reset,
  }
})
