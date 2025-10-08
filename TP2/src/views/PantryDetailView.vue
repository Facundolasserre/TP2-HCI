<template>
  <div class="pantry-detail-view">
    <!-- Header -->
    <header class="page-header">
      <div>
        <h1>{{ pantry?.name || 'Cargando...' }}</h1>
        <p class="subtitle">Despensa</p>
      </div>
      <div class="header-actions">
        <button @click="goToEdit" class="btn-secondary">Editar</button>
        <button @click="goBack" class="btn-secondary">Volver</button>
      </div>
    </header>

    <!-- Tabs -->
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- TAB 1: ITEMS -->
      <div v-if="activeTab === 'items'" class="tab-panel">
        <div class="panel-header">
          <h2>Productos en Despensa</h2>
          <button @click="showAddItemForm = true" class="btn-primary">+ Agregar Producto</button>
        </div>

        <!-- Add Item Form -->
        <div v-if="showAddItemForm" class="add-item-form">
          <h3>Agregar Producto</h3>
          <div class="form-row">
            <input v-model.number="newItem.product_id" type="number" placeholder="ID Producto" required />
            <input v-model.number="newItem.quantity" type="number" placeholder="Cantidad" step="0.01" required />
            <input v-model="newItem.unit" type="text" placeholder="Unidad (kg, l, u)" required />
            <button @click="handleAddItem" class="btn-primary">Agregar</button>
            <button @click="showAddItemForm = false" class="btn-secondary">Cancelar</button>
          </div>
        </div>

        <!-- Items Table -->
        <div v-if="itemsStore.isLoading" class="loading">Cargando productos...</div>
        <div v-else-if="!itemsStore.hasItems" class="empty">No hay productos en esta despensa</div>
        <table v-else class="items-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Cantidad</th>
              <th>Unidad</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in itemsStore.items" :key="item.id">
              <td><strong>{{ item.product.name }}</strong></td>
              <td>{{ item.product.category?.name || '-' }}</td>
              <td>{{ item.quantity }}</td>
              <td>{{ item.unit }}</td>
              <td class="actions">
                <button @click="startEditItem(item)" class="btn-icon">✏️</button>
                <button @click="confirmDeleteItem(item.id)" class="btn-icon">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Edit Item Modal (Simple) -->
        <div v-if="editingItem" class="modal-overlay" @click.self="editingItem = null">
          <div class="modal">
            <h3>Editar Producto</h3>
            <input v-model.number="editingItem.quantity" type="number" placeholder="Cantidad" step="0.01" />
            <input v-model="editingItem.unit" type="text" placeholder="Unidad" />
            <div class="modal-actions">
              <button @click="handleUpdateItem" class="btn-primary">Guardar</button>
              <button @click="editingItem = null" class="btn-secondary">Cancelar</button>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 2: COMPARTIR -->
      <div v-if="activeTab === 'share'" class="tab-panel">
        <div class="panel-header">
          <h2>Compartir Despensa</h2>
        </div>

        <!-- Share Form -->
        <div class="share-form">
          <input v-model="shareEmail" type="email" placeholder="Email del usuario" class="form-input" />
          <button @click="handleShare" :disabled="!shareEmail" class="btn-primary">Compartir</button>
        </div>

        <!-- Shared Users List -->
        <div class="shared-users">
          <h3>Usuarios con acceso</h3>
          <div v-if="pantriesStore.isLoading" class="loading">Cargando...</div>
          <div v-else-if="sharedUsers.length === 0" class="empty">No compartido con nadie todavía</div>
          <ul v-else class="users-list">
            <li v-for="user in sharedUsers" :key="user.id" class="user-item">
              <span>{{ user.name }} {{ user.surname }} ({{ user.email }})</span>
              <button @click="confirmRevoke(user)" class="btn-danger-sm">Revocar</button>
            </li>
          </ul>
        </div>
      </div>

      <!-- TAB 3: DETALLE -->
      <div v-if="activeTab === 'details'" class="tab-panel">
        <div class="details-grid">
          <div class="detail-item">
            <label>Nombre:</label>
            <span>{{ pantry?.name }}</span>
          </div>
          <div class="detail-item">
            <label>Propietario:</label>
            <span>{{ pantry?.owner.name }} {{ pantry?.owner.surname }}</span>
          </div>
          <div class="detail-item">
            <label>Email Propietario:</label>
            <span>{{ pantry?.owner.email }}</span>
          </div>
          <div class="detail-item">
            <label>Compartida con:</label>
            <span>{{ pantry?.sharedWith?.length || 0 }} persona(s)</span>
          </div>
          <div class="detail-item">
            <label>Fecha Creación:</label>
            <span>{{ formatDate(pantry?.createdAt) }}</span>
          </div>
          <div class="detail-item">
            <label>Última Actualización:</label>
            <span>{{ formatDate(pantry?.updatedAt) }}</span>
          </div>
          <div v-if="pantry?.metadata" class="detail-item full-width">
            <label>Metadata:</label>
            <pre>{{ JSON.stringify(pantry.metadata, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePantriesStore } from '@/stores/pantries'
import { usePantryItemsStore } from '@/stores/pantryItems'
import type { PantryItem, PantryItemCreate, PantryItemUpdate } from '@/types/pantry'
import type { GetUser } from '@/types/user'

const router = useRouter()
const route = useRoute()
const pantriesStore = usePantriesStore()
const itemsStore = usePantryItemsStore()

const pantryId = computed(() => parseInt(route.params.id as string, 10))
const pantry = computed(() => pantriesStore.currentPantry)

const activeTab = ref<'items' | 'share' | 'details'>('items')
const tabs = [
  { id: 'items' as const, label: 'Productos' },
  { id: 'share' as const, label: 'Compartir' },
  { id: 'details' as const, label: 'Detalles' }
]

// Items Tab
const showAddItemForm = ref(false)
const newItem = reactive<PantryItemCreate>({
  product_id: 0,
  quantity: 1,
  unit: 'u'
})
const editingItem = ref<PantryItem | null>(null)

// Share Tab
const shareEmail = ref('')
const sharedUsers = computed(() => pantriesStore.sharedUsers)

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('es-ES')
}

function goToEdit() {
  router.push(`/pantries/${pantryId.value}/edit`)
}

function goBack() {
  router.push('/pantries')
}

// === ITEMS TAB FUNCTIONS ===

async function handleAddItem() {
  try {
    await itemsStore.addItem(pantryId.value, newItem)
    alert('✓ Producto agregado')
    showAddItemForm.value = false
    // Reset form
    newItem.product_id = 0
    newItem.quantity = 1
    newItem.unit = 'u'
    newItem.metadata = undefined
  } catch (error: any) {
    alert(`✗ Error: ${error.message}`)
  }
}

function startEditItem(item: PantryItem) {
  editingItem.value = { ...item }
}

async function handleUpdateItem() {
  if (!editingItem.value) return

  const updateData: PantryItemUpdate = {
    quantity: editingItem.value.quantity,
    unit: editingItem.value.unit,
    metadata: editingItem.value.metadata
  }

  try {
    await itemsStore.updateItem(pantryId.value, editingItem.value.id, updateData)
    alert('✓ Producto actualizado')
    editingItem.value = null
  } catch (error: any) {
    alert(`✗ Error: ${error.message}`)
  }
}

async function confirmDeleteItem(itemId: number) {
  if (!confirm('¿Seguro que deseas eliminar este producto?')) return

  try {
    await itemsStore.removeItem(pantryId.value, itemId)
    alert('✓ Producto eliminado')
  } catch (error: any) {
    alert(`✗ Error: ${error.message}`)
  }
}

// === SHARE TAB FUNCTIONS ===

async function handleShare() {
  if (!shareEmail.value) return

  try {
    await pantriesStore.sharePantry(pantryId.value, shareEmail.value)
    alert('✓ Despensa compartida exitosamente')
    shareEmail.value = ''
    await loadSharedUsers()
  } catch (error: any) {
    alert(`✗ Error: ${error.message}`)
  }
}

async function confirmRevoke(user: GetUser) {
  if (!confirm(`¿Revocar acceso a ${user.name} ${user.surname}?`)) return

  try {
    await pantriesStore.revokeShare(pantryId.value, user.id)
    alert('✓ Acceso revocado')
    await loadSharedUsers()
  } catch (error: any) {
    alert(`✗ Error: ${error.message}`)
  }
}

// === LOAD DATA ===

async function loadPantry() {
  try {
    await pantriesStore.fetchPantryById(pantryId.value)
  } catch (error) {
    alert('Error al cargar la despensa')
    router.push('/pantries')
  }
}

async function loadItems() {
  try {
    await itemsStore.fetchItems(pantryId.value, { page: 1, per_page: 50 })
  } catch (error) {
    console.error('Error loading items:', error)
  }
}

async function loadSharedUsers() {
  try {
    await pantriesStore.fetchSharedUsers(pantryId.value)
  } catch (error) {
    console.error('Error loading shared users:', error)
  }
}

onMounted(async () => {
  await loadPantry()
  await loadItems()
  await loadSharedUsers()
})
</script>

<style scoped>
.pantry-detail-view {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0;
  font-size: 32px;
  color: #EDEAF6;
}

.subtitle {
  margin: 4px 0 0;
  color: #CFC9E6;
  opacity: 0.7;
}

.header-actions {
  display: flex;
  gap: 8px;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 8px;
  border-bottom: 2px solid #322D59;
  margin-bottom: 24px;
}

.tab {
  padding: 12px 24px;
  border: none;
  background: transparent;
  color: #CFC9E6;
  font-weight: 600;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
}

.tab:hover {
  color: #EDEAF6;
}

.tab.active {
  color: #6B7CFF;
  border-bottom-color: #6B7CFF;
}

/* Tab Content */
.tab-content {
  background: #0E0F1A;
  padding: 24px;
  border-radius: 12px;
  min-height: 400px;
}

.tab-panel h2 {
  margin: 0 0 20px;
  color: #EDEAF6;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

/* Add Item Form */
.add-item-form {
  background: #1C1C30;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.add-item-form h3 {
  margin: 0 0 12px;
  color: #EDEAF6;
  font-size: 16px;
}

.form-row {
  display: flex;
  gap: 8px;
}

.form-row input {
  flex: 1;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #4B5CC7;
  background: #0E0F1A;
  color: #fff;
}

/* Items Table */
.items-table {
  width: 100%;
  border-collapse: collapse;
}

.items-table thead {
  background: #322D59;
}

.items-table th {
  padding: 12px;
  text-align: left;
  font-weight: 700;
  color: #EDEAF6;
}

.items-table tbody tr {
  border-bottom: 1px solid #322D59;
}

.items-table tbody tr:hover {
  background: #1A1A2E;
}

.items-table td {
  padding: 12px;
  color: #CFC9E6;
}

.actions {
  display: flex;
  gap: 8px;
}

/* Share Form */
.share-form {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.form-input {
  flex: 1;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #4B5CC7;
  background: #1C1C30;
  color: #fff;
}

/* Users List */
.shared-users h3 {
  margin: 0 0 12px;
  color: #EDEAF6;
  font-size: 18px;
}

.users-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.user-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #1C1C30;
  border-radius: 8px;
  margin-bottom: 8px;
  color: #EDEAF6;
}

.btn-danger-sm {
  padding: 6px 12px;
  background: #ff6b6b;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
}

.btn-danger-sm:hover {
  background: #ff5252;
}

/* Details Grid */
.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-item label {
  font-weight: 600;
  color: #CFC9E6;
  font-size: 14px;
}

.detail-item span,
.detail-item pre {
  color: #EDEAF6;
  font-size: 16px;
}

.detail-item pre {
  background: #1C1C30;
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 13px;
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
  background: #0E0F1A;
  padding: 24px;
  border-radius: 12px;
  min-width: 400px;
}

.modal h3 {
  margin: 0 0 16px;
  color: #EDEAF6;
}

.modal input {
  width: 100%;
  padding: 12px;
  margin-bottom: 12px;
  border-radius: 8px;
  border: 1px solid #4B5CC7;
  background: #1C1C30;
  color: #fff;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

/* Buttons */
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

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(107, 124, 255, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
}

.btn-icon:hover {
  opacity: 0.7;
}

.loading,
.empty {
  text-align: center;
  padding: 40px;
  color: #CFC9E6;
}
</style>
