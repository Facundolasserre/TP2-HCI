<template>
<Teleport to="body">
    <div class="overlay" @click.self="$emit('close')">
      <section class="panel">
        <!-- Header sólo con close (sin título grande) -->
        <button class="x" @click="$emit('close')" :aria-label="t('common.close')">✕</button>

        <!-- Search (pill con icono a la derecha) -->
        <div class="search-wrap">
          <input class="search" v-model.trim="q" :placeholder="t('shareModal.search_placeholder')" />
        </div>

        <!-- List -->
        <div class="list">
          <div v-if="loading" class="loading">{{ t('common.loading') }}</div>
          <div v-else>
            <!-- Owner Section -->
            <div class="section-header">{{ t('shareModal.owner') }}</div>
            <div class="member-row owner-row">
              <div class="l">
                <span class="nm">{{ props.owner.name }} {{ props.owner.surname || '' }}</span>
              </div>
              <div class="r">
                <span class="badge owner">{{ t('shareModal.role.owner') }}</span>
              </div>
            </div>

            <!-- Members Section -->
            <div v-if="filtered.length > 0" class="section-header" style="margin-top: 16px;">{{ t('shareModal.members') }}</div>
            <div class="member-row" v-for="m in filtered" :key="m.id">
              <div class="l">
                <span class="nm">{{ m.name }}</span>
              </div>
              <div class="r">
                <span class="badge member">{{ t('shareModal.role.member') }}</span>
                <button class="btn-menu" @click="toggleMenu(m.id)">⋮</button>
                <div v-if="openMenuId === m.id" class="menu-dropdown">
                  <ul>
                    <li class="danger" @click="remove(m.id)">{{ t('shareModal.actions.remove') }}</li>
                  </ul>
                </div>
              </div>
            </div>

            <p v-if="filtered.length===0 && !loading" class="empty">{{ t('shareModal.empty') }}</p>
          </div>
        </div>

        <!-- Footer: botón centrado -->
        <footer class="footer">
      <button class="btn-add" @click="addMember">
        <span class="icon-plus">{{ t('shareModal.add_button') }}</span>
      </button>

    <!-- El modal AddMember va afuera -->
      <AddMember
        v-if="showAdd"
        @close="showAdd = false"
        @save="onAddSave"
      />
</footer>
      </section>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { useToast } from '@/composables/useToast'
import AddMember from '@/components/members/AddMember.vue'
import * as shoppingListsService from '@/api/shopping-lists.service'

type User = {
  id: number
  email: string
  name: string
  surname?: string
  updatedAt?: string
  createdAt?: string
}

const props = defineProps<{
  listId: number
  listName: string
  owner: User
}>()

const emit = defineEmits<{ (e:'close'): void }>()

const { t } = useI18n()
const toast = useToast()

const q = ref('')
const openMenuId = ref<string|null>(null)
const showAdd = ref(false)

type SharedUser = {
  id: number
  email: string
  name: string
  surname?: string
  updatedAt?: string
  createdAt?: string
}

const sharedUsers = ref<SharedUser[]>([])
const loading = ref(false)

// Load shared users when modal opens
onMounted(async () => {
  await loadSharedUsers()
})

async function loadSharedUsers() {
  if (!props.listId) return
  
  loading.value = true
  try {
    const users = await shoppingListsService.getSharedUsers(props.listId)
    sharedUsers.value = users as SharedUser[]
  } catch (error) {
    console.error('Error loading shared users:', error)
  } finally {
    loading.value = false
  }
}

type AddMemberPayload = {
  email: string
  role: 'Owner' | 'Member'
  notes: string
}

async function onAddSave(payload: AddMemberPayload) {
  if (!props.listId) {
    toast.error(t('shareModal.toast.share_error'))
    return
  }

  try {
    await shoppingListsService.shareList(props.listId, payload.email)
    toast.success(t('shareModal.toast.shared', { email: payload.email }))
    
    // Reload shared users
    await loadSharedUsers()
    showAdd.value = false
  } catch (error: any) {
    console.error('Error sharing list:', error)
    
    if (error.response?.status === 404) {
      toast.error(t('shareModal.toast.user_not_found'))
    } else {
      toast.error(t('shareModal.toast.share_error'))
    }
  }
}

