<template>
  <div class="products-view">
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
            <h1 class="title">Products</h1>
            <p class="subtitle">Manage your product inventory</p>
          </div>
        </div>
        <button class="btn-create" @click="goToCreate">
          + Create Product
        </button>
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
          @input="onSearchDebounced"
        />
      </div>
      
      <!-- Contextual Pantry Filter Badge -->
      <div v-if="selectedPantryId" class="context-badge">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/>
          <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/>
          <path d="M12 3v6"/>
        </svg>
        <span>Filtering by pantry</span>
        <button class="remove-badge" @click="clearPantryFilter">×</button>
      </div>
    </div>

    <!-- Category Pills -->
    <div class="categories-section">
      <button
        v-for="cat in categoryPills"
        :key="cat.id"
        :class="['category-pill', { active: selectedCategory === cat.id }]"
        @click="selectCategory(cat.id)"
      >
        {{ cat.name }}
      </button>
    </div>

    <!-- Sort Controls -->
    <div class="sort-controls">
      <div class="sort-group">
        <label>Sort by:</label>
        <select v-model="sortBy" @change="changeSortBy(sortBy)" class="sort-select">
          <option value="name">Name</option>
          <option value="categoryName">Category</option>
          <option value="createdAt">Created Date</option>
          <option value="updatedAt">Updated Date</option>
        </select>
        <button class="btn-sort-order" @click="toggleSortOrder" :title="`Sort ${sortOrder === 'ASC' ? 'Descending' : 'Ascending'}`">
          <svg v-if="sortOrder === 'ASC'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m3 16 4 4 4-4"/>
            <path d="M7 20V4"/>
            <path d="m21 8-4-4-4 4"/>
            <path d="M17 4v16"/>
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m3 8 4-4 4 4"/>
            <path d="M7 4v16"/>
            <path d="m21 16-4 4-4-4"/>
            <path d="M17 20V4"/>
          </svg>
        </button>
      </div>
      <div class="results-count">
        {{ store.items.length }} result{{ store.items.length !== 1 ? 's' : '' }}
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="store.isLoading && !store.hasProducts" class="loading-state">
      <p>Loading products...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="store.hasError && !store.hasProducts" class="error-state">
      <p>{{ store.error?.message || 'Error loading products' }}</p>
      <button class="btn-retry" @click="loadProducts">Retry</button>
    </div>

    <!-- Empty State -->
    <div v-else-if="!store.hasProducts" class="empty-state">
      <p>No products found</p>
      <button class="btn-create" @click="goToCreate">Create first product</button>
    </div>

    <!-- Products Grid -->
    <div v-else class="products-grid">
      <div v-for="product in store.items" :key="product.id" class="product-card">
        <div class="product-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
          </svg>
        </div>
        
        <div class="product-content">
          <div class="product-header">
            <h3 class="product-name">{{ product.name }}</h3>
            <div class="product-actions">
              <button class="btn-icon" @click="goToEdit(product.id)" title="Edit">
                <img :src="editIcon" alt="Edit" width="18" height="18" />
              </button>
              <button class="btn-icon btn-delete" @click="confirmDelete(product)" title="Delete">
                <img :src="deleteIcon" alt="Delete" width="18" height="18" />
              </button>
            </div>
          </div>

          <div class="product-badges">
            <span v-if="product.category" class="badge badge-category">
              {{ product.category.name }}
            </span>
            <span v-if="getStorageType(product)" class="badge badge-storage">
              {{ getStorageType(product) }}
            </span>
          </div>

          <p v-if="product.metadata?.description" class="product-description">
            {{ product.metadata.description }}
          </p>
          <p v-else class="product-description empty">
            No description available
          </p>

          <div class="product-footer">
            <span class="stock-label">Stock: {{ getStock(product) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination Controls -->
    <div v-if="store.hasProducts" class="pagination">
      <button 
        class="btn-page" 
        @click="changePage(currentPage - 1)" 
        :disabled="currentPage === 1"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Previous
      </button>
      
      <div class="page-info">
        <span>Page {{ currentPage }}</span>
        <select v-model.number="perPage" @change="currentPage = 1; loadProducts()" class="per-page-select">
          <option :value="10">10 per page</option>
          <option :value="20">20 per page</option>
          <option :value="50">50 per page</option>
          <option :value="100">100 per page</option>
        </select>
      </div>
      
      <button 
        class="btn-page" 
        @click="changePage(currentPage + 1)" 
        :disabled="store.items.length < perPage"
      >
        Next
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="cancelDelete">
      <div class="modal" @click.stop>
        <h2>Confirm deletion</h2>
        <p>Are you sure you want to delete <strong>{{ productToDelete?.name }}</strong>?</p>
        <p class="warning-text">This action cannot be undone.</p>
        <div class="modal-actions">
          <button class="btn-secondary" @click="cancelDelete">Cancel</button>
          <button class="btn-danger" @click="executeDelete">Delete</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Sidebar -->
  <Sidebar
    :open="sidebarOpen"
    :active="'products'"
    @close="closeSidebar"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useProductsStore } from '@/stores/products'
import { useCategoriesStore } from '@/stores/categories'
import { useToast } from '@/composables/useToast'
import type { Product } from '@/types/products'
import Sidebar from '@/components/Sidebar.vue'
import editIcon from '@/assets/edit.svg'
import deleteIcon from '@/assets/delete.svg'

const router = useRouter()
const route = useRoute()
const store = useProductsStore()
const categoriesStore = useCategoriesStore()
const toast = useToast()

// State
const searchQuery = ref('')
const selectedCategory = ref<number | undefined>(undefined)
const selectedPantryId = ref<number | undefined>(undefined)
const sortBy = ref<'name' | 'categoryName' | 'createdAt' | 'updatedAt'>('name')
const sortOrder = ref<'ASC' | 'DESC'>('ASC')
const currentPage = ref(1)
const perPage = ref(20)
const showDeleteModal = ref(false)
const productToDelete = ref<Product | null>(null)
const sidebarOpen = ref(false)

// Debounce timer
let searchDebounceTimer: number | undefined

// Category pills
const categoryPills = computed(() => {
  const pills: Array<{ id: number | undefined; name: string }> = [
    { id: undefined, name: 'All Categories' }
  ]
  categoriesStore.items.forEach(cat => {
    pills.push({ id: cat.id, name: cat.name })
  })
  return pills
})

onMounted(async () => {
  // Check if we're coming from a pantry detail (context filter)
  if (route.query.pantry_id) {
    selectedPantryId.value = Number(route.query.pantry_id)
  }
  
  // Load categories
  try {
    await categoriesStore.fetchCategories({ per_page: 100 })
  } catch (error: any) {
    console.error('Error loading categories:', error)
  }
  
  // Load products
  loadProducts()
})

const loadProducts = async () => {
  try {
    await store.fetchProducts({
      name: searchQuery.value || undefined,
      category_id: selectedCategory.value,
      pantry_id: selectedPantryId.value,
      per_page: perPage.value,
      page: currentPage.value,
      order: sortOrder.value,
      sort_by: sortBy.value,
    })
  } catch (error: any) {
    toast.error(error.message || 'Error loading products')
  }
}

const onSearchDebounced = () => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }
  searchDebounceTimer = window.setTimeout(() => {
    currentPage.value = 1 // Reset to first page on search
    loadProducts()
  }, 500)
}

