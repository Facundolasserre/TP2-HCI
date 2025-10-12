<template>
  <div class="page-wrapper">
    <div class="page">
      <!-- TOP BAR - Home | Search | Share -->
      <header class="topbar">
        <button class="icon-btn home-btn" @click="goHome" :aria-label="t('listView.home_aria')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </button>

        <input
          v-model="q"
          type="text"
          class="search"
          :placeholder="t('listView.search_placeholder')"
        />

        <button class="icon-btn share-btn" @click="shareList" :aria-label="t('common.share')" :title="t('listView.share_title')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="18" cy="5" r="3"/>
            <circle cx="6" cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
        </button>
      </header>

      <!-- TITLE & EDIT -->
      <section class="title-section">
        <h1 class="main-title">{{ currentList?.name || t('listView.title_fallback') }}</h1>
        <button class="icon-btn edit-btn" @click="editList" :aria-label="t('listView.edit_aria')" :title="t('listView.edit_title')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
      </section>

    <!-- TOOLBAR - Filter, Sort | Add -->
    <section class="toolbar">
      <div class="toolbar-left">
        <button class="tool-btn" @click="onFilter" :aria-label="t('listView.toolbar.filter')">
          <img src="../../assets/fonts/filter.png" :alt="t('listView.toolbar.filter')" class="tool-icon" />
        </button>
        <button 
          class="tool-btn" 
          :class="{ 'active': sortAlphabetically }"
          @click="onSort" 
          :aria-label="t('listView.toolbar.sort')"
        >
          <img src="../../assets/fonts/sort.png" :alt="t('listView.toolbar.sort')" class="tool-icon" />
        </button>
      </div>

      <button class="add-btn" @click="goToAddItem">
        <span>{{ t('listView.toolbar.add') }}</span>
        <span class="plus-icon">+</span>
      </button>
    </section>

    <!-- ITEMS LIST -->
    <main class="items-container">
      <div v-if="!currentList" class="empty-state">
        <p>{{ t('listView.empty.not_found') }}</p>
      </div>
      <div v-else-if="filteredProducts.length === 0" class="empty-state">
        <p>{{ t('listView.empty.no_items') }}</p>
      </div>
      <div v-else class="items-list">
        <article
          v-for="product in filteredProducts"
          :key="product.id"
          class="item-row"
        >
          <!-- Left: checkbox + info -->
          <div class="item-left">
            <label class="checkbox-wrapper">
              <input 
                type="checkbox" 
                :checked="product.checked" 
                @change="toggleCheck(product.id)"
                class="checkbox-input"
              />
              <span class="checkbox-custom"></span>
            </label>

            <div class="item-info">
              <div class="item-name">{{ product.name }}</div>
              <div class="item-meta">{{ product.amount }} {{ product.unit }}</div>
            </div>
          </div>

          <!-- Right: quantity + action buttons -->
          <div class="item-right">
            <div class="item-quantity">{{ product.amount }} {{ product.unit }}</div>
            <button 
              class="action-btn edit-btn" 
              @click="editItem(product.id)"
              :aria-label="t('listView.actions.edit')"
            >
              <img src="@/assets/edit.svg" alt="Edit" class="action-icon" />
            </button>
            <button 
              class="action-btn delete-btn" 
              @click="confirmDeleteItem(product.id, product.name)"
              :aria-label="t('listView.actions.delete')"
            >
              <img src="@/assets/delete.svg" alt="Delete" class="action-icon" />
            </button>
          </div>
        </article>
      </div>
    </main>

    <!-- Share Modal -->
    <ShareMembersModal
      v-if="showShareModal && currentList"
      :list-id="listId!"
      :list-name="currentList.name"
      :owner="currentList.owner"
      @close="closeShareModal"
    />

    <!-- Add Item Modal -->
    <Modal :open="showAddItemModal" @close="closeAddItemModal" size="md">
      <template #header>
        <h2 style="margin: 0; font-size: 24px; font-weight: 600; color: white;">
          Add Product to List
        </h2>
      </template>

      <template #default>
        <div class="add-item-modal-content">
          <!-- Search existing products -->
          <div v-if="!showCreateProductInline" class="form-group">
            <label for="search-product">Search Product</label>
            <input
              id="search-product"
              v-model="searchProductQuery"
              type="text"
              placeholder="Type to search products..."
              class="form-input"
            />
            
            <div class="products-list">
              <div
                v-for="product in filteredModalProducts"
                :key="product.id"
                class="product-option"
                :class="{ 
                  selected: selectedProductId === product.id,
                  'already-in-list': isProductInList(product.id)
                }"
                @click="!isProductInList(product.id) && (selectedProductId = product.id)"
              >
                <div class="product-info-left">
                  <span class="product-name">{{ product.name }}</span>
                  <span class="product-category">{{ product.category?.name || 'No category' }}</span>
                </div>
                <span v-if="isProductInList(product.id)" class="already-badge">Already in list</span>
              </div>
              
              <div
                v-if="filteredModalProducts.length === 0"
                class="no-products"
              >
                No products found. Create a new one below.
              </div>
            </div>

            <button
              type="button"
              class="create-product-btn"
              @click="showCreateProductInline = true"
            >
              ➕ Create New Product
            </button>
          </div>

          <!-- Create new product inline -->
          <div v-else class="form-group">
            <label for="new-product-name">New Product Name <span style="color: #FF6B9D;">*</span></label>
            <input
              id="new-product-name"
              v-model="newProductName"
              type="text"
              placeholder="Enter product name"
              class="form-input"
              maxlength="50"
              required
            />

            <label for="new-product-category">Category <span style="color: #FF6B9D;">*</span></label>
            <select
              id="new-product-category"
              v-model="newProductCategoryId"
              class="form-input"
              required
              @change="onCategoryChange"
            >
              <option :value="null">Select a category</option>
              <option
                v-for="category in categoriesStore.items"
                :key="category.id"
                :value="category.id"
              >
                {{ category.name }}
              </option>
              <option value="NEW_CATEGORY" style="font-style: italic; font-weight: 600;">
                ➕ New Category
              </option>
            </select>

            <div class="inline-actions">
              <button
                type="button"
                class="btn-secondary"
                @click="showCreateProductInline = false; newProductName = ''; newProductCategoryId = null; newCategoryName = ''"
              >
                Cancel
              </button>
              <button
                type="button"
                class="btn-primary"
                @click="createProductInline"
              >
                Create Product
              </button>
            </div>
          </div>

          <!-- Quantity and Unit -->
          <div v-if="selectedProductId && !showCreateProductInline" class="quantity-section">
            <div class="form-group quantity-group">
              <label for="quantity">Quantity *</label>
              <input
                id="quantity"
                v-model.number="quantity"
                type="number"
                min="1"
                step="1"
                class="form-input"
                placeholder="Enter quantity"
              />
            </div>

            <div class="form-group unit-group">
              <label for="unit">Unit *</label>
              <select
                id="unit"
                v-model="unit"
                class="form-input"
              >
                <option value="units">Units</option>
                <option value="kg">Kg</option>
                <option value="g">g</option>
                <option value="L">L</option>
                <option value="mL">mL</option>
                <option value="lbs">lbs</option>
                <option value="oz">oz</option>
              </select>
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="closeAddItemModal">
            Cancel
          </button>
          <button
            type="button"
            class="btn-save"
            :disabled="!selectedProductId || showCreateProductInline || quantity <= 0"
            @click="addItemToList"
          >
            Add to List
          </button>
        </div>
      </template>
    </Modal>

    <!-- Edit Item Modal -->
    <Modal :open="showEditItemModal" @close="closeEditItemModal" size="md">
      <template #header>
        <h2 style="margin: 0; font-size: 24px; font-weight: 600; color: white;">
          Edit product
        </h2>
      </template>

      <template #default>
        <div class="add-item-modal-content">
          <!-- Product Name (Read-only) -->
          <div class="form-group">
            <label for="edit-product-name">
              Name <span class="required-indicator">*</span>
            </label>
            <input
              id="edit-product-name"
              :value="editingProductName"
              type="text"
              class="form-input"
              disabled
              style="opacity: 0.6; cursor: not-allowed;"
            />
          </div>

          <!-- Category (Read-only) -->
          <div class="form-group">
            <label for="edit-product-category">
              Category <span class="required-indicator">*</span>
            </label>
            <input
              id="edit-product-category"
              :value="editingProductCategory"
              type="text"
              class="form-input"
              disabled
              style="opacity: 0.6; cursor: not-allowed;"
            />
          </div>

          <!-- Description (Empty, disabled) -->
          <div class="form-group">
            <label for="edit-product-description">Description</label>
            <textarea
              id="edit-product-description"
              class="form-input"
              rows="4"
              disabled
              style="opacity: 0.6; cursor: not-allowed; resize: none;"
            ></textarea>
          </div>

          <!-- Quantity and Unit -->
          <div class="quantity-section">
            <div class="form-group quantity-group">
              <label for="edit-quantity">Quantity *</label>
              <input
                id="edit-quantity"
                v-model.number="editingQuantity"
                type="number"
                min="1"
                step="1"
                class="form-input"
                placeholder="Enter quantity"
              />
            </div>

            <div class="form-group unit-group">
              <label for="edit-unit">Unit *</label>
              <select
                id="edit-unit"
                v-model="editingUnit"
                class="form-input"
              >
                <option value="units">Units</option>
                <option value="kg">Kg</option>
                <option value="g">g</option>
                <option value="L">L</option>
                <option value="mL">mL</option>
                <option value="lbs">lbs</option>
                <option value="oz">oz</option>
              </select>
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="closeEditItemModal">
            Cancel
          </button>
          <button
            type="button"
            class="btn-save"
            :disabled="editingQuantity <= 0 || !editingUnit.trim()"
            @click="saveEditItem"
          >
            Update
          </button>
        </div>
      </template>
    </Modal>

    <!-- Create Category Modal -->
    <Modal :open="showCreateCategoryModal" @close="closeCreateCategoryModal" size="sm">
      <template #header>
        <h2 style="margin: 0; font-size: 24px; font-weight: 600; color: white;">
          Create new category
        </h2>
      </template>

      <template #default>
        <div class="category-modal-content">
          <div class="form-group">
            <label for="category-name">Category name <span style="color: #FF6B9D;">*</span></label>
            <input
              id="category-name"
              v-model="newCategoryName"
              type="text"
              placeholder="Enter category name"
              class="form-input"
              maxlength="50"
              @keyup.enter="createCategory"
            />
            <p style="color: #9B95B8; font-size: 13px; margin-top: 8px;">Maximum 50 characters</p>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="closeCreateCategoryModal">
            Cancel
          </button>
          <button
            type="button"
            class="btn-save"
            :disabled="!newCategoryName.trim()"
            @click="createCategory"
          >
            Create
          </button>
        </div>
      </template>
    </Modal>
  </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useShoppingListsStore } from '@/stores/shoppingLists'
