<template>
  <div class="page">
    <!-- TOPBAR -->
    <header class="topbar">
      <button class="btn-back" @click="goBack" aria-label="Back">
        ← Back
      </button>

      <div class="search-wrap">
        <input 
          v-model.trim="itemSearch" 
          class="search" 
          type="text" 
          placeholder="Search products..." 
        />
      </div>

      <button class="btn-icon" @click="shareList" aria-label="Share">
        🔗
      </button>
    </header>

    <!-- Loading state -->
    <div v-if="listsStore.isLoading && !listsStore.currentList" class="loading-state">
      <div class="spinner"></div>
      <p>Loading list...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="listsStore.hasError" class="error-state">
      <div class="error-icon">⚠️</div>
      <h2>Error loading list</h2>
      <p>{{ listsStore.error?.message || 'Something went wrong' }}</p>
      <button class="btn-retry" @click="loadList">Retry</button>
    </div>

    <!-- Main content -->
    <main v-else-if="list" class="main-content">
      <!-- TITLE BAR -->
      <section class="titlebar">
        <div class="left-actions">
          <button class="round" @click="toggleFilter" title="Filter">🜜</button>
          <button class="round" @click="openActionsMenu" title="More Actions">⋯</button>
        </div>

        <h1 class="title">{{ list.name }}</h1>

        <div class="right-actions">
          <button class="round" @click="editList" title="Edit">✎</button>
          <button class="add" @click="showAddItemModal = true">
            <span>Add Item</span>
            <span class="plus">＋</span>
          </button>
        </div>
      </section>

      <!-- Description -->
      <p v-if="list.description" class="description">{{ list.description }}</p>

      <!-- Filter panel -->
      <transition name="slide">
        <div v-if="showFilter" class="filter-panel">
          <label class="filter-item">
            <input type="radio" v-model="itemFilter" value="all" />
            <span>All Items ({{ itemsStore.itemsCount }})</span>
          </label>
          <label class="filter-item">
            <input type="radio" v-model="itemFilter" value="pending" />
            <span>Pending ({{ itemsStore.pendingCount }})</span>
          </label>
          <label class="filter-item">
            <input type="radio" v-model="itemFilter" value="purchased" />
            <span>Purchased ({{ itemsStore.purchasedCount }})</span>
          </label>
        </div>
      </transition>

      <!-- TABS -->
      <div class="tabs">
        <button 
          :class="['tab', { active: activeTab === 'items' }]" 
          @click="activeTab = 'items'"
        >
          Items ({{ itemsStore.itemsCount }})
        </button>
        <button 
          :class="['tab', { active: activeTab === 'share' }]" 
          @click="activeTab = 'share'"
        >
          Shared ({{ list.sharedWith?.length || 0 }})
        </button>
      </div>

      <!-- TAB CONTENT: Items -->
      <div v-if="activeTab === 'items'" class="tab-content">
        <!-- Items list -->
        <div v-if="filteredItems.length > 0" class="items-list">
          <article
            v-for="item in filteredItems"
            :key="item.id"
            class="item-row"
          >
            <div class="item-left">
              <label class="checkbox-wrapper">
                <input 
                  type="checkbox" 
                  :checked="item.purchased"
                  @change="togglePurchased(item)"
                />
                <span class="checkbox-custom"></span>
              </label>

              <div class="item-info">
                <div class="item-name" :class="{ purchased: item.purchased }">
                  {{ item.product.name }}
                </div>
                <div class="item-category">
                  {{ item.product.category?.name || 'No category' }}
                </div>
              </div>
            </div>

            <div class="item-right">
              <div class="item-quantity">{{ item.quantity }} {{ item.unit }}</div>
              <button class="item-action" @click="editItem(item)" title="Edit">
                ✎
              </button>
              <button class="item-action danger" @click="deleteItem(item)" title="Delete">
                🗑
              </button>
            </div>
          </article>
        </div>

        <!-- Empty state for items -->
        <div v-else class="empty-state">
          <div class="empty-icon">📦</div>
          <h3>No items yet</h3>
          <p>Add items to your shopping list</p>
          <button class="btn-add-first" @click="showAddItemModal = true">
            Add First Item
          </button>
        </div>
      </div>

      <!-- TAB CONTENT: Share -->
      <div v-else-if="activeTab === 'share'" class="tab-content">
        <!-- Shared users list -->
        <div v-if="sharedUsers.length > 0" class="shared-list">
          <article
            v-for="user in sharedUsers"
            :key="user.id"
            class="shared-row"
          >
            <div class="shared-left">
              <div class="user-avatar">
                {{ user.name.charAt(0).toUpperCase() }}
              </div>
              <div class="user-info">
                <div class="user-name">{{ user.name }} {{ user.surname }}</div>
                <div class="user-email">{{ user.email }}</div>
              </div>
            </div>

            <div class="shared-right">
              <button 
                v-if="isOwner"
                class="btn-revoke" 
                @click="revokeAccess(user)"
              >
                Revoke Access
              </button>
            </div>
          </article>
        </div>

        <!-- Empty state for share -->
        <div v-else class="empty-state">
          <div class="empty-icon">👥</div>
          <h3>Not shared yet</h3>
          <p>Share this list with other users</p>
          <button v-if="isOwner" class="btn-add-first" @click="openShareModal">
            Share List
          </button>
        </div>

        <!-- Share button -->
        <div v-if="isOwner && sharedUsers.length > 0" class="share-actions">
          <button class="btn-share" @click="openShareModal">
            + Share with Another User
          </button>
        </div>
      </div>
    </main>

    <!-- Actions Menu -->
    <transition name="fade">
      <div v-if="showActionsMenu" class="actions-menu-overlay" @click="closeActionsMenu">
        <div class="actions-menu" @click.stop>
          <button class="menu-item" @click="purchaseList">
            🛒 Mark as Purchased
          </button>
          <button class="menu-item" @click="resetList">
            🔄 Reset All Items
          </button>
          <button class="menu-item" @click="moveToPantry">
            📦 Move Purchased to Pantry
          </button>
          <button class="menu-item danger" @click="deleteList">
            🗑 Delete List
          </button>
        </div>
      </div>
    </transition>

    <!-- Add/Edit Item Modal -->
    <teleport to="body">
      <div v-if="showAddItemModal || editingItem" class="modal-overlay" @click="closeItemModal">
        <div class="modal" @click.stop>
          <h2>{{ editingItem ? 'Edit Item' : 'Add Item' }}</h2>
          <form @submit.prevent="saveItem">
            <div class="form-group">
              <label>Product Name</label>
              <input v-model="itemForm.productName" type="text" required />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Quantity</label>
                <input v-model.number="itemForm.quantity" type="number" min="0.01" step="0.01" required />
              </div>
              <div class="form-group">
                <label>Unit</label>
                <select v-model="itemForm.unit" required>
                  <option value="unit">unit</option>
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="l">l</option>
                  <option value="ml">ml</option>
                  <option value="lb">lb</option>
                  <option value="oz">oz</option>
                </select>
              </div>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-cancel" @click="closeItemModal">Cancel</button>
              <button type="submit" class="btn-save" :disabled="itemsStore.isLoading">
                {{ editingItem ? 'Save Changes' : 'Add Item' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </teleport>

    <!-- Share Modal -->
    <ShareMembersModal
      v-if="showShareModal"
      :list-id="listId!"
      :list-name="list?.name || ''"
      @close="closeShareModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useShoppingListsStore } from '@/stores/shoppingLists'
import { useListItemsStore } from '@/stores/listItems'
import { useToast } from '@/composables/useToast'
import type { ListItem, User } from '@/types/shopping-lists'
import ShareMembersModal from '@/components/ShareMembersModal.vue'

const router = useRouter()
const route = useRoute()
const listsStore = useShoppingListsStore()
const itemsStore = useListItemsStore()
const toast = useToast()

// State
const activeTab = ref<'items' | 'share'>('items')
const itemSearch = ref('')
const itemFilter = ref<'all' | 'pending' | 'purchased'>('all')
const showFilter = ref(false)
const showActionsMenu = ref(false)
const showAddItemModal = ref(false)
const showShareModal = ref(false)
const editingItem = ref<ListItem | null>(null)
const sharedUsers = ref<User[]>([])

// Item form
const itemForm = ref({
  productName: '',
  quantity: 1,
  unit: 'unit',
})

// Computed
const listId = computed(() => {
  const id = route.params.id
  return id ? parseInt(id as string, 10) : null
})

const list = computed(() => listsStore.currentList)

const isOwner = computed(() => {
  // TODO: Get current user from auth store
  // For now, assume we're the owner if we have the list
  return true
})

const filteredItems = computed(() => {
  let items = itemsStore.items

  // Filter by purchase status
  if (itemFilter.value === 'pending') {
    items = items.filter(i => !i.purchased)
  } else if (itemFilter.value === 'purchased') {
    items = items.filter(i => i.purchased)
  }

  // Filter by search
  if (itemSearch.value) {
    const search = itemSearch.value.toLowerCase()
    items = items.filter(i => 
      i.product.name.toLowerCase().includes(search)
    )
  }

  return items
})

// Methods
const loadList = async () => {
  if (!listId.value) return

  try {
    await listsStore.fetchListById(listId.value)
    await itemsStore.fetchItems(listId.value)
    await loadSharedUsers()
  } catch (error: any) {
    toast.error(error.message || 'Failed to load list')
  }
}

const loadSharedUsers = async () => {
  if (!listId.value) return

  try {
    sharedUsers.value = await listsStore.fetchSharedUsers(listId.value)
  } catch (error: any) {
    console.error('Failed to load shared users:', error)
  }
}

const goBack = () => {
  router.push('/lists')
}

const editList = () => {
  if (listId.value) {
    router.push(`/lists/${listId.value}/edit`)
  }
}

const shareList = () => {
  openShareModal()
}

const toggleFilter = () => {
  showFilter.value = !showFilter.value
}

const openActionsMenu = () => {
  showActionsMenu.value = true
}

const closeActionsMenu = () => {
  showActionsMenu.value = false
}

const openShareModal = () => {
  showShareModal.value = true
}

const closeShareModal = () => {
  showShareModal.value = false
  loadSharedUsers()
}

const togglePurchased = async (item: ListItem) => {
  if (!listId.value) return

  try {
    await itemsStore.togglePurchased(listId.value, item.id, !item.purchased)
  } catch (error: any) {
    toast.error(error.message || 'Failed to update item')
  }
}

const editItem = (item: ListItem) => {
  editingItem.value = item
  itemForm.value = {
    productName: item.product.name,
    quantity: item.quantity,
    unit: item.unit,
  }
}

const deleteItem = async (item: ListItem) => {
  if (!listId.value) return
  if (!confirm(`Delete "${item.product.name}"?`)) return

  try {
    await itemsStore.removeItem(listId.value, item.id)
    toast.success('Item deleted')
  } catch (error: any) {
    toast.error(error.message || 'Failed to delete item')
  }
}

const saveItem = async () => {
  if (!listId.value) return

  try {
    if (editingItem.value) {
      // Update existing item
      await itemsStore.updateItem(listId.value, editingItem.value.id, {
        quantity: itemForm.value.quantity,
        unit: itemForm.value.unit,
      })
      toast.success('Item updated')
    } else {
      // Add new item
      // Note: We need a product ID, but the form only has name
      // This is a simplified version - in production you'd search/create products
      toast.error('Adding new items requires product selection - feature not yet implemented')
      return
    }
    closeItemModal()
  } catch (error: any) {
    toast.error(error.message || 'Failed to save item')
  }
}

const closeItemModal = () => {
  showAddItemModal.value = false
  editingItem.value = null
  itemForm.value = {
    productName: '',
    quantity: 1,
    unit: 'unit',
  }
}

const revokeAccess = async (user: User) => {
  if (!listId.value) return
  if (!confirm(`Revoke access for ${user.name} ${user.surname}?`)) return

  try {
    await listsStore.revokeShare(listId.value, user.id)
    toast.success('Access revoked')
    loadSharedUsers()
  } catch (error: any) {
    toast.error(error.message || 'Failed to revoke access')
  }
}

const purchaseList = async () => {
  if (!listId.value) return
  closeActionsMenu()

  try {
    await listsStore.purchaseList(listId.value)
    toast.success('List marked as purchased!')
    await loadList()
  } catch (error: any) {
    toast.error(error.message || 'Failed to mark list as purchased')
  }
}

const resetList = async () => {
  if (!listId.value) return
  if (!confirm('Reset all items to not purchased?')) return
  closeActionsMenu()

  try {
    await listsStore.resetList(listId.value)
    toast.success('List reset!')
    await loadList()
  } catch (error: any) {
    toast.error(error.message || 'Failed to reset list')
  }
}

const moveToPantry = async () => {
  if (!listId.value) return
  if (!confirm('Move all purchased items to pantry?')) return
  closeActionsMenu()

  try {
    await listsStore.moveToPantry(listId.value)
    toast.success('Purchased items moved to pantry!')
    await loadList()
  } catch (error: any) {
    toast.error(error.message || 'Failed to move items')
  }
}

const deleteList = async () => {
  if (!listId.value || !list.value) return
  if (!confirm(`Delete "${list.value.name}"? This cannot be undone.`)) return
  closeActionsMenu()

  try {
    await listsStore.deleteList(listId.value)
    toast.success('List deleted!')
    router.push('/lists')
  } catch (error: any) {
    toast.error(error.message || 'Failed to delete list')
  }
}

// Load data on mount
onMounted(() => {
  loadList()
})

// Reload items when filter changes
watch(itemFilter, () => {
  if (listId.value) {
    itemsStore.fetchItems(listId.value, {
      purchased: itemFilter.value === 'all' ? undefined : itemFilter.value === 'purchased',
    })
  }
})
</script>

<style scoped>
/* Same styling as other views - keeping consistent design */
.page {
  min-height: 100vh;
  background: #1C1C30;
  color: #EDEAF6;
  padding: 24px clamp(16px, 4vw, 48px);
}

/* TOPBAR */
.topbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.btn-back {
  height: 44px;
  padding: 0 20px;
  border: none;
  border-radius: 12px;
  background: #322D59;
  color: #EDEAF6;
  font-weight: 700;
  cursor: pointer;
}

.search-wrap {
  flex: 1;
}

.search {
  width: 100%;
  height: 44px;
  border-radius: 22px;
  border: 2px solid rgba(255, 255, 255, 0.12);
  background: #201F34;
  color: #EDEAF6;
  padding: 0 16px;
  outline: none;
  font-weight: 600;
}

.btn-icon {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 12px;
  background: #322D59;
  font-size: 20px;
  cursor: pointer;
}

/* MAIN CONTENT */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
}

/* TITLEBAR */
.titlebar {
  display: grid;
  grid-template-columns: 180px 1fr 260px;
  align-items: center;
  background: #322D59;
  border-radius: 18px;
  padding: 14px 18px;
  margin-bottom: 16px;
}

.title {
  margin: 0;
  text-align: center;
  font-size: 32px;
  font-weight: 800;
}

.left-actions,
.right-actions {
  display: flex;
  gap: 10px;
}

.right-actions {
  justify-content: flex-end;
}

.round {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 12px;
  background: #2B2950;
  color: #EDEAF6;
  font-size: 16px;
  cursor: pointer;
}

.add {
  height: 40px;
  padding: 0 14px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(180deg, #7F89FF, #6B7CFF);
  color: #fff;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.description {
  text-align: center;
  color: #CFC9E6;
  margin: 0 0 16px;
  opacity: 0.85;
}

/* FILTER PANEL */
.filter-panel {
  background: #322D59;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  display: flex;
  gap: 16px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* TABS */
.tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.tab {
  flex: 1;
  height: 48px;
  border: none;
  border-radius: 12px;
  background: #322D59;
  color: #CFC9E6;
  font-weight: 800;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab.active {
  background: #6B7CFF;
  color: #fff;
}

/* TAB CONTENT */
.tab-content {
  background: #322D59;
  border-radius: 18px;
  padding: 20px;
  min-height: 400px;
}

/* ITEMS LIST */
.items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: #201F34;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.item-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.checkbox-wrapper {
  position: relative;
  width: 24px;
  height: 24px;
  cursor: pointer;
}

.checkbox-wrapper input {
  position: absolute;
  opacity: 0;
}

.checkbox-custom {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-radius: 6px;
  background: #0E0F1A;
  transition: all 0.2s ease;
  display: block;
}

.checkbox-wrapper input:checked + .checkbox-custom {
  background: #6B7CFF;
  border-color: #6B7CFF;
}

.checkbox-wrapper input:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  font-weight: 900;
  font-size: 14px;
}

.item-info {
  flex: 1;
}

.item-name {
  font-weight: 800;
  font-size: 16px;
  color: #EDEAF6;
}

.item-name.purchased {
  text-decoration: line-through;
  opacity: 0.5;
}

.item-category {
  font-size: 13px;
  color: #CFC9E6;
  opacity: 0.7;
  margin-top: 2px;
}

.item-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.item-quantity {
  font-weight: 700;
  color: #EDEAF6;
  opacity: 0.85;
  min-width: 60px;
  text-align: right;
}

.item-action {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: #322D59;
  color: #EDEAF6;
  font-size: 14px;
  cursor: pointer;
}

.item-action.danger:hover {
  background: #ff4444;
}

/* SHARED LIST */
.shared-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.shared-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: #201F34;
  border-radius: 12px;
}

.shared-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #6B7CFF;
  display: grid;
  place-items: center;
  font-weight: 900;
  font-size: 20px;
  color: #fff;
}