const selectCategory = (categoryId: number | undefined) => {
  selectedCategory.value = categoryId
  currentPage.value = 1 // Reset to first page on filter change
  loadProducts()
}

const changeSortBy = (newSortBy: 'name' | 'categoryName' | 'createdAt' | 'updatedAt') => {
  sortBy.value = newSortBy
  loadProducts()
}

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'ASC' ? 'DESC' : 'ASC'
  loadProducts()
}

const changePage = (page: number) => {
  currentPage.value = page
  loadProducts()
}

const clearPantryFilter = () => {
  selectedPantryId.value = undefined
  router.replace({ query: {} }) // Remove query param
  loadProducts()
}

const getStock = (product: Product): string => {
  if (product.metadata && typeof product.metadata.stock === 'number') {
    return product.metadata.stock.toString()
  }
  return 'N/A'
}

const getStorageType = (product: Product): string | null => {
  if (product.metadata?.storage) {
    return product.metadata.storage
  }
  return null
}

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const closeSidebar = () => {
  sidebarOpen.value = false
}

const goToCreate = () => {
  router.push('/products/new')
}

const goToEdit = (id: number) => {
  router.push(`/products/${id}/edit`)
}

const confirmDelete = (product: Product) => {
  productToDelete.value = product
  showDeleteModal.value = true
}

