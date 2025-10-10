<template>
  <div class="pantry-detail-view">
    <!-- Header -->
    <div class="header">
      <div class="header-content">
        <div class="header-left">
          <div class="menu-icon" @click="toggleSidebar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </div>
          <div class="header-text">
            <h1 class="title">{{ pantry?.name || 'Loading...' }}</h1>
            <p class="subtitle">Pantry Management</p>
          </div>
        </div>
        <div class="header-actions">
          <button class="btn-secondary" @click="openShareModal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
              <polyline points="16 6 12 2 8 6"/>
              <line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
            Share
          </button>
          <button class="btn-secondary" @click="openEditModal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit
          </button>
          <button class="btn-danger" @click="confirmDeletePantry">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Metrics Cards -->
    <div class="metrics-section">
      <div class="metric-card">
        <div class="metric-icon blue">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/>
            <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/>
            <path d="M12 3v6"/>
          </svg>
        </div>
        <div class="metric-content">
          <div class="metric-label">Total Items</div>
          <div class="metric-value">{{ totalItems }}</div>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon red">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <div class="metric-content">
          <div class="metric-label">Low Stock</div>
          <div class="metric-value">{{ lowStockCount }}</div>
        </div>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="search-section">
      <div class="search-container">
        <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search products..."
          class="search-input"
          @input="onSearch"
        />
      </div>
      <button class="btn-add" @click="openAddItemModal">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Add
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="itemsStore.isLoading && !itemsStore.hasItems" class="loading-state">
      <p>Loading products...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!itemsStore.hasItems" class="empty-state">
      <div class="empty-icon">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/>
          <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/>
          <path d="M12 3v6"/>
        </svg>
      </div>
      <h3>No products in this pantry</h3>
      <p>Start adding products to track your pantry inventory</p>
      <button class="btn-create" @click="openAddItemModal">Add First Product</button>
    </div>

    <!-- Items List -->
    <div v-else class="items-list">
      <div v-for="item in filteredItems" :key="item.id" class="item-card" :class="{ 'low-stock': getStockStatus(item) === 'low' }">
        <div class="item-header">
          <div class="item-info">
            <h3 class="item-name">{{ item.product.name }}</h3>
            <span v-if="item.product.category" class="item-category">
              {{ item.product.category.name }}
            </span>
          </div>
          <div class="item-actions">
            <button class="btn-icon" @click="openEditItemModal(item)" title="Edit">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="btn-icon btn-delete" @click="confirmDeleteItem(item.id)" title="Delete">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="item-details">
          <div class="detail-row">
            <span class="detail-label">Quantity:</span>
            <span class="detail-value">{{ item.quantity }} {{ item.unit }}</span>
          </div>
          <div v-if="getStockStatus(item) === 'low'" class="low-stock-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Low Stock
          </div>
        </div>
        
        <div class="item-meta">
          <span class="item-date">Updated {{ formatDate(item.updatedAt) }}</span>
        </div>
      </div>
    </div>

    <!-- Add Item Modal -->
    <div v-if="showAddItemModal" class="modal-overlay" @click.self="showAddItemModal = false">
      <div class="modal">
        <div class="modal-header">
          <h2>Add Product to Pantry</h2>
          <button class="btn-close" @click="showAddItemModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Product ID *</label>
            <input v-model.number="newItem.product_id" type="number" placeholder="Enter product ID" required />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Quantity *</label>
              <input v-model.number="newItem.quantity" type="number" step="0.01" placeholder="0.00" required />
            </div>
            <div class="form-group">
              <label>Unit *</label>
              <input v-model="newItem.unit" type="text" placeholder="kg, l, u" required />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showAddItemModal = false">Cancel</button>
          <button class="btn-primary" @click="handleAddItem">Add Product</button>
        </div>
      </div>
    </div>

    <!-- Edit Item Modal -->
    <div v-if="showEditItemModal && editingItem" class="modal-overlay" @click.self="showEditItemModal = false">
      <div class="modal">
        <div class="modal-header">
          <h2>Edit Product</h2>
          <button class="btn-close" @click="showEditItemModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Product</label>
            <input :value="editingItem.product.name" disabled />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Quantity *</label>
              <input v-model.number="editingItem.quantity" type="number" step="0.01" required />
            </div>
            <div class="form-group">
              <label>Unit *</label>
              <input v-model="editingItem.unit" type="text" required />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showEditItemModal = false">Cancel</button>
          <button class="btn-primary" @click="handleUpdateItem">Save Changes</button>
        </div>
      </div>
    </div>

    <!-- Share Modal -->
    <div v-if="showShareModal" class="modal-overlay" @click.self="showShareModal = false">
      <div class="modal large">
        <div class="modal-header">
          <h2>Share Pantry</h2>
          <button class="btn-close" @click="showShareModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Share with user by email</label>
            <div class="share-input-group">
              <input v-model="shareEmail" type="email" placeholder="user@example.com" />
              <button class="btn-primary" @click="handleShare" :disabled="!shareEmail">Share</button>
            </div>
          </div>
          
          <div class="shared-users-section">
            <h3>Users with access</h3>
            <div v-if="pantriesStore.isLoading" class="loading">Loading...</div>
            <div v-else-if="sharedUsers.length === 0" class="empty-message">Not shared with anyone yet</div>
            <div v-else class="shared-users-list">
              <div v-for="user in sharedUsers" :key="user.id" class="shared-user-item">
                <div class="user-avatar">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div class="user-info">
                  <div class="user-name">{{ user.name }} {{ user.surname }}</div>
                  <div class="user-email">{{ user.email }}</div>
                </div>
                <button class="btn-revoke" @click="confirmRevoke(user)">Revoke</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Pantry Modal -->
    <div v-if="showEditPantryModal" class="modal-overlay" @click.self="showEditPantryModal = false">
      <div class="modal">
        <div class="modal-header">
          <h2>Edit Pantry</h2>
          <button class="btn-close" @click="showEditPantryModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Pantry Name *</label>
            <input v-model="pantryEditData.name" type="text" placeholder="Enter pantry name" maxlength="50" required />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showEditPantryModal = false">Cancel</button>
          <button class="btn-primary" @click="handleUpdatePantry">Save Changes</button>
        </div>
      </div>
    </div>

    <!-- Sidebar -->
    <Sidebar
      :open="sidebarOpen"
      active="pantries"
      @close="closeSidebar"
    />
  </div>
