<template>
  <div class="categories-view">
    <div class="header">
      <h1 class="title">Categorías</h1>
      <button class="btn-primary" @click="goToCreate">
        + Nueva Categoría
      </button>
    </div>

    <!-- Filters and Search -->
    <div class="filters-bar">
      <div class="search-group">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por nombre..."
          class="search-input"
          @input="onSearchDebounced"
        />
      </div>

      <div class="filters-group">
        <select v-model="sortBy" class="select" @change="onFiltersChange">
          <option value="name">Nombre</option>
          <option value="createdAt">Fecha creación</option>
          <option value="updatedAt">Última modificación</option>
        </select>

        <select v-model="order" class="select" @change="onFiltersChange">
          <option value="ASC">Ascendente</option>
          <option value="DESC">Descendente</option>
        </select>

        <select v-model="perPage" class="select" @change="onFiltersChange">
          <option :value="5">5 por página</option>
          <option :value="10">10 por página</option>
          <option :value="25">25 por página</option>
          <option :value="50">50 por página</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="store.isLoading && !store.hasCategories" class="loading">
      <p>Cargando categorías...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="store.hasError && !store.hasCategories" class="error-state">
      <p>{{ store.error?.message || 'Error al cargar categorías' }}</p>
      <button class="btn-secondary" @click="loadCategories">Reintentar</button>
    </div>

    <!-- Empty State -->
    <div v-else-if="!store.hasCategories" class="empty-state">
      <p>No hay categorías creadas</p>
      <button class="btn-primary" @click="goToCreate">Crear primera categoría</button>
    </div>

    <!-- Categories Table -->
    <div v-else class="table-container">
      <table class="categories-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Fecha creación</th>
            <th>Última actualización</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="category in store.items" :key="category.id">
            <td>{{ category.id }}</td>
            <td class="name-cell">{{ category.name }}</td>
            <td>{{ formatDate(category.createdAt) }}</td>
            <td>{{ formatDate(category.updatedAt) }}</td>
            <td class="actions-cell">
              <button class="btn-icon" @click="goToDetail(category.id)" title="Ver detalles">
                👁️
              </button>
              <button class="btn-icon" @click="goToEdit(category.id)" title="Editar">
                ✏️
              </button>
              <button class="btn-icon btn-danger" @click="confirmDelete(category)" title="Eliminar">
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="pagination">
        <button
          class="btn-secondary"
          :disabled="currentPage <= 1"
          @click="goToPage(currentPage - 1)"
        >
          ← Anterior
        </button>
        <span class="page-info">Página {{ currentPage }}</span>
        <button
          class="btn-secondary"
          :disabled="store.items.length < perPage"
          @click="goToPage(currentPage + 1)"
        >
          Siguiente →
        </button>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="cancelDelete">
      <div class="modal" @click.stop>
        <h2>Confirmar eliminación</h2>
        <p>¿Estás seguro que querés eliminar la categoría <strong>{{ categoryToDelete?.name }}</strong>?</p>
        <p class="warning-text">Esta acción no se puede deshacer.</p>
        <div class="modal-actions">
          <button class="btn-secondary" @click="cancelDelete">Cancelar</button>
          <button class="btn-danger" @click="executeDelete">Eliminar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCategoriesStore } from '@/stores/categories'
import { useToast } from '@/composables/useToast'
import type { GetCategory } from '@/types/categories'

const router = useRouter()
const store = useCategoriesStore()
const toast = useToast()

// Filters and pagination
const searchQuery = ref('')
const sortBy = ref<'name' | 'createdAt' | 'updatedAt'>('createdAt')
const order = ref<'ASC' | 'DESC'>('ASC')
const perPage = ref(10)
const currentPage = ref(1)

// Delete modal
const showDeleteModal = ref(false)
const categoryToDelete = ref<GetCategory | null>(null)

// Debounce timer
let searchDebounceTimer: number | undefined

onMounted(() => {
  loadCategories()
})

