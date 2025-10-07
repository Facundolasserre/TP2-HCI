<template>
  <!-- BOTÓN SETTINGS ARRIBA DERECHA -->
  <button class="user-settings" @click="goSettings" aria-label="Open settings">
    <img src="@/assets/fonts/settings.png" alt="Settings" />
  </button>

  <!-- WRAPPER TOPBAR -->
  <div class="layout-topbar">
    <div class="topbar-wrap">
      <Topbar
        v-model:query="q"
        @toggle-sidebar="toggleSidebar"
        @filter="onFilter"
        @sort="onSort"
        @favorites="onFavs"
        @new="onNew" 
        @search="onSearch"
      />
    </div>
  </div>

  <!-- WRAPPER GRID -->
  <div class="layout-grid">
    <main class="grid">
      <article
        v-for="card in filtered"
        :key="card.id"
        class="card"
        @click="openCard(card)"
      >
        <div class="card-ico">
          <img :src="card.icon" :alt="card.title" />
        </div>
        <h3 class="card-title">{{ card.title }}</h3>
        <p class="card-sub">
          <em v-if="card.sharedWith?.length">
            shared with {{ shareText(card.sharedWith) }}
          </em>
          <em v-else>no shares</em>
        </p>
      </article>
    </main>
  </div>

  <!-- SIDEBAR -->
  <Sidebar
    :open="sidebarOpen"
    :active="active"
    @close="closeSidebar"
    @update:active="val => active = val"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

import Topbar from '@/components/Topbar.vue'
import Sidebar from '@/components/Sidebar.vue'

import { useRouter } from 'vue-router' // f

const router = useRouter()                 // 👈 agregado


type Card = { id: string; title: string; icon: string; sharedWith?: string[] }

const q = ref('')
const active = ref<'home'|'edit'|'history'>('home')
const sidebarOpen = ref(false)

function toggleSidebar(){ sidebarOpen.value = !sidebarOpen.value }
function closeSidebar(){ sidebarOpen.value = false }

function goSettings(){
  router.push('/settings')
}
const cards = ref<Card[]>([
  {
    id: 'supermarket',
    title: 'Supermarket',
    icon: new URL('@/assets/shopping_cart.svg', import.meta.url).href,
    sharedWith: ['Emma']
  },
  {
    id: 'family',
    title: 'Family',
    icon: new URL('@/assets/family.svg', import.meta.url).href,
    sharedWith: ['Ana','Juan','Emma']
  },
  {
    id: 'travel',
    title: 'Travel',
    icon: new URL('@/assets/travel.svg', import.meta.url).href,
    sharedWith: ['Ana','Luis','Mar']
  },
  {
    id: 'drinks',
    title: 'Drinks',
    icon: new URL('@/assets/liquor.svg', import.meta.url).href,
    sharedWith: []
  }
])

const filtered = computed(()=>{
  const t = q.value.trim().toLowerCase()
  return t ? cards.value.filter(c => c.title.toLowerCase().includes(t)) : cards.value
})

function shareText(list: string[]){ 
  return list.length === 1 ? list[0] : `${list.length} contacts`
}
// API CON ESTO FUNCIONARIA 
function openCard(card: Card){

  router.push({ name: 'list', params: { name: encodeURIComponent(card.title) } })
}

/* === Eventos de Topbar === */
function onFilter(){ console.log('filter') }
function onSort(){ console.log('sort') }
function onFavs(){ console.log('favorites') }
function onSearch(){ console.log('search', q.value) }




function onNew() {
  router.push('/AddList')  // llama AddListView
}

</script>

<style scoped>
:root{
  --bg:#1C1C30;
  --panel:#322D59;
  --ink:#EDEAF6;
  --muted:#CFC9E6;
  --tile:#0E0F1A;
  --edge:#4B5CC7;
}

/* ===== LAYOUT GENERAL ===== */
.layout{
  min-height:100vh;
  background: var(--bg);
  color: var(--ink);
  display:flex;
  flex-direction:column;
  padding: 22px 26px 32px;
  position: relative;                /* para posicionar el botón settings */
}

/* ===== BOTÓN SETTINGS (arriba derecha) ===== */
.user-settings{
  position: absolute;
  top: 10px;
  right: 16px;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.04);
  display: grid;
  place-items: center;
  overflow: hidden;
  cursor: pointer;
}
.user-settings:hover{ background: rgba(255,255,255,.07); }
.user-settings img{
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ===== TOPBAR (alineado y centrado) ===== */
.layout-topbar{
  display: grid;
  place-items: center;               /* centra horizontalmente toda la franja */
  margin: 8px 0 18px;
}
.topbar-wrap{
  width: min(1100px, 92vw);          /* mismo ancho máximo que el grid */
}

/* Si el Topbar interno expone clases, las alineamos con :deep */
/* todos los controles (botones e input) alineados al centro y misma altura */
:deep(.topbar){
  display: flex;
  align-items: center;
  gap: 12px;
}
:deep(.topbar button),
:deep(.topbar .search),
:deep(.topbar input){
  height: 44px;
  display: inline-flex;
  align-items: center;               /* centra verticalmente el contenido */
}

/* El pill de búsqueda alineado */
:deep(.search-wrap){
  display: inline-flex;
  align-items: center;
}

/* ===== GRID ===== */
.grid{
  display:grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 34px;
  width: 100%;
}
@media (max-width: 860px){
  .grid{ grid-template-columns: 1fr; }
}

/* ===== CARD ===== */
.card{
  background:#0E0F1A;
  width: 580px;
  height: 300px;
  border-radius:16px;
  min-height: 260px;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:8px;
  box-shadow: 0 10px 24px rgba(0,0,0,.35);
  transition: transform .08s ease;
  cursor:pointer;
}
.card:hover{ transform: translateY(-2px); }
.card-ico{ 
  color:#EDEAF6; 
  opacity:.85;
  display: flex;
  align-items: center;
  justify-content: center;
}
.card-ico img{
  width: 72px;
  height: 72px;
  filter: brightness(0) invert(1);
  opacity: .85;
}
.card-title{ margin:6px 0 0; font-weight:800; color:#fff; }
.card-sub{ margin:0; color:#fff; font-size:12px; }
</style>