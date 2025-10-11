<template>
  <div class="product-detail-view">
    <div class="detail-container">
      <div class="detail-header">
        <button class="btn-back" @click="goBack">← {{ t('productDetail.back_to_list') }}</button>
        <div class="header-actions">
          <button class="btn-edit" @click="goToEdit">
            <img :src="editIcon" alt="Editar" width="16" height="16" />
            {{ t('common.edit') }}
          </button>
          <button class="btn-delete" @click="confirmDelete">
            <img :src="deleteIcon" alt="Eliminar" width="16" height="16" />
            {{ t('common.delete') }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading">
        <p>{{ t('productDetail.loading') }}</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
        <button class="btn-secondary" @click="loadProduct">{{ t('common.retry') }}</button>
      </div>

      <!-- Product Details -->
      <div v-else-if="product" class="detail-content">
        <h1 class="product-name">{{ product.name }}</h1>

        <!-- Description Section -->
        <div v-if="product.metadata?.description" class="description-section">
          <p class="description-text">{{ product.metadata.description }}</p>
        </div>

        <div class="details-grid">
          <!-- ID -->
          <div class="detail-item">
            <span class="detail-label">ID</span>
            <span class="detail-value">{{ product.id }}</span>
          </div>

          <!-- Category -->
          <div class="detail-item">
            <span class="detail-label">{{ t('productDetail.section.category') }}</span>
            <span v-if="product.category" class="detail-value category-value">
              {{ product.category.name }}
            </span>
            <span v-else class="detail-value no-category">{{ t('productDetail.section.no_category') }}</span>
          </div>

          <!-- Created At -->
          <div class="detail-item">
            <span class="detail-label">{{ t('productDetail.section.created_at') }}</span>
            <span class="detail-value">{{ formatDate(product.createdAt) }}</span>
          </div>

          <!-- Updated At -->
          <div class="detail-item">
            <span class="detail-label">{{ t('productDetail.section.updated_at') }}</span>
            <span class="detail-value">{{ formatDate(product.updatedAt) }}</span>
          </div>
        </div>

        <!-- Category Details (if exists) -->
        <div v-if="product.category" class="category-section">
          <h2 class="section-title">{{ t('productDetail.section.category_details') }}</h2>
          <div class="category-details">
            <div class="detail-row">
              <span class="detail-label">{{ t('productDetail.section.category_id') }}</span>
              <span class="detail-value">{{ product.category.id }}</span>
            </div>
            <div class="detail-row" v-if="product.category.createdAt">
              <span class="detail-label">{{ t('productDetail.section.category_created') }}</span>
              <span class="detail-value">{{ formatDate(product.category.createdAt) }}</span>
            </div>
          </div>
        </div>

        <!-- Metadata Section -->
        <div class="metadata-section">
          <h2 class="section-title">{{ t('productDetail.section.metadata') }}</h2>
          <div v-if="product.metadata && Object.keys(product.metadata).length > 0" class="metadata-content">
            <pre class="metadata-json">{{ formatMetadata(product.metadata) }}</pre>
          </div>
          <div v-else class="empty-metadata">
            <p>{{ t('productDetail.section.no_metadata') }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="cancelDelete">
      <div class="modal" @click.stop>
        <h2>{{ t('products.delete.title') }}</h2>
        <p>{{ t('products.delete.message', { name: product?.name || '' }) }}</p>
        <p class="warning-text">{{ t('products.delete.warning') }}</p>
        <div class="modal-actions">
          <button class="btn-secondary" @click="cancelDelete">{{ t('common.cancel') }}</button>
          <button class="btn-danger" @click="executeDelete">{{ t('products.delete.confirm') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useProductsStore } from '@/stores/products'
import { useToast } from '@/composables/useToast'
import { useI18n } from '@/composables/useI18n'
import { useLanguageStore } from '@/stores/language'
import { formatDateBuenosAires } from '@/utils/dateFormatter'
import editIcon from '@/assets/edit.svg'
import deleteIcon from '@/assets/delete.svg'

const router = useRouter()
const route = useRoute()
const store = useProductsStore()
const toast = useToast()
const { t } = useI18n()
const languageStore = useLanguageStore()

const loading = ref(false)
const error = ref<string | null>(null)
const showDeleteModal = ref(false)

const productId = computed(() => Number(route.params.id))
const product = computed(() => store.currentProduct)

onMounted(() => {
  loadProduct()
})

const loadProduct = async () => {
  loading.value = true
  error.value = null

  try {
    await store.fetchProductById(productId.value)
  } catch (err: any) {
    const errorMessage = err.message || t('productDetail.toast.load_error')
    error.value = errorMessage
    toast.error(errorMessage)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string) => {
  const locale = languageStore.language === 'es' ? 'es-AR' : 'en-US'
  return formatDateBuenosAires(dateString, locale)
}

const formatMetadata = (metadata: any) => {
  try {
    return JSON.stringify(metadata, null, 2)
  } catch {
    return String(metadata)
  }
}

const goBack = () => {
  router.push('/products')
}

const goToEdit = () => {
  router.push(`/products/${productId.value}/edit`)
}

const confirmDelete = () => {
  showDeleteModal.value = true
}

const cancelDelete = () => {
  showDeleteModal.value = false
}

const executeDelete = async () => {
  if (!product.value) return

  try {
    await store.deleteProduct(product.value.id)
    toast.success(t('products.toast.delete_success'))
    router.push('/products')
  } catch (err: any) {
    toast.error(err.message || t('products.toast.delete_error'))
    showDeleteModal.value = false
  }
}
</script>

<style scoped>
.product-detail-view {
  min-height: 100vh;
  background: #1C1C30;
  color: #EDEAF6;
  padding: 32px;
}

.detail-container {
  max-width: 900px;
  margin: 0 auto;
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
  background: rgba(255, 255, 255, 0.1);
  color: #EDEAF6;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.15);
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-edit,
.btn-delete {
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-edit img {
  filter: brightness(0) invert(1);
}

.btn-edit {
  background: #4B5CC7;
  color: #EDEAF6;
}

.btn-edit:hover {
  background: #5A6BD8;
}

.btn-delete {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
  border: 1px solid rgba(244, 67, 54, 0.4);
}

.btn-delete img {
  filter: brightness(0) saturate(100%) invert(56%) sepia(89%) saturate(2530%) hue-rotate(334deg) brightness(97%) contrast(94%);
}

.btn-delete:hover {
  background: rgba(244, 67, 54, 0.3);
}

.btn-delete:hover img {
  filter: brightness(0) saturate(100%) invert(42%) sepia(84%) saturate(2449%) hue-rotate(343deg) brightness(101%) contrast(92%);
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
  border-radius: 12px;
  padding: 32px;
}

.product-name {
  font-size: 36px;
  font-weight: 800;
  margin: 0 0 16px;
  color: #EDEAF6;
}

.description-section {
  margin-bottom: 24px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border-left: 3px solid #5B5DD9;
}

.description-text {
  margin: 0;
  font-size: 16px;
  line-height: 1.6;
  color: #CFC9E6;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-label {
  font-size: 13px;
  font-weight: 600;
  color: #CFC9E6;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 16px;
  color: #EDEAF6;
}

.category-value {
  display: inline-block;
  background: rgba(75, 92, 199, 0.3);
  border: 1px solid rgba(75, 92, 199, 0.5);
  border-radius: 999px;
  padding: 6px 16px;
  font-weight: 500;
}

.no-category {
  color: #999;
  font-style: italic;
}

.category-section {
  margin-top: 32px;
  padding-top: 32px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 16px;
  color: #EDEAF6;
}

.category-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.detail-row .detail-label {
  text-transform: none;
  min-width: 140px;
}

.metadata-section {
  margin-top: 32px;
  padding-top: 32px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.metadata-content {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 16px;
  overflow-x: auto;
}

.metadata-json {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  color: #88D5BF;
}

.empty-metadata {
  padding: 24px;
  text-align: center;
  color: #999;
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
  background: rgba(244, 67, 54, 0.3);
  color: #f44336;
  border: 1px solid rgba(244, 67, 54, 0.4);
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-danger:hover {
  background: rgba(244, 67, 54, 0.4);
}

@media (max-width: 768px) {
  .product-detail-view {
    padding: 16px;
  }

  .detail-content {
    padding: 20px;
  }

  .product-name {
    font-size: 28px;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .detail-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    justify-content: stretch;
  }

  .btn-edit,
  .btn-delete {
    flex: 1;
  }
}
</style>
