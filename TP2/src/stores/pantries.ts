import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PaginationMeta } from '@/types/pagination'
import type {
  Pantry,
  ArrayOfPantries,
  PantryCreate,
  PantryUpdate,
  PantriesListParams
} from '@/types/pantry'
import type { GetUser } from '@/types/user'
import * as pantriesService from '@/api/pantries.service'

export const usePantriesStore = defineStore('pantries', () => {
  // State
  const items = ref<Pantry[]>([])
  const currentPantry = ref<Pantry | null>(null)
  const sharedUsers = ref<GetUser[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  
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
  const pantriesCount = computed(() => items.value.length)
  const hasPantries = computed(() => items.value.length > 0)
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => error.value !== null)

  // Owned pantries
  const ownedPantries = computed(() => 
    items.value.filter(p => p.owner)
  )

  // Shared pantries (not owned by current user)
  const sharedPantries = computed(() =>
    items.value.filter(p => !p.owner || (p.sharedWith && p.sharedWith.length > 0))
  )

  // Actions

  /**
   * Fetch pantries with filters
   */
  const fetchPantries = async (params?: PantriesListParams) => {
    loading.value = true
    error.value = null

    try {
      const response = await pantriesService.listPantries(params)
      // API v1.0.1 returns { data: [...], pagination: {...} }
      items.value = response.data
      pagination.value = response.pagination
      
      console.log('✓ Pantries loaded:', response.data.length)
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Error al cargar las despensas'
      console.error('✗ Error fetching pantries:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch a single pantry by ID
   */
  const fetchPantryById = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      const pantry = await pantriesService.getPantry(id)
      currentPantry.value = pantry
      
      // Update in items array if exists
      const index = items.value.findIndex(p => p.id === id)
      if (index !== -1) {
        items.value[index] = pantry
      } else {
        items.value.push(pantry)
      }
      
      console.log('✓ Pantry loaded:', pantry.name)
      return pantry
    } catch (err: any) {
      error.value = err.message || 'Error al cargar la despensa'
      console.error('✗ Error fetching pantry:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Create a new pantry
   */
  const createPantry = async (data: PantryCreate) => {
    loading.value = true
    error.value = null

    try {
      const pantry = await pantriesService.createPantry(data)
      items.value.push(pantry)
      currentPantry.value = pantry
      
      console.log('✓ Pantry created:', pantry.name)
      return pantry
    } catch (err: any) {
      error.value = err.message || 'Error al crear la despensa'
      console.error('✗ Error creating pantry:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update a pantry
   */
  const updatePantry = async (id: number, data: PantryUpdate) => {
    loading.value = true
    error.value = null

    try {
      const pantry = await pantriesService.updatePantry(id, data)
      
      // Update in items array
      const index = items.value.findIndex(p => p.id === id)
      if (index !== -1) {
        items.value[index] = pantry
      }
      
      // Update current pantry if it's the same
      if (currentPantry.value?.id === id) {
        currentPantry.value = pantry
      }
      
      console.log('✓ Pantry updated:', pantry.name)
      return pantry
    } catch (err: any) {
      error.value = err.message || 'Error al actualizar la despensa'
      console.error('✗ Error updating pantry:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete a pantry
   */
  const deletePantry = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      await pantriesService.deletePantry(id)
      
      // Remove from items array
      items.value = items.value.filter(p => p.id !== id)
      
      // Clear current pantry if it's the same
      if (currentPantry.value?.id === id) {
        currentPantry.value = null
      }
      
      console.log('✓ Pantry deleted:', id)
    } catch (err: any) {
      error.value = err.message || 'Error al eliminar la despensa'
      console.error('✗ Error deleting pantry:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Share a pantry with another user
   */
  const sharePantry = async (id: number, email: string) => {
    loading.value = true
    error.value = null

    try {
      const user = await pantriesService.sharePantry(id, email)
      
      // Add user to sharedUsers if not already present
      if (!sharedUsers.value.find(u => u.id === user.id)) {
        sharedUsers.value.push(user)
      }
      
      // Refresh pantry to get updated sharedWith
      await fetchPantryById(id)
      
      console.log('✓ Pantry shared with:', email)
      return user
    } catch (err: any) {
      error.value = err.message || 'Error al compartir la despensa'
      console.error('✗ Error sharing pantry:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch users with access to a pantry
   */
  const fetchSharedUsers = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      const users = await pantriesService.listShares(id)
      sharedUsers.value = users
      
      console.log('✓ Shared users loaded:', users.length)
      return users
    } catch (err: any) {
      error.value = err.message || 'Error al cargar los usuarios compartidos'
      console.error('✗ Error fetching shared users:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Revoke access from a user
   */
  const revokeShare = async (pantryId: number, userId: number) => {
    loading.value = true
    error.value = null

    try {
      await pantriesService.revokeShare(pantryId, userId)
      
      // Remove user from sharedUsers
      sharedUsers.value = sharedUsers.value.filter(u => u.id !== userId)
      
      // Refresh pantry to get updated sharedWith
      await fetchPantryById(pantryId)
      
      console.log('✓ Share revoked for user:', userId)
    } catch (err: any) {
      error.value = err.message || 'Error al revocar el acceso'
      console.error('✗ Error revoking share:', err)
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
   * Clear current pantry
   */
  const clearCurrentPantry = () => {
    currentPantry.value = null
  }

  /**
   * Clear all data (for logout)
   */
  const clearAll = () => {
    items.value = []
    currentPantry.value = null
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
    currentPantry,
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
    pantriesCount,
    hasPantries,
    isLoading,
    hasError,
    ownedPantries,
    sharedPantries,
    
    // Actions
    fetchPantries,
    fetchPantryById,
    createPantry,
    updatePantry,
    deletePantry,
    sharePantry,
    fetchSharedUsers,
    revokeShare,
    clearError,
    clearCurrentPantry,
    clearAll
  }
})
