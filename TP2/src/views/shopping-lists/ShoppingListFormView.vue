<template>
  <div class="page">
    <!-- TOPBAR -->
    <header class="topbar">
      <button class="btn-back" @click="goBack" aria-label="Back">
        ← Back
      </button>
      
      <h1 class="page-title">{{ isEditMode ? 'Edit List' : 'Create New List' }}</h1>

      <div class="spacer"></div>
    </header>

    <!-- FORM -->
    <main class="form-container">
      <div class="form-card">
        <form @submit.prevent="handleSubmit">
          <!-- Name -->
          <div class="form-group">
            <label for="name" class="label">
              List Name <span class="required">*</span>
            </label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              class="input"
              :class="{ error: errors.name }"
              placeholder="e.g. Weekly Groceries"
              maxlength="100"
              required
            />
            <div v-if="errors.name" class="error-message">{{ errors.name }}</div>
            <div class="hint">{{ form.name.length }}/100 characters</div>
          </div>

          <!-- Description -->
          <div class="form-group">
            <label for="description" class="label">
              Description
            </label>
            <textarea
              id="description"
              v-model="form.description"
              class="textarea"
              placeholder="Optional description..."
              rows="3"
            ></textarea>
          </div>

          <!-- Recurring -->
          <div class="form-group">
            <label class="checkbox-label">
              <input
                v-model="form.recurring"
                type="checkbox"
                class="checkbox"
              />
              <span class="checkbox-custom"></span>
              <span class="checkbox-text">
                Recurring List
                <span class="checkbox-hint">This list will reset periodically</span>
              </span>
            </label>
          </div>

          <!-- Icon & Color -->
          <div class="form-row">
            <div class="form-group">
              <label class="label">Icon</label>
              <div class="icon-picker">
                <button
                  v-for="icon in iconOptions"
                  :key="icon.value"
                  type="button"
                  class="icon-option"
                  :class="{ selected: form.metadata.icon === icon.value }"
                  @click="form.metadata.icon = icon.value"
                >
                  <img :src="icon.url" :alt="icon.label" />
                </button>
              </div>
            </div>

            <div class="form-group">
              <label class="label">Color</label>
              <div class="color-picker">
                <button
                  v-for="color in colorOptions"
                  :key="color"
                  type="button"
                  class="color-option"
                  :class="{ selected: form.metadata.color === color }"
                  :style="{ backgroundColor: color }"
                  @click="form.metadata.color = color"
                ></button>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="goBack">
              Cancel
            </button>
            <button 
              type="submit" 
              class="btn btn-primary" 
              :disabled="store.isLoading || !isValid"
            >
              <span v-if="store.isLoading" class="spinner-small"></span>
              <span v-else>{{ isEditMode ? 'Save Changes' : 'Create List' }}</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Preview Card -->
      <div class="preview-section">
        <h3 class="preview-title">Preview</h3>
        <div class="preview-card">
          <div class="card-title-wrapper" :style="{ backgroundColor: form.metadata.color }">
            <div class="card-ico">
              <img :src="getSelectedIconUrl()" alt="Preview" />
            </div>
            <h3 class="card-title">{{ form.name || 'List Name' }}</h3>
            <div v-if="form.recurring" class="recurring-badge">🔄 Recurring</div>
          </div>
          
          <div class="card-body">
            <p v-if="form.description" class="card-description">{{ form.description }}</p>
            <p v-else class="card-description placeholder">No description</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useShoppingListsStore } from '@/stores/shoppingLists'
import { useToast } from '@/composables/useToast'
import type { ShoppingListCreate, ShoppingListUpdate } from '@/types/shopping-lists'

const router = useRouter()
const route = useRoute()
const store = useShoppingListsStore()
const toast = useToast()

// Form state
const form = reactive({
  name: '',
  description: '',
  recurring: false,
  metadata: {
    icon: 'shopping_cart.svg',
    color: '#6B7CFF',
  },
})

const errors = reactive({
  name: '',
})