import { useListItemsStore } from '@/stores/listItems'
import { useProductsStore } from '@/stores/products'
import { useCategoriesStore } from '@/stores/categories'
import { useToast } from '@/composables/useToast'
import { useI18n } from '@/composables/useI18n'
import ShareMembersModal from '@/components/ShareMembersModal.vue'
import Modal from '@/components/Modal.vue'

const route = useRoute()
const router = useRouter()
const listsStore = useShoppingListsStore()
const itemsStore = useListItemsStore()
const productsStore = useProductsStore()
const categoriesStore = useCategoriesStore()
const toast = useToast()
const { t } = useI18n()

const q = ref('')
const showShareModal = ref(false)
const showAddItemModal = ref(false)
const showCreateCategoryModal = ref(false)
const showEditItemModal = ref(false)
const editingItemId = ref<number | null>(null)
const editingProductName = ref('')
const editingProductCategory = ref('')
const editingQuantity = ref(1)
const editingUnit = ref('units')
const searchProductQuery = ref('')
const selectedProductId = ref<number | null>(null)
const quantity = ref(1)
const unit = ref('units')
const showCreateProductInline = ref(false)
const newProductName = ref('')
const newProductCategoryId = ref<number | string | null>(null)
const newCategoryName = ref('')
const sortAlphabetically = ref(false)

