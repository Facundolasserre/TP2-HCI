<template>
 
    <!-- WRAPPER TOPBAR -->
    <div class="layout-topbar">
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

    <!-- WRAPPER GRID -->
    <div class="layout-grid">
      <main class="grid">
        <article
          v-for="card in filtered"
          :key="card.id"
          class="card"
          @click="openCard(card)"
        >
          <div class="card-ico" v-html="card.icon"></div>
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

const cards = ref<Card[]>([
  {
    id: 'supermarket',
    title: 'Supermarket',
    icon: `<svg width="72" height="72" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="1.6" stroke-linecap="round"
      stroke-linejoin="round">
      <circle cx="9" cy="21" r="1"/>
      <circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 12.39A2 2 0 0 0 9.61 15H19
      a2 2 0 0 0 2-1.59l1-5.41H6"/></svg>`,
    sharedWith: ['Emma']
  },
  {
    id: 'family',
    title: 'Family',
    icon:`<svg width="72" height="72" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="1.6" stroke-linecap="round"
      stroke-linejoin="round">
      <path d="M5.5 22v-3a2 2 0 0 1 2-2h.5"/>
      <circle cx="7" cy="7" r="2"/>
      <path d="M17 22v-4a2 2 0 0 0-2-2h-1"/>
      <circle cx="15" cy="6" r="2"/>
      <path d="M12 22v-5a2 2 0 0 0-2-2H8"/>
      <circle cx="10" cy="9" r="2"/></svg>`,
    sharedWith: ['Ana','Juan','Emma']
  },
  {
    id: 'travel',
    title: 'Travel',
    icon:`<svg width="72" height="72" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="1.6" stroke-linecap="round"
      stroke-linejoin="round">
      <path d="m10.5 7 7 7"/>
      <path d="M21 16v-2l-8-8-3 3 8 8h2z"/>
      <path d="M4 13l6-6"/></svg>`,
    sharedWith: ['Ana','Luis','Mar']
  },
  {
    id: 'drinks',
    title: 'Drinks',
    icon:`<svg width="72" height="72" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="1.6" stroke-linecap="round"
      stroke-linejoin="round">
      <path d="M8 22h8"/>
      <path d="M10 2h4l-1 8h-2L10 2z"/>
      <path d="M12 10v8"/></svg>`,
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

function openCard(card: Card){ 
  console.log('open', card.id) 
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
.card-ico{ color:#EDEAF6; opacity:.85; }
.card-title{ margin:6px 0 0; font-weight:800; }
.card-sub{ margin:0; color:var(--muted); font-size:12px; }


</style>