// Icon options
const iconOptions = [
  { value: 'shopping_cart.svg', label: 'Shopping Cart', url: new URL('@/assets/shopping_cart.svg', import.meta.url).href },
  { value: 'family.svg', label: 'Family', url: new URL('@/assets/family.svg', import.meta.url).href },
  { value: 'travel.svg', label: 'Travel', url: new URL('@/assets/travel.svg', import.meta.url).href },
  { value: 'liquor.svg', label: 'Liquor', url: new URL('@/assets/liquor.svg', import.meta.url).href },
]

// Color options
const colorOptions = [
  '#6B7CFF', '#FF6B9D', '#4CAF50', '#FF9800', 
  '#9C27B0', '#00BCD4', '#F44336', '#FF5722',
]

// Computed
const isEditMode = computed(() => !!route.params.id)
const listId = computed(() => {
  const id = route.params.id
  return id ? parseInt(id as string, 10) : null
})

const isValid = computed(() => {
  return form.name.trim().length > 0 && form.name.length <= 100
})

// Methods
const validateForm = (): boolean => {
  errors.name = ''

  if (!form.name.trim()) {
    errors.name = 'List name is required'
    return false
  }

  if (form.name.length > 100) {
    errors.name = 'List name must be 100 characters or less'
    return false
  }

  return true
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  try {
    const data: ShoppingListCreate | ShoppingListUpdate = {
      name: form.name.trim(),
      description: form.description.trim() || '', // Backend requires description (can be empty string)
      recurring: form.recurring,
      metadata: form.metadata,
    }

    if (isEditMode.value && listId.value) {
      // Update existing list
      await store.updateList(listId.value, data)
      toast.success('List updated successfully!')
      router.push(`/lists/${listId.value}`)
    } else {
      // Create new list
      const newList = await store.createList(data as ShoppingListCreate)
      toast.success('List created successfully!')
      router.push(`/lists/${newList.id}`)
    }
  } catch (error: any) {
    // Handle 409 Conflict - duplicate list name
    if (error.status === 409 || error.response?.status === 409) {
      errors.name = 'A list with this name already exists'
      toast.error('A list with this name already exists')
    } else {
      toast.error(error.message || 'Failed to save list')
    }
  }
}

const goBack = () => {
  if (isEditMode.value && listId.value) {
    router.push(`/lists/${listId.value}`)
  } else {
    router.push('/lists')
  }
}

const getSelectedIconUrl = (): string => {
  const icon = iconOptions.find(i => i.value === form.metadata.icon)
  return icon?.url || iconOptions[0].url
}

