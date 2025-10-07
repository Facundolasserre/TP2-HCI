<template>
  <div class="category-form-view">
    <div class="form-container">
      <div class="form-header">
        <button class="btn-back" @click="goBack">← Volver</button>
        <h1 class="title">{{ isEditMode ? 'Editar Categoría' : 'Nueva Categoría' }}</h1>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading">
        <p>{{ isEditMode ? 'Cargando categoría...' : 'Guardando...' }}</p>
      </div>

      <!-- Form -->
      <form v-else class="form" @submit.prevent="handleSubmit">
        <!-- Name Field -->
        <div class="form-group">
          <label for="name" class="label">
            Nombre <span class="required">*</span>
          </label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            class="input"
            :class="{ 'input-error': errors.name }"
            placeholder="Ej: Electrónica, Alimentos, Ropa..."
            maxlength="50"
            @input="clearError('name')"
          />
          <div class="field-info">
            <span v-if="errors.name" class="error-text">{{ errors.name }}</span>
            <span class="char-count">{{ formData.name.length }}/50</span>
          </div>
        </div>

        <!-- Metadata Field -->
        <div class="form-group">
          <label for="metadata" class="label">
            Metadata (JSON opcional)
          </label>
          <textarea
            id="metadata"
            v-model="metadataText"
            class="textarea"
            :class="{ 'input-error': errors.metadata }"
            placeholder='{"color": "#ff5733", "icon": "shopping"}'
            rows="6"
            @input="clearError('metadata')"
          />
          <div class="field-info">
            <span v-if="errors.metadata" class="error-text">{{ errors.metadata }}</span>
            <span v-else class="hint-text">
              Ingresá un objeto JSON válido con datos adicionales (opcional)
            </span>
          </div>
        </div>

        <!-- Actions -->
        <div class="form-actions">
          <button type="button" class="btn-secondary" @click="goBack">
            Cancelar
          </button>
          <button type="submit" class="btn-primary" :disabled="submitting">
            {{ submitting ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Crear') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCategoriesStore } from '@/stores/categories'
import { useToast } from '@/composables/useToast'
import type { CategoryRegistrationData, UpdateCategoryProfile } from '@/types/categories'

const router = useRouter()
const route = useRoute()
const store = useCategoriesStore()
const toast = useToast()

const formData = ref({
  name: '',
})

const metadataText = ref('')
const errors = ref<Record<string, string>>({})
const loading = ref(false)
const submitting = ref(false)

const isEditMode = computed(() => !!route.params.id)
const categoryId = computed(() => Number(route.params.id))

onMounted(async () => {
  if (isEditMode.value) {
    await loadCategory()
  }
})

const loadCategory = async () => {
  loading.value = true
  try {
    const category = await store.fetchCategoryById(categoryId.value)
    formData.value.name = category.name
    
    // Format metadata for display
    if (category.metadata) {
      metadataText.value = JSON.stringify(category.metadata, null, 2)
    }
  } catch (error: any) {
    toast.error(error.message || 'Error al cargar categoría')
    router.push('/categories')
  } finally {
    loading.value = false
  }
}

const validateForm = (): boolean => {
  errors.value = {}
  let isValid = true

  // Validate name
  if (!formData.value.name.trim()) {
    errors.value.name = 'El nombre es requerido'
    isValid = false
  } else if (formData.value.name.length > 50) {
    errors.value.name = 'El nombre no puede exceder los 50 caracteres'
    isValid = false
  }

  // Validate metadata JSON
  if (metadataText.value.trim()) {
    try {
      JSON.parse(metadataText.value)
    } catch {
      errors.value.metadata = 'El metadata debe ser un JSON válido'
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
    toast.error('Por favor corregí los errores en el formulario')
    return
  }

  submitting.value = true

  try {
    // Parse metadata if provided
    let metadata: any = undefined
    if (metadataText.value.trim()) {
      try {
        metadata = JSON.parse(metadataText.value)
      } catch {
        // Already validated, should not reach here
      }
    }

    if (isEditMode.value) {
      // Update existing category
      const updateData: UpdateCategoryProfile = {
        name: formData.value.name.trim(),
        metadata,
      }
      await store.updateCategory(categoryId.value, updateData)
      toast.success('Categoría actualizada exitosamente')
    } else {
      // Create new category
      const createData: CategoryRegistrationData = {
        name: formData.value.name.trim(),
        metadata,
      }
      await store.createCategory(createData)
      toast.success('Categoría creada exitosamente')
    }

    // Navigate back to list
    router.push('/categories')
  } catch (error: any) {
    toast.error(error.message || 'Error al guardar categoría')
  } finally {
    submitting.value = false
  }
}

const goBack = () => {
  router.push('/categories')
}
</script>

<style scoped>
.category-form-view {
  min-height: 100vh;
  background: #1C1C30;
  color: #EDEAF6;
  padding: 32px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.form-container {
  width: 100%;
  max-width: 700px;
  background: #322D59;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.form-header {
  margin-bottom: 32px;
}

.btn-back {
  background: rgba(255, 255, 255, 0.08);
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  color: #EDEAF6;
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 16px;
  transition: all 0.2s ease;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.12);
}

.title {
  font-size: 28px;
  font-weight: 800;
  margin: 0;
}

.loading {
  text-align: center;
  padding: 60px 20px;
  color: #CFC9E6;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label {
  font-size: 14px;
  font-weight: 600;
  color: #CFC9E6;
}

.required {
  color: #f44336;
}

.input,
.textarea {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 12px 16px;
  color: #EDEAF6;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: all 0.2s ease;
}

.input:focus,
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
}

.field-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  min-height: 18px;
}

.error-text {
  color: #f44336;
}

.hint-text {
  color: #CFC9E6;
  opacity: 0.7;
}

.char-count {
  color: #CFC9E6;
  opacity: 0.6;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  justify-content: flex-end;
}

.btn-primary {
  background: #FFFFFF;
  color: #000;
  border: none;
  border-radius: 999px;
  padding: 12px 32px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #EDEAF6;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  padding: 12px 32px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

@media (max-width: 768px) {
  .category-form-view {
    padding: 16px;
  }

  .form-container {
    padding: 24px 20px;
  }

  .title {
    font-size: 24px;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>
