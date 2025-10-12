<template>
  <div class="pantries-view"><!-- Top Navigation Bar - Full Width -->
    <nav class="top-nav">
      <div class="nav-left">
        <button
          class="menu-btn"
          @click="toggleSidebar"
          :aria-label="t('topbar.open_menu')"
        >
          <img :src="IconMenu" alt="Menu" width="24" height="24" />
        </button>
        <div class="nav-title">
          <h1>{{ t('pantries.title') }}</h1>
          <span class="nav-subtitle">{{ t('pantries.subtitle') }}</span>
        </div>

        <!-- Profile Button -->
        <button class="profile-btn" @click="goProfile">
          <img src="@/assets/fonts/account.png" alt="Profile" />
        </button>
      </div>

    </nav>

    <!-- Main Content Area - Full Width -->
    <main class="main-content">
      <!-- Metrics Bar - Full Width -->
      <section class="metrics-bar">
        <div class="metric-item">
          <div class="metric-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/>
              <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/>
            </svg>
          </div>
          <div class="metric-details">
            <span class="metric-label">{{ t('pantries.metrics.total') }}</span>
            <span class="metric-value">{{ totalPantriesCount }}</span>
          </div>
        </div>

        <div class="metric-item">
          <div class="metric-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div class="metric-details">
            <span class="metric-label">{{ t('pantries.metrics.mine') }}</span>
            <span class="metric-value">{{ myPantriesCount }}</span>
          </div>
        </div>

        <div class="metric-item">
          <div class="metric-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div class="metric-details">
            <span class="metric-label">{{ t('pantries.metrics.shared') }}</span>
            <span class="metric-value">{{ sharedPantriesCount }}</span>
          </div>
        </div>

        <div class="metric-item">
          <div class="metric-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
            </svg>
          </div>
          <div class="metric-details">
            <span class="metric-label">{{ t('pantries.metrics.items') }}</span>
            <span class="metric-value">0</span>
          </div>
        </div>
      </section>

      <!-- Toolbar - Full Width -->
      <section class="toolbar">
        <div class="toolbar-left">
          <!-- Filter Tabs -->
          <div class="filter-tabs">
            <button 
              :class="['tab', { active: ownerFilter === undefined }]"
              @click="ownerFilter = undefined"
            >
              {{ t('pantries.filters.all') }}
            </button>
            <button 
              :class="['tab', { active: ownerFilter === true }]"
              @click="ownerFilter = true"
            >
              {{ t('pantries.filters.mine') }}
            </button>
            <button 
              :class="['tab', { active: ownerFilter === false }]"
              @click="ownerFilter = false"
            >
              {{ t('pantries.filters.shared') }}
            </button>
          </div>

          <!-- Search & Create Pantry -->
          <div class="toolbar-center">
            <div class="search-box">
              <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                :placeholder="t('pantries.search_placeholder')"
                class="search-input"
              />
            </div>
            <button class="btn-primary" @click="openCreateModal">
              {{ t('pantries.new_button') }}
            </button>

          </div>
        </div>
        <div class="toolbar-right">
          <!-- View Toggle -->
          <div class="view-toggle">
            <button 
              :class="['view-btn', { active: viewMode === 'table' }]"
              @click="viewMode = 'table'"
              :title="t('pantries.view.table')"
            >
              <img :src="IconLists" alt="Table view" width="18" height="18" />
            </button>
            <button 
              :class="['view-btn', { active: viewMode === 'grid' }]"
              @click="viewMode = 'grid'"
              :title="t('pantries.view.grid')"
            >
              <img :src="IconGridView" alt="Grid view" width="18" height="18" />
            </button>
          </div>

          <!-- Sort -->
          <select v-model="sortBy" @change="loadPantries" class="sort-select">
            <option value="name">{{ t('pantries.sort.name') }}</option>
            <option value="createdAt">{{ t('pantries.sort.created') }}</option>
            <option value="updatedAt">{{ t('pantries.sort.updated') }}</option>
          </select>

          <button
            class="sort-order-btn"
            @click="toggleSortOrder"
            :title="sortOrder === 'ASC' ? t('common.ascending') : t('common.descending')"
          >
            <svg v-if="sortOrder === 'ASC'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m3 8 4-4 4 4"/>
              <path d="M7 4v16"/>
            </svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m21 16-4 4-4-4"/>
              <path d="M17 20V4"/>
            </svg>
          </button>
        </div>
      </section>

      <!-- Pantries Content - Full Width -->
      <section class="pantries-section">
        <!-- Loading -->
        <div v-if="pantriesStore.isLoading" class="state-container">
          <div class="spinner"></div>
          <p>{{ t('pantries.loading') }}</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredPantries.length === 0" class="state-container empty">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/>
            <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/>
            <path d="M12 3v6"/>
          </svg>
          <h3>{{ t('pantries.empty.title') }}</h3>
          <p>{{ searchQuery ? t('pantries.empty.search_hint') : t('pantries.empty.create_hint') }}</p>
          <button class="btn-primary" @click="openCreateModal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            {{ t('pantries.new_button') }}
          </button>
        </div>

        <!-- Table View -->
        <DataTable
          v-else-if="viewMode === 'table'"
          :columns="tableColumns"
          :items="filteredPantries"
          :loading="pantriesStore.isLoading"
          row-key="id"
          :row-clickable="true"
          @row-click="goToDetail"
        >
          <template #cell-name="{ item }">
            <div class="name-cell">
              <div class="pantry-icon-small">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/>
                  <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/>
                </svg>
              </div>
              <div class="name-content">
                <span class="pantry-name-text">{{ item.name }}</span>
                <span v-if="isSharedWithMe(item)" class="badge-mini">{{ t('pantries.shared.badge') }}</span>
              </div>
            </div>
          </template>

          <template #cell-owner="{ item }">
            <div class="owner-cell">
              <div class="avatar">{{ getInitials(item.owner) }}</div>
              <span>{{ item.owner.name }} {{ item.owner.surname }}</span>
            </div>
          </template>

          <template #cell-sharedWith="{ item }">
            <div class="shared-cell">
              <template v-if="item.sharedWith && item.sharedWith.length > 0">
                <div class="avatars-stack">
                  <div v-for="(user, idx) in item.sharedWith.slice(0, 3)" :key="user.id" class="avatar-small" :style="{ zIndex: 10 - idx }">
                    {{ getInitials(user) }}
                  </div>
                  <span v-if="item.sharedWith.length > 3" class="more-count">+{{ item.sharedWith.length - 3 }}</span>
                </div>
                <span class="count-text">{{ sharedPeopleLabel(item.sharedWith.length) }}</span>
              </template>
              <span v-else class="text-muted">—</span>
            </div>
          </template>

          <template #cell-updatedAt="{ value }">
            <span class="date-cell">{{ formatDate(value) }}</span>
          </template>

          <template #actions="{ item }">
            <div class="table-actions">
              <button 
              class="btn-icon-sm"
              @click.stop="goToEdit(item.id)"
              :title="t('pantries.actions.edit')"
            >
                <img :src="IconEdit" alt="Edit" width="16" height="16" />
              </button>
              <button 
              class="btn-icon-sm btn-danger"
              @click.stop="confirmDelete(item)"
              :title="t('pantries.actions.delete')"
            >
                <img :src="IconDelete" alt="Delete" width="16" height="16" />
              </button>
            </div>
          </template>

          <template #empty>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/>
              <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/>
            </svg>
            <p>{{ t('pantries.empty.title') }}</p>
          </template>
        </DataTable>

        <!-- Grid View -->
        <div v-else class="pantries-grid">
          <div 
            v-for="pantry in filteredPantries" 
            :key="pantry.id"
            class="pantry-card"
            @click="goToDetail(pantry.id)"
          >
            <div class="card-header">
              <div class="card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/>
                  <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/>
                </svg>
              </div>
              <div class="card-actions">
                <button
                  class="btn-icon-xs"
                  @click.stop="goToEdit(pantry.id)"
                  :title="t('pantries.actions.edit')"
                >
                  <img :src="IconEdit" alt="Edit" width="14" height="14" />
                </button>
                <button
                  class="btn-icon-xs btn-danger"
                  @click.stop="confirmDelete(pantry)"
                  :title="t('pantries.actions.delete')"
                >
                  <img :src="IconDelete" alt="Delete" width="14" height="14" />
                </button>
              </div>
            </div>

            <div class="card-content">
              <h3 class="card-title">{{ pantry.name }}</h3>
              
              <div class="card-info">
                <div class="info-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <span>{{ pantry.owner.name }} {{ pantry.owner.surname }}</span>
                </div>

                <div v-if="pantry.sharedWith && pantry.sharedWith.length > 0" class="info-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  <span>{{ t('pantries.shared.count', { count: pantry.sharedWith.length }) }}</span>
                </div>

                <div class="info-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
              <span>{{ formatDate(pantry.updatedAt) }}</span>
                </div>
              </div>

            <span v-if="isSharedWithMe(pantry)" class="card-badge">{{ t('pantries.shared.badge_with_you') }}</span>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Create/Edit Modal -->
    <Modal
      :open="showPantryModal"
      :title="editingPantry ? t('pantries.form.modal.edit_title') : t('pantries.form.modal.create_title')"
      size="md"
      @close="closePantryModal"
    >
      <form @submit.prevent="savePantry" class="pantry-form">
        <div class="form-group">
          <label for="pantry-name" class="form-label">
            {{ t('pantries.form.name_label') }} <span class="required">*</span>
          </label>
          <input
            id="pantry-name"
            v-model="pantryForm.name"
            type="text"
            class="form-input"
            :placeholder="t('pantries.form.name_placeholder')"
            maxlength="100"
            required
          />
          <span class="form-hint">{{ t('pantries.form.name_hint') }}</span>
        </div>
      </form>

      <template #footer>
        <button type="button" class="btn-secondary" @click="closePantryModal">
          {{ t('common.cancel') }}
        </button>
        <button type="button" class="btn-primary" @click="savePantry" :disabled="isSaving">
          {{ isSaving ? t('common.saving') : (editingPantry ? t('common.update') : t('common.create')) }}
        </button>
      </template>
    </Modal>

    <!-- Delete Confirmation Modal -->
    <Modal
      :open="showDeleteModal"
      :title="t('pantries.delete.title')"
      size="sm"
      @close="cancelDelete"
    >
      <p class="modal-text">
        {{ t('pantries.delete.message', { name: pantryToDelete?.name || '' }) }}
      </p>
      <p class="modal-warning">{{ t('pantries.delete.warning') }}</p>

      <template #footer>
        <button type="button" class="btn-secondary" @click="cancelDelete">
          {{ t('common.cancel') }}
        </button>
        <button type="button" class="btn-danger" @click="executeDelete" :disabled="isDeleting">
          {{ isDeleting ? t('common.deleting') : t('pantries.delete.confirm') }}
        </button>
      </template>
    </Modal>

    <!-- Sidebar -->
    <Sidebar
      :open="sidebarOpen"
      active="pantries"
      @close="closeSidebar"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePantriesStore } from '@/stores/pantries'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import type { Pantry } from '@/types/pantry'
