<template>
  <teleport to="body">
    <transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click="handleClose">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h2 class="modal-title">{{ productName }}</h2>
            <button class="btn-close" @click="handleClose" :aria-label="t('common.close')">✕</button>
          </div>

          <form class="modal-body" @submit.prevent="handleSubmit">
            <!-- Add product to another list -->
            <div class="form-group">
              <label class="form-label">{{ t('addToListModal.label') }}</label>
              <select v-model="selectedListId" class="form-select" required>
                <option v-for="list in availableLists" :key="list.id" :value="String(list.id)">
                  {{ list.title }}
                </option>
              </select>
            </div>

            <!-- Actions -->
            <div class="modal-actions">
              <button type="submit" class="btn-add" :disabled="!selectedListId">
                {{ t('addToListModal.submit') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useShoppingListsStore } from '@/stores/shoppingLists'
import { useToast } from '@/composables/useToast'
import { useI18n } from '@/composables/useI18n'
import type { Product } from '@/types/lists'

const props = defineProps<{
  modelValue: boolean
  product: Product | null
  currentListId?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'product-added': []
}>()

const shoppingListsStore = useShoppingListsStore()
const toast = useToast()
const { t } = useI18n()

const selectedListId = ref('')

const productName = computed(() => props.product?.name || '')

const lists = computed(() => shoppingListsStore.items)
const availableLists = computed(() =>
  lists.value.filter((list) => String(list.id) !== String(props.currentListId ?? ''))
)

// Set default list when modal opens
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    selectedListId.value = String(availableLists.value[0]?.id || '')
  }
})

watch(availableLists, (lists) => {
  if (!lists.find((list) => String(list.id) === selectedListId.value)) {
    selectedListId.value = String(lists[0]?.id || '')
  }
})

const handleClose = () => {
  emit('update:modelValue', false)
  selectedListId.value = ''
}

const handleSubmit = () => {
  if (!props.product || !selectedListId.value) return

  try {
    shoppingListsStore.addProduct({
      name: props.product.name,
      amount: props.product.amount,
      notes: props.product.notes,
      listId: selectedListId.value,
    })

    const targetList = lists.value.find((list) => String(list.id) === selectedListId.value)
    toast.success(
      t('addToListModal.toast.success', {
        product: props.product.name,
        list: targetList?.name || '',
      })
    )
    emit('product-added')
    handleClose()
  } catch (error: any) {
    toast.error(error.message || t('addToListModal.toast.error'))
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
  max-width: 480px;
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

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 8px;
}

.form-select {
  width: 100%;
  background: #3A3464;
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  color: #FFFFFF;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23FFFFFF' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  padding-right: 40px;
  transition: background 0.2s ease;
}

.form-select:focus {
  background-color: #342D5C;
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

.btn-add:hover:not(:disabled) {
  background: #8B7FE8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(124, 111, 219, 0.4);
}

.btn-add:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
}
</style>