// Get list ID from route
const listId = computed(() => {
  const id = route.params.id
  return id ? parseInt(id as string, 10) : null
})

const currentList = computed(() => listsStore.currentList)

const filteredProducts = computed(() => {
  let items = itemsStore.items
  
  // Filter out items with null products
  items = items.filter(item => item.product != null)
  
  if (q.value) {
    const search = q.value.toLowerCase()
    items = items.filter(item => 
      item.product.name.toLowerCase().includes(search)
    )
  }
  
  const mappedItems = items.map(item => ({
    id: item.id,
    name: item.product.name,
    amount: item.quantity,
    unit: item.unit,
    checked: item.purchased,
    addedBy: '', // We don't track this in the API schema
    createdAt: item.createdAt // Keep track of when it was added
  }))
  
  // Sort based on sortAlphabetically state
  if (sortAlphabetically.value) {
    // Sort alphabetically (case-insensitive)
    return mappedItems.sort((a, b) => 
      a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    )
  } else {
    // Sort by creation date (oldest first - order of addition)
    return mappedItems.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
  }
})

const loadData = async () => {
  if (!listId.value) return
  
  try {
    await listsStore.fetchListById(listId.value)
    await itemsStore.fetchItems(listId.value)
  } catch (error: any) {
    // Silently handle errors - stores already provide mock data on network errors
    console.log('List data loaded:', currentList.value?.name || 'Mock data')
    
    // Only redirect on 404 (not found), not on network errors
    if (error.status === 404) {
      toast.error(t('listView.toast.not_found'))
      router.push('/Home')
    }
  }
}