const filtered = computed(()=>{
  const text = q.value.toLowerCase()
  return sharedUsers.value.filter(user => {
    const byText = !text || 
      user.name.toLowerCase().includes(text) || 
      user.surname?.toLowerCase().includes(text)
    return byText
  }).map(user => ({
    id: String(user.id),
    name: `${user.name} ${user.surname || ''}`.trim(),
    role: 'Member',
    state: 'all'
  }))
})

function toggleMenu(id: string){ openMenuId.value = openMenuId.value === id ? null : id }

async function remove(id: string){
  if (!props.listId) {
    toast.error(t('shareModal.toast.remove_error'))
    return
  }

  try {
    await shoppingListsService.revokeShare(props.listId, parseInt(id))
    toast.success(t('shareModal.toast.removed'))
    
    // Reload shared users
    await loadSharedUsers()
    openMenuId.value = null
  } catch (error) {
    console.error('Error removing user:', error)
    toast.error(t('shareModal.toast.remove_error'))
  }
}

function addMember() {
  if (!props.listId) {
    toast.error(t('shareModal.toast.share_error'))
    return
  }

  showAdd.value = true
}
</script>

<style scoped>
/* ===== Overlay oscuro + blur ===== */
.overlay{
  position: fixed; inset:0;
  background: rgba(0,0,0,.55);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display:grid; place-items:center;
  z-index: 2100;
}

/* ===== Panel modal ===== */
/* Panel: da espacio arriba para la X y recorta bordes redondeados */
.panel{
  position: relative;
  width: min(760px, 92vw);
  background:#322D59;
  border-radius: 22px;
  border:1px solid rgba(255,255,255,.08);
  color:#EDEAF6;
  box-shadow: 0 20px 60px rgba(0,0,0,.55);
  /* ⬇️ más padding arriba para que la X no choque con el buscador */
  padding: 56px 20px 16px;
  /* ⬇️ evita que el contenido “se pase” del borde redondeado */
  overflow: hidden;
  box-sizing: border-box;
}

/* Botón de cierre: queda por encima del contenido pero sin taparlo */
.x{
  position:absolute;
  top:12px;
  right:12px;
  width:36px; height:36px;
  border:none; border-radius:999px;
  background:#3C3A63; color:#fff; cursor:pointer;
  z-index: 2; /* por si acaso */
}

/* ===== Search (mismo ancho que tabs) ===== */
.search-wrap{
  display: grid;
  grid-template-columns: 1fr; /* mismo ancho que los tabs */
  padding: 0 6px 14px; /* mismo lateral y separación inferior */
}

.search{
  width: 100%;
  height: 48px;
  border-radius: 26px;
  border: 2px solid rgba(255,255,255,.12);
  background:#201F34;
  color:#EDEAF6;
  padding: 0 16px;
  outline: none;
  font-weight: 700;
  box-sizing: border-box;
}