import type { GetUser } from '@/types/user'
import Sidebar from '@/components/layout/Sidebar.vue'
import DataTable from '@/components/ui/DataTable.vue'
import Modal from '@/components/common/Modal.vue'
import { useI18n } from '@/composables/useI18n'
import { useLanguageStore } from '@/stores/language'
import { formatDateOnlyBuenosAires } from '@/utils/dateFormatter'
import IconMenu from '@/assets/menu.svg'
import IconEdit from '@/assets/edit.svg'
import IconDelete from '@/assets/delete.svg'
import IconGridView from '@/assets/grid_view.svg'
import IconLists from '@/assets/lists.svg'

const router = useRouter()
const pantriesStore = usePantriesStore()
const authStore = useAuthStore()
const toast = useToast()
const { t } = useI18n()
const languageStore = useLanguageStore()


function goProfile() {
  router.push('/profile');
}
// State
const sidebarOpen = ref(false)
const searchQuery = ref('')
const ownerFilter = ref<boolean | undefined>(undefined)
const sortBy = ref<'name' | 'createdAt' | 'updatedAt'>('updatedAt')
const sortOrder = ref<'ASC' | 'DESC'>('DESC')
const viewMode = ref<'table' | 'grid'>('table')

// Modal states
const showPantryModal = ref(false)
const showDeleteModal = ref(false)
const editingPantry = ref<Pantry | null>(null)
const pantryToDelete = ref<Pantry | null>(null)
const isSaving = ref(false)
const isDeleting = ref(false)

