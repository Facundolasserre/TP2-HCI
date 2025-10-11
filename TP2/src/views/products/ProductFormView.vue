<template>
  <div class="product-form-view">
    <div class="form-container">
      <div class="form-header">
        <button class="btn-back" @click="goBack">← {{ t('common.back') }}</button>
        <h1 class="title">
          {{ isEditMode ? t('productForm.title.edit') : t('productForm.title.new') }}
        </h1>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading">
        <p>{{ isEditMode ? t('productForm.loading.edit') : t('productForm.loading.new') }}</p>
      </div>

      <!-- Form -->
      <form v-else class="form" @submit.prevent="handleSubmit">
        <!-- Name Field -->
        <div class="form-group">
          <label for="name" class="label">
            {{ t('products.form.name_label') }} <span class="required">*</span>
          </label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            class="input"
            :class="{ 'input-error': errors.name }"
            :placeholder="t('productForm.name_placeholder')"
            maxlength="50"
            @input="clearError('name')"
          />
          <div class="field-info">
            <span v-if="errors.name" class="error-text">{{ errors.name }}</span>
            <span class="char-count">{{ formData.name.length }}/50</span>
          </div>
        </div>

        <!-- Category Field -->
        <div class="form-group">
          <label for="category" class="label">
            {{ t('products.form.category_label') }}
          </label>
          <select
            id="category"
            v-model="formData.categoryId"
            class="select"
            :class="{ 'input-error': errors.category }"
            @change="clearError('category')"
          >
            <option :value="undefined">{{ t('productForm.category.none') }}</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
          <div class="field-info">
            <span v-if="errors.category" class="error-text">{{ errors.category }}</span>
            <span v-else class="hint-text">
              {{ t('productForm.category.hint') }}
            </span>
          </div>
        </div>

        <!-- Description Field -->
        <div class="form-group">
          <label for="description" class="label">
            {{ t('productForm.description.label') }}
          </label>
          <textarea
            id="description"
            v-model="formData.description"
            class="textarea"
            :class="{ 'input-error': errors.description }"
            :placeholder="t('productForm.description.placeholder')"
            rows="4"
            maxlength="500"
            @input="clearError('description')"
          />
          <div class="field-info">
            <span v-if="errors.description" class="error-text">{{ errors.description }}</span>
            <span v-else class="char-count">{{ formData.description.length }}/500</span>
          </div>
        </div>

        <!-- Metadata Field -->
        <div class="form-group">
          <label for="metadata" class="label">
            {{ t('productForm.metadata.label') }}
          </label>
          <textarea
            id="metadata"
            v-model="metadataText"
            class="textarea"
            :class="{ 'input-error': errors.metadata }"
            :placeholder="t('productForm.metadata.placeholder')"
            rows="6"
            @input="clearError('metadata')"
          />
          <div class="field-info">
            <span v-if="errors.metadata" class="error-text">{{ errors.metadata }}</span>
            <span v-else class="hint-text">
              {{ t('productForm.metadata.hint') }}
            </span>
          </div>
        </div>

        <!-- Actions -->
        <div class="form-actions">
          <button type="button" class="btn-secondary" @click="goBack">
            {{ t('common.cancel') }}
          </button>
          <button type="submit" class="btn-primary" :disabled="submitting">
            {{ submitting ? t('common.saving') : (isEditMode ? t('common.update') : t('common.create')) }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useProductsStore } from '@/stores/products'
import { useCategoriesStore } from '@/stores/categories'
import { useToast } from '@/composables/useToast'
import type { ProductRegistrationData, ProductUpdateData } from '@/types/products'
import { useI18n } from '@/composables/useI18n'

const router = useRouter()
const route = useRoute()
const store = useProductsStore()
const categoriesStore = useCategoriesStore()
const toast = useToast()
const { t } = useI18n()

const formData = ref({
  name: '',
  categoryId: undefined as number | undefined,
  description: '',
})

const metadataText = ref('')
const errors = ref<Record<string, string>>({})
const loading = ref(false)
const submitting = ref(false)
const categories = ref<Array<{ id: number; name: string }>>([])

const isEditMode = computed(() => !!route.params.id)
const productId = computed(() => Number(route.params.id))

onMounted(async () => {
  // Load categories for dropdown
  try {
    await categoriesStore.fetchCategories({ per_page: 100 })
    categories.value = categoriesStore.items.map(c => ({ id: c.id, name: c.name }))
  } catch (error: any) {
    console.error('Error loading categories:', error)
  }

  // Load product data if editing
  if (isEditMode.value) {
    await loadProduct()
  }
})