.search::placeholder{ color:#b9b5d1; }
.search-ico{
  position:absolute; right:10px; top:50%; transform: translateY(-50%);
  width:36px; height:36px; border:none; border-radius:12px;
  background:transparent; color:#EDEAF6; cursor:pointer;
}

/* ===== Tabs ===== */
/* ===== Tabs (mismo ancho que las filas de la lista) ===== */
.tabs{
  /* mismo padding lateral que .list para alinear bordes */
  padding: 0 6px 10px;

  /* tres columnas iguales */
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

/* cada pill ocupa TODO su columna (sin min-width) */
.tab{
  width: 100%;
  height: 40px;
  border: none;
  border-radius: 22px;
  background:#27263a;
  color:#CFC9E6;
  font-weight: 800;
  cursor: pointer;
  text-align: center;
}

/* activo */
.tab.on{
  color:#fff;
  background:#2d2b46;
  outline:2px solid rgba(107,124,255,.6);
}
/* ===== Lista ===== */
.list{ display:flex; flex-direction:column; gap:8px; max-height: 48vh; overflow:auto; padding: 12px 6px 6px; }

/* Section headers */
.section-header {
  font-size: 13px;
  font-weight: 700;
  color: #CFC9E6;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 4px 6px;
  margin-bottom: 6px;
}

/* Member rows */
.member-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #1f1f31;
  border-radius: 12px;
  padding: 14px 16px;
  border: 1px solid rgba(255,255,255,.06);
}

.member-row.owner-row {
  background: #2a2847;
  border: 1px solid rgba(107, 124, 255, 0.2);
}

.member-row .l {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.member-row .r {
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
}

.member-row .nm {
  font-weight: 700;
  font-size: 16px;
  color: #EDEAF6;
}

.member-row .em {
  font-size: 13px;
  color: #CFC9E6;
  opacity: 0.7;
}

.row{
  display:flex; align-items:center; justify-content:space-between;
  background:#1f1f31; border-radius:12px; padding:14px 14px;
  border:1px solid rgba(255,255,255,.06);
}
.left{ display:flex; align-items:center; gap:12px; }
.avatar{
  width:36px; height:36px; display:grid; place-items:center;
  background:#0E0F1A; border-radius:999px; font-size:18px;
}
.name{ font-weight:800; font-size:18px; }

/* derecha */
.right{ display:flex; align-items:center; gap:10px; position:relative; }
.badge{
  font-size:13px; padding:6px 12px; border-radius:10px; font-weight:800;
  background:#3a385c; color:#fff;
}
.badge.owner{ background:#C4B04A; color:#232323; }
.badge.member{ background:#3a6ccf; }

/* menu tres puntos */
.btn-menu {
  width: 36px;
  height: 34px;
  border: none;
  border-radius: 10px;
  background: #0E0F1A;
  color: #fff;
  cursor: pointer;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-menu:hover {
  background: #1a1b2e;
}

.menu-dropdown {
  position: absolute;
  right: 0;
  top: 38px;
  z-index: 10;
}

.menu-dropdown ul {
  list-style: none;
  margin: 0;
  padding: 6px 0;
  background: #1f1f31;
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 12px;
  width: 180px;
  box-shadow: 0 8px 20px rgba(0,0,0,.35);
}

.menu-dropdown li {
  padding: 10px 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
}

.menu-dropdown li:hover {
  background: rgba(255,255,255,.06);
}

.menu-dropdown li.danger {
  color: #ffb8b8;
}

.dots{
  width:36px; height:34px; border:none; border-radius:10px;
  background:#0E0F1A; color:#fff; cursor:pointer;
}
.menu{ position:relative; }
.submenu{
  position:absolute; right:0; top:38px; list-style:none; margin:0; padding:6px 0;
  background:#1f1f31; border:1px solid rgba(255,255,255,.1); border-radius:12px; width:180px;
  box-shadow: 0 8px 20px rgba(0,0,0,.35); z-index:5;
}
.submenu li{ padding:10px 12px; cursor:pointer; }
.submenu li:hover{ background: rgba(255,255,255,.06); }
.submenu li.danger{ color:#ffb8b8; }

/* ===== Mensajes de estado ===== */
.loading, .empty {
  text-align: center;
  padding: 30px 20px;
  color: #CFC9E6;
  font-size: 14px;
  opacity: 0.7;
}

/* ===== Footer con botón centrado ===== */
.footer{ padding: 18px 6px 6px; display:flex; justify-content:center; }
.btn-add{
  display:flex; align-items:center; justify-content:center; gap:10px;
  width: min(420px, 80%);
  height: 46px; border-radius: 999px; border:none; cursor:pointer;
  background:#6B7CFF; color:#fff; font-weight:800; font-size:16px;
}
.icon-plus{ opacity:.95; }

/* opcional para pantallas chicas: mantener 3 columnas */
@media (max-width: 760px){
  .tabs{
    grid-template-columns: repeat(3, 1fr);
  }
  .name{ font-size:16px; }
}
</style>
const { t } = useI18n()
