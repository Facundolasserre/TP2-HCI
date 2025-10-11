<template>
  <div class="products-view">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <button
            class="menu-button"
            @click="toggleSidebar"
            :aria-label="t('topbar.open_menu')"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div>
            <h1 class="title">{{ t('products.title') }}</h1>
            <p class="subtitle">{{ t('products.subtitle') }}</p>
          </div>
        </div>
        <button class="btn-primary" @click="openCreateModal">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {{ t('products.create_button') }}
        </button>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="toolbar-left">
        <div class="search-box">
          <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="t('products.search_placeholder')"
            class="search-input"
            @input="onSearchDebounced"
          />
        </div>
      </div>

      <div class="toolbar-right">
        <select v-model="selectedCategory" @change="onFilterChange" class="filter-select" :aria-label="t('products.form.category_label')">
          <option :value="undefined">{{ t('products.filter.all_categories') }}</option>
          <option v-for="cat in categoriesStore.items" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>

        <div class="per-page-control">
          <label for="per-page">{{ t('products.filter.show') }}</label>
          <select id="per-page" v-model.number="perPage" @change="onPerPageChange" class="filter-select small">
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Category Pills -->
    <div class="category-pills">
      <button 
        :class="['pill', { active: selectedCategory === undefined }]"
        @click="selectedCategory = undefined; onFilterChange()"
      >
        {{ t('products.filter.all_categories') }}
      </button>
      <button 
        v-for="cat in categoriesStore.items" 
        :key="cat.id"
        :class="['pill', { active: selectedCategory === cat.id }]"
        @click="selectedCategory = cat.id; onFilterChange()"
      >
        {{ cat.name }}
      </button>
    </div>

    <!-- Products List -->
    <div class="products-section">
      <!-- Loading -->
      <div v-if="store.isLoading" class="state-container">
        <div class="spinner"></div>
        <p>{{ t('products.loading') }}</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="store.items.length === 0" class="state-container empty">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
        </svg>
        <h3>{{ t('products.empty.title') }}</h3>
        <p>{{ searchQuery ? t('products.empty.search_hint') : t('products.empty.create_hint') }}</p>
        <button class="btn-primary" @click="openCreateModal">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {{ t('products.create_button') }}
        </button>
      </div>

      <!-- Products Cards -->
      <div v-else class="products-list">
        <div 
          v-for="product in store.items" 
          :key="product.id"
          class="product-card"
        >
          <div class="product-icon">
            <img :src="IconShoppingCart" :alt="t('products.title')" width="32" height="32" />
          </div>

          <div class="product-content">
            <div class="product-header">
              <div class="product-info">
                <h3 class="product-name">{{ product.name }}</h3>
                <p v-if="product.metadata?.description" class="product-description">
                  {{ product.metadata.description }}
                </p>
              </div>
              
              <div class="product-badges">
                <span v-if="product.category" class="badge badge-category">
                  {{ product.category.name }}
                </span>
                <span v-if="product.metadata?.storage" class="badge badge-storage">
                  {{ product.metadata.storage }}
                </span>
              </div>
            </div>

            <div class="product-meta">
              <span v-if="product.metadata?.stock" class="meta-item">
                {{ t('products.stock_label') }} <strong>{{ product.metadata.stock }}</strong>
              </span>
              <span class="meta-item meta-divider">•</span>
              <span class="meta-item">
                {{ t('products.updated_label') }} <strong>{{ formatDate(product.updatedAt) }}</strong>
              </span>
            </div>
          </div>

          <div class="product-actions">
            <button 
              class="btn-icon"
              @click="openEditModal(product)"
              :title="t('products.actions.edit')"
              :aria-label="t('products.actions.edit')"
            >
              <img :src="IconEdit" :alt="t('common.edit')" width="18" height="18" />
            </button>
            <button 
              class="btn-icon btn-danger"
              @click="confirmDelete(product)"
              :title="t('products.actions.delete')"
              :aria-label="t('products.actions.delete')"
            >
              <img :src="IconDelete" :alt="t('common.delete')" width="18" height="18" />
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <Pagination
        v-if="store.items.length > 0"
        :current-page="currentPage"
        :total-pages="totalPages"
        :total="totalProducts"
        @update:current-page="changePage"
      />
    </div>

    <!-- Create/Edit Modal -->
    <Modal
      :open="showProductModal"
      :title="editingProduct ? t('products.modal.edit_title') : t('products.modal.create_title')"
      size="md"
      @close="closeProductModal"
    >
      <form @submit.prevent="saveProduct" class="product-form">
        <div class="form-group">
          <label for="product-name" class="form-label">
            {{ t('products.form.name_label') }} <span class="required">*</span>
          </label>
          <input
            id="product-name"
            v-model="productForm.name"
            type="text"
            class="form-input"
            :placeholder="t('products.form.name_placeholder')"
            maxlength="50"
            required
          />
          <span class="form-hint">{{ t('products.form.name_hint') }}</span>
        </div>

        <div class="form-group">
          <label for="product-category" class="form-label">
            {{ t('products.form.category_label') }} <span class="required">*</span>
          </label>
          <select
            id="product-category"
            v-model="productForm.categoryId"
            class="form-input"
            required
          >
            <option :value="null">{{ t('products.form.category_placeholder') }}</option>
            <option v-for="cat in categoriesStore.items" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="product-metadata" class="form-label">
            {{ t('products.form.metadata_label') }}
          </label>
          <textarea
            id="product-metadata"
            v-model="productForm.metadataString"
            class="form-input textarea"
            :placeholder="t('products.form.metadata_placeholder')"
            rows="4"
          ></textarea>
          <span v-if="metadataError" class="form-error">{{ metadataError }}</span>
          <span v-else class="form-hint">{{ t('products.form.metadata_hint') }}</span>
        </div>
      </form>

      <template #footer>
        <button type="button" class="btn-secondary" @click="closeProductModal">
          {{ t('common.cancel') }}
        </button>
        <button type="button" class="btn-primary" @click="saveProduct" :disabled="isSaving">
          {{ isSaving ? t('common.saving') : (editingProduct ? t('common.update') : t('common.create')) }}
        </button>
      </template>
    </Modal>

    <!-- Delete Confirmation Modal -->
    <Modal
      :open="showDeleteModal"
      :title="t('products.delete.title')"
      size="sm"
      @close="cancelDelete"
    >
      <p class="modal-text">
        {{ t('products.delete.message', { name: productToDelete?.name || '' }) }}
      </p>
      <p class="modal-warning">{{ t('products.delete.warning') }}</p>

      <template #footer>
        <button type="button" class="btn-secondary" @click="cancelDelete">
          {{ t('common.cancel') }}
        </button>
        <button type="button" class="btn-danger" @click="executeDelete" :disabled="isDeleting">
          {{ isDeleting ? t('common.deleting') : t('products.delete.confirm') }}
        </button>
      </template>
    </Modal>

    <!-- Sidebar -->
    <Sidebar
      :open="sidebarOpen"
      active="products"
      @close="closeSidebar"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useProductsStore } from '@/stores/products'
