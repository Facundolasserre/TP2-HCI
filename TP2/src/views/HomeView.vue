<template>
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
        @user-settings="goSettings"
      />
    </div>
  </div>

  <!-- WRAPPER GRID -->
  <div class="layout-grid">
    <main v-if="filtered.length > 0" class="grid">
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
    
    <!-- Empty state -->
    <div v-else class="empty-state">
      <div class="empty-content">
        <div class="empty-icon">
          <img src="@/assets/emptyLogo.png"/>
        </div>
        <h2 class="empty-title">No lists yet</h2>
        <p class="empty-text">Create your first shopping list to get started</p>
        <button class="btn-create" @click="onNew">
          <span class="plus-icon">+</span>
          Create List
        </button>
      </div>
    </div>
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
import { useRouter } from 'vue-router'
import { useListsStore } from '@/stores/lists'

import Topbar from '@/components/Topbar.vue'
import Sidebar from '@/components/Sidebar.vue'

const router = useRouter()
const listsStore = useListsStore()

const q = ref('')
const active = ref<'home'|'edit'|'history'>('home')
const sidebarOpen = ref(false)

function toggleSidebar(){ sidebarOpen.value = !sidebarOpen.value }
function closeSidebar(){ sidebarOpen.value = false }

function goSettings(){
  router.push('/settings')
}

// Mapa de iconos por defecto
const iconMap: Record<string, string> = {
  'shopping_cart.svg': new URL('@/assets/shopping_cart.svg', import.meta.url).href,
  'family.svg': new URL('@/assets/family.svg', import.meta.url).href,
  'travel.svg': new URL('@/assets/travel.svg', import.meta.url).href,
  'liquor.svg': new URL('@/assets/liquor.svg', import.meta.url).href,
}

// Convertir las listas del store a cards con iconos
const cards = computed(() => {
  return listsStore.allLists.map(list => {
    // Intentar obtener el icono desde el mapa, o usar el SVG por defecto
    const icon = iconMap[list.icon] || new URL('@/assets/shopping_cart.svg', import.meta.url).href
    
    return {
      id: list.id,
      title: list.title,
      icon,
      sharedWith: list.sharedWith || []
    }
  })
})

const filtered = computed(() => {
  const t = q.value.trim().toLowerCase()
  return t ? cards.value.filter(c => c.title.toLowerCase().includes(t)) : cards.value
})

function shareText(list: string[]){ 
  return list.length === 1 ? list[0] : `${list.length} contacts`
}

function openCard(card: { id: string; title: string; icon: string; sharedWith?: string[] }){
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
.layout-topbar{ width: 100%; margin: 0 0 0; }
.topbar-wrap{ width: 100%; }

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

/* ===== EMPTY STATE ===== */
.empty-state{
  display: grid;
  place-items: center;
  min-height: 60vh;
  width: 100%;
}
.empty-content{
  text-align: center;
  max-width: 400px;
  padding: 40px 20px;
}
.empty-icon{
  font-size: 80px;
  margin-bottom: 20px;
  opacity: 0.6;
}
.empty-icon img{
  width: 350px;
  height: 350px;
  object-fit: contain;
}
.empty-title{
  font-size: 32px;
  font-weight: 800;
  color: #EDEAF6;
  margin: 0 0 12px;
}
.empty-text{
  font-size: 16px;
  color: #CFC9E6;
  opacity: 0.8;
  margin: 0 0 32px;
  line-height: 1.5;
}
.btn-create{
  height: 50px;
  padding: 0 32px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(180deg, #7F89FF, #6B7CFF);
  color: #fff;
  font-weight: 800;
  font-size: 16px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s ease;
}
.btn-create:hover{
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(107, 124, 255, 0.4);
}
.plus-icon{
  font-size: 22px;
  font-weight: 900;
  line-height: 1;
}
</style>