const loadProduct = async () => {
  loading.value = true
  try {
    const product = await store.fetchProductById(productId.value)
    formData.value.name = product.name
    formData.value.categoryId = product.category?.id
    formData.value.description = product.metadata?.description || ''
    
    // Format metadata for display (excluding description as it has its own field)
    if (product.metadata) {
      const { description, ...restMetadata } = product.metadata
      if (Object.keys(restMetadata).length > 0) {
        metadataText.value = JSON.stringify(restMetadata, null, 2)
      }
    }
  } catch (error: any) {
    toast.error(error.message || t('productForm.toast.load_error'))
    router.push('/products')
  } finally {
    loading.value = false
  }
}

const validateForm = (): boolean => {
  errors.value = {}
  let isValid = true

  // Validate name
  if (!formData.value.name.trim()) {
    errors.value.name = t('products.toast.name_required')
    isValid = false
  } else if (formData.value.name.length > 50) {
    errors.value.name = t('productForm.errors.name_max')
    isValid = false
  }

  // Validate description length
  if (formData.value.description.length > 500) {
    errors.value.description = t('productForm.errors.description_max')
    isValid = false
  }

  // Validate metadata JSON
  if (metadataText.value.trim()) {
    try {
      JSON.parse(metadataText.value)
    } catch {
      errors.value.metadata = t('productForm.errors.metadata_invalid')
      isValid = false
    }
  }

  return isValid
}

const clearError = (field: string) => {
  delete errors.value[field]
}

const handleSubmit = async () => {
  if (!validateForm()) {
    toast.error(t('productForm.toast.validation_error'))
    return
  }

  submitting.value = true

  try {
    // Parse metadata if provided
    let metadata: any = {}
    if (metadataText.value.trim()) {
      try {
        metadata = JSON.parse(metadataText.value)
      } catch {
        // Already validated, should not reach here
      }
    }

    // Add description to metadata if provided
    if (formData.value.description.trim()) {
      metadata.description = formData.value.description.trim()
    }

    // Build data object
    const data: ProductRegistrationData = {
      name: formData.value.name.trim(),
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
    }

    // Add category if selected
    if (formData.value.categoryId) {
      data.category = { id: formData.value.categoryId }
    }

    if (isEditMode.value) {
      // Update existing product
      await store.updateProduct(productId.value, data as ProductUpdateData)
      toast.success(t('products.toast.update_success'))
      router.push(`/products/${productId.value}`)
    } else {
      // Create new product
      const newProduct = await store.createProduct(data)
      toast.success(t('products.toast.create_success'))
      router.push(`/products/${newProduct.id}`)
    }
  } catch (error: any) {
    toast.error(error.message || t('productForm.toast.save_error'))
  } finally {
    submitting.value = false
  }
}

const goBack = () => {
  if (isEditMode.value) {
    router.push(`/products/${productId.value}`)
  } else {
    router.push('/products')
  }
}
</script>

<style scoped>
.product-form-view {
  min-height: 100vh;
  background: #1C1C30;
  color: #EDEAF6;
  padding: 32px;
}

.form-container {
  max-width: 700px;
  margin: 0 auto;
}

.form-header {
  margin-bottom: 32px;
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
  margin-bottom: 16px;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.15);
}

.title {
  font-size: 32px;
  font-weight: 800;
  margin: 0;
}

.loading {
  text-align: center;
  padding: 60px 20px;
  background: #322D59;
  border-radius: 12px;
}

.form {
  background: #322D59;
  border-radius: 12px;
  padding: 32px;
}

.form-group {
  margin-bottom: 24px;
}

.label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #CFC9E6;
}

.required {
  color: #f44336;
}

.input,
.select,
.textarea {
  width: 100%;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 12px;
  color: #EDEAF6;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: all 0.2s ease;
}

.input:focus,
.select:focus,
.textarea:focus {
  border-color: #4B5CC7;
  background: rgba(255, 255, 255, 0.12);
}

.input-error {
  border-color: #f44336;
}

.textarea {
  resize: vertical;
  font-family: 'Courier New', monospace;
  line-height: 1.6;
}

.select {
  cursor: pointer;
}

.field-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
  min-height: 20px;
}

.error-text {
  color: #f44336;
  font-size: 13px;
}

.hint-text {
  color: #999;
  font-size: 13px;
}

.char-count {
  color: #999;
  font-size: 13px;
  margin-left: auto;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 32px;
  justify-content: flex-end;
}

.btn-secondary,
.btn-primary {
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #EDEAF6;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

.btn-primary {
  background: #FFFFFF;
  color: #000;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .product-form-view {
    padding: 16px;
  }

  .form {
    padding: 20px;
  }

  .title {
    font-size: 24px;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-secondary,
  .btn-primary {
    width: 100%;
  }
}
</style>