</template>


<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePantriesStore } from '@/stores/pantries'
import { usePantryItemsStore } from '@/stores/pantryItems'
import Sidebar from '@/components/Sidebar.vue'
import type { PantryItem, PantryItemCreate, PantryItemUpdate } from '@/types/pantry'
import type { GetUser } from '@/types/user'

const router = useRouter()
const route = useRoute()
const pantriesStore = usePantriesStore()
const itemsStore = usePantryItemsStore()

const pantryId = computed(() => parseInt(route.params.id as string, 10))
const pantry = computed(() => pantriesStore.currentPantry)

// Sidebar state
const sidebarOpen = ref(false)
const toggleSidebar = () => { sidebarOpen.value = !sidebarOpen.value }
const closeSidebar = () => { sidebarOpen.value = false }

// Search
const searchQuery = ref('')
const filteredItems = computed(() => {
  if (!searchQuery.value.trim()) {
    return itemsStore.items
  }
  const query = searchQuery.value.toLowerCase()
  return itemsStore.items.filter(item =>
    item.product.name.toLowerCase().includes(query) ||
    item.product.category?.name.toLowerCase().includes(query)
  )
})

const onSearch = () => {
  // Search is reactive through computed
}

// Metrics
const totalItems = computed(() => itemsStore.items.length)
const lowStockCount = computed(() => {
  // Low stock threshold: quantity <= 2
  return itemsStore.items.filter(item => item.quantity <= 2).length
})

// Items CRUD
const showAddItemModal = ref(false)
const showEditItemModal = ref(false)
const editingItem = ref<PantryItem | null>(null)

const newItem = reactive<PantryItemCreate>({
  product_id: 0,
  quantity: 1,
  unit: 'u',
  metadata: null
})

// Share modal
const showShareModal = ref(false)
const shareEmail = ref('')
const sharedUsers = computed(() => pantriesStore.sharedUsers)

// Edit pantry modal
const showEditPantryModal = ref(false)
const pantryEditData = reactive({
  name: '',
  metadata: null as Record<string, any> | null
})

async function loadPantry() {
  try {
    await pantriesStore.fetchPantryById(pantryId.value)
  } catch (error) {
    alert('Error al cargar la despensa')
    router.push('/pantries')
  }
}

async function loadItems() {
  try {
    await itemsStore.fetchItems(pantryId.value, { page: 1, per_page: 100 })
  } catch (error) {
    console.error('Error loading items:', error)
  }
}

