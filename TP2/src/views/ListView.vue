<template>
  <div class="page">
    <!-- TOP BAR -->
    <header class="topbar">
      <button class="home" @click="goHome" aria-label="Home">🏠</button>

      <div class="search-wrap">
        <input v-model.trim="q" class="search" type="text" placeholder="Search product" />
        <button class="search-ico" aria-label="Search">🔎</button>
      </div>

      <div class="top-actions">
        <button class="share" @click="shareList" aria-label="Share">🔗</button>
      </div>
    </header>

    <!-- TITLE BAR -->
    <section class="titlebar">
      <div class="left-actions">
        <button class="round" title="Filter">🜜</button>
        <button class="round" title="Sort">☰</button>
      </div>

      <h1 class="title">{{ currentList?.title || 'List' }}</h1>

      <div class="right-actions">
        <button class="round" title="Rename / Edit">✎</button>
        <button class="add" @click="showAddProduct = true">
          <span>Add</span>
          <span class="plus">＋</span>
        </button>
      </div>
    </section>

    <!-- LIST -->
    <main class="sheet">
      <div v-if="!currentList" class="empty-state">
        <p>List not found</p>
      </div>
      <div v-else-if="filteredProducts.length === 0" class="empty-state">
        <p>{{ q ? 'No products found' : 'No products yet. Add one!' }}</p>
      </div>
      <article
        v-else
        v-for="product in filteredProducts"
        :key="product.id"
        class="row"
      >
        <div class="left">
          <button class="bullet" @click="openAddToListModal(product)">➕</button>
          <div class="info">
            <div class="name">{{ product.name }}</div>
            <div class="hint">{{ product.addedBy ? `added by ${product.addedBy}` : '' }}</div>
          </div>
        </div>

        <div class="right">
          <div class="qty">x{{ product.amount }}</div>
          <label class="box">
            <input 
              type="checkbox" 
              :checked="product.checked" 
              @change="toggleCheck(product.id)"
            />
            <span></span>
          </label>
        </div>
      </article>
    </main>

    <!-- Add Product Modal -->
    <AddProductModal
      v-model="showAddProduct"
      :default-list-id="listId || undefined"
      @product-added="onProductAdded"
    />

    <!-- Add To List Modal -->
    <AddToListModal
      v-model="showAddToList"
      :product="selectedProduct"
      :current-list-id="listId || undefined"
      @product-added="onProductAdded"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useListsStore } from '@/stores/lists'
import { useToast } from '@/composables/useToast'
import AddProductModal from '@/components/AddProductModal.vue'
import AddToListModal from '@/components/AddToListModal.vue'
import type { Product } from '@/types/lists'

const route = useRoute()
const router = useRouter()
const listsStore = useListsStore()
const toast = useToast()

const q = ref('')
const showAddProduct = ref(false)
const showAddToList = ref(false)
const selectedProduct = ref<Product | null>(null)

// Get list ID from route
const listId = computed(() => {
  const name = route.params.name as string
  if (!name) return null
  
  // Try to find by title
  const list = listsStore.getListByTitle(decodeURIComponent(name))
  return list?.id || null
})

const currentList = computed(() => {
  if (!listId.value) return null
  return listsStore.getListById(listId.value)
})

const filteredProducts = computed(() => {
  if (!currentList.value) return []
  if (!q.value) return currentList.value.products
  
  const search = q.value.toLowerCase()
  return currentList.value.products.filter(p => 
    p.name.toLowerCase().includes(search)
  )
})

onMounted(() => {
  if (!currentList.value) {
    toast.error('List not found')
    router.push('/Home')
  }
})

const goHome = () => {
  router.push('/Home')
}

const shareList = () => {
  toast.info('Share functionality coming soon!')
}

const toggleCheck = (productId: string) => {
  if (!listId.value) return
  listsStore.toggleProductCheck(listId.value, productId)
}

const openAddToListModal = (product: Product) => {
  selectedProduct.value = product
  showAddToList.value = true
}

const onProductAdded = () => {
  // Product added successfully - list will auto-update via store
}
</script>
<style scoped>
html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
}

