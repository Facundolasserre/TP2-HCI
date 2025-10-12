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
        <div class="title-container">
          <button @click="sidebarOpen = true" class="burger-icon">
            <i class="fas fa-bars"></i>
          </button>
          <h1 class="page-title">Historial de Compras</h1>
        </div>
      </header>

      <div class="filter-bar">
        <div class="filter-card total-purchases-card">
          <i class="fas fa-receipt icon"></i>
          <div class="total-purchases-info">
            <span class="label">Total Compras</span>
            <span class="count">{{ filteredPurchases.length }}</span>
          </div>
        </div>
        <div class="date-range-filter">
          <input type="date" v-model="fromDate" placeholder="dd/mm/aaaa" />
          <span class="date-divider">-</span>
          <input type="date" v-model="toDate" placeholder="dd/mm/aaaa" />
        </div>
        <div class="search-bar">
          <i class="fas fa-search"></i>
          <input type="text" v-model="searchQuery" @input="debouncedSearch" placeholder="Buscar por nombre..." />
        </div>
      </div>

      <main class="content-area">
        <div v-if="loading" class="skeleton-container">
          <div class="skeleton-card" v-for="n in 3" :key="n"></div>
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
            <div class="card-content">
              <div class="card-header">
                <span class="list-name">{{ purchase.title }}</span>
                <span class="status-badge">Completada</span>
              </div>
              <div class="purchase-details">
                <span><i class="fas fa-calendar-alt"></i> Hace 4 días</span>
                <span><i class="fas fa-list-ul"></i> {{ purchase.items }} artículos</span>
                <span><i class="fas fa-dollar-sign"></i> {{ purchase.total.toFixed(2) }}</span>
              </div>
            </div>
            <button @click="restorePurchase(purchase.id)" class="restore-button">Restaurar</button>
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

// Mock Data for demonstration
const mockPurchases: Purchase[] = [
  { id: 1, title: "Birthday Party Shopping", status: 'completed', items: 12, total: 145.50, currency: "USD", date: "2023-10-22T10:00:00Z" },
  { id: 2, title: "Weekly Groceries", status: 'completed', items: 25, total: 89.90, currency: "USD", date: "2023-10-20T18:30:00Z" },
  { id: 3, title: "Hardware Store Run", status: 'completed', items: 5, total: 210.00, currency: "USD", date: "2023-10-19T14:15:00Z" },
];

const purchases = ref<Purchase[]>([]);
const loading = ref(true);
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
    // Simulating API call
    await new Promise(res => setTimeout(res, 1500));
    // Uncomment the line below to use actual API
    // const response = await http.get('/api/purchases/history');
    // purchases.value = response.data;
    purchases.value = mockPurchases; // Using mock data
  } catch (err) {
    error.value = true;
    console.error('Error fetching purchase history:', err);
  } finally {
    loading.value = false;
  }
};

const restorePurchase = async (id: number) => {
  try {
    // await http.post(`/api/purchases/${id}/restore`);
    alert(`Compra ${id} restaurada con éxito`);
  } catch (err) {
    alert('Error al restaurar la compra');
    console.error('Error restoring purchase:', err);
  }
};

const debouncedSearch = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    // The computed property will react to searchQuery changes automatically
  }, 300);
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
    to.setHours(23, 59, 59, 999); // Include the whole end day

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
/* Using variables from src/assets/styles.css */
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
  color: var(--text);
  font-family: 'Roboto', sans-serif;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2rem;
}

.view-header {
  padding: 2rem 0 1.5rem 0;
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

.page-title { font-size: 2rem; font-weight: 700; }

.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2rem;

}

.filter-card {
  background-color: #322D59;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 8px var(--shadow-color);
  height: 56px; /* Ensure consistent height */
  box-sizing: border-box;
}

