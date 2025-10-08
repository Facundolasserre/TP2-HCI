<template>
  <div class="page">
    <!-- TOP BAR - Simple: Home | Title | Share -->
    <header class="topbar">
      <button class="icon-btn home-btn" @click="goHome" aria-label="Home">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </button>

      <h1 class="main-title">{{ currentList?.name || 'List' }}</h1>

      <button class="icon-btn share-btn" @click="shareList" aria-label="Share" title="Share this list">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="18" cy="5" r="3"/>
          <circle cx="6" cy="12" r="3"/>
          <circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
      </button>
    </header>

    <!-- TOOLBAR - Filter, Sort | Add -->
    <section class="toolbar">
      <div class="toolbar-left">
        <button class="tool-btn" @click="onFilter" aria-label="Filter">
          <img src="@/assets/fonts/filter.png" alt="filter" class="tool-icon" />
        </button>
        <button class="tool-btn" @click="onSort" aria-label="Sort">
          <img src="@/assets/fonts/sort.png" alt="sort" class="tool-icon" />
        </button>
      </div>

      <button class="add-btn" @click="goToAddItem">
        <span>Add</span>
        <span class="plus-icon">+</span>
      </button>
    </section>

    <!-- ITEMS LIST -->
    <main class="items-container">
      <div v-if="!currentList" class="empty-state">
        <p>List not found</p>
      </div>
      <div v-else-if="filteredProducts.length === 0" class="empty-state">
        <p>No products yet. Tap Add to get started!</p>
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
              <div class="item-meta">added by {{ product.addedBy || 'user' }}</div>
            </div>
          </div>

          <!-- Right: quantity + checkbox -->
          <div class="item-right">
            <div class="item-quantity">x{{ product.amount }}</div>
            <label class="checkbox-wrapper">
              <input 
                type="checkbox" 
                :checked="product.checked" 
                @change="toggleCheck(product.id)"
                class="checkbox-input"
              />
              <span class="checkbox-custom"></span>
            </label>
          </div>
        </article>
      </div>
    </main>

    <!-- Share Modal -->
    <ShareMembersModal
      v-if="showShareModal && currentList"
      :list-id="listId!"
      :list-name="currentList.name"
      @close="closeShareModal"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useShoppingListsStore } from '@/stores/shoppingLists'
import { useListItemsStore } from '@/stores/listItems'
import { useToast } from '@/composables/useToast'
import ShareMembersModal from '@/components/ShareMembersModal.vue'

const route = useRoute()
const router = useRouter()
const listsStore = useShoppingListsStore()
const itemsStore = useListItemsStore()
const toast = useToast()

const q = ref('')
const showShareModal = ref(false)

// Get list ID from route
const listId = computed(() => {
  const id = route.params.id
  return id ? parseInt(id as string, 10) : null
})

const currentList = computed(() => listsStore.currentList)

const filteredProducts = computed(() => {
  let items = itemsStore.items
  
  if (q.value) {
    const search = q.value.toLowerCase()
    items = items.filter(item => 
      item.product.name.toLowerCase().includes(search)
    )
  }
  
  return items.map(item => ({
    id: item.id,
    name: item.product.name,
    amount: item.quantity,
    unit: item.unit,
    checked: item.purchased,
    addedBy: '', // We don't track this in the API schema
  }))
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
      toast.error('List not found')
      router.push('/Home')
    }
  }
}

onMounted(() => {
  loadData()
})

const goHome = () => {
  router.push('/Home')
}

const onFilter = () => {
  toast.info('Filter feature coming soon!')
}

const onSort = () => {
  toast.info('Sort feature coming soon!')
}

const editList = () => {
  if (listId.value) {
    router.push(`/lists/${listId.value}/edit`)
  }
}

const goToAddItem = () => {
  toast.info('Add item feature coming soon! Use the detail view at /lists/' + listId.value)
}

const shareList = () => {
  showShareModal.value = true
}

