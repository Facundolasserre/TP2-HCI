<template>
  <div class="layout">
    <!-- TOPBAR -->
    <div class="layout-topbar">
      <div class="topbar-wrap">
        <div class="topbar">
          <!-- Burger menu -->
          <button class="btn-icon" @click="toggleSidebar" aria-label="Menu">
            <img src="@/assets/fonts/burgerIcon.png" alt="Menu" />
          </button>

          <!-- Search -->
          <div class="search-wrap">
            <input 
              v-model.trim="searchQuery" 
              class="search" 
              type="text" 
              placeholder="Search shopping lists..." 
              @input="onSearch"
            />
          </div>

          <!-- Filter button -->
          <button class="btn-icon" @click="toggleFilters" aria-label="Filter">
            <img src="@/assets/fonts/filter.png" alt="Filter" />
          </button>

          <!-- Sort button -->
          <button class="btn-icon" @click="toggleSort" aria-label="Sort">
            <img src="@/assets/fonts/sort.png" alt="Sort" />
          </button>

          <!-- New list button -->
          <button class="btn-new" @click="createNewList">
            <span class="plus">+</span>
            New List
          </button>

          <!-- Settings -->
          <button class="btn-icon" @click="goSettings" aria-label="Settings">
            <img src="@/assets/fonts/settings.png" alt="Settings" />
          </button>
        </div>

        <!-- Filters panel (collapsible) -->
        <transition name="slide">
          <div v-if="showFilters" class="filters-panel">
            <label class="filter-item">
              <input type="checkbox" v-model="filters.owner" />
              <span>My Lists Only</span>
            </label>
            <label class="filter-item">
              <input type="checkbox" v-model="filters.recurring" />
              <span>Recurring Lists</span>
            </label>
            <button class="btn-clear-filters" @click="clearFilters">Clear Filters</button>
          </div>
        </transition>

        <!-- Sort panel (collapsible) -->
        <transition name="slide">
          <div v-if="showSort" class="sort-panel">
            <label class="sort-item" v-for="option in sortOptions" :key="option.value">
              <input type="radio" v-model="sortBy" :value="option.value" />
              <span>{{ option.label }}</span>
            </label>
          </div>
        </transition>
      </div>
    </div>

    <!-- GRID -->
    <div class="layout-grid">
      <!-- Loading state -->
      <div v-if="store.isLoading && !store.hasLists" class="loading-state">
        <div class="spinner"></div>
        <p>Loading shopping lists...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="store.hasError" class="error-state">
        <div class="error-icon">⚠️</div>
        <h2>Error loading lists</h2>
        <p>{{ store.error?.message || 'Something went wrong' }}</p>
        <button class="btn-retry" @click="loadLists">Retry</button>
      </div>

      <!-- Empty state -->
      <div v-else-if="!store.hasLists" class="empty-state">
        <div class="empty-content">
          <div class="empty-icon">
            <img src="@/assets/shopping_cart.svg" alt="Empty" />
          </div>
          <h2 class="empty-title">No shopping lists yet</h2>
          <p class="empty-text">Create your first list to start organizing your shopping</p>
          <button class="btn-create" @click="createNewList">
            <span class="plus-icon">+</span>
            Create List
          </button>
        </div>
      </div>

      <!-- Lists grid -->
      <main v-else class="grid">
        <article
          v-for="list in store.items"
          :key="list.id"
          class="card"
          @click="openList(list)"
        >
          <div class="card-title-wrapper" :style="{ backgroundColor: getListColor(list) }">
            <div class="card-ico">
              <img :src="getListIcon(list)" :alt="list.name" />
            </div>
            <h3 class="card-title">{{ list.name }}</h3>
            <div v-if="list.recurring" class="recurring-badge">🔄 Recurring</div>
          </div>
          
          <div class="card-body">
            <p v-if="list.description" class="card-description">{{ list.description }}</p>
            
            <div class="card-meta">
              <div class="meta-item">
                <span class="meta-icon">👤</span>
                <span class="meta-text">{{ list.owner.name }} {{ list.owner.surname }}</span>
              </div>
              <div v-if="list.sharedWith?.length" class="meta-item">
                <span class="meta-icon">🔗</span>
                <span class="meta-text">Shared with {{ list.sharedWith.length }}</span>
              </div>
              <div v-if="list.lastPurchasedAt" class="meta-item">
                <span class="meta-icon">🛒</span>
                <span class="meta-text">Last: {{ formatDate(list.lastPurchasedAt) }}</span>
              </div>
            </div>
          </div>

          <div class="card-actions" @click.stop>
            <button class="action-btn" @click="editList(list)" title="Edit">
              ✎
            </button>
            <button class="action-btn" @click="shareListModal(list)" title="Share">
              🔗
            </button>
            <button class="action-btn danger" @click="confirmDelete(list)" title="Delete">
              🗑
            </button>
          </div>
        </article>
      </main>
    </div>

    <!-- SIDEBAR -->
    <Sidebar
      :open="sidebarOpen"
      :active="'home'"
      @close="closeSidebar"
    />

    <!-- Share Modal -->
    <ShareMembersModal
      v-if="showShareModal && selectedList"
      :list-id="selectedList.id"
      :list-name="selectedList.name"
      @close="closeShareModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useShoppingListsStore } from '@/stores/shoppingLists'