import { useCategoriesStore } from '@/stores/categories'
import { useToast } from '@/composables/useToast'
import type { Product } from '@/types/products'
import Sidebar from '@/components/Sidebar.vue'
import Pagination from '@/components/Pagination.vue'
import Modal from '@/components/Modal.vue'
import { useI18n } from '@/composables/useI18n'
import { useLanguageStore } from '@/stores/language'

// Import local SVG icons
import IconShoppingCart from '@/assets/shopping_cart.svg'
import IconEdit from '@/assets/edit.svg'
import IconDelete from '@/assets/delete.svg'

const store = useProductsStore()
const categoriesStore = useCategoriesStore()
const toast = useToast()
const { t } = useI18n()
const languageStore = useLanguageStore()

// State
const sidebarOpen = ref(false)
const searchQuery = ref('')
const selectedCategory = ref<number | undefined>(undefined)
const sortBy = ref<'name' | 'createdAt' | 'updatedAt'>('name')
const sortOrder = ref<'ASC' | 'DESC'>('ASC')
const currentPage = ref(1)
const perPage = ref(10)
const totalProducts = ref(0)

// Modal states
const showProductModal = ref(false)
const showDeleteModal = ref(false)
const editingProduct = ref<Product | null>(null)
const productToDelete = ref<Product | null>(null)
const isSaving = ref(false)
const isDeleting = ref(false)

