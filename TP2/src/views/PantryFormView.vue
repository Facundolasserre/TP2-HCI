<template>
  <div class="pantry-form-view">
    <header class="page-header">
      <h1>{{ isEditing ? 'Editar Despensa' : 'Nueva Despensa' }}</h1>
    </header>

    <!-- Error Message -->
    <div v-if="errorMessage" class="error-banner">
      {{ errorMessage }}
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="pantry-form">
      <!-- Name Field -->
      <div class="form-group">
        <label for="name">Nombre *</label>
        <input
          id="name"
          v-model="formData.name"
          type="text"
          placeholder="Ej: Alacena, Refrigerador, Despensa..."
          maxlength="50"
          required
          class="form-input"
          :class="{ 'input-error': errors.name }"
        />
        <span v-if="errors.name" class="error-text">{{ errors.name }}</span>
        <span class="char-count">{{ formData.name.length }}/50</span>
      </div>

      <!-- Metadata Field (Optional JSON) -->
      <div class="form-group">
        <label for="metadata">
          Metadata (opcional)
          <span class="help-text">JSON válido, ej: {"color": "blue", "location": "kitchen"}</span>
        </label>
        <textarea
          id="metadata"
          v-model="metadataText"
          rows="4"
          placeholder='{"color": "blue", "location": "kitchen"}'
          class="form-input"
          :class="{ 'input-error': errors.metadata }"
        ></textarea>
        <span v-if="errors.metadata" class="error-text">{{ errors.metadata }}</span>
      </div>

      <!-- Actions -->
      <div class="form-actions">
        <button type="button" @click="goBack" class="btn-secondary">
          Cancelar
        </button>
        <button type="submit" :disabled="pantriesStore.isLoading" class="btn-primary">
          {{ pantriesStore.isLoading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePantriesStore } from '@/stores/pantries'
import type { PantryCreate, PantryUpdate } from '@/types/pantry'
import { ValidationMessages } from '@/types/pantry'

const router = useRouter()
const route = useRoute()
const pantriesStore = usePantriesStore()

const pantryId = computed(() => {
  const id = route.params.id
  return id ? parseInt(id as string, 10) : null
})

const isEditing = computed(() => pantryId.value !== null)

const formData = reactive({
  name: '',
})

const metadataText = ref('')
const errorMessage = ref('')
const errors = reactive({
  name: '',
  metadata: ''
})

function validateForm(): boolean {
  // Reset errors
  errors.name = ''
  errors.metadata = ''
  errorMessage.value = ''

  // Validate name
  if (!formData.name.trim()) {
    errors.name = ValidationMessages.NAME_REQUIRED
    return false
  }

  if (formData.name.length > 50) {
    errors.name = ValidationMessages.NAME_TOO_LONG
    return false
  }

  // Validate metadata (if provided)
  if (metadataText.value.trim()) {
    try {
      JSON.parse(metadataText.value)
    } catch (e) {
      errors.metadata = ValidationMessages.METADATA_INVALID
      return false
    }
  }

  return true
}

function parseMetadata(): object | null {
  if (!metadataText.value.trim()) return null
  
  try {
    return JSON.parse(metadataText.value)
  } catch (e) {
    return null
  }
}

async function handleSubmit() {
  if (!validateForm()) return

  const metadata = parseMetadata()

  try {
    if (isEditing.value && pantryId.value) {
      // Update existing pantry
      const updateData: PantryUpdate = {
        name: formData.name,
        metadata
      }
      
      await pantriesStore.updatePantry(pantryId.value, updateData)
      alert('✓ Despensa actualizada exitosamente')
      router.push(`/pantries/${pantryId.value}`)
    } else {
      // Create new pantry
      const createData: PantryCreate = {
        name: formData.name,
        metadata
      }
      
      const newPantry = await pantriesStore.createPantry(createData)
      alert('✓ Despensa creada exitosamente')
      router.push(`/pantries/${newPantry.id}`)
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'Error al guardar la despensa'
    console.error('Error saving pantry:', error)
  }
}

function goBack() {
  router.back()
}

async function loadPantry() {
  if (!isEditing.value || !pantryId.value) return

  try {
    const pantry = await pantriesStore.fetchPantryById(pantryId.value)
    
    // Populate form
    formData.name = pantry.name
    
    if (pantry.metadata) {
      metadataText.value = JSON.stringify(pantry.metadata, null, 2)
    }
  } catch (error: any) {
    errorMessage.value = 'Error al cargar la despensa'
    console.error('Error loading pantry:', error)
  }
}

onMounted(() => {
  if (isEditing.value) {
    loadPantry()
  }
})
</script>

<style scoped>
.pantry-form-view {
  padding: 24px;
  max-width: 600px;
  margin: 0 auto;
}

.page-header h1 {
  margin: 0 0 24px;
  font-size: 28px;
  color: #EDEAF6;
}

.error-banner {
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid #ff6b6b;
  color: #ff6b6b;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.pantry-form {
  background: #0E0F1A;
  padding: 32px;
  border-radius: 12px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #EDEAF6;
  font-size: 14px;
}

.help-text {
  font-weight: 400;
  font-size: 12px;
  color: #CFC9E6;
  opacity: 0.7;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #4B5CC7;
  background: #1C1C30;
  color: #fff;
  font-size: 14px;
  font-family: 'Roboto', sans-serif;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #6B7CFF;
}

.form-input.input-error {
  border-color: #ff6b6b;
}

textarea.form-input {
  resize: vertical;
  min-height: 100px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
}

.error-text {
  display: block;
  color: #ff6b6b;
  font-size: 12px;
  margin-top: 4px;
}

.char-count {
  display: block;
  text-align: right;
  font-size: 12px;
  color: #CFC9E6;
  opacity: 0.6;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 32px;
}

.btn-primary,
.btn-secondary {
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(180deg, #7F89FF, #6B7CFF);
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(107, 124, 255, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #322D59;
  color: #fff;
}

.btn-secondary:hover {
  background: #3D3A5C;
}
</style>