import { useToast } from '@/composables/useToast'
import type { ShoppingList } from '@/types/shopping-lists'
import Sidebar from '@/components/Sidebar.vue'
import ShareMembersModal from '@/components/ShareMembersModal.vue'

const router = useRouter()
const store = useShoppingListsStore()
const toast = useToast()

// UI State
const sidebarOpen = ref(false)
const showFilters = ref(false)
const showSort = ref(false)
const searchQuery = ref('')
const showShareModal = ref(false)
const selectedList = ref<ShoppingList | null>(null)

// Filters
const filters = ref({
  owner: false,
  recurring: false,
})

// Sort
const sortBy = ref<'name' | 'createdAt' | 'updatedAt' | 'lastPurchasedAt'>('createdAt')
const sortOptions = [
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'createdAt', label: 'Created Date' },
  { value: 'updatedAt', label: 'Last Updated' },
  { value: 'lastPurchasedAt', label: 'Last Purchased' },
]

// Icon mapping
const iconMap: Record<string, string> = {
  'shopping_cart.svg': new URL('@/assets/shopping_cart.svg', import.meta.url).href,
  'family.svg': new URL('@/assets/family.svg', import.meta.url).href,
  'travel.svg': new URL('@/assets/travel.svg', import.meta.url).href,
  'liquor.svg': new URL('@/assets/liquor.svg', import.meta.url).href,
}

// Color mapping
const colors = [
  '#6B7CFF', '#FF6B9D', '#4CAF50', '#FF9800', '#9C27B0', '#00BCD4',
]

// Methods
const toggleSidebar = () => sidebarOpen.value = !sidebarOpen.value
const closeSidebar = () => sidebarOpen.value = false
const toggleFilters = () => {
  showFilters.value = !showFilters.value
  showSort.value = false
}
const toggleSort = () => {
  showSort.value = !showSort.value
  showFilters.value = false
}

const goSettings = () => router.push('/settings')

const clearFilters = () => {
  filters.value.owner = false
  filters.value.recurring = false
  loadLists()
}

const onSearch = () => {
  loadLists()
}

const loadLists = async () => {
  try {
    await store.fetchLists({
      name: searchQuery.value || undefined,
      owner: filters.value.owner || undefined,
      recurring: filters.value.recurring || undefined,
      sort_by: sortBy.value,
      page: 1,
      per_page: 50,
    })
  } catch (error: any) {
    toast.error(error.message || 'Failed to load lists')
  }
}

const createNewList = () => {
  router.push('/lists/new')
}

const openList = (list: ShoppingList) => {
  router.push(`/lists/${list.id}`)
}

const editList = (list: ShoppingList) => {
  router.push(`/lists/${list.id}/edit`)
}

const shareListModal = (list: ShoppingList) => {
  selectedList.value = list
  showShareModal.value = true
}

const closeShareModal = () => {
  showShareModal.value = false
  selectedList.value = null
  loadLists() // Refresh to get updated sharedWith
}

const confirmDelete = async (list: ShoppingList) => {
  if (!confirm(`Are you sure you want to delete "${list.name}"?`)) {
    return
  }

  try {
    await store.deleteList(list.id)
    toast.success('List deleted successfully')
  } catch (error: any) {
    toast.error(error.message || 'Failed to delete list')
  }
}

const getListIcon = (list: ShoppingList): string => {
  // Extract icon from metadata or use default
  const iconName = (list.metadata as any)?.icon || 'shopping_cart.svg'
  return iconMap[iconName] || iconMap['shopping_cart.svg']
}

const getListColor = (list: ShoppingList): string => {
  // Extract color from metadata or use hash-based color
  const color = (list.metadata as any)?.color
  if (color) return color
  
  // Generate consistent color based on list ID
  return colors[list.id % colors.length]
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return date.toLocaleDateString()
}

// Watch for filter/sort changes
watch([filters, sortBy], () => {
  loadLists()
}, { deep: true })

// Load lists on mount
onMounted(() => {
  loadLists()
})
</script>