const cancelDelete = () => {
  showDeleteModal.value = false
  productToDelete.value = null
}

const executeDelete = async () => {
  if (!productToDelete.value) return

  try {
    await store.deleteProduct(productToDelete.value.id)
    toast.success('Product deleted successfully')
    showDeleteModal.value = false
    productToDelete.value = null
    loadProducts()
  } catch (error: any) {
    toast.error(error.message || 'Error deleting product')
  }
}
</script>

<style scoped>
.products-view {
  min-height: 100vh;
  background: #1C1C30;
  color: #EDEAF6;
  padding: 0;
}

/* Header */
.header {
  background: #322D59;
  padding: 24px 32px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.menu-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s ease;
}

.menu-icon:hover {
  background: rgba(255, 255, 255, 0.08);
}

.menu-icon svg {
  color: #EDEAF6;
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.title {
  font-size: 28px;
  font-weight: 800;
  margin: 0;
  color: #EDEAF6;
}

.subtitle {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.btn-create {
  background: #5B5DD9;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-create:hover {
  background: #6B6FE8;
  transform: translateY(-1px);
}

/* Search Section */
.search-section {
  padding: 24px 32px 16px;
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.search-container {
  position: relative;
  flex: 1;
  max-width: 600px;
  min-width: 250px;
}

.context-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 152, 0, 0.15);
  border: 1px solid rgba(255, 152, 0, 0.3);
  border-radius: 8px;
  padding: 8px 12px;
  color: #FFB74D;
  font-size: 14px;
  font-weight: 500;
}

.context-badge svg {
  flex-shrink: 0;
}

.remove-badge {
  background: none;
  border: none;
  color: #FFB74D;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.remove-badge:hover {
  background: rgba(255, 152, 0, 0.2);
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.search-input {
  width: 100%;
  background: #322D59;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px 16px 12px 48px;
  color: #EDEAF6;
  font-size: 15px;
  outline: none;
  transition: all 0.2s ease;
}

.search-input::placeholder {
  color: #999;
}

.search-input:focus {
  border-color: #5B5DD9;
  background: rgba(91, 93, 217, 0.1);
}

/* Categories Section */
.categories-section {
  padding: 0 32px 24px;
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  overflow-x: auto;
}

.category-pill {
  background: #322D59;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  padding: 8px 20px;
  color: #EDEAF6;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.category-pill:hover {
  background: rgba(91, 93, 217, 0.2);
  border-color: rgba(91, 93, 217, 0.4);
}

.category-pill.active {
  background: #5B5DD9;
  border-color: #5B5DD9;
  color: #FFFFFF;
}

/* Sort Controls */
.sort-controls {
  padding: 0 32px 16px;
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.sort-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sort-group label {
  font-size: 14px;
  color: #999;
  font-weight: 500;
}

.sort-select,
.per-page-select {
  background: #322D59;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px 12px;
  color: #EDEAF6;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

.sort-select:hover,
.per-page-select:hover {
  border-color: rgba(91, 93, 217, 0.4);
}

.sort-select:focus,
.per-page-select:focus {
  border-color: #5B5DD9;
}

.btn-sort-order {
  background: #322D59;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px;
  color: #EDEAF6;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-sort-order:hover {
  background: rgba(91, 93, 217, 0.2);
  border-color: rgba(91, 93, 217, 0.4);
}

.results-count {
  font-size: 14px;
  color: #999;
  font-weight: 500;
}

/* States */
.loading-state,
.error-state,
.empty-state {
  padding: 60px 32px;
  text-align: center;
  max-width: 1400px;
  margin: 0 auto;
}

.error-state {
  color: #f44336;
}

.btn-retry {
  background: rgba(255, 255, 255, 0.1);
  color: #EDEAF6;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  cursor: pointer;
  margin-top: 16px;
  transition: all 0.2s ease;
}

.btn-retry:hover {
  background: rgba(255, 255, 255, 0.15);
}

/* Products Grid */
.products-grid {
  padding: 0 32px 32px;
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.product-card {
  background: #322D59;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s ease;
  display: flex;
  gap: 16px;
}

.product-card:hover {
  border-color: rgba(91, 93, 217, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.product-icon {
  width: 56px;
  height: 56px;
  background: rgba(91, 93, 217, 0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.product-icon svg {
  color: #5B5DD9;
}

.product-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.product-name {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: #EDEAF6;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.btn-icon {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.08);
  border: none;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #EDEAF6;
}

.btn-icon img {
  filter: brightness(0) invert(1);
  opacity: 0.9;
}

.btn-icon:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(1.1);
}

.btn-icon:hover img {
  opacity: 1;
}

.btn-icon.btn-delete:hover {
  background: rgba(244, 67, 54, 0.2);
}

.btn-icon.btn-delete img {
  filter: brightness(0) saturate(100%) invert(56%) sepia(89%) saturate(2530%) hue-rotate(334deg) brightness(97%) contrast(94%);
}

.btn-icon.btn-delete:hover img {
  filter: brightness(0) saturate(100%) invert(42%) sepia(84%) saturate(2449%) hue-rotate(343deg) brightness(101%) contrast(92%);
}

.product-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.badge-category {
  background: rgba(91, 93, 217, 0.2);
  color: #8B8EFF;
  border: 1px solid rgba(91, 93, 217, 0.3);
}

.badge-storage {
  background: rgba(76, 175, 80, 0.2);
  color: #81C784;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.product-description {
  font-size: 14px;
  color: #999;
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-description.empty {
  font-style: italic;
  opacity: 0.7;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.stock-label {
  font-size: 14px;
  color: #EDEAF6;
  font-weight: 500;
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
  background: #322D59;
  border-radius: 16px;
  padding: 32px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.modal h2 {
  margin: 0 0 16px;
  font-size: 24px;
  color: #EDEAF6;
}

.modal p {
  margin: 12px 0;
  line-height: 1.6;
  color: #CFC9E6;
}

.warning-text {
  color: #ff9800;
  font-size: 14px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  justify-content: flex-end;
}

.btn-secondary,
.btn-danger {
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #EDEAF6;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

.btn-danger {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
  border: 1px solid rgba(244, 67, 54, 0.4);
}

.btn-danger:hover {
  background: rgba(244, 67, 54, 0.3);
}

/* Pagination */
.pagination {
  padding: 24px 32px;
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.btn-page {
  background: #322D59;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 10px 16px;
  color: #EDEAF6;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-page:hover:not(:disabled) {
  background: rgba(91, 93, 217, 0.2);
  border-color: rgba(91, 93, 217, 0.4);
}

.btn-page:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #EDEAF6;
}

.per-page-select {
  padding: 6px 10px;
  font-size: 13px;
}

/* Responsive */
@media (max-width: 768px) {
  .header {
    padding: 16px 20px;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .header-left {
    flex-direction: row;
  }

  .title {
    font-size: 24px;
  }

  .search-section,
  .categories-section,
  .sort-controls,
  .products-grid,
  .pagination {
    padding-left: 20px;
    padding-right: 20px;
  }

  .search-section {
    flex-direction: column;
    align-items: stretch;
  }

  .search-container {
    max-width: 100%;
  }

  .sort-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .sort-group {
    justify-content: space-between;
  }

  .results-count {
    text-align: center;
  }

  .products-grid {
    grid-template-columns: 1fr;
  }

  .product-card {
    flex-direction: column;
  }

  .product-icon {
    width: 48px;
    height: 48px;
  }

  .pagination {
    flex-direction: column;
    gap: 12px;
  }

  .btn-page {
    width: 100%;
    justify-content: center;
  }
}
</style>