<template>
  <div class="purchase-history-view">
    <Sidebar
      :open="sidebarOpen"
      :active="active"
      @close="closeSidebar"
      @update:active="val => active = val"
    />
    <div class="container">
      <header class="view-header">
        <div class="header-row">
          <div class="title-container">
            <button @click="sidebarOpen = true" class="burger-icon">
              <i class="fas fa-bars"></i>
            </button>
            <h1 class="page-title">Historial de Compras</h1>
          </div>
          <div class="search-bar">
            <i class="fas fa-search"></i>
            <input type="text" v-model="searchQuery" @input="debouncedSearch" placeholder="Buscar por nombre..." />
          </div>
        </div>
        <div class="filters-row">
          <div class="date-filters">
            <input type="date" v-model="fromDate" placeholder="dd/mm/aaaa" />
            <span class="date-divider">—</span>
            <input type="date" v-model="toDate" placeholder="dd/mm/aaaa" />
          </div>
          <div class="total-purchases-chip">
            <i class="fas fa-shopping-cart"></i>
            <span>Total Compras: {{ filteredPurchases.length }}</span>
          </div>
        </div>
      </header>

      <main class="content-area">
        <div v-if="loading" class="skeleton-container">
          <div class="skeleton-card" v-for="n in 3" :key="n">
            <div class="skeleton-line title"></div>
            <div class="skeleton-line meta"></div>
            <div class="skeleton-line meta short"></div>
            <div class="skeleton-action"></div>
          </div>
        </div>

        <div v-else-if="error" class="error-state-container">
          <div class="error-card">
            <i class="fas fa-exclamation-triangle error-icon"></i>
            <h2>Error al Cargar</h2>
            <p>No se pudo obtener el historial de compras. Por favor, intente de nuevo.</p>
            <button @click="fetchPurchaseHistory" class="retry-button">Reintentar</button>
          </div>
        </div>

        <div v-else class="purchase-list">
          <div v-for="purchase in filteredPurchases" :key="purchase.id" class="purchase-card">
            <div class="card-header">
              <span class="list-name">{{ purchase.title }}</span>
              <span class="status-badge">Completada</span>
            </div>
            <div class="card-body">
              <div class="purchase-details">
                <span><i class="fas fa-calendar-alt"></i> Hace 4 días</span>
                <span><i class="fas fa-list-ul"></i> {{ purchase.items }} artículos</span>
                <span><i class="fas fa-dollar-sign"></i> {{ purchase.total.toFixed(2) }} {{ purchase.currency }}</span>
              </div>
              <button @click="restorePurchase(purchase.id)" class="restore-button">Restaurar</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import Sidebar from "@/components/Sidebar.vue";
// import http from '@/services/http';

interface Purchase {
  id: number;
  title: string;
  status: 'completed' | 'active';
  items: number;
  total: number;
  currency: string;
  date: string;
}

const purchases = ref<Purchase[]>([]);
const loading = ref(false);
const error = ref(false);
const searchQuery = ref('');
const fromDate = ref('');
const toDate = ref('');
const sidebarOpen = ref(false);
const active = ref('history');
let debounceTimer: number;

const closeSidebar = () => {
  sidebarOpen.value = false;
};

const fetchPurchaseHistory = async () => {
  loading.value = true;
  error.value = false;
  try {
    // Mock delay to show skeleton
    await new Promise(res => setTimeout(res, 1000));
    const response = await http.get('/api/purchases/history');
    purchases.value = response.data;
  } catch (err) {
    error.value = true;
    console.error('Error fetching purchase history:', err);
  } finally {
    loading.value = false;
  }
};

const restorePurchase = async (id: number) => {
  try {
    await http.post(`/api/purchases/${id}/restore`);
    alert('Compra restaurada con éxito');
  } catch (err) {
    alert('Error al restaurar la compra');
    console.error('Error restoring purchase:', err);
  }
};

const debouncedSearch = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {}, 300);
};

const filteredPurchases = computed(() => {
  let filtered = purchases.value;
  const searchLower = searchQuery.value.toLowerCase();

  if (searchLower) {
    filtered = filtered.filter(p => p.title.toLowerCase().includes(searchLower));
  }

  if (fromDate.value && toDate.value) {
    const from = new Date(fromDate.value);
    const to = new Date(toDate.value);
    to.setHours(23, 59, 59, 999);

    filtered = filtered.filter(p => {
      const purchaseDate = new Date(p.date);
      return purchaseDate >= from && purchaseDate <= to;
    });
  }

  return filtered;
});

