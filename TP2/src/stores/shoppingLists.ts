import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PaginationMeta } from '@/types/pagination'
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
  
  // Map to track completed status by listId
  // This gets updated when items are toggled
  const completedStatusMap = ref<Map<number, boolean>>(new Map())
  
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
  const listsCount = computed(() => items.value.length)
  const hasLists = computed(() => items.value.length > 0)
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => error.value !== null)

  /**
   * Update the completed status for a specific list
   * This is called from listItems store when items are toggled
   */
  const setListCompletedStatus = (listId: number, isCompleted: boolean) => {
    completedStatusMap.value.set(listId, isCompleted)
    
    // Trigger reactivity by creating a new Map
    completedStatusMap.value = new Map(completedStatusMap.value)
  }

  /**
   * Helper function to determine if a list is completed
   * Uses the completedStatusMap that gets updated when items are toggled
   * Falls back to lastPurchasedAt if status is not in map
   */
  const isListCompleted = (list: ShoppingList): boolean => {
    // Check if we have status in the map (updated from item toggles)
    if (completedStatusMap.value.has(list.id)) {
      return completedStatusMap.value.get(list.id) || false
    }
    
    // Fallback to lastPurchasedAt for lists we haven't interacted with
    return list.lastPurchasedAt !== null && list.lastPurchasedAt !== undefined
  }

  /**
   * Get lists with computed 'completed' field
   */
  const itemsWithCompletion = computed(() => {
    return items.value.map(list => ({
      ...list,
      completed: isListCompleted(list)
    }))
  })

  // Actions

  /**
   * Fetch shopping lists with filters
   */
  const fetchLists = async (params?: ListShoppingListsParams) => {
    loading.value = true;
    error.value = null;

    try {
      console.log('Fetching lists with params:', params);
      const response = await shoppingListsService.listLists(params);
      console.log('API response:', JSON.stringify(response, null, 2));
      
      // The API v1.0.1 returns { data: [...], pagination: {...} }
      items.value = response.data;
      pagination.value = response.pagination;
      console.log('Processed lists:', response.data);
      
      return response.data;
    } catch (err: any) {
      console.error('Error fetching lists:', err);
      error.value = err as ApiError;
      items.value = []; // Clear items on error
      throw err;
    } finally {
      loading.value = false;
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
          completed: false,
          lastPurchasedAt: null,
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
    loading.value = true;
    error.value = null;

    try {
      const newList = await shoppingListsService.createList(data);
      console.log('New list created:', newList);
      console.log('Re-fetching lists...');
      await fetchLists(); // Re-fetch the lists to get the updated data
      console.log('Lists re-fetched. Items in store:', items.value);
      return newList;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
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
    currentList,
    sharedUsers,
    loading,
    error,
    pagination,
    
    // Pagination computed getters
    total,
    currentPage,
    perPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    
    // Getters
    listsCount,
    hasLists,
    isLoading,
    hasError,
    isListCompleted,
    itemsWithCompletion,
    
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
    setListCompletedStatus,
  }
})