onMounted(async () => {
  await loadData()
  // Load products and categories for the add item modal
  await productsStore.fetchProducts()
  await categoriesStore.fetchCategories()
})

// Filter products for search in modal
const filteredModalProducts = computed(() => {
  let products = productsStore.items
  
  if (searchProductQuery.value) {
    const search = searchProductQuery.value.toLowerCase()
    products = products.filter(p => 
      p.name.toLowerCase().includes(search)
    )
  }
  
  return products
})

// Check if a product is already in the list
const isProductInList = (productId: number): boolean => {
  return itemsStore.items.some(item => item.product != null && item.product.id === productId)
}

// Open/close add item modal
const openAddItemModal = () => {
  showAddItemModal.value = true
  selectedProductId.value = null
  quantity.value = 1
  unit.value = 'units'
  searchProductQuery.value = ''
  showCreateProductInline.value = false
  newProductName.value = ''
  newProductCategoryId.value = null
}

const closeAddItemModal = () => {
  showAddItemModal.value = false
  selectedProductId.value = null
  quantity.value = 1
  unit.value = 'units'
  searchProductQuery.value = ''
  showCreateProductInline.value = false
  newProductName.value = ''
  newProductCategoryId.value = null
}

// Create new product inline
const createProductInline = async () => {
  if (!newProductName.value.trim()) {
    toast.error('Please enter a product name')
    return
  }

  // Check if user selected "New Category"
  if (newProductCategoryId.value === 'NEW_CATEGORY') {
    // Open the category creation modal
    showCreateCategoryModal.value = true
    return
  }

  if (!newProductCategoryId.value || newProductCategoryId.value === 'NEW_CATEGORY') {
    toast.error('Please select a category')
    return
  }

  try {
    const newProduct = await productsStore.createProduct({
      name: newProductName.value.trim(),
      category: { id: newProductCategoryId.value as number },
      metadata: {}
    })
    
    await productsStore.fetchProducts()
    selectedProductId.value = newProduct.id
    showCreateProductInline.value = false
    newProductName.value = ''
    newProductCategoryId.value = null
    newCategoryName.value = ''
    toast.success('Product created successfully')
  } catch (error) {
    toast.error('Failed to create product')
    console.error('Error creating product:', error)
  }
}

