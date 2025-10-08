<template>
  <div class="pantries-view">
    <header class="page-header">
      <h1>Mis Despensas</h1>
      <button class="btn-primary" @click="goToNew">+ Nueva Despensa</button>
    </header>

    <!-- Filters -->
    <div class="filters">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Buscar por nombre..."
        class="search-input"
      />
      <select v-model="ownerFilter" class="filter-select">
        <option :value="undefined">Todas</option>
        <option :value="true">Mis despensas</option>
        <option :value="false">Compartidas conmigo</option>
      </select>
    </div>

    <!-- Loading State -->
    <div v-if="pantriesStore.isLoading" class="loading">
      <p>Cargando despensas...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="pantriesStore.hasError" class="error">
      <p>{{ pantriesStore.error }}</p>
      <button @click="loadPantries" class="btn-secondary">Reintentar</button>
    </div>

    <!-- Empty State -->
    <div v-else-if="!pantriesStore.hasPantries" class="empty">
      <p>No tienes despensas todavía</p>
      <button @click="goToNew" class="btn-primary">Crear Primera Despensa</button>
    </div>

    <!-- Pantries Table -->
    <div v-else class="pantries-table">
      <table>
        <thead>
          <tr>
            <th @click="toggleSort('name')">Nombre</th>
            <th>Propietario</th>
            <th>Compartida con</th>
            <th @click="toggleSort('createdAt')">Fecha Creación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pantry in filteredPantries" :key="pantry.id">
            <td>
              <strong>{{ pantry.name }}</strong>
            </td>
            <td>{{ pantry.owner.name }} {{ pantry.owner.surname }}</td>
            <td>{{ sharedWithText(pantry.sharedWith) }}</td>
            <td>{{ formatDate(pantry.createdAt) }}</td>
            <td class="actions">
              <button @click="goToDetail(pantry.id)" class="btn-icon" title="Ver">👁️</button>
              <button @click="goToEdit(pantry.id)" class="btn-icon" title="Editar">✏️</button>
              <button @click="confirmDelete(pantry)" class="btn-icon" title="Eliminar">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePantriesStore } from '@/stores/pantries'
import type { Pantry } from '@/types/pantry'
import type { GetUser } from '@/types/user'

const router = useRouter()
const pantriesStore = usePantriesStore()

const searchQuery = ref('')
const ownerFilter = ref<boolean | undefined>(undefined)
const sortBy = ref<'name' | 'createdAt'>('createdAt')
const sortOrder = ref<'ASC' | 'DESC'>('DESC')

const filteredPantries = computed(() => {
  let result = pantriesStore.items

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(p => p.name.toLowerCase().includes(query))
  }

  // Filter by owner
  if (ownerFilter.value !== undefined) {
    // Note: This assumes backend returns owner property correctly
    // Adjust logic based on actual API response
    result = ownerFilter.value
      ? result.filter(p => p.owner !== null)
      : result.filter(p => p.sharedWith && p.sharedWith.length > 0)
  }

  // Sort
  result = [...result].sort((a, b) => {
    let compareA: any = a[sortBy.value]
    let compareB: any = b[sortBy.value]

    if (sortBy.value === 'name') {
      compareA = a.name.toLowerCase()
      compareB = b.name.toLowerCase()
    }

    if (sortOrder.value === 'ASC') {
      return compareA > compareB ? 1 : -1
    } else {
      return compareA < compareB ? 1 : -1
    }
  })

  return result
})

function toggleSort(field: 'name' | 'createdAt') {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'ASC' ? 'DESC' : 'ASC'
  } else {
    sortBy.value = field
    sortOrder.value = 'ASC'
  }
}

function sharedWithText(sharedWith: GetUser[] | null): string {
  if (!sharedWith || sharedWith.length === 0) return 'Nadie'
  if (sharedWith.length === 1) return `${sharedWith[0].name} ${sharedWith[0].surname}`
  return `${sharedWith.length} personas`
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-ES')
}

function goToNew() {
  router.push('/pantries/new')
}

function goToDetail(id: number) {
  router.push(`/pantries/${id}`)
}

function goToEdit(id: number) {
  router.push(`/pantries/${id}/edit`)
}

async function confirmDelete(pantry: Pantry) {
  if (!confirm(`¿Seguro que deseas eliminar la despensa "${pantry.name}"?`)) return

  try {
    await pantriesStore.deletePantry(pantry.id)
    alert('✓ Despensa eliminada exitosamente')
  } catch (error: any) {
    alert(`✗ Error: ${error.message}`)
  }
}

async function loadPantries() {
  try {
    await pantriesStore.fetchPantries({
      page: 1,
      per_page: 50,
      sort_by: sortBy.value,
      order: sortOrder.value
    })
  } catch (error) {
    console.error('Error loading pantries:', error)
  }
}

onMounted(() => {
  loadPantries()
})
</script>

<style scoped>
.pantries-view {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0;
  font-size: 28px;
  color: #EDEAF6;
}

.filters {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.search-input,
.filter-select {
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid #4B5CC7;
  background: #1C1C30;
  color: #fff;
  font-size: 14px;
}

.search-input {
  flex: 1;
}

.filter-select {
  min-width: 200px;
}

.loading,
.error,
.empty {
  text-align: center;
  padding: 60px 20px;
  color: #CFC9E6;
}

.pantries-table {
  background: #0E0F1A;
  border-radius: 12px;
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #322D59;
}

thead th {
  padding: 14px 16px;
  text-align: left;
  font-weight: 700;
  color: #EDEAF6;
  cursor: pointer;
  user-select: none;
}

thead th:hover {
  background: #3D3A5C;
}

tbody tr {
  border-bottom: 1px solid #322D59;
}

tbody tr:hover {
  background: #1A1A2E;
}

tbody td {
  padding: 14px 16px;
  color: #CFC9E6;
}

.actions {
  display: flex;
  gap: 8px;
}

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

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(107, 124, 255, 0.4);
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
  border-radius: 4px;
  transition: background 0.2s;
}

.btn-icon:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>
