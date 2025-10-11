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

        <!-- Tabs -->
        <div class="tabs">
          <button :class="['tab', {on: tab==='all'}]" @click="tab='all'">{{ t('shareModal.tabs.all') }}</button>
          <button :class="['tab', {on: tab==='pending'}]" @click="tab='pending'">{{ t('shareModal.tabs.pending') }}</button>
          <button :class="['tab', {on: tab==='blocked'}]" @click="tab='blocked'">{{ t('shareModal.tabs.blocked') }}</button>
        </div>

        <!-- List -->
        <div class="list">
          <div v-for="m in filtered" :key="m.id" class="row">
            <div class="left">
              <span class="avatar">👤</span>
              <span class="name">{{ m.name }}</span>
            </div>

            <div class="right">
              <span v-if="m.role" :class="['badge', m.role === 'Owner' ? 'owner' : 'member']">
                {{ m.role === 'Owner' ? t('shareModal.role.owner') : t('shareModal.role.member') }}
              </span>

              <div class="menu">
                <button class="dots" @click="toggleMenu(m.id)">⋮</button>
                <ul v-if="openMenuId === m.id" class="submenu">
                  <li @click="setRole(m.id,'Owner')">{{ t('shareModal.actions.make_owner') }}</li>
                  <li @click="setRole(m.id,'Member')">{{ t('shareModal.actions.make_member') }}</li>
                  <li class="danger" @click="block(m.id)">{{ t('shareModal.actions.block') }}</li>
                  <li class="danger" @click="remove(m.id)">{{ t('shareModal.actions.remove') }}</li>
                </ul>
              </div>
            </div>
          </div>

          <p v-if="filtered.length===0" class="empty">{{ t('shareModal.empty') }}</p>
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
import { computed, ref } from 'vue'
import { useI18n } from '@/composables/useI18n'
import AddMember from '@/components/AddMember.vue'

type Role = 'Owner' | 'Member' | null
type Member = { id: string; name: string; role: Role; state: 'all'|'pending'|'blocked' }

const q = ref('')
const tab = ref<'all'|'pending'|'blocked'>('all')
const openMenuId = ref<string|null>(null)


// 👇 payload EXACTO que emite AddMember.vue
type AddMemberPayload = {
  email: string
  role: 'Owner' | 'Member'
  notes: string
}

function onAddSave(p: AddMemberPayload) {
  // ejemplo simple: derive el "name" del email (antes de la @)
  const nameFromEmail = p.email.split('@')[0] || p.email

  members.value.push({
    id: String(Date.now()),
    name: nameFromEmail,          // o pedí name explícito si querés
    role: p.role ?? null,
    state: 'all',
  })

  // si querés usar p.notes, podés guardarlo en tu modelo o ignorarlo
  showAdd.value = false
}


const members = ref<Member[]>([
  { id:'1', name:'Emma',  role:'Owner',  state:'all' },
  { id:'2', name:'Peter', role:'Member', state:'all' },
  { id:'3', name:'Nina',  role:null,     state:'pending' },
  { id:'4', name:'Vera',  role:null,     state:'blocked' },
])


const showAdd = ref(false)
function addMember() {
  showAdd.value = true
}




const filtered = computed(()=>{
  const text = q.value.toLowerCase()
  return members.value.filter(m=>{
    const byTab = tab.value === 'all' ? m.state !== 'blocked' : m.state === tab.value
    const byText = !text || m.name.toLowerCase().includes(text)
    return byTab && byText
  })
})

function toggleMenu(id: string){ openMenuId.value = openMenuId.value === id ? null : id }

function setRole(id: string, role: Role){
  const m = members.value.find(x=>x.id===id); if(!m) return
  m.role = role; m.state = 'all'; openMenuId.value = null
}


function block(id: string){
  const m = members.value.find(x=>x.id===id); if(!m) return
  m.state = 'blocked'; m.role = null; openMenuId.value = null
}
function remove(id: string){ members.value = members.value.filter(x=>x.id!==id); openMenuId.value = null }


defineEmits<{ (e:'close'): void }>()
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
.list{ display:flex; flex-direction:column; gap:12px; max-height: 48vh; overflow:auto; padding: 0 6px 6px; }
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