// Form state
const pantryForm = ref({
  name: ''
})

// Table columns
const tableColumns = computed(() => [
  { key: 'name', label: t('pantries.table.name'), sortable: true },
  { key: 'owner', label: t('pantries.table.owner'), sortable: false },
  { key: 'sharedWith', label: t('pantries.table.sharedWith'), sortable: false },
  { key: 'updatedAt', label: t('pantries.table.updatedAt'), sortable: true },
])

// Computed
const totalPantriesCount = computed(() => pantriesStore.items.length)

const myPantriesCount = computed(() => {
  const currentUserId = authStore.user?.id
  return pantriesStore.items.filter(p => p.owner.id === currentUserId).length
})

const sharedPantriesCount = computed(() => {
  const currentUserId = authStore.user?.id
  return pantriesStore.items.filter(p => p.owner.id !== currentUserId).length
})

const filteredPantries = computed(() => {
  let result = pantriesStore.items

  // Filter by search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(p => p.name.toLowerCase().includes(query))
  }

  // Filter by owner
  if (ownerFilter.value !== undefined) {
    const currentUserId = authStore.user?.id
    if (ownerFilter.value) {
      result = result.filter(p => p.owner.id === currentUserId)
    } else {
      result = result.filter(p => p.owner.id !== currentUserId)
    }
  }

  return result
})