// Add item to list
const addItemToList = async () => {
  if (!listId.value) {
    toast.error('List not found')
    return
  }

  if (!selectedProductId.value) {
    toast.error('Please select a product')
    return
  }

  if (quantity.value < 1) {
    toast.error('Quantity must be at least 1')
    return
  }

  if (!unit.value.trim()) {
    toast.error('Unit is required')
    return
  }

  try {
    const newItem = await itemsStore.addItem(listId.value, {
      product: { id: selectedProductId.value },
      quantity: quantity.value,
      unit: unit.value.trim(),
      metadata: {}
    })
    
    // Force refresh to ensure we have the latest data with full product details
    await itemsStore.fetchItems(listId.value)
    
    toast.success(t('listView.toast.item_added'))
    closeAddItemModal()
  } catch (error: any) {
    console.error('Error adding item:', error)
    
    // Handle specific error cases
    if (error.response?.status === 409) {
      toast.error('This product is already in the list. You can update its quantity from the list.')
    } else if (error.response?.status === 404) {
      toast.error('Product or list not found')
    } else if (error.message) {
      toast.error(error.message)
    } else {
      toast.error('Failed to add item to list')
    }
  }
}

const goToAddItem = () => {
  openAddItemModal()
}

const goHome = () => {
  router.push('/Home')
}

const onFilter = () => {
  toast.info(t('listView.toast.filter_soon'))
}

const onSort = () => {
  sortAlphabetically.value = !sortAlphabetically.value
  if (sortAlphabetically.value) {
    toast.success(t('listView.toast.sort_alphabetically'))
  } else {
    toast.success(t('listView.toast.sort_by_date'))
  }
}

const editList = () => {
  if (listId.value) {
    router.push(`/lists/${listId.value}/edit`)
  }
}

const shareList = () => {
  showShareModal.value = true
}

const closeShareModal = () => {
  showShareModal.value = false
  loadData() // Refresh to get updated shared users
}

const closeCreateCategoryModal = () => {
  showCreateCategoryModal.value = false
  newCategoryName.value = ''
}

const onCategoryChange = () => {
  if (newProductCategoryId.value === 'NEW_CATEGORY') {
    showCreateCategoryModal.value = true
  }
}

const createCategory = async () => {
  if (!newCategoryName.value.trim()) {
    toast.error('Please enter a category name')
    return
  }

  try {
    // Create the new category
    const newCategory = await categoriesStore.createCategory({
      name: newCategoryName.value.trim()
    })
    
    await categoriesStore.fetchCategories()
    newProductCategoryId.value = newCategory.id
    toast.success(`Category "${newCategoryName.value}" created successfully`)
    
    // Close modal and clear
    closeCreateCategoryModal()
    
    // Category is now selected, user can continue creating the product
  } catch (error: any) {
    if (error.response?.status === 409 || error.status === 409) {
      toast.error('A category with this name already exists')
    } else {
      toast.error('Failed to create category')
    }
    console.error('Error creating category:', error)
  }
}

const toggleCheck = async (productId: number) => {
  if (!listId.value) return
  
  const item = itemsStore.items.find(i => i.id === productId)
  if (!item) return
  
  try {
    await itemsStore.togglePurchased(listId.value, productId, !item.purchased)
  } catch (error: any) {
    toast.error(error.message || t('listView.toast.update_error'))
  }
}

const editItem = async (itemId: number) => {
  if (!listId.value) return
  
  const item = itemsStore.items.find(i => i.id === itemId)
  if (!item || !item.product) return
  
  // Set editing state
  editingItemId.value = itemId
  editingProductName.value = item.product.name
  editingProductCategory.value = item.product.category?.name || 'No category'
  editingQuantity.value = item.quantity
  editingUnit.value = item.unit
  showEditItemModal.value = true
}

const closeEditItemModal = () => {
  showEditItemModal.value = false
  editingItemId.value = null
  editingProductName.value = ''
  editingProductCategory.value = ''
  editingQuantity.value = 1
  editingUnit.value = 'units'
}

const saveEditItem = async () => {
  if (!listId.value || !editingItemId.value) return
  
  // Validate
  if (editingQuantity.value <= 0) {
    toast.error(t('listView.toast.quantity_error'))
    return
  }
  
  if (!editingUnit.value.trim()) {
    toast.error(t('listView.toast.unit_error'))
    return
  }
  
  try {
    await itemsStore.updateItem(listId.value, editingItemId.value, {
      quantity: editingQuantity.value,
      unit: editingUnit.value
    })
    
    toast.success(t('listView.toast.quantity_updated'))
    closeEditItemModal()
  } catch (error: any) {
    toast.error(error.message || t('listView.toast.update_error'))
  }
}

