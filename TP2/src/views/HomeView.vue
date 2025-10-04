<template>
  <div class="layout">
    <!-- TOPBAR -->
    <header class="topbar">
      <button class="burger" @click="toggleSidebar" aria-label="Open menu">
        <span></span><span></span><span></span>
      </button>

      <div class="top-icons">
        <button class="round-btn" title="Filter">⎇</button>
        <button class="round-btn" title="Sort">≡</button>
      </div>

      <div class="search-wrap">
        <input v-model="q" class="search" type="text" placeholder="Search" />
        <button class="search-ico" title="Search">🔍</button>
        <button class="star" title="Favorites">⭐</button>
        <button class="plus" title="New">＋</button>
      </div>
    </header>

    <!-- GRID 2x2 -->
    <main class="grid">
      <article v-for="card in filtered" :key="card.id" class="card" @click="openCard(card)">
        <div class="card-ico" v-html="card.icon"></div>
        <h3 class="card-title">{{ card.title }}</h3>
        <p class="card-sub">
          <em v-if="card.sharedWith?.length">shared with {{ shareText(card.sharedWith) }}</em>
          <em v-else>no shares</em>
        </p>
      </article>
    </main>

    <!-- SIDEBAR OVERLAY (aparece al tocar burger) -->
    <transition name="fade">
      <div v-if="sidebarOpen" class="overlay" @click.self="closeSidebar">
        <aside class="sidebar" @keydown.esc="closeSidebar" tabindex="-1">
          <div class="sb-top">
            <div class="brand">
              <img src="../assets/LogoHCI.png" alt="BagIt" />
            </div>
            <button class="close" @click="closeSidebar" aria-label="Close">✖</button>
          </div>

          <ul class="sb-menu">
            <li :class="{active: active==='home'}" @click="setActive('home')">
              <span class="ico">🏠</span> <span>Home</span>
            </li>
            <li :class="{active: active==='edit'}" @click="setActive('edit')">
              <span class="ico">✏️</span> <span>Edit Lists</span>
            </li>
            <li :class="{active: active==='history'}" @click="setActive('history')">
              <span class="ico">⏱️</span> <span>Shopping List History</span>
            </li>
          </ul>

          <div class="sb-bottom">
            <button class="logout">
              <span>Log out</span>
              <span class="exit">↪︎</span>
            </button>
          </div>
        </aside>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

type Card = { id: string; title: string; icon: string; sharedWith?: string[] }

const q = ref('')
const active = ref<'home'|'edit'|'history'>('home')
const sidebarOpen = ref(false)

function toggleSidebar(){ sidebarOpen.value = !sidebarOpen.value }
function closeSidebar(){ sidebarOpen.value = false }
function setActive(v: typeof active.value){ active.value = v; closeSidebar() }

function onKey(e: KeyboardEvent){ if(e.key === 'Escape') closeSidebar() }
onMounted(()=> window.addEventListener('keydown', onKey))
onUnmounted(()=> window.removeEventListener('keydown', onKey))

// Mock de listas (luego lo reemplazás por API)
const cards = ref<Card[]>([
  {
    id: 'supermarket', title: 'Supermarket',
    icon: `<svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 12.39A2 2 0 0 0 9.61 15H19a2 2 0 0 0 2-1.59l1-5.41H6"/></svg>`,
    sharedWith: ['Emma']
  },
  {
    id: 'family', title: 'Family',
    icon:`<svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 22v-3a2 2 0 0 1 2-2h.5"/><circle cx="7" cy="7" r="2"/><path d="M17 22v-4a2 2 0 0 0-2-2h-1"/><circle cx="15" cy="6" r="2"/><path d="M12 22v-5a2 2 0 0 0-2-2H8"/><circle cx="10" cy="9" r="2"/></svg>`,
    sharedWith: ['Ana','Juan','Emma']
  },
  {
    id: 'travel', title: 'Travel',
    icon:`<svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m10.5 7 7 7"/><path d="M21 16v-2l-8-8-3 3 8 8h2z"/><path d="M4 13l6-6"/></svg>`,
    sharedWith: ['Ana','Luis','Mar']
  },
  {
    id: 'drinks', title: 'Drinks',
    icon:`<svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M8 22h8"/><path d="M10 2h4l-1 8h-2L10 2z"/><path d="M12 10v8"/></svg>`,
    sharedWith: []
  }
])