async function loadSharedUsers() {
  try {
    await pantriesStore.fetchSharedUsers(pantryId.value)
  } catch (error) {
    console.error('Error loading shared users:', error)
  }
}

// Items CRUD handlers
function openAddItemModal() {
  newItem.product_id = 0
  newItem.quantity = 1
  newItem.unit = 'u'
  newItem.metadata = null
  showAddItemModal.value = true
}

async function handleAddItem() {
  try {
    await itemsStore.addItem(pantryId.value, newItem)
    showAddItemModal.value = false
    alert('✓ Product added to pantry')
  } catch (error: any) {
    alert(`✗ Error: ${error.message}`)
  }
}

function openEditItemModal(item: PantryItem) {
  editingItem.value = { ...item }
  showEditItemModal.value = true
}

async function handleUpdateItem() {
  if (!editingItem.value) return

  const updateData: PantryItemUpdate = {
    quantity: editingItem.value.quantity,
    unit: editingItem.value.unit,
    metadata: editingItem.value.metadata
  }

  try {
    await itemsStore.updateItem(pantryId.value, editingItem.value.id, updateData)
    showEditItemModal.value = false
    editingItem.value = null
    alert('✓ Product updated')
  } catch (error: any) {
    alert(`✗ Error: ${error.message}`)
  }
}

async function confirmDeleteItem(itemId: number) {
  if (!confirm('Are you sure you want to remove this product?')) return

  try {
    await itemsStore.removeItem(pantryId.value, itemId)
    alert('✓ Product removed from pantry')
  } catch (error: any) {
    alert(`✗ Error: ${error.message}`)
  }
}

// Share handlers
function openShareModal() {
  shareEmail.value = ''
  showShareModal.value = true
}

async function handleShare() {
  if (!shareEmail.value) return

  try {
    await pantriesStore.sharePantry(pantryId.value, shareEmail.value)
    shareEmail.value = ''
    await loadSharedUsers()
    alert('✓ Pantry shared successfully')
  } catch (error: any) {
    alert(`✗ Error: ${error.message}`)
  }
}

async function confirmRevoke(user: GetUser) {
  if (!confirm(`Revoke access for ${user.name} ${user.surname}?`)) return

  try {
    await pantriesStore.revokeShare(pantryId.value, user.id)
    await loadSharedUsers()
    alert('✓ Access revoked')
  } catch (error: any) {
    alert(`✗ Error: ${error.message}`)
  }
}

// Edit pantry handlers
function openEditModal() {
  if (pantry.value) {
    pantryEditData.name = pantry.value.name
    pantryEditData.metadata = pantry.value.metadata as Record<string, any> | null
  }
  showEditPantryModal.value = true
}

async function handleUpdatePantry() {
  try {
    await pantriesStore.updatePantry(pantryId.value, {
      name: pantryEditData.name,
      metadata: pantryEditData.metadata
    })
    showEditPantryModal.value = false
    await loadPantry()
    alert('✓ Pantry updated')
  } catch (error: any) {
    alert(`✗ Error: ${error.message}`)
  }
}

// Delete pantry
async function confirmDeletePantry() {
  if (!confirm(`Are you sure you want to delete "${pantry.value?.name}"? This action cannot be undone.`)) return

  try {
    await pantriesStore.deletePantry(pantryId.value)
    alert('✓ Pantry deleted')
    router.push('/pantries')
  } catch (error: any) {
    alert(`✗ Error: ${error.message}`)
  }
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('en-US')
}

function getStockStatus(item: PantryItem): 'low' | 'ok' {
  return item.quantity <= 2 ? 'low' : 'ok'
}

onMounted(async () => {
  await loadPantry()
  await loadItems()
  await loadSharedUsers()
})
</script>

<style scoped>
/* Base Variables */
:root {
  --bg: #1C1C30;
  --panel: #322D59;
  --ink: #EDEAF6;
  --muted: #CFC9E6;
  --tile: #0E0F1A;
  --edge: #4B5CC7;
  --primary: #6B7CFF;
  --danger: #ff6b6b;
}

.pantry-detail-view {
  min-height: 100vh;
  background: var(--bg);
  color: var(--ink);
  padding: 24px;
}

/* Header */
.header {
  margin-bottom: 32px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.menu-icon {
  width: 44px;
  height: 44px;
  background: var(--tile);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--ink);
}

.menu-icon:hover {
  background: var(--panel);
  transform: translateY(-2px);
}

.header-text .title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: var(--ink);
}