// Form state
const productForm = ref({
  name: '',
  categoryId: null as number | null,
  metadataString: ''
})

const metadataError = ref('')

// Debounce timer
let searchDebounceTimer: number | undefined

// Computed
const totalPages = computed(() => {
  return Math.ceil(totalProducts.value / perPage.value) || 1
})

// Methods
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const closeSidebar = () => {
  sidebarOpen.value = false
}

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  const locale = languageStore.language === 'es' ? 'es-AR' : 'en-US'
  return date.toLocaleDateString(locale, { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const loadProducts = async () => {
  try {
    const result = await store.fetchProducts({
      name: searchQuery.value || undefined,
      category_id: selectedCategory.value,
      per_page: perPage.value,
      page: currentPage.value,
      order: sortOrder.value,
      sort_by: sortBy.value,
    })
    
    // Update total from response if available
    if (result && typeof result === 'object' && 'total' in result) {
      totalProducts.value = (result as any).total || store.items.length
    } else {
      totalProducts.value = store.items.length
    }
  } catch (error: any) {
    toast.error(error.message || t('products.toast.load_error'))
  }
}

const onSearchDebounced = () => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }
  searchDebounceTimer = window.setTimeout(() => {
    currentPage.value = 1
    loadProducts()
  }, 300)
}

const onFilterChange = () => {
  currentPage.value = 1
  loadProducts()
}

const onPerPageChange = () => {
  currentPage.value = 1
  loadProducts()
}

const changePage = (page: number) => {
  currentPage.value = page
  loadProducts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Product Modal
const openCreateModal = () => {
  editingProduct.value = null
  productForm.value = {
    name: '',
    categoryId: null,
    metadataString: ''
  }
  metadataError.value = ''
  showProductModal.value = true
}

const openEditModal = (product: Product) => {
  editingProduct.value = product
  productForm.value = {
    name: product.name,
    categoryId: product.category?.id || null,
    metadataString: product.metadata ? JSON.stringify(product.metadata, null, 2) : ''
  }
  metadataError.value = ''
  showProductModal.value = true
}

const closeProductModal = () => {
  showProductModal.value = false
  editingProduct.value = null
  productForm.value = {
    name: '',
    categoryId: null,
    metadataString: ''
  }
  metadataError.value = ''
}

const validateMetadata = (): boolean => {
  if (!productForm.value.metadataString.trim()) {
    return true // Empty is valid
  }
  
  try {
    JSON.parse(productForm.value.metadataString)
    metadataError.value = ''
    return true
  } catch (error) {
    metadataError.value = t('products.form.metadata_invalid')
    return false
  }
}

const saveProduct = async () => {
  if (!productForm.value.name.trim()) {
    toast.error(t('products.toast.name_required'))
    return
  }
  
  if (!productForm.value.categoryId) {
    toast.error(t('products.toast.category_required'))
    return
  }
  
  if (!validateMetadata()) {
    return
  }
  
  isSaving.value = true
  
  try {
    const metadata = productForm.value.metadataString.trim() 
      ? JSON.parse(productForm.value.metadataString)
      : {}
    
    const productData = {
      name: productForm.value.name.trim(),
      category: { id: productForm.value.categoryId },
      metadata
    }
    
    if (editingProduct.value) {
      await store.updateProduct(editingProduct.value.id, productData)
      toast.success(t('products.toast.update_success'))
    } else {
      await store.createProduct(productData)
      toast.success(t('products.toast.create_success'))
    }
    
    closeProductModal()
    loadProducts()
  } catch (error: any) {
    toast.error(
      error.message ||
      t(editingProduct.value ? 'products.toast.update_error' : 'products.toast.create_error')
    )
  } finally {
    isSaving.value = false
  }
}

// Delete
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
  
  isDeleting.value = true
  
  try {
    await store.deleteProduct(productToDelete.value.id)
    toast.success(t('products.toast.delete_success'))
    showDeleteModal.value = false
    productToDelete.value = null
    loadProducts()
  } catch (error: any) {
    toast.error(error.message || t('products.toast.delete_error'))
  } finally {
    isDeleting.value = false
  }
}

