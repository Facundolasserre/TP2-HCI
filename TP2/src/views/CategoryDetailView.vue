<template>
  <div class="category-detail-view">
    <div class="detail-container">
      <div class="detail-header">
        <button class="btn-back" @click="goBack">← Volver a la lista</button>
        <div class="header-actions">
          <button class="btn-edit" @click="goToEdit">✏️ Editar</button>
          <button class="btn-delete" @click="confirmDelete">🗑️ Eliminar</button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading">
        <p>Cargando categoría...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
        <button class="btn-secondary" @click="loadCategory">Reintentar</button>
      </div>

      <!-- Category Details -->
      <div v-else-if="category" class="detail-content">
        <h1 class="category-name">{{ category.name }}</h1>

        <div class="details-grid">
          <!-- ID -->
          <div class="detail-item">
            <span class="detail-label">ID</span>
            <span class="detail-value">{{ category.id }}</span>
          </div>

          <!-- Created At -->
          <div class="detail-item">
            <span class="detail-label">Fecha de creación</span>
            <span class="detail-value">{{ formatDate(category.createdAt) }}</span>
          </div>

          <!-- Updated At -->
          <div class="detail-item">
            <span class="detail-label">Última actualización</span>
            <span class="detail-value">{{ formatDate(category.updatedAt) }}</span>
          </div>
        </div>

        <!-- Metadata Section -->
        <div class="metadata-section">
          <h2 class="section-title">Metadata</h2>
          <div v-if="category.metadata && Object.keys(category.metadata).length > 0" class="metadata-content">
            <pre class="metadata-json">{{ formatMetadata(category.metadata) }}</pre>
          </div>
          <div v-else class="empty-metadata">
            <p>No hay metadata asociada a esta categoría</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="cancelDelete">
      <div class="modal" @click.stop>
        <h2>Confirmar eliminación</h2>
        <p>¿Estás seguro que querés eliminar la categoría <strong>{{ category?.name }}</strong>?</p>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCategoriesStore } from '@/stores/categories'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const route = useRoute()
const store = useCategoriesStore()
const toast = useToast()

const loading = ref(false)
const error = ref<string | null>(null)
const showDeleteModal = ref(false)

const categoryId = computed(() => Number(route.params.id))
const category = computed(() => store.currentCategory)

onMounted(() => {
  loadCategory()
})

const loadCategory = async () => {
  loading.value = true
  error.value = null

  try {
    await store.fetchCategoryById(categoryId.value)
  } catch (err: any) {
    const errorMessage = err.message || 'Error al cargar la categoría'
    error.value = errorMessage
    toast.error(errorMessage)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateString
  }
}

const formatMetadata = (metadata: any) => {
  try {
    return JSON.stringify(metadata, null, 2)
  } catch {
    return String(metadata)
  }
}

const goBack = () => {
  router.push('/categories')
}

const goToEdit = () => {
  router.push(`/categories/${categoryId.value}/edit`)
}

const confirmDelete = () => {
  showDeleteModal.value = true
}

const cancelDelete = () => {
  showDeleteModal.value = false
}

const executeDelete = async () => {
  try {
    await store.deleteCategory(categoryId.value)
    toast.success('Categoría eliminada exitosamente')
    router.push('/categories')
  } catch (err: any) {
    toast.error(err.message || 'Error al eliminar categoría')
    showDeleteModal.value = false
  }
}
</script>

<style scoped>
.category-detail-view {
  min-height: 100vh;
  background: #1C1C30;
  color: #EDEAF6;
  padding: 32px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.detail-container {
  width: 100%;
  max-width: 900px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;
}

.btn-back {
  background: rgba(255, 255, 255, 0.08);
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  color: #EDEAF6;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.12);
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-edit {
  background: #4B5CC7;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-edit:hover {
  background: #5a6dd8;
  transform: translateY(-2px);
}

.btn-delete {
  background: rgba(244, 67, 54, 0.2);
  border: 1px solid #f44336;
  border-radius: 8px;
  padding: 10px 20px;
  color: #f44336;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-delete:hover {
  background: rgba(244, 67, 54, 0.3);
  transform: translateY(-2px);
}

.loading,
.error-state {
  text-align: center;
  padding: 60px 20px;
  background: #322D59;
  border-radius: 12px;
}

.error-state p {
  color: #f44336;
  margin-bottom: 20px;
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

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

.detail-content {
  background: #322D59;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.category-name {
  font-size: 36px;
  font-weight: 800;
  margin: 0 0 32px;
  color: #fff;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
  padding-bottom: 32px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-label {
  font-size: 12px;
  font-weight: 600;
  color: #CFC9E6;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 16px;
  color: #EDEAF6;
  font-weight: 500;
}

.metadata-section {
  margin-top: 32px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 16px;
  color: #CFC9E6;
}

.metadata-content {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 20px;
  overflow-x: auto;
}

.metadata-json {
  margin: 0;
  color: #EDEAF6;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.empty-metadata {
  text-align: center;
  padding: 40px 20px;
  color: #CFC9E6;
  opacity: 0.6;
}

.empty-metadata p {
  margin: 0;
  font-style: italic;
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

.btn-danger {
  background: #f44336;
  border: none;
  border-radius: 8px;
  padding: 10px 24px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-danger:hover {
  background: #d32f2f;
}

@media (max-width: 768px) {
  .category-detail-view {
    padding: 16px;
  }

  .detail-content {
    padding: 24px 20px;
  }

  .category-name {
    font-size: 28px;
  }

  .details-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .header-actions {
    width: 100%;
  }

  .btn-edit,
  .btn-delete {
    flex: 1;
  }
}
</style>