onMounted(() => {
  fetchPurchaseHistory();
});
</script>

<style scoped>
:root {
  --background: #1C1C30;
  --surface: #322D59;
  --text: #EDEAF6;
  --secondary-text: #BDB7E3;
  --accent: #8B7CFF;
  --shadow-color: rgba(0, 0, 0, 0.2);
}

.purchase-history-view {
  background-color: var(--background);
  min-height: 100vh;
  font-family: 'Roboto', sans-serif;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2rem;
}

.view-header {
  padding: 2rem 0;
}

.header-row, .filters-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
}

.filters-row {
  margin-top: 1.5rem;
}

.title-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.burger-icon {
  background: none; border: none; color: var(--text);
  font-size: 1.5rem; cursor: pointer; padding: 0.5rem;
  border-radius: 50%; display: flex; align-items: center;
  justify-content: center; transition: background-color 0.2s;
}
.burger-icon:hover { background-color: var(--surface); }

.page-title { font-size: 2rem; font-weight: 700; color: var(--text); }

.search-bar {
  display: flex; align-items: center; gap: 0.75rem;
  background-color: var(--surface);
  border-radius: 8px; padding: 0 1rem;
  border: 1px solid transparent;
  transition: border-color 0.2s;
}
.search-bar:focus-within { border-color: var(--accent); }
.search-bar i { color: var(--secondary-text); }
.search-bar input {
  background: none; border: none; color: var(--text);
  padding: 0.75rem 0; font-family: inherit; font-size: 1rem;
}
.search-bar input::placeholder { color: var(--secondary-text); }

.date-filters {
  display: flex; align-items: center; gap: 0.5rem;
  background-color: var(--surface); border-radius: 8px;
  padding: 0.5rem 1rem; border: 1px solid var(--surface);
}
.date-filters input {
  background: none; border: none; color: var(--secondary-text);
  font-family: inherit;
}
.date-divider { color: var(--secondary-text); }

.total-purchases-chip {
  display: flex; align-items: center; gap: 0.5rem;
  background-color: var(--surface);
  color: var(--secondary-text); font-size: 0.9rem;
  padding: 0.5rem 1rem; border-radius: 20px;
}
.total-purchases-chip i { color: var(--accent); }

.content-area { padding-bottom: 2rem; }

.skeleton-container, .purchase-list { display: grid; gap: 1.5rem; }

.skeleton-card {
  background-color: var(--surface); border-radius: 12px;
  padding: 1.5rem; position: relative;
  overflow: hidden; height: 150px;
}
.skeleton-line { background-color: #4a4570; border-radius: 4px; }
.skeleton-line.title { height: 24px; width: 60%; margin-bottom: 1rem; }
.skeleton-line.meta { height: 16px; width: 40%; margin-bottom: 0.5rem; }
.skeleton-line.short { width: 30%; }
.skeleton-action { position: absolute; right: 1.5rem; bottom: 1.5rem; width: 100px; height: 40px; background-color: #4a4570; border-radius: 8px; }

.error-state-container {
  display: flex; justify-content: center; align-items: center;
  padding-top: 4rem;
}
.error-card {
  background-color: var(--surface); border-radius: 12px;
  padding: 2.5rem; text-align: center; max-width: 400px;
  box-shadow: 0 4px 12px var(--shadow-color);
}
.error-icon { font-size: 2.5rem; color: var(--accent); margin-bottom: 1rem; }
.error-card h2 { font-size: 1.5rem; color: var(--text); margin-bottom: 0.5rem; }
.error-card p { color: var(--secondary-text); margin-bottom: 1.5rem; }
.retry-button {
  background-color: var(--accent); color: white; border: none;
  border-radius: 8px; padding: 0.75rem 1.5rem; cursor: pointer;
  font-weight: 500; transition: background-color 0.2s;
}
.retry-button:hover { background-color: #7A6EE3; }

.purchase-card { /* styles from before */ }

@media (max-width: 992px) {
  .header-row, .filters-row { flex-direction: column; align-items: stretch; }
  .filters-row { align-items: flex-start; }
  .total-purchases-chip { align-self: flex-start; }
}

@media (max-width: 768px) {
  .container { padding: 0 1rem; }
  .view-header { padding: 1.5rem 0; }
  .page-title { font-size: 1.75rem; }
}
</style>