// Load existing list for edit mode
onMounted(async () => {
  if (isEditMode.value && listId.value) {
    try {
      await store.fetchListById(listId.value)
      const list = store.currentList
      
      if (list) {
        form.name = list.name
        form.description = list.description || ''
        form.recurring = list.recurring || false
        
        // Extract metadata
        if (list.metadata) {
          form.metadata.icon = (list.metadata as any).icon || 'shopping_cart.svg'
          form.metadata.color = (list.metadata as any).color || '#6B7CFF'
        }
      } else {
        toast.error('List not found')
        router.push('/lists')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load list')
      router.push('/lists')
    }
  }
})
</script>

<style scoped>
/* ===== PAGE ===== */
.page {
  min-height: 100vh;
  background: #1C1C30;
  color: #EDEAF6;
  padding: 24px clamp(16px, 4vw, 48px);
}

/* ===== TOPBAR ===== */
.topbar {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 32px;
}

.btn-back {
  height: 44px;
  padding: 0 20px;
  border: none;
  border-radius: 12px;
  background: #322D59;
  color: #EDEAF6;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-back:hover {
  background: #3a3868;
}

.page-title {
  margin: 0;
  font-size: 32px;
  font-weight: 800;
  color: #EDEAF6;
}

.spacer {
  flex: 1;
}

/* ===== FORM CONTAINER ===== */
.form-container {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 32px;
  max-width: 1400px;
  margin: 0 auto;
}

@media (max-width: 1024px) {
  .form-container {
    grid-template-columns: 1fr;
  }
  
  .preview-section {
    order: -1;
  }
}

/* ===== FORM CARD ===== */
.form-card {
  background: #322D59;
  border-radius: 18px;
  padding: 32px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
}

.form-group {
  margin-bottom: 24px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.label {
  display: block;
  font-weight: 700;
  font-size: 14px;
  color: #EDEAF6;
  margin-bottom: 8px;
}

.required {
  color: #FF6B9D;
}

.input,
.textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  background: #201F34;
  color: #EDEAF6;
  font-weight: 600;
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.input:focus,
.textarea:focus {
  border-color: #6B7CFF;
}

.input.error {
  border-color: #FF6B9D;
}

.textarea {
  resize: vertical;
  font-family: inherit;
}

.hint {
  margin-top: 6px;
  font-size: 12px;
  color: #CFC9E6;
  opacity: 0.7;
}

.error-message {
  margin-top: 6px;
  font-size: 13px;
  color: #FF6B9D;
  font-weight: 600;
}

/* ===== CHECKBOX ===== */
.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  user-select: none;
}

.checkbox {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.checkbox-custom {
  width: 22px;
  height: 22px;
  min-width: 22px;
  border-radius: 6px;
  border: 2px solid rgba(255, 255, 255, 0.25);
  background: #0E0F1A;
  transition: all 0.2s ease;
  position: relative;
}

.checkbox:checked + .checkbox-custom {
  background: #6B7CFF;
  border-color: #6B7CFF;
}

.checkbox:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  font-weight: 900;
  font-size: 14px;
}

.checkbox-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-weight: 600;
  color: #EDEAF6;
}

.checkbox-hint {
  font-size: 12px;
  font-weight: 500;
  color: #CFC9E6;
  opacity: 0.7;
}

/* ===== ICON PICKER ===== */
.icon-picker {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.icon-option {
  width: 64px;
  height: 64px;
  border: 2px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  background: #201F34;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-option:hover {
  border-color: #6B7CFF;
  background: #2a2947;
}

.icon-option.selected {
  border-color: #6B7CFF;
  background: #2a2947;
  box-shadow: 0 0 0 2px #6B7CFF;
}

.icon-option img {
  width: 36px;
  height: 36px;
  filter: brightness(0) invert(1);
  opacity: 0.8;
}

/* ===== COLOR PICKER ===== */
.color-picker {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.color-option {
  width: 42px;
  height: 42px;
  border: 3px solid transparent;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.selected {
  border-color: #fff;
  box-shadow: 0 0 0 2px #6B7CFF;
}

/* ===== FORM ACTIONS ===== */
.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 32px;
}

.btn {
  flex: 1;
  height: 48px;
  border: none;
  border-radius: 12px;
  font-weight: 800;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #2B2950;
  color: #EDEAF6;
}

.btn-secondary:hover:not(:disabled) {
  background: #3a3868;
}

.btn-primary {
  background: linear-gradient(180deg, #7F89FF, #6B7CFF);
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(107, 124, 255, 0.4);
}

.spinner-small {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ===== PREVIEW SECTION ===== */
.preview-section {
  position: sticky;
  top: 24px;
  height: fit-content;
}

.preview-title {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 800;
  color: #EDEAF6;
}

.preview-card {
  background: #0E0F1A;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.35);
}

.card-title-wrapper {
  padding: 24px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  position: relative;
}

.recurring-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 10px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
}

.card-ico {
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-ico img {
  width: 64px;
  height: 64px;
  filter: brightness(0) invert(1);
  opacity: 0.9;
}

.card-title {
  margin: 0;
  font-weight: 800;
  color: #fff;
  font-size: 22px;
}

.card-body {
  padding: 20px;
}

.card-description {
  margin: 0;
  color: #CFC9E6;
  font-size: 14px;
  line-height: 1.4;
}

.card-description.placeholder {
  opacity: 0.5;
  font-style: italic;
}
</style>