.user-name {
  font-weight: 800;
  font-size: 16px;
}

.user-email {
  font-size: 13px;
  color: #CFC9E6;
  opacity: 0.7;
}

.btn-revoke {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: #ff4444;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}

.share-actions {
  margin-top: 20px;
  text-align: center;
}

.btn-share {
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  background: #6B7CFF;
  color: #fff;
  font-weight: 800;
  cursor: pointer;
}

/* EMPTY STATE */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 24px;
  font-weight: 800;
  margin: 0 0 8px;
}

.empty-state p {
  color: #CFC9E6;
  opacity: 0.7;
  margin: 0 0 24px;
}

.btn-add-first {
  padding: 12px 32px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(180deg, #7F89FF, #6B7CFF);
  color: #fff;
  font-weight: 800;
  cursor: pointer;
}

/* ACTIONS MENU */
.actions-menu-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: grid;
  place-items: center;
  z-index: 1000;
}

.actions-menu {
  background: #322D59;
  border-radius: 16px;
  padding: 12px;
  min-width: 280px;
}

.menu-item {
  width: 100%;
  padding: 14px 16px;
  border: none;
  background: transparent;
  color: #EDEAF6;
  font-weight: 700;
  font-size: 15px;
  text-align: left;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s ease;
}

.menu-item:hover {
  background: #3a3868;
}