const loadCategories = async () => {
  try {
    await store.fetchCategories({
      name: searchQuery.value || undefined,
      page: currentPage.value,
      per_page: perPage.value,
      order: order.value,
      sort_by: sortBy.value,
    })
  } catch (error: any) {
    toast.error(error.message || 'Error al cargar categorías')
  }
}

const onFiltersChange = () => {
  currentPage.value = 1
  loadCategories()
}

const onSearchDebounced = () => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }
  searchDebounceTimer = window.setTimeout(() => {
    currentPage.value = 1
    loadCategories()
  }, 500)
}

const goToPage = (page: number) => {
  currentPage.value = page
  loadCategories()
}

const goToCreate = () => {
  router.push('/categories/new')
}

const goToDetail = (id: number) => {
  router.push(`/categories/${id}`)
}

const goToEdit = (id: number) => {
  router.push(`/categories/${id}/edit`)
}

const confirmDelete = (category: GetCategory) => {
  categoryToDelete.value = category
  showDeleteModal.value = true
}

const cancelDelete = () => {
  showDeleteModal.value = false
  categoryToDelete.value = null
}

const executeDelete = async () => {
  if (!categoryToDelete.value) return

  try {
    await store.deleteCategory(categoryToDelete.value.id)
    toast.success('Categoría eliminada exitosamente')
    showDeleteModal.value = false
    categoryToDelete.value = null
    
    // Reload if current page is now empty
    if (store.items.length === 0 && currentPage.value > 1) {
      currentPage.value--
      loadCategories()
    }
  } catch (error: any) {
    toast.error(error.message || 'Error al eliminar categoría')
  }
}

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  } catch {
    return dateString
  }
}
</script>

<style scoped>
.categories-view {
  min-height: 100vh;
  background: #1C1C30;
  color: #EDEAF6;
  padding: 32px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.title {
  font-size: 32px;
  font-weight: 800;
  margin: 0;
}

.filters-bar {
  background: #322D59;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: center;
}

.search-group {
  flex: 1;
  min-width: 250px;
}

.search-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 10px 14px;
  color: #EDEAF6;
  font-size: 14px;
  outline: none;
}

.search-input:focus {
  border-color: #4B5CC7;
  background: rgba(255, 255, 255, 0.12);
}

.filters-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.select {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 10px 14px;
  color: #EDEAF6;
  font-size: 14px;
  cursor: pointer;
  outline: none;
}

.select:focus {
  border-color: #4B5CC7;
}

.btn-primary {
  background: #FFFFFF;
  color: #000;
  border: none;
  border-radius: 999px;
  padding: 12px 24px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #EDEAF6;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
}

.btn-secondary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.loading,
.error-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: #322D59;
  border-radius: 12px;
}

.error-state p {
  color: #f44336;
  margin-bottom: 20px;
}

.table-container {
  background: #322D59;
  border-radius: 12px;
  padding: 20px;
  overflow-x: auto;
}

.categories-table {
  width: 100%;
  border-collapse: collapse;
}

.categories-table th {
  text-align: left;
  padding: 12px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  font-weight: 600;
  color: #CFC9E6;
  font-size: 14px;
}

.categories-table td {
  padding: 16px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 14px;
}

.name-cell {
  font-weight: 600;
}

.actions-cell {
  display: flex;
  gap: 8px;
}

.btn-icon {
  background: rgba(255, 255, 255, 0.08);
  border: none;
  border-radius: 6px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 16px;
}

.btn-icon:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(1.1);
}

.btn-danger {
  background: rgba(244, 67, 54, 0.2);
}

.btn-danger:hover {
  background: rgba(244, 67, 54, 0.3);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
}

.page-info {
  font-size: 14px;
  color: #CFC9E6;
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
}

.modal p {
  margin: 12px 0;
  line-height: 1.6;
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

@media (max-width: 768px) {
  .categories-view {
    padding: 16px;
  }

  .header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .filters-bar {
    flex-direction: column;
  }

  .filters-group {
    width: 100%;
  }

  .select {
    flex: 1;
  }

  .table-container {
    padding: 12px;
  }

  .categories-table {
    font-size: 12px;
  }

  .categories-table th,
  .categories-table td {
    padding: 8px;
  }
}
</style>