// Methods
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const closeSidebar = () => {
  sidebarOpen.value = false
}

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'ASC' ? 'DESC' : 'ASC'
  loadPantries()
}

const isSharedWithMe = (pantry: Pantry): boolean => {
  const currentUserId = authStore.user?.id
  return pantry.owner.id !== currentUserId
}

const getInitials = (user: GetUser): string => {
  return `${user.name[0]}${user.surname[0]}`.toUpperCase()
}

const sharedPeopleLabel = (count: number): string => {
  return count === 1
    ? t('pantries.shared.person_one')
    : t('pantries.shared.person_other', { count })
}

const formatDate = (dateStr: string): string => {
  const locale = languageStore.language === 'es' ? 'es-AR' : 'en-US'
  return formatDateOnlyBuenosAires(dateStr, locale)
}

const goToDetail = (id: number) => {
  router.push(`/pantries/${id}`)
}

const goToEdit = (id: number) => {
  router.push(`/pantries/${id}/edit`)
}

const goToProfile = () => {
  router.push('/profile')
}

// Modal methods
const openCreateModal = () => {
  editingPantry.value = null
  pantryForm.value = { name: '' }
  showPantryModal.value = true
}

const closePantryModal = () => {
  showPantryModal.value = false
  editingPantry.value = null
  pantryForm.value = { name: '' }
}

const savePantry = async () => {
  if (!pantryForm.value.name.trim()) {
    toast.error(t('pantries.toast.name_required'))
    return
  }

  isSaving.value = true

  try {
    if (editingPantry.value) {
      await pantriesStore.updatePantry(editingPantry.value.id, { name: pantryForm.value.name.trim() })
      toast.success(t('pantries.toast.update_success'))
    } else {
      await pantriesStore.createPantry({ name: pantryForm.value.name.trim() })
      toast.success(t('pantries.toast.create_success'))
    }

    closePantryModal()
    loadPantries()
  } catch (error: any) {
    toast.error(
      error.message ||
      t(editingPantry.value ? 'pantries.toast.update_error' : 'pantries.toast.create_error')
    )
  } finally {
    isSaving.value = false
  }
}

const confirmDelete = (pantry: Pantry) => {
  pantryToDelete.value = pantry
  showDeleteModal.value = true
}

const cancelDelete = () => {
  showDeleteModal.value = false
  pantryToDelete.value = null
}

const executeDelete = async () => {
  if (!pantryToDelete.value) return

  isDeleting.value = true

  try {
    await pantriesStore.deletePantry(pantryToDelete.value.id)
    toast.success(t('pantries.toast.delete_success'))
    showDeleteModal.value = false
    pantryToDelete.value = null
    loadPantries()
  } catch (error: any) {
    toast.error(error.message || t('pantries.toast.delete_error'))
  } finally {
    isDeleting.value = false
  }
}

const loadPantries = async () => {
  try {
    await pantriesStore.fetchPantries({
      page: 1,
      per_page: 100,
      sort_by: sortBy.value,
      order: sortOrder.value
    })
  } catch (error: any) {
    console.error('Error loading pantries:', error)
    toast.error(error.message || t('pantries.toast.load_error'))
  }
}

// Lifecycle
onMounted(async () => {
  await loadPantries()
})
</script>

<style scoped>