/* ===== Página a pantalla completa ===== */
.page {
  min-height: 100dvh;
  width: 100vw;
  margin: 0;
  padding: 24px clamp(16px, 4vw, 48px);
  box-sizing: border-box;
  background: #1C1C30;
  color: #EDEAF6;
  display: grid;
  grid-template-rows: auto auto 1fr;
  gap: 16px;
}

/* ===== Topbar (home / search / share) ===== */
.topbar {
  display: grid;
  grid-template-columns: 48px 1fr 48px;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.home,
.share {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: none;
  background: #1A1930;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s ease;
}

.home:hover,
.share:hover {
  background: #252442;
}

/* ===== Search ===== */
.search-wrap {
  position: relative;
  width: 100%;
  margin: 0;
}

.search {
  width: 100%;
  height: 46px;
  border-radius: 26px;
  border: 2px solid rgba(255, 255, 255, 0.12);
  background: #201F34;
  color: #EDEAF6;
  padding: 0 44px 0 16px;
  outline: none;
  font-weight: 700;
  box-sizing: border-box;
}

.search::placeholder {
  color: #b9b5d1;
}

.search-ico {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 34px;
  height: 34px;
  border: none;
  background: transparent;
  color: #EDEAF6;
  cursor: pointer;
}

/* ===== Titlebar ===== */
.titlebar {
  display: grid;
  grid-template-columns: 180px 1fr 260px;
  align-items: center;
  background: #322D59;
  border-radius: 18px;
  padding: 14px 18px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
  width: 100%;
}

.title {
  margin: 0;
  text-align: center;
  font-size: 32px;
  font-weight: 800;
  color: #EDEAF6;
}

.left-actions,
.right-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: flex-start;
}

.right-actions {
  justify-content: flex-end;
}

.round {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: none;
  background: #2B2950;
  color: #EDEAF6;
  cursor: pointer;
  transition: background 0.2s ease;
}

.round:hover {
  background: #3a3868;
}

.add {
  height: 40px;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  border-radius: 12px;
  background: linear-gradient(180deg, #7F89FF, #6B7CFF);
  color: #fff;
  font-weight: 800;
  font-size: 15px;
  transition: transform 0.2s ease;
}

.add:hover {
  transform: translateY(-2px);
}

.add .plus {
  font-weight: 900;
  font-size: 18px;
}

/* ===== List sheet ===== */
.sheet {
  background: #322D59;
  border-radius: 22px;
  padding: 10px 0 18px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
  width: 100%;
  min-height: 0;
  overflow-y: auto;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #CFC9E6;
  opacity: 0.7;
}

.empty-state p {
  margin: 0;
  font-size: 16px;
}

/* ===== Filas ===== */
.row {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.row:first-child {
  border-top: none;
}

.left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bullet {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  background: #0E0F1A;
  border-radius: 999px;
  font-size: 18px;
  border: none;
  color: #EDEAF6;
  cursor: pointer;
  transition: background 0.2s ease;
}

.bullet:hover {
  background: #1a1b2e;
}

.info .name {
  font-weight: 800;
  font-size: 18px;
  color: #EDEAF6;
}

.info .hint {
  font-size: 12px;
  opacity: 0.65;
  margin-top: 2px;
  color: #CFC9E6;
}

.right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.qty {
  font-weight: 800;
  opacity: 0.85;
  color: #EDEAF6;
}

/* ===== Checkbox ===== */
.box {
  position: relative;
  width: 22px;
  height: 22px;
  display: inline-grid;
  place-items: center;
  cursor: pointer;
}

.box input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.box span {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  background: #0E0F1A;
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.25);
  transition: all 0.2s ease;
}

.box input:checked + span {
  background: #6B7CFF;
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0);
}

/* ===== Responsive ===== */
@media (max-width: 860px) {
  .titlebar {
    grid-template-columns: 120px 1fr 200px;
  }
  .title {
    font-size: 26px;
  }
}

@media (max-width: 560px) {
  .titlebar {
    grid-template-columns: 1fr;
    gap: 10px;
    text-align: center;
  }
  .left-actions,
  .right-actions {
    justify-content: center;
  }
}
</style>