<style scoped>
/* ===== LAYOUT GENERAL ===== */
.layout {
  min-height: 100vh;
  background: #1C1C30;
  color: #EDEAF6;
  display: flex;
  flex-direction: column;
  padding: 22px 26px 32px;
}

/* ===== TOPBAR ===== */
.layout-topbar {
  width: 100%;
  margin: 0 0 24px;
}

.topbar-wrap {
  width: 100%;
}

.topbar {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.btn-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: none;
  background: #322D59;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-icon:hover {
  background: #3a3868;
}

.btn-icon img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.search-wrap {
  flex: 1;
  position: relative;
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
  box-sizing: border-box;
}

.search::placeholder {
  color: #b9b5d1;
}

.btn-new {
  height: 44px;
  padding: 0 20px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(180deg, #7F89FF, #6B7CFF);
  color: #fff;
  font-weight: 800;
  font-size: 15px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: transform 0.2s ease;
}

.btn-new:hover {
  transform: translateY(-2px);
}

.btn-new .plus {
  font-size: 20px;
  font-weight: 900;
}

/* ===== FILTERS & SORT PANELS ===== */
.filters-panel,
.sort-panel {
  margin-top: 12px;
  padding: 16px;
  background: #322D59;
  border-radius: 12px;
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-item,
.sort-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.filter-item input,
.sort-item input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.filter-item span,
.sort-item span {
  font-weight: 600;
  color: #EDEAF6;
}

.btn-clear-filters {
  margin-left: auto;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: #2B2950;
  color: #EDEAF6;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-clear-filters:hover {
  background: #3a3868;
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

/* ===== GRID ===== */
.layout-grid {
  flex: 1;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
  width: 100%;
}

@media (max-width: 860px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

/* ===== CARD ===== */
.card {
  background: #0E0F1A;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.35);
  transition: transform 0.08s ease;
  cursor: pointer;
  overflow: hidden;
}

.card:hover {
  transform: translateY(-2px);
}

.card-title-wrapper {
  padding: 24px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  position: relative;
}

.recurring-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 10px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
}

.card-ico {
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-ico img {
  width: 64px;
  height: 64px;
  filter: brightness(0) invert(1);
  opacity: 0.9;
}

.card-title {
  margin: 0;
  font-weight: 800;
  color: #fff;
  font-size: 22px;
  word-break: break-word;
}

.card-body {
  padding: 16px 20px;
  flex: 1;
}

.card-description {
  margin: 0 0 12px;
  color: #CFC9E6;
  font-size: 14px;
  line-height: 1.4;
  opacity: 0.85;
}

.card-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #CFC9E6;
}

.meta-icon {
  opacity: 0.7;
}

.meta-text {
  font-weight: 600;
}

.card-actions {
  display: flex;
  gap: 8px;
  padding: 12px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.action-btn {
  flex: 1;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: #322D59;
  color: #EDEAF6;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.action-btn:hover {
  background: #3a3868;
}

.action-btn.danger:hover {
  background: #ff4444;
}

/* ===== LOADING STATE ===== */
.loading-state {
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

/* ===== ERROR STATE ===== */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
}

.error-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.error-state h2 {
  font-size: 28px;
  font-weight: 800;
  color: #EDEAF6;
  margin: 0 0 12px;
}

.error-state p {
  font-size: 16px;
  color: #CFC9E6;
  opacity: 0.8;
  margin: 0 0 24px;
}

.btn-retry {
  height: 44px;
  padding: 0 28px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(180deg, #7F89FF, #6B7CFF);
  color: #fff;
  font-weight: 800;
  font-size: 15px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.btn-retry:hover {
  transform: translateY(-2px);
}

/* ===== EMPTY STATE ===== */
.empty-state {
  display: grid;
  place-items: center;
  min-height: 60vh;
  width: 100%;
}

.empty-content {
  text-align: center;
  max-width: 400px;
  padding: 40px 20px;
}

.empty-icon {
  margin-bottom: 20px;
}

.empty-icon img {
  width: 120px;
  height: 120px;
  filter: brightness(0) invert(1);
  opacity: 0.3;
}

.empty-title {
  font-size: 32px;
  font-weight: 800;
  color: #EDEAF6;
  margin: 0 0 12px;
}

.empty-text {
  font-size: 16px;
  color: #CFC9E6;
  opacity: 0.8;
  margin: 0 0 32px;
  line-height: 1.5;
}

.btn-create {
  height: 50px;
  padding: 0 32px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(180deg, #7F89FF, #6B7CFF);
  color: #fff;
  font-weight: 800;
  font-size: 16px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s ease;
}

.btn-create:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(107, 124, 255, 0.4);
}

.plus-icon {
  font-size: 22px;
  font-weight: 900;
  line-height: 1;
}
</style>