const confirmDeleteItem = async (itemId: number, productName: string) => {
  const confirmed = window.confirm(
    t('listView.confirm.delete_item', { name: productName })
  )
  
  if (!confirmed) return
  
  if (!listId.value) return
  
  try {
    await itemsStore.removeItem(listId.value, itemId)
    toast.success(t('listView.toast.item_deleted'))
  } catch (error: any) {
    toast.error(error.message || t('listView.toast.delete_error'))
  }
}

const onProductAdded = () => {
  // Reload items after adding a product
  if (listId.value) {
    itemsStore.fetchItems(listId.value)
  }
}
</script>
<style scoped>
/* ===== WRAPPER - Override #app styles ===== */
.page-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  background: #23273A;
  overflow: auto;
}

/* ===== PAGE LAYOUT - Desktop First ===== */
.page {
  min-height: 100vh;
  width: 100%;
  margin: 0;
  padding: 40px 80px 60px;
  box-sizing: border-box;
  background: #23273A;
  color: #EDEAF6;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* ===== TOP BAR: Home | Search | Share ===== */
.topbar {
  display: grid;
  grid-template-columns: 80px 1fr 80px;
  align-items: center;
  gap: 60px;
  padding: 12px 0;
  margin-bottom: 8px;
}

.search {
  width: 100%;
  height: 52px;
  border-radius: 999px;
  border: none;
  background: #0E0F1A;
  color: #fff;
  padding: 0 24px;
  outline: none;
  font-size: 18px;
  font-family: 'Roboto', sans-serif;
  font-weight: 700;
  text-align: left;
}

.search::placeholder {
  color: rgba(255, 255, 255, 0.6);
  font-family: 'Roboto', sans-serif;
  font-weight: 700;
}

.icon-btn {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: none;
  background: #3C3A63;
  color: #EDEAF6;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.icon-btn:hover {
  background: #4a4770;
  transform: scale(1.08);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.icon-btn svg {
  width: 32px;
  height: 32px;
}

/* ===== TITLE SECTION ===== */
.title-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 12px;
}

.title-section .main-title {
  margin: 0;
  font-size: 56px;
  font-weight: 900;
  color: #EDEAF6;
  letter-spacing: -1px;
}

.title-section .edit-btn {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
}

.title-section .edit-btn svg {
  width: 20px;
  height: 20px;
}

/* ===== TOOLBAR: Filter/Sort | Add ===== */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #4B497C;
  border-radius: 24px;
  padding: 20px 32px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
}

.toolbar-left {
  display: flex;
  gap: 20px;
}

.tool-btn {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  border: none;
  background: #5B5990;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.tool-btn.active {
  background: #6B7CFF;
  box-shadow: 0 4px 12px rgba(107, 124, 255, 0.4);
}

.tool-btn:hover {
  background: #6a678f;
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.tool-btn.active:hover {
  background: #7d8dff;
}

.tool-icon {
  width: 32px;
  height: 32px;
  filter: brightness(0) invert(1);
  opacity: 0.9;
}

.add-btn {
  height: 60px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 36px;
  border-radius: 16px;
  background: #6B7CFF;
  color: #fff;
  font-weight: 800;
  font-size: 20px;
  transition: all 0.2s ease;
  box-shadow: 0 3px 14px rgba(107, 124, 255, 0.35);
}

.add-btn:hover {
  background: #7F89FF;
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(107, 124, 255, 0.45);
}

.plus-icon {
  font-size: 26px;
  font-weight: 900;
  line-height: 1;
}

/* ===== ITEMS CONTAINER ===== */
.items-container {
  background: #4B497C;
  border-radius: 28px;
  padding: 0;
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.3);
  min-height: 600px;
}

.empty-state {
  text-align: center;
  padding: 140px 20px;
  color: #B9B5D1;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state p {
  margin: 0;
  font-size: 22px;
  opacity: 0.8;
}

/* ===== ITEMS LIST ===== */
.items-list {
  overflow-y: auto;
  flex: 1;
  padding: 12px 0;
}

.item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32px 40px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  transition: background 0.2s ease;
  min-height: 100px;
}

.item-row:hover {
  background: rgba(255, 255, 255, 0.05);
}

.item-row:last-child {
  border-bottom: none;
}

/* Left side: checkbox + info */
.item-left {
  display: flex;
  align-items: center;
  gap: 28px;
  flex: 1;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-name {
  font-size: 24px;
  font-weight: 700;
  color: #EDEAF6;
  line-height: 1.3;
}

.item-meta {
  font-size: 15px;
  color: #6B7CFF;
  opacity: 0.9;
  font-weight: 600;
  background: rgba(107, 124, 255, 0.08);
  padding: 4px 10px;
  border-radius: 6px;
  display: inline-block;
}

/* Right side: quantity + action buttons */
.item-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.item-quantity {
  font-size: 20px;
  font-weight: 800;
  color: #6B7CFF;
  min-width: 90px;
  text-align: right;
  padding: 8px 14px;
  background: rgba(107, 124, 255, 0.12);
  border-radius: 10px;
  border: 1px solid rgba(107, 124, 255, 0.25);
}

/* Action buttons (edit & delete) */
.action-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.05);
}

.action-btn:active {
  transform: scale(0.95);
}

.action-btn.edit-btn:hover {
  background: rgba(107, 124, 255, 0.15);
}

.action-btn.delete-btn {
  background: rgba(244, 67, 54, 0.1);
}

.action-btn.delete-btn:hover {
  background: rgba(244, 67, 54, 0.2);
  border: 1px solid rgba(244, 67, 54, 0.3);
}

.action-icon {
  width: 20px;
  height: 20px;
  opacity: 0.8;
}

.action-btn:hover .action-icon {
  opacity: 1;
}

/* ===== CUSTOM CHECKBOX - Larger ===== */
.checkbox-wrapper {
  position: relative;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.checkbox-input {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  z-index: 1;
}

.checkbox-custom {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 3px solid rgba(255, 255, 255, 0.35);
  background: transparent;
  transition: all 0.2s ease;
  position: relative;
}

.checkbox-input:checked + .checkbox-custom {
  background: #6B7CFF;
  border-color: #6B7CFF;
}

.checkbox-input:checked + .checkbox-custom::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) rotate(45deg);
  width: 8px;
  height: 15px;
  border: solid white;
  border-width: 0 3.5px 3.5px 0;
}

.checkbox-wrapper:hover .checkbox-custom {
  border-color: rgba(255, 255, 255, 0.55);
  transform: scale(1.1);
}

.checkbox-input:checked + .checkbox-custom:hover {
  background: #7F89FF;
}

/* ===== RESPONSIVE - Keep desktop feel ===== */
@media (max-width: 1200px) {
  .page {
    padding: 28px 48px 40px;
  }
  
  .main-title {
    font-size: 42px;
  }
}

@media (max-width: 900px) {
  .page {
    padding: 24px 32px 36px;
  }
  
  .topbar {
    grid-template-columns: 52px 1fr 52px;
    gap: 24px;
  }
  
  .icon-btn {
    width: 52px;
    height: 52px;
  }
  
  .main-title {
    font-size: 36px;
  }
  
  .item-row {
    padding: 20px 24px;
  }
}

@media (max-width: 600px) {
  .page {
    padding: 20px 20px 32px;
  }
  
  .topbar {
    grid-template-columns: 48px 1fr 48px;
    gap: 16px;
  }
  
  .icon-btn {
    width: 48px;
    height: 48px;
  }
  
  .main-title {
    font-size: 28px;
  }
  
  .toolbar {
    padding: 12px 16px;
  }
  
  .tool-btn {
    width: 44px;
    height: 44px;
  }
  
  .add-btn {
    height: 44px;
    padding: 0 20px;
    font-size: 16px;
  }
  
  .item-row {
    padding: 16px 20px;
    min-height: 68px;
  }
  
  .item-left {
    gap: 14px;
  }
  
  .item-right {
    gap: 16px;
  }
  
  .item-name {
    font-size: 18px;
  }
  
  .item-quantity {
    font-size: 16px;
  }
}