// Lifecycle
onMounted(async () => {
  // Load categories
  try {
    await categoriesStore.fetchCategories({ per_page: 100 })
  } catch (error: any) {
    console.error('Error loading categories:', error)
  }
  
  // Load products
  loadProducts()
})
</script>

<style scoped>
/* ============================================
   FULL-SCREEN WEB LAYOUT - USE ALL PIXELS
   ============================================ */

.products-view {
  min-height: 100vh;
  background: #1C1C30;
  color: #EDEAF6;
  display: flex;
  flex-direction: column;
}

/* Page Header - Full Width, Sticky */
.page-header {
  background: #322D59;
  padding: 0 12px;
  height: 60px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
}

.header-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-button {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s ease;
  color: #EDEAF6;
}

.menu-button:hover {
  background: rgba(255, 255, 255, 0.08);
}

.title {
  font-size: 24px;
  font-weight: 800;
  margin: 0;
  color: #EDEAF6;
}

.subtitle {
  font-size: 13px;
  color: #CFC9E6;
  margin: 0;
}

.btn-primary {
  background: linear-gradient(135deg, #6B7CFF 0%, #5B5DD9 100%);
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(107, 124, 255, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Toolbar */
.toolbar {
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  background: #1C1C30;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Search Box */
.search-box {
  position: relative;
  flex: 1;
  max-width: 700px;
  min-width: 180px;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #CFC9E6;
  opacity: 0.6;
  pointer-events: none;
}

.search-input {
  width: 100%;
  background: #322D59;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 10px 14px 10px 42px;
  color: #EDEAF6;
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;
}

.search-input::placeholder {
  color: #9A94B8;
}

.search-input:focus {
  border-color: #6B7CFF;
  background: rgba(107, 124, 255, 0.05);
  box-shadow: 0 0 0 3px rgba(107, 124, 255, 0.1);
}

/* Filter Select */
.filter-select {
  background: #322D59;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 10px 14px;
  color: #EDEAF6;
  font-size: 13px;
  outline: none;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 140px;
}

.filter-select.small {
  min-width: 70px;
  padding: 8px 12px;
}

.filter-select:hover {
  border-color: rgba(107, 124, 255, 0.3);
}

.filter-select:focus {
  border-color: #6B7CFF;
  box-shadow: 0 0 0 3px rgba(107, 124, 255, 0.1);
}

.per-page-control {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #CFC9E6;
}

.per-page-control label {
  font-weight: 500;
}

/* Category Pills */
.category-pills {
  padding: 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  background: #1C1C30;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  overflow-x: auto;
}

.pill {
  background: #322D59;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  padding: 8px 16px;
  color: #EDEAF6;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.pill:hover {
  background: rgba(107, 124, 255, 0.15);
  border-color: rgba(107, 124, 255, 0.3);
  transform: translateY(-1px);
}

.pill.active {
  background: linear-gradient(135deg, #6B7CFF 0%, #5B5DD9 100%);
  border-color: #6B7CFF;
  color: #FFFFFF;
  box-shadow: 0 4px 12px rgba(107, 124, 255, 0.3);
}

/* Products Section */
.products-section {
  padding: 12px;
  min-height: 400px;
}

/* State Container */
.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  text-align: center;
  color: #CFC9E6;
}

.state-container.empty svg {
  color: #6B7CFF;
  opacity: 0.3;
  margin-bottom: 24px;
}

.state-container h3 {
  margin: 0 0 12px 0;
  font-size: 24px;
  font-weight: 700;
  color: #EDEAF6;
}

.state-container p {
  margin: 0 0 32px 0;
  font-size: 15px;
  color: #CFC9E6;
  opacity: 0.8;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(107, 124, 255, 0.2);
  border-top-color: #6B7CFF;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Products List - Horizontal Cards */
.products-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.product-card {
  background: #322D59;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.product-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.product-card:hover {
  border-color: rgba(107, 124, 255, 0.4);
  transform: translateX(4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.product-card:hover::before {
  opacity: 1;
}

.product-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, rgba(107, 124, 255, 0.2) 0%, rgba(91, 93, 217, 0.2) 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6B7CFF;
  flex-shrink: 0;
}

.product-icon img {
  width: 28px;
  height: 28px;
  filter: brightness(0) saturate(100%) invert(53%) sepia(89%) saturate(2593%) hue-rotate(222deg) brightness(103%) contrast(101%);
}

.product-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.product-info {
  flex: 1;
  min-width: 0;
}

.product-name {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 700;
  color: #EDEAF6;
  line-height: 1.3;
}

.product-description {
  margin: 0;
  font-size: 13px;
  color: #CFC9E6;
  opacity: 0.8;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: flex-start;
}

.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  white-space: nowrap;
}

.badge-category {
  background: rgba(107, 124, 255, 0.15);
  color: #6B7CFF;
  border: 1px solid rgba(107, 124, 255, 0.3);
}

.badge-storage {
  background: rgba(76, 175, 80, 0.15);
  color: #4CAF50;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.product-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: #9A94B8;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-item strong {
  color: #EDEAF6;
  font-weight: 600;
}

.meta-divider {
  opacity: 0.3;
}

.product-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
}

.btn-icon {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  width: 36px;
  height: 36px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #EDEAF6;
  padding: 0;
}

.btn-icon img {
  width: 16px;
  height: 16px;
  filter: brightness(0) saturate(100%) invert(92%) sepia(3%) saturate(1259%) hue-rotate(205deg) brightness(103%) contrast(94%);
  transition: filter 0.2s ease;
}

.btn-icon:hover {
  background: rgba(107, 124, 255, 0.15);
  border-color: rgba(107, 124, 255, 0.4);
  transform: scale(1.05);
}

.btn-icon:hover img {
  filter: brightness(0) saturate(100%) invert(53%) sepia(89%) saturate(2593%) hue-rotate(222deg) brightness(103%) contrast(101%);
}

.btn-icon.btn-danger:hover {
  background: rgba(244, 67, 54, 0.15);
  border-color: rgba(244, 67, 54, 0.4);
}

.btn-icon.btn-danger:hover img {
  filter: brightness(0) saturate(100%) invert(41%) sepia(79%) saturate(6201%) hue-rotate(349deg) brightness(95%) contrast(93%);
}

.btn-secondary {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 10px 20px;
  color: #EDEAF6;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.3);
}

.btn-danger {
  background: linear-gradient(135deg, #F44336 0%, #D32F2F 100%);
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  color: #FFFFFF;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-danger:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
}

.btn-danger:disabled,
.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

/* Modal Content */
.product-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: #EDEAF6;
}

.form-label .required {
  color: #F44336;
  margin-left: 2px;
}

.form-input {
  background: #1C1C30;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px 16px;
  color: #EDEAF6;
  font-size: 15px;
  outline: none;
  transition: all 0.2s ease;
}

.form-input:focus {
  border-color: #6B7CFF;
  box-shadow: 0 0 0 3px rgba(107, 124, 255, 0.1);
}

.form-input.textarea {
  resize: vertical;
  min-height: 100px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
}

.form-hint {
  font-size: 13px;
  color: #9A94B8;
}

.form-error {
  font-size: 13px;
  color: #F44336;
  font-weight: 500;
}

.modal-text {
  font-size: 15px;
  color: #EDEAF6;
  margin: 0 0 12px 0;
  line-height: 1.6;
}

.modal-warning {
  font-size: 14px;
  color: #FFB74D;
  margin: 0;
  padding: 12px;
  background: rgba(255, 152, 0, 0.1);
  border-left: 3px solid #FFB74D;
  border-radius: 4px;
}

/* Responsive */
@media (max-width: 1200px) {
  .page-header,
  .toolbar,
  .table-section {
    padding-left: 24px;
    padding-right: 24px;
  }
}

@media (max-width: 768px) {
  .page-header,
  .toolbar,
  .table-section {
    padding-left: 16px;
    padding-right: 16px;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .header-left {
    gap: 12px;
  }

  .title {
    font-size: 24px;
  }

  .subtitle {
    font-size: 13px;
  }

  .btn-primary {
    width: 100%;
    justify-content: center;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-left,
  .toolbar-right {
    flex-direction: column;
    width: 100%;
  }

  .search-box {
    max-width: none;
  }

  .filter-select {
    width: 100%;
  }

  .per-page-control {
    justify-content: space-between;
  }
}
</style>