.header-text .subtitle {
  margin: 4px 0 0;
  font-size: 14px;
  color: var(--muted);
  opacity: 0.7;
}

.header-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

/* Metrics Section */
.metrics-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.metric-card {
  background: var(--tile);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: transform 0.2s;
}

.metric-card:hover {
  transform: translateY(-2px);
}

.metric-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.metric-icon.blue {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.metric-icon.red {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.metric-content {
  flex: 1;
}

.metric-label {
  font-size: 14px;
  color: var(--muted);
  margin-bottom: 4px;
}

.metric-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--ink);
}

/* Search Section */
.search-section {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.search-container {
  flex: 1;
  min-width: 300px;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--muted);
  opacity: 0.6;
}

.search-input {
  width: 100%;
  padding: 14px 16px 14px 48px;
  background: var(--tile);
  border: 1px solid var(--edge);
  border-radius: 12px;
  color: var(--ink);
  font-size: 15px;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(107, 124, 255, 0.1);
}

.search-input::placeholder {
  color: var(--muted);
  opacity: 0.5;
}

.btn-add {
  padding: 14px 24px;
  background: linear-gradient(180deg, #7F89FF, #6B7CFF);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(107, 124, 255, 0.4);
}

/* States */
.loading-state,
.empty-state {
  text-align: center;
  padding: 80px 24px;
  background: var(--tile);
  border-radius: 16px;
  margin-top: 24px;
}

.empty-icon {
  color: var(--muted);
  opacity: 0.3;
  margin-bottom: 24px;
}

.empty-state h3 {
  margin: 0 0 8px;
  font-size: 24px;
  color: var(--ink);
}

.empty-state p {
  margin: 0 0 24px;
  color: var(--muted);
  opacity: 0.7;
}

.btn-create {
  padding: 14px 32px;
  background: linear-gradient(180deg, #7F89FF, #6B7CFF);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-create:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(107, 124, 255, 0.4);
}

/* Items List */
.items-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-top: 24px;
}

.item-card {
  background: var(--tile);
  border-radius: 16px;
  padding: 20px;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.item-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  border-color: var(--edge);
}

.item-card.low-stock {
  border-color: var(--danger);
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.05) 0%, rgba(14, 15, 26, 1) 100%);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.item-info {
  flex: 1;
}

.item-name {
  margin: 0 0 6px;
  font-size: 18px;
  font-weight: 600;
  color: var(--ink);
}

.item-category {
  display: inline-block;
  padding: 4px 12px;
  background: var(--panel);
  color: var(--muted);
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.item-actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 36px;
  height: 36px;
  background: var(--panel);
  border: none;
  border-radius: 8px;
  color: var(--ink);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: var(--edge);
  transform: scale(1.05);
}

.btn-icon.btn-delete:hover {
  background: var(--danger);
  color: white;
}

.item-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--panel);
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-label {
  font-size: 13px;
  color: var(--muted);
  opacity: 0.7;
}

.detail-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--ink);
}

.low-stock-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: rgba(255, 107, 107, 0.15);
  color: var(--danger);
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.item-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-date {
  font-size: 12px;
  color: var(--muted);
  opacity: 0.6;
}

/* Buttons */
.btn-primary,
.btn-secondary,
.btn-danger {
  padding: 12px 20px;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: linear-gradient(180deg, #7F89FF, #6B7CFF);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(107, 124, 255, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--panel);
  color: var(--ink);
}

.btn-secondary:hover {
  background: var(--edge);
  transform: translateY(-2px);
}

.btn-danger {
  background: linear-gradient(180deg, #ff8080, #ff6b6b);
  color: white;
}

.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
}

.btn-revoke {
  padding: 6px 14px;
  background: transparent;
  border: 1px solid var(--danger);
  color: var(--danger);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-revoke:hover {
  background: var(--danger);
  color: white;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal {
  background: var(--tile);
  border-radius: 20px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.modal.large {
  max-width: 700px;
}

.modal-header {
  padding: 24px 24px 16px;
  border-bottom: 1px solid var(--panel);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 22px;
  color: var(--ink);
}

.btn-close {
  width: 36px;
  height: 36px;
  background: transparent;
  border: none;
  color: var(--muted);
  font-size: 28px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  background: var(--panel);
  color: var(--ink);
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--panel);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Forms */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--ink);
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  background: var(--bg);
  border: 1px solid var(--panel);
  border-radius: 10px;
  color: var(--ink);
  font-size: 15px;
  transition: all 0.2s;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(107, 124, 255, 0.1);
}

.form-group input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.share-input-group {
  display: flex;
  gap: 12px;
}

.share-input-group input {
  flex: 1;
}

/* Shared Users Section */
.shared-users-section {
  margin-top: 32px;
}

.shared-users-section h3 {
  margin: 0 0 16px;
  font-size: 18px;
  color: var(--ink);
}

.shared-users-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.shared-user-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--bg);
  border-radius: 12px;
  transition: all 0.2s;
}