.total-purchases-card .icon { font-size: 1.5rem; color: #322D59; }
.total-purchases-info { display: flex; flex-direction: column; }
.total-purchases-info .label { font-size: 0.8rem; color: var(--secondary-text); font-weight: 500; }
.total-purchases-info .count { font-size: 1.25rem; font-weight: 700; }

/* Visual Adjustment: Date Filter Squares */
.date-range-filter {
  display: flex;
  align-items: center;
  gap: 0.75rem;

}

.date-range-filter input[type="date"] {
  background-color: var(--surface);
  color: var(--text);
  border: 1px solid transparent;
  border-radius: 12px;
  height: 56px;
  width: 160px;
  padding: 1rem;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 500;
  text-align: center;
  box-shadow: 0 4px 8px var(--shadow-color);
  transition: all 0.2s ease-in-out;
  box-sizing: border-box;
}

.date-range-filter input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.date-range-filter input[type="date"]:hover {
  border-color: var(--accent);
  filter: brightness(1.1);
}

.date-range-filter input[type="date"]:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(139, 124, 255, 0.4);
}

.date-range-filter input[type="date"]:hover::-webkit-calendar-picker-indicator {
  opacity: 1;
}

.date-divider {
  color: var(--secondary-text);
  font-size: 1.2rem;
  font-weight: 500;
}

.search-bar {
  flex-grow: 1;
  display: flex; align-items: center; gap: 0.75rem;
  background-color: var(--surface);
  border-radius: 12px; padding: 0 1rem;
  box-shadow: 0 4px 8px var(--shadow-color);
  border: 1px solid transparent;
  transition: border-color 0.2s;
  height: 56px; /* Ensure consistent height */
  box-sizing: border-box;
}
.search-bar:focus-within { border-color: var(--accent); }
.search-bar i { color: var(--secondary-text); }
.search-bar input {
  flex-grow: 1; background: none; border: none; color: var(--text);
  padding: 1rem 0; font-family: inherit; font-size: 1rem;
}
.search-bar input::placeholder { color: var(--secondary-text); }

.content-area { padding-bottom: 2rem; }

.purchase-list { display: grid; gap: 1rem; }

.purchase-card {
  background-color: var(--surface);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  box-shadow: 0 4px 12px var(--shadow-color);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.purchase-card:hover { transform: translateY(-4px); box-shadow: 0 8px 16px var(--shadow-color); }

.card-content { flex-grow: 1; }
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}
.list-name { font-size: 1.25rem; font-weight: 700; }
.status-badge {
  background-color: var(--accent);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.purchase-details {
  display: flex;
  gap: 1.5rem;
  color: var(--secondary-text);
  font-size: 0.9rem;
}
.purchase-details i { margin-right: 0.5rem; color: var(--accent); }

.restore-button {
  background-color: var(--accent);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  font-weight: 500;
  white-space: nowrap;
  transition: background-color 0.2s;
}
.restore-button:hover { background-color: #7A6EE3; }

.skeleton-container { display: grid; gap: 1rem; }
.skeleton-card {
  background-color: var(--surface);
  border-radius: 12px;
  height: 120px;
}

.error-state-container, .skeleton-container {
  margin-top: 2rem;
}

.error-card {
  background-color: var(--surface); border-radius: 12px;
  padding: 2.5rem; text-align: center; max-width: 450px;
  margin: 4rem auto;
  box-shadow: 0 4px 12px var(--shadow-color);
}
.error-icon { font-size: 2.5rem; color: var(--accent); margin-bottom: 1rem; }
.retry-button {
  background-color: var(--accent); color: white; border: none;
  border-radius: 8px; padding: 0.75rem 1.5rem; cursor: pointer;
  font-weight: 500; transition: background-color 0.2s;
}
.retry-button:hover { background-color: #7A6EE3; }

/* Responsive Behavior */
@media (max-width: 1100px) { /* Adjusted breakpoint */
  .filter-bar {
    flex-wrap: wrap;
  }
  .search-bar {
    width: 100%;
    order: -1; /* Move search bar to the top on wrap */
  }
  .date-range-filter {
    flex-grow: 1;
  }
  .date-range-filter input[type="date"] {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .container { padding: 0 1rem; }
  .page-title { font-size: 1.75rem; }
  .purchase-card { flex-direction: column; align-items: stretch; }
  .restore-button { margin-top: 1rem; text-align: center; }
  .purchase-details { flex-direction: column; gap: 0.5rem; }
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>