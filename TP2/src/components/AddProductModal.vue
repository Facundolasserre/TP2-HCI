<template>
  <teleport to="body">
    <transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click="handleClose">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h2 class="modal-title">Add Product</h2>
            <button class="btn-close" @click="handleClose">✕</button>
          </div>

          <form class="modal-body" @submit.prevent="handleSubmit">
            <!-- Name of the Product -->
            <div class="form-group">
              <label class="form-label">Name of the Product</label>
              <input
                v-model="formData.name"
                type="text"
                class="form-input"
                placeholder="Example: Milk, Bread, etc."
                required
              />
            </div>

            <div class="form-row">
              <!-- Amount -->
              <div class="form-group">
                <label class="form-label">Amount</label>
                <div class="amount-input">
                  <input
                    v-model.number="formData.amount"
                    type="number"
                    min="1"
                    class="amount-field"
                  />
                  <div class="amount-buttons">
                    <button
                      type="button"
                      class="btn-amount"
                      @click="formData.amount++"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      class="btn-amount"
                      @click="formData.amount = Math.max(1, formData.amount - 1)"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              </div>

              <!-- Add To Lists -->
              <div class="form-group">
                <label class="form-label">Add To Lists</label>
                <select v-model="formData.listId" class="form-select" required>
                  <option v-for="list in lists" :key="list.id" :value="list.id">
                    {{ list.title }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Notes -->
            <div class="form-group">
              <label class="form-label">Notes</label>
              <textarea
                v-model="formData.notes"
                class="form-textarea"
                rows="4"
                placeholder="Additional notes..."
              />
            </div>

            <!-- Actions -->
            <div class="modal-actions">
              <button type="submit" class="btn-add">Add</button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useListsStore } from '@/stores/lists'
import { useToast } from '@/composables/useToast'

const props = defineProps<{
  modelValue: boolean
  defaultListId?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'product-added': []
}>()

const listsStore = useListsStore()
const toast = useToast()

const formData = ref({
  name: '',
  amount: 1,
  listId: '',
  notes: '',
})

const lists = computed(() => listsStore.allLists)

// Set default list when modal opens
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    formData.value.listId = props.defaultListId || lists.value[0]?.id || ''
  }
})

const handleClose = () => {
  emit('update:modelValue', false)
  resetForm()
}

const handleSubmit = () => {
  try {
    listsStore.addProduct({
      name: formData.value.name,
      amount: formData.value.amount,
      notes: formData.value.notes,
      listId: formData.value.listId,
    })

    toast.success(`${formData.value.name} added successfully!`)
    emit('product-added')
    handleClose()
  } catch (error: any) {
    toast.error(error.message || 'Failed to add product')
  }
}

const resetForm = () => {
  formData.value = {
    name: '',
    amount: 1,
    listId: props.defaultListId || lists.value[0]?.id || '',
    notes: '',
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.modal-container {
  background: #4E4682;
  border-radius: 20px;
  width: 100%;
  max-width: 520px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px 0;
}

.modal-title {
  font-size: 28px;
  font-weight: 700;
  color: #FFFFFF;
  margin: 0;
}

.btn-close {
  background: transparent;
  border: none;
  color: #FFFFFF;
  font-size: 28px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.1);
}

.modal-body {
  padding: 24px 32px 32px;
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 16px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 8px;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  background: #3A3464;
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  color: #FFFFFF;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: background 0.2s ease;
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  background: #342D5C;
}

.form-select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23FFFFFF' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  padding-right: 40px;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.amount-input {
  position: relative;
  display: flex;
  align-items: center;
}

.amount-field {
  width: 100%;
  background: #3A3464;
  border: none;
  border-radius: 8px;
  padding: 12px 48px 12px 16px;
  color: #FFFFFF;
  font-size: 14px;
  outline: none;
  text-align: center;
  appearance: textfield;
  -moz-appearance: textfield;
}

.amount-field::-webkit-outer-spin-button,
.amount-field::-webkit-inner-spin-button {
  -webkit-appearance: none;
  appearance: none;
  margin: 0;
}

.amount-buttons {
  position: absolute;
  right: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.btn-amount {
  background: transparent;
  border: none;
  color: #FFFFFF;
  font-size: 10px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.btn-amount:hover {
  background: rgba(255, 255, 255, 0.1);
}

.modal-actions {
  margin-top: 32px;
  display: flex;
  justify-content: center;
}

.btn-add {
  background: #7C6FDB;
  color: #FFFFFF;
  border: none;
  border-radius: 999px;
  padding: 14px 60px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-add:hover {
  background: #8B7FE8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(124, 111, 219, 0.4);
}

/* Modal transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9);
}

@media (max-width: 600px) {
  .modal-container {
    max-width: 100%;
    border-radius: 16px;
  }

  .modal-header,
  .modal-body {
    padding-left: 20px;
    padding-right: 20px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