.search-bar {
  width: 320px;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.btn-primary {
  padding: 10px 18px;
  border: none;
  border-radius: 8px;
  background-color: var(--brand, #8b7cff);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.25s ease;
}

.btn-primary:hover {
  background-color: #6e61ff;
}
/* ============================================
   FULL-SCREEN WEB LAYOUT - NO MOBILE PADDING
   ============================================ */

.pantries-view {
  min-height: 100vh;
  background: #1C1C30;
  color: #EDEAF6;
  display: flex;
  flex-direction: column;
}

/* ==================== TOP NAVIGATION ==================== */
.top-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #322D59;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0 32px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.menu-btn {
  width: 44px;
  height: 44px;
  background: rgba(107, 124, 255, 0.1);
  border: 1px solid rgba(107, 124, 255, 0.2);
  border-radius: 10px;
  color: #EDEAF6;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.menu-btn img {
  filter: brightness(0) saturate(100%) invert(92%) sepia(6%) saturate(488%) hue-rotate(201deg) brightness(101%) contrast(94%);
}

.menu-btn:hover {
  background: rgba(107, 124, 255, 0.2);
  border-color: rgba(107, 124, 255, 0.4);
  transform: scale(1.05);
}

.nav-title h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #EDEAF6;
  line-height: 1.2;
}