.menu-item.danger {
  color: #ff6b6b;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* MODAL */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: grid;
  place-items: center;
  z-index: 2000;
}

.modal {
  background: #322D59;
  border-radius: 18px;
  padding: 32px;
  width: min(500px, 90vw);
}

.modal h2 {
  margin: 0 0 24px;
  font-size: 24px;
  font-weight: 800;
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-group label {
  display: block;
  font-weight: 700;
  margin-bottom: 8px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px;
  border: 2px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  background: #201F34;
  color: #EDEAF6;
  font-weight: 600;
  outline: none;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn-cancel,
.btn-save {
  flex: 1;
  height: 44px;
  border: none;
  border-radius: 12px;
  font-weight: 800;
  cursor: pointer;
}

.btn-cancel {
  background: #2B2950;
  color: #EDEAF6;
}

.btn-save {
  background: #6B7CFF;
  color: #fff;
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* LOADING/ERROR STATES */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 20px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: #6B7CFF;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-icon {
  font-size: 64px;
}

.btn-retry {
  padding: 12px 28px;
  border: none;
  border-radius: 12px;
  background: #6B7CFF;
  color: #fff;
  font-weight: 800;
  cursor: pointer;
}

@media (max-width: 860px) {
  .titlebar {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .left-actions,
  .right-actions {
    justify-content: center;
  }
}
</style>