const filtered = computed(()=> {
  const t = q.value.trim().toLowerCase()
  return t ? cards.value.filter(c=>c.title.toLowerCase().includes(t)) : cards.value
})

function shareText(list: string[]){ return list.length === 1 ? list[0] : `${list.length} contacts` }
function openCard(card: Card){ console.log('open', card.id) /* router.push a detalle si querés */ }
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

/* ===== Layout sin menú izq ===== */
.layout{
  min-height:100vh;
  background: var(--bg);
  color: var(--ink);
  display:flex;
  flex-direction:column;
  padding: 22px 26px 32px;
}

/* ===== Topbar ===== */
.topbar{
  display:grid;
  grid-template-columns: auto auto 1fr;
  align-items:center;
  gap:16px;
  margin-bottom: 18px;
}
.burger{
  width:46px; height:38px; background:transparent; border:none; cursor:pointer; padding:0;
  display:grid; gap:6px;
}
.burger span{
  display:block; height:3px; width:30px; background:#EDEAF6; border-radius:4px;
}
.top-icons{ display:flex; gap:10px; }
.round-btn{
  width:44px; height:44px; border-radius:999px; border:none; cursor:pointer;
  background: #080A14; color:#fff; font-size:18px;
}

.search-wrap{ display:flex; align-items:center; gap:10px; }
.search{
  flex:1; height:44px; border-radius:12px; border:2px solid var(--edge);
  background:#0E0F1A; color:#fff; padding:0 14px; outline:none;
}
.search-ico,.star,.plus{
  width:44px; height:44px; border-radius:999px; border:none; cursor:pointer;
  background:#080A14; color:#fff; font-size:18px;
}

/* ===== Grid ===== */
.grid{
  display:grid;
  grid-template-columns: repeat(2, minmax(320px, 1fr));
  gap: 34px;
}
.card{
  background:#0E0F1A;
  border-radius:16px;
  min-height: 260px;
  height: 320;
  width: 580;
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px;
  box-shadow: 0 10px 24px rgba(0,0,0,.35);
  transition: transform .08s ease;
  cursor:pointer;
}
.card:hover{ transform: translateY(-2px); }
.card-ico{ color:#EDEAF6; opacity:.85; }
.card-title{ margin:6px 0 0; font-weight:800; }
.card-sub{ margin:0; color:var(--muted); font-size:12px; }

/* ===== Sidebar overlay ===== */
.overlay{
  position: fixed; inset:0; background: rgba(0,0,0,.35);
  display:flex;
}
.sidebar{
  width:300px; max-width:85vw; height:100%;
  background: var(--panel);
  box-shadow: 6px 0 24px rgba(0,0,0,.45);
  display:flex; flex-direction:column;
  transform: translateX(-8px);
  animation: slideIn .18s ease-out;
}
@keyframes slideIn { from{ transform: translateX(-40px); opacity:.6 } to{ transform: translateX(-8px); opacity:1 } }
.fade-enter-active,.fade-leave-active{ transition: opacity .15s ease; }
.fade-enter-from,.fade-leave-to{ opacity:0; }

.sb-top{ display:flex; align-items:center; justify-content:space-between; padding:16px 14px; }
.brand img{ width:42px; height:auto; display:block; }
.close{
  border:none; background:transparent; color:#fff; font-size:20px; cursor:pointer;
}

.sb-menu{ list-style:none; padding:8px; margin:0; }
.sb-menu li{
  display:flex; align-items:center; gap:12px; padding: 12px 14px; border-radius: 10px; cursor:pointer;
}
.sb-menu li.active{ background: rgba(255,255,255,.08); }
.sb-menu .ico{ width:22px; text-align:center; }

.sb-bottom{ margin-top:auto; padding: 18px; }
.logout{
  width:100%; height:38px; border-radius:999px; border:none; cursor:pointer;
  background:#5f57d1; color:#fff; font-weight:700;
  display:flex; align-items:center; justify-content:center; gap:10px;
}
.logout .exit{ background:#4f49b8; padding:4px 8px; border-radius:10px; }

@media (max-width: 860px){
  .grid{ grid-template-columns: 1fr; }
}
</style>