/* Add Item Modal Styles */
.add-item-modal-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 8px 20px;
  max-width: 100%;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-group label {
  font-size: 16px;
  font-weight: 600;
  color: #EDEAF6;
}

.form-input {
  width: 100%;
  max-width: 100%;
  padding: 14px 18px;
  background: #0E0F1A;
  border: 2px solid rgba(107, 124, 255, 0.3);
  border-radius: 12px;
  color: #EDEAF6;
  font-size: 16px;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #6B7CFF;
  box-shadow: 0 0 0 3px rgba(107, 124, 255, 0.15);
}

.form-input::placeholder {
  color: rgba(185, 181, 209, 0.5);
}

.products-list {
  max-height: 300px;
  overflow-y: auto;
  border: 2px solid rgba(107, 124, 255, 0.2);
  border-radius: 12px;
  background: #0E0F1A;
}

.product-option {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.product-option:last-child {
  border-bottom: none;
}

.product-option:hover {
  background: rgba(107, 124, 255, 0.1);
}

.product-option.selected {
  background: rgba(107, 124, 255, 0.2);
  border-left: 4px solid #6B7CFF;
}

.product-option.already-in-list {
  opacity: 0.6;
  cursor: not-allowed;
}

.product-option.already-in-list:hover {
  background: rgba(255, 152, 0, 0.1);
}

.product-info-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.product-name {
  font-size: 16px;
  font-weight: 600;
  color: #EDEAF6;
}

.product-category {
  font-size: 14px;
  color: #B9B5D1;
  opacity: 0.7;
}

.already-badge {
  font-size: 12px;
  padding: 4px 10px;
  background: rgba(255, 152, 0, 0.2);
  color: #FFB74D;
  border-radius: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.no-products {
  padding: 32px 18px;
  text-align: center;
  color: #B9B5D1;
  font-size: 15px;
}

.create-product-btn {
  margin-top: 12px;
  width: 100%;
  padding: 14px;
  background: rgba(107, 124, 255, 0.15);
  border: 2px dashed rgba(107, 124, 255, 0.4);
  border-radius: 12px;
  color: #6B7CFF;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.create-product-btn:hover {
  background: rgba(107, 124, 255, 0.25);
  border-color: #6B7CFF;
}

.inline-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.btn-secondary,
.btn-primary {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.08);
  color: #EDEAF6;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.12);
}

.btn-primary {
  background: linear-gradient(135deg, #6B7CFF 0%, #5B5DD9 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(107, 124, 255, 0.4);
}

.quantity-section {
  display: flex;
  gap: 20px;
  padding-top: 16px;
  margin-top: 16px;
  border-top: 2px solid rgba(107, 124, 255, 0.2);
  align-items: flex-start;
}

.quantity-group {
  flex: 0 0 20%;
  min-width: 0;
}

.unit-group {
  flex: 0 0 20%;
  min-width: 0;
}

.quantity-section .form-group {
  margin: 0;
}

.quantity-section .form-group label {
  display: flex;
  align-items: center;
  gap: 4px;
}

.quantity-section .form-group label::after {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  background: #E76F51;
  border-radius: 50%;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-cancel,
.btn-save {
  padding: 12px 32px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.08);
  color: #EDEAF6;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.12);
}

.btn-save {
  background: linear-gradient(135deg, #6B7CFF 0%, #5B5DD9 100%);
  color: white;
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(107, 124, 255, 0.4);
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Category Modal Styles */
.category-modal-content {
  padding: 0;
}

.category-modal-content .form-group {
  margin-bottom: 0;
}

.category-modal-content .form-input {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(107, 124, 255, 0.2);
  color: #EDEAF6;
  padding: 14px 16px;
  font-size: 15px;
}

.category-modal-content .form-input:focus {
  border-color: #6B7CFF;
  background: rgba(107, 124, 255, 0.08);
  outline: none;
}

/* New Category Input Animation */
.new-category-input {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