.shared-user-item:hover {
  background: var(--panel);
}

.user-avatar {
  width: 48px;
  height: 48px;
  background: var(--panel);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted);
  flex-shrink: 0;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: 4px;
}

.user-email {
  font-size: 13px;
  color: var(--muted);
  opacity: 0.7;
}

.empty-message {
  text-align: center;
  padding: 40px;
  color: var(--muted);
  opacity: 0.5;
}

/* Responsive */
@media (max-width: 768px) {
  .pantry-detail-view {
    padding: 16px;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
  }

  .metrics-section {
    grid-template-columns: 1fr;
  }

  .items-list {
    grid-template-columns: 1fr;
  }

  .search-section {
    flex-direction: column;
  }

  .search-container {
    min-width: 100%;
  }

  .btn-add {
    width: 100%;
    justify-content: center;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .modal {
    width: 95%;
    margin: 16px;
  }

  .share-input-group {
    flex-direction: column;
  }
}
</style>
  background: transparent;
  color: #CFC9E6;
  font-weight: 600;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
}

.tab:hover {
  color: #EDEAF6;
}

.tab.active {
  color: #6B7CFF;
  border-bottom-color: #6B7CFF;
}

/* Tab Content */
.tab-content {
  background: #0E0F1A;
  padding: 24px;
  border-radius: 12px;
  min-height: 400px;
}

.tab-panel h2 {
  margin: 0 0 20px;
  color: #EDEAF6;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

/* Add Item Form */
.add-item-form {
  background: #1C1C30;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.add-item-form h3 {
  margin: 0 0 12px;
  color: #EDEAF6;
  font-size: 16px;
}

.form-row {
  display: flex;
  gap: 8px;
}

.form-row input {
  flex: 1;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #4B5CC7;
  background: #0E0F1A;
  color: #fff;
}

/* Items Table */
.items-table {
  width: 100%;
  border-collapse: collapse;
}

.items-table thead {
  background: #322D59;
}

.items-table th {
  padding: 12px;
  text-align: left;
  font-weight: 700;
  color: #EDEAF6;
}

.items-table tbody tr {
  border-bottom: 1px solid #322D59;
}

.items-table tbody tr:hover {
  background: #1A1A2E;
}

.items-table td {
  padding: 12px;
  color: #CFC9E6;
}

.actions {
  display: flex;
  gap: 8px;
}

/* Share Form */
.share-form {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.form-input {
  flex: 1;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #4B5CC7;
  background: #1C1C30;
  color: #fff;
}

/* Users List */
.shared-users h3 {
  margin: 0 0 12px;
  color: #EDEAF6;
  font-size: 18px;
}

.users-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.user-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #1C1C30;
  border-radius: 8px;
  margin-bottom: 8px;
  color: #EDEAF6;
}

.btn-danger-sm {
  padding: 6px 12px;
  background: #ff6b6b;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
}

.btn-danger-sm:hover {
  background: #ff5252;
}

/* Details Grid */
.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-item label {
  font-weight: 600;
  color: #CFC9E6;
  font-size: 14px;
}

.detail-item span,
.detail-item pre {
  color: #EDEAF6;
  font-size: 16px;
}

.detail-item pre {
  background: #1C1C30;
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 13px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #0E0F1A;
  padding: 24px;
  border-radius: 12px;
  min-width: 400px;
}

.modal h3 {
  margin: 0 0 16px;
  color: #EDEAF6;
}

.modal input {
  width: 100%;
  padding: 12px;
  margin-bottom: 12px;
  border-radius: 8px;
  border: 1px solid #4B5CC7;
  background: #1C1C30;
  color: #fff;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

/* Buttons */
.btn-primary,
.btn-secondary {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(180deg, #7F89FF, #6B7CFF);
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(107, 124, 255, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #322D59;
  color: #fff;
}

.btn-secondary:hover {
  background: #3D3A5C;
}

.btn-icon {
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
}

.btn-icon:hover {
  opacity: 0.7;
}