.nav-subtitle {
  display: block;
  font-size: 13px;
  color: #CFC9E6;
  opacity: 0.7;
  margin-top: 2px;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-primary {
  background: linear-gradient(135deg, #6B7CFF 0%, #5B5DD9 100%);
  color: #FFFFFF;
  border: none;
  border-radius: 10px;
  padding: 12px 24px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(107, 124, 255, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* ==================== MAIN CONTENT ==================== */
.main-content {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
}

/* ==================== METRICS BAR - FULL WIDTH ==================== */
.metrics-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.metric-item {
  background: #322D59;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s ease;
}

.metric-item:hover {
  border-color: rgba(107, 124, 255, 0.3);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.metric-icon {
  width: 64px;
  height: 64px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #FFFFFF;
}

.metric-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metric-label {
  font-size: 13px;
  font-weight: 600;
  color: #CFC9E6;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-value {
  font-size: 36px;
  font-weight: 700;
  color: #EDEAF6;
  line-height: 1;
}

/* ==================== TOOLBAR - FULL WIDTH ==================== */
.toolbar {
  background: #322D59;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1 1 0;
  min-width: 0;
  justify-content: flex-start;
}

.toolbar-center {
  flex: 2;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
  min-width: 0;
  padding-right: 24px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1 1 0;
  min-width: 0;
  justify-content: flex-end;
}

/* Filter Tabs */
.filter-tabs {
  display: flex;
  gap: 8px;
  background: rgba(28, 28, 48, 0.5);
  border-radius: 10px;
  padding: 4px;
}

.tab {
  background: transparent;
  border: none;
  color: #CFC9E6;
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.tab:hover {
  color: #EDEAF6;
  background: rgba(107, 124, 255, 0.1);
}

.tab.active {
  background: linear-gradient(135deg, #6B7CFF 0%, #5B5DD9 100%);
  color: #FFFFFF;
  box-shadow: 0 2px 8px rgba(107, 124, 255, 0.3);
}

/* Search Box */
.search-box {
  position: relative;
  flex-shrink: 1;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #CFC9E6;
  opacity: 0.6;
  pointer-events: none;
}

.search-input {
  width: 100%;
  background: rgba(28, 28, 48, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 10px 14px 10px 42px;
  color: #EDEAF6;
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;
}

.search-input::placeholder {
  color: #9A94B8;
}

.search-input:focus {
  border-color: #6B7CFF;
  background: rgba(107, 124, 255, 0.05);
  box-shadow: 0 0 0 3px rgba(107, 124, 255, 0.1);
}

/* View Toggle */
.view-toggle {
  display: flex;
  gap: 4px;
  background: rgba(28, 28, 48, 0.5);
  border-radius: 8px;
  padding: 4px;
}

.view-btn {
  background: transparent;
  border: none;
  color: #CFC9E6;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.view-btn img {
  filter: brightness(0) saturate(100%) invert(85%) sepia(8%) saturate(670%) hue-rotate(201deg) brightness(98%) contrast(91%);
  transition: filter 0.2s ease;
}

.view-btn:hover {
  background: rgba(107, 124, 255, 0.1);
  color: #EDEAF6;
}

.view-btn:hover img {
  filter: brightness(0) saturate(100%) invert(92%) sepia(6%) saturate(488%) hue-rotate(201deg) brightness(101%) contrast(94%);
}

.view-btn.active {
  background: rgba(107, 124, 255, 0.2);
  color: #6B7CFF;
}

.view-btn.active img {
  filter: brightness(0) saturate(100%) invert(55%) sepia(68%) saturate(2458%) hue-rotate(220deg) brightness(101%) contrast(101%);
}

/* Sort Controls */
.sort-select {
  background: rgba(28, 28, 48, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 10px 14px;
  color: #EDEAF6;
  font-size: 14px;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;
}

.sort-select:hover {
  border-color: rgba(107, 124, 255, 0.3);
}

.sort-select:focus {
  border-color: #6B7CFF;
  box-shadow: 0 0 0 3px rgba(107, 124, 255, 0.1);
}

.sort-order-btn {
  background: rgba(28, 28, 48, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  width: 40px;
  height: 40px;
  color: #CFC9E6;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.sort-order-btn:hover {
  background: rgba(107, 124, 255, 0.1);
  border-color: rgba(107, 124, 255, 0.3);
  color: #EDEAF6;
}

/* ==================== PANTRIES SECTION ==================== */
.pantries-section {
  min-height: 400px;
}

/* State Container */
.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  text-align: center;
  color: #CFC9E6;
}

.state-container.empty svg {
  color: #6B7CFF;
  opacity: 0.3;
  margin-bottom: 24px;
}

.state-container h3 {
  margin: 0 0 12px 0;
  font-size: 24px;
  font-weight: 700;
  color: #EDEAF6;
}

.state-container p {
  margin: 0 0 32px 0;
  font-size: 15px;
  color: #CFC9E6;
  opacity: 0.8;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(107, 124, 255, 0.2);
  border-top-color: #6B7CFF;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ==================== TABLE CUSTOMIZATION ==================== */
.name-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pantry-icon-small {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, rgba(107, 124, 255, 0.2) 0%, rgba(91, 93, 217, 0.2) 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6B7CFF;
  flex-shrink: 0;
}

.name-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pantry-name-text {
  font-weight: 600;
  color: #EDEAF6;
}

.badge-mini {
  background: rgba(76, 175, 80, 0.15);
  color: #4CAF50;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.owner-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.shared-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatars-stack {
  display: flex;
  align-items: center;
}

.avatar-small {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  border: 2px solid #322D59;
  margin-left: -8px;
}

.avatar-small:first-child {
  margin-left: 0;
}

.more-count {
  background: rgba(107, 124, 255, 0.2);
  color: #6B7CFF;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  margin-left: 4px;
}

.count-text {
  font-size: 13px;
  color: #CFC9E6;
}

.text-muted {
  color: #9A94B8;
  font-style: italic;
}

.date-cell {
  color: #CFC9E6;
  font-size: 14px;
}

/* Table Actions */
.table-actions {
  display: flex;
  gap: 6px;
  align-items: center;
}

.btn-icon-sm {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  width: 32px;
  height: 32px;
  color: #EDEAF6;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-icon-sm img {
  filter: brightness(0) saturate(100%) invert(92%) sepia(6%) saturate(488%) hue-rotate(201deg) brightness(101%) contrast(94%);
}

.btn-icon-sm:hover {
  background: rgba(107, 124, 255, 0.15);
  border-color: rgba(107, 124, 255, 0.4);
  transform: scale(1.05);
}

.btn-icon-sm.btn-danger:hover {
  background: rgba(244, 67, 54, 0.15);
  border-color: rgba(244, 67, 54, 0.4);
  color: #F44336;
}

.btn-icon-sm.btn-danger:hover img {
  filter: brightness(0) saturate(100%) invert(40%) sepia(89%) saturate(6145%) hue-rotate(348deg) brightness(96%) contrast(92%);
}

/* ==================== GRID VIEW ==================== */
.pantries-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.pantry-card {
  background: #322D59;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.pantry-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.pantry-card:hover {
  border-color: rgba(107, 124, 255, 0.4);
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
}

.pantry-card:hover::before {
  opacity: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-icon {
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg, rgba(107, 124, 255, 0.2) 0%, rgba(91, 93, 217, 0.2) 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6B7CFF;
}

.card-actions {
  display: flex;
  gap: 6px;
}

.btn-icon-xs {
  background: rgba(28, 28, 48, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  width: 28px;
  height: 28px;
  color: #EDEAF6;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-icon-xs img {
  filter: brightness(0) saturate(100%) invert(92%) sepia(6%) saturate(488%) hue-rotate(201deg) brightness(101%) contrast(94%);
}

.btn-icon-xs:hover {
  background: rgba(107, 124, 255, 0.2);
  border-color: rgba(107, 124, 255, 0.4);
}

.btn-icon-xs.btn-danger:hover {
  background: rgba(244, 67, 54, 0.2);
  border-color: rgba(244, 67, 54, 0.4);
  color: #F44336;
}

.btn-icon-xs.btn-danger:hover img {
  filter: brightness(0) saturate(100%) invert(40%) sepia(89%) saturate(6145%) hue-rotate(348deg) brightness(96%) contrast(92%);
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #EDEAF6;
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #CFC9E6;
}

.info-item svg {
  flex-shrink: 0;
  opacity: 0.7;
}

.card-badge {
  background: rgba(76, 175, 80, 0.15);
  color: #4CAF50;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  width: fit-content;
}

/* ==================== MODAL STYLES ==================== */
.pantry-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: #EDEAF6;
}

.form-label .required {
  color: #F44336;
  margin-left: 2px;
}

.form-input {
  background: #1C1C30;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px 16px;
  color: #EDEAF6;
  font-size: 15px;
  outline: none;
  transition: all 0.2s ease;
}

.form-input:focus {
  border-color: #6B7CFF;
  box-shadow: 0 0 0 3px rgba(107, 124, 255, 0.1);
}

.form-hint {
  font-size: 13px;
  color: #9A94B8;
}

.btn-secondary {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 10px 20px;
  color: #EDEAF6;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.3);
}

.btn-danger {
  background: linear-gradient(135deg, #F44336 0%, #D32F2F 100%);
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  color: #FFFFFF;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-danger:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
}

.btn-danger:disabled,
.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.modal-text {
  font-size: 15px;
  color: #EDEAF6;
  margin: 0 0 12px 0;
  line-height: 1.6;
}

.modal-warning {
  font-size: 14px;
  color: #FFB74D;
  margin: 0;
  padding: 12px;
  background: rgba(255, 152, 0, 0.1);
  border-left: 3px solid #FFB74D;
  border-radius: 4px;
}

/* ==================== RESPONSIVE ==================== */
@media (max-width: 1400px) {
  .main-content {
    padding: 24px;
  }

  .metrics-bar {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 1024px) {
  .top-nav {
    padding: 0 24px;
  }

  .main-content {
    padding: 20px;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-left {
    min-width: 100%;
    flex-direction: column;
  }

  .toolbar-center {
    justify-content: flex-start;
    width: 100%;
    margin-top: 12px;
  }

  .toolbar-right {
    justify-content: space-between;
  }

  .search-wrapper {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .create-pantry-btn {
    margin-left: 0;
  }

  .pantries-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .top-nav {
    padding: 0 16px;
    height: 60px;
  }

  .nav-title h1 {
    font-size: 18px;
  }

  .nav-subtitle {
    font-size: 12px;
  }

  .main-content {
    padding: 16px;
  }

  .metrics-bar {
    grid-template-columns: 1fr;
  }

  .metric-item {
    padding: 20px;
  }

  .metric-value {
    font-size: 32px;
  }

  .filter-tabs {
    width: 100%;
  }

  .tab {
    flex: 1;
    padding: 8px 12px;
    font-size: 13px;
  }

  .view-toggle,
  .sort-select,
  .sort-order-btn {
    flex: 1;
  }

  .pantries-grid {
    grid-template-columns: 1fr;
  }
}


.profile-btn {
  position: absolute;
  top: 18px;
  right: 32px;
  z-index: 1100;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--bg);
  border: 2px solid var(--ink);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.15s;
}
.profile-btn img {
  width: 28px;
  height: 28px;
  object-fit: contain;
  filter: brightness(0) invert(1);
}
.profile-btn:hover {
  opacity: 0.8;
  transform: scale(1.07);
}
@media (max-width: 600px) {
  .profile-btn {
    top: 12px;
    right: 16px;
    width: 38px;
    height: 38px;
    padding: 4px;
  }
}
.layout-topbar {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: var(--bg);
  padding: 10px 0;
  min-height: 64px;
  display: flex;
  align-items: center;
  position: relative;
}


</style>