const closeShareModal = () => {
  showShareModal.value = false
  loadData() // Refresh to get updated shared users
}

const toggleCheck = async (productId: number) => {
  if (!listId.value) return
  
  const item = itemsStore.items.find(i => i.id === productId)
  if (!item) return
  
  try {
    await itemsStore.togglePurchased(listId.value, productId, !item.purchased)
  } catch (error: any) {
    toast.error(error.message || 'Failed to update item')
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
/* ===== PAGE LAYOUT - Desktop First ===== */
.page {
  min-height: 100vh;
  width: 100%;
  margin: 0;
  padding: 32px 64px 48px;
  box-sizing: border-box;
  background: #23273A;
  color: #EDEAF6;
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

/* ===== TOP BAR: Home | Title | Share ===== */
.topbar {
  display: grid;
  grid-template-columns: 64px 1fr 64px;
  align-items: center;
  gap: 32px;
  padding: 8px 0;
}

.icon-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: #3C3A63;
  color: #EDEAF6;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.icon-btn:hover {
  background: #4a4770;
  transform: scale(1.08);
}

.icon-btn svg {
  width: 28px;
  height: 28px;
}

.main-title {
  margin: 0;
  text-align: center;
  font-size: 48px;
  font-weight: 800;
  color: #EDEAF6;
  letter-spacing: -0.5px;
}

/* ===== TOOLBAR: Filter/Sort | Add ===== */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #4B497C;
  border-radius: 20px;
  padding: 16px 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
}

.toolbar-left {
  display: flex;
  gap: 16px;
}

.tool-btn {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  border: none;
  background: #5B5990;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.tool-btn:hover {
  background: #6a678f;
  transform: translateY(-2px);
}

.tool-icon {
  width: 28px;
  height: 28px;
  filter: brightness(0) invert(1);
  opacity: 0.9;
}

.add-btn {
  height: 52px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 28px;
  border-radius: 14px;
  background: #6B7CFF;
  color: #fff;
  font-weight: 800;
  font-size: 18px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 12px rgba(107, 124, 255, 0.3);
}

.add-btn:hover {
  background: #7F89FF;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(107, 124, 255, 0.4);
}

.plus-icon {
  font-size: 22px;
  font-weight: 900;
  line-height: 1;
}

/* ===== ITEMS CONTAINER ===== */
.items-container {
  background: #4B497C;
  border-radius: 24px;
  padding: 0;
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  min-height: 500px;
}

.empty-state {
  text-align: center;
  padding: 120px 20px;
  color: #B9B5D1;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state p {
  margin: 0;
  font-size: 20px;
  opacity: 0.8;
}

/* ===== ITEMS LIST ===== */
.items-list {
  overflow-y: auto;
  flex: 1;
  padding: 8px 0;
}

.item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  transition: background 0.2s ease;
  min-height: 80px;
}

.item-row:hover {
  background: rgba(255, 255, 255, 0.04);
}

.item-row:last-child {
  border-bottom: none;
}

/* Left side: checkbox + info */
.item-left {
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.item-name {
  font-size: 20px;
  font-weight: 700;
  color: #EDEAF6;
  line-height: 1.3;
}

.item-meta {
  font-size: 14px;
  color: #B9B5D1;
  opacity: 0.85;
}

/* Right side: quantity + checkbox */
.item-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

.item-quantity {
  font-size: 18px;
  font-weight: 800;
  color: #EDEAF6;
  min-width: 50px;
  text-align: right;
}

/* ===== CUSTOM CHECKBOX - Larger ===== */
.checkbox-wrapper {
  position: relative;
  width: 28px;
  height: 28px;
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
  width: 28px;
  height: 28px;
  border-radius: 7px;
  border: 2.5px solid rgba(255, 255, 255, 0.35);
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
  width: 7px;
  height: 13px;
  border: solid white;
  border-width: 0 3px 3px 0;
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
</style>