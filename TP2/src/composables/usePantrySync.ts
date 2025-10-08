/**
 * Composable for Pantry-ShoppingList Integration
 * Provides helpers for move-to-pantry operations
 */

import { usePantryItemsStore } from '@/stores/pantryItems'

/**
 * Use pantry sync functionality
 * This composable helps synchronize pantry items after move-to-pantry operations
 */
export function usePantrySync() {
  const pantryItemsStore = usePantryItemsStore()

  /**
   * Refresh pantry items after a move-to-pantry operation
   * Call this after POST /api/shopping-lists/{id}/move-to-pantry succeeds
   * 
   * @param pantryId - The pantry ID to refresh (optional if store has currentPantryId)
   */
  async function refreshAfterMoveToPantry(pantryId?: number) {
    const targetPantryId = pantryId || pantryItemsStore.currentPantryId

    if (!targetPantryId) {
      console.warn('⚠️ No pantry ID provided for refresh after move-to-pantry')
      return
    }

    try {
      console.log('🔄 Refreshing pantry items after move-to-pantry...')
      await pantryItemsStore.refreshItems()
      console.log('✓ Pantry items refreshed successfully')
    } catch (error) {
      console.error('✗ Error refreshing pantry items:', error)
      throw error
    }
  }

  /**
   * Refresh all pantries after a move-to-pantry operation
   * Use this if you need to update the pantries list view
   */
  async function refreshPantriesAfterMove() {
    // This can be called from views that need to update the pantries list
    console.log('🔄 Pantries list should be refreshed after move-to-pantry')
    // The calling component should handle fetching pantries
  }

  return {
    refreshAfterMoveToPantry,
    refreshPantriesAfterMove
  }
}

/**
 * Event bus for pantry synchronization
 * Use this to communicate between shopping lists and pantries
 */
class PantrySyncEventBus {
  private listeners: Map<string, Set<Function>> = new Map()

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)
  }

  off(event: string, callback: Function) {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.delete(callback)
    }
  }

  emit(event: string, data?: any) {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach(callback => callback(data))
    }
  }
}

export const pantrySyncBus = new PantrySyncEventBus()

/**
 * Events:
 * - 'items-moved-to-pantry': Emitted when items are moved to pantry
 *   Data: { listId: number, pantryId?: number }
 * 
 * - 'pantry-items-updated': Emitted when pantry items are updated
 *   Data: { pantryId: number }
 * 
 * Usage in components:
 * 
 * ```typescript
 * import { pantrySyncBus } from '@/composables/usePantrySync'
 * 
 * // In ShoppingListDetailView after move-to-pantry:
 * pantrySyncBus.emit('items-moved-to-pantry', { listId: 123 })
 * 
 * // In PantryDetailView to listen:
 * onMounted(() => {
 *   pantrySyncBus.on('items-moved-to-pantry', async (data) => {
 *     await loadItems() // Refresh items
 *   })
 * })
 * 
 * onUnmounted(() => {
 *   pantrySyncBus.off('items-moved-to-pantry', handler)
 * })
 * ```
 */
