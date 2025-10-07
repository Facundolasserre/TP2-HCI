<template>
  <!-- TOPBAR: burger + título + search en la misma línea -->
  <header class="topbar">
    <div class="left">
      <button class="burger" @click="toggleSidebar" aria-label="Open menu" title="Menu">
        <span></span><span></span><span></span>
      </button>
      <h1 class="title">Products</h1>
    </div>

    <div class="search-wrap">
      <input
        v-model.trim="q"
        class="search"
        type="text"
        placeholder="Search products…"
        @keydown.stop
        aria-label="Search products"
      />
      <span class="search-ico">🔍</span>
    </div>
  </header>

  <!-- SIDEBAR -->
  <Sidebar
    :open="sidebarOpen"
    :active="active"
    @close="closeSidebar"
    @update:active="val => active = val"
  />

  <!-- CONTADOR -->
  <p class="meta" v-if="filtered.length">
    {{ filtered.length }} product{{ filtered.length === 1 ? '' : 's' }} found
  </p>

  <!-- LISTA CONSOLIDADA -->
  <section class="list">
    <div v-for="p in filtered" :key="p.key" class="row">
      <div class="left">
        <h3 class="name">{{ p.name }}</h3>
        <p class="sub">
          <span class="cat" v-if="p.category">{{ p.category }}</span>
          <span class="dot" v-if="p.category">•</span>
          <span class="qty">Total: {{ p.totalQty }}</span>
        </p>
      </div>
      <div class="right">
        <div class="chips">
          <span class="chip" v-for="ln in p.listNames" :key="ln">📋 {{ ln }}</span>
        </div>
      </div>
    </div>

    <p v-if="!filtered.length" class="empty">No products match your search.</p>
  </section>
</template>
<script setup lang="ts">


import { computed, ref } from 'vue'
import Sidebar from '@/components/Sidebar.vue';

interface ListItem { id: number; name: string; category?: string; qty?: number }
interface ShoppingList { id: number; name: string; items: ListItem[] }
interface AggregatedProduct {
  key: string; name: string; category?: string; totalQty: number; listNames: string[]
}


const active = ref<'home'|'edit'|'history'>('home')

const sidebarOpen = ref(false)
function toggleSidebar(){ sidebarOpen.value = !sidebarOpen.value }
function closeSidebar(){ sidebarOpen.value = false }

const lists = ref<ShoppingList[]>([
  { id: 1, name: 'Weekly Groceries', items: [
    { id: 11, name: 'Milk', category: 'Dairy', qty: 2 },
    { id: 12, name: 'Bread', category: 'Bakery', qty: 1 },
    { id: 13, name: 'Apples', category: 'Fruits', qty: 6 }
  ]},
  { id: 2, name: 'BBQ Saturday', items: [
    { id: 21, name: 'Bread', category: 'Bakery', qty: 2 },
    { id: 22, name: 'Apples', category: 'Fruits', qty: 4 },
    { id: 23, name: 'Soda', category: 'Drinks', qty: 3 }
  ]},
  { id: 3, name: 'Cleaning', items: [
    { id: 31, name: 'Detergent', category: 'Cleaning', qty: 1 },
    { id: 32, name: 'Sponge', category: 'Cleaning', qty: 3 }
  ]}
])

const q = ref('')

const aggregated = computed<AggregatedProduct[]>(() => {
  const map = new Map<string, AggregatedProduct>()
  for (const list of lists.value) {
    for (const item of list.items) {
      const key = item.name.trim().toLowerCase()
      const cur = map.get(key)
      if (!cur) {
        map.set(key, {
          key,
          name: item.name,
          category: item.category,
          totalQty: item.qty ?? 1,
          listNames: [list.name]
        })
      } else {
        cur.totalQty += item.qty ?? 1
        if (!cur.category && item.category) cur.category = item.category
        if (!cur.listNames.includes(list.name)) cur.listNames.push(list.name)
      }
    }
  }
  return Array.from(map.values()).sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  )
})

const filtered = computed(() => {
  const term = q.value.toLowerCase()
  if (!term) return aggregated.value
  return aggregated.value.filter(p =>
    p.name.toLowerCase().includes(term) ||
    (p.category ?? '').toLowerCase().includes(term) ||
    p.listNames.some(n => n.toLowerCase().includes(term))
  )
})
</script>



<style scoped>
:root{
  --container: 1100px;     /* ancho máximo */
  --side-pad: 24px;        /* padding lateral del contenedor */
}
/* ===== FONDO GENERAL ===== */
:host, :root, body {
  background: #0F1020;
  color: #EDEAF6;
  font-family: 'Inter', system-ui, sans-serif;
}

/* ===== TOPBAR (burger + título + search) ===== */
.topbar {
  display: flex;
  align-items: center;
  gap: 16px;
  justify-content: space-between;
  width: var(--container);      /* <-- mismo ancho que las tarjetas */
  margin: 20px auto 14px;
  padding: 0;                   /* sin padding para alinear con las cards */
}

/* IZQUIERDA (burger + título) */
.topbar .left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 0 0 auto;               /* <-- no se estira */
}

.burger {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.14);
  background: #1A1940;
  color: #EDEAF6;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: transform .12s ease;
}
.burger span {
  display: block;
  width: 20px;
  height: 2px;
  background: currentColor;
  border-radius: 2px;
}
.burger span + span { margin-top: 4px; }
.burger:active { transform: scale(0.96); }

.title {
  font-size: 28px;
  font-weight: 800;
  margin: 0;
}

/* SEARCH ocupa TODO lo restante */
.search-wrap {
  position: relative;
  flex: 1 1 auto;               /* <-- se expande */
  max-width: none;              /* <-- quita el tope de 480px */
  min-width: 240px;             /* opcional: evita que colapse en pantallas muy chicas */
}

.search {
  width: 100%;
  height: 44px;
  padding: 0 40px 0 14px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.12);
  background: #1A1940;
  color: #EDEAF6;
  font-size: 15px;
  outline: none;
}

.search:focus {
  border-color: rgba(111, 103, 222, 0.65);
  box-shadow: 0 0 0 3px rgba(111, 103, 222, 0.25);
}
.search-ico {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  opacity: .8;
}

/* ===== CONTADOR ===== */
.meta {
  width: min(1100px, 92vw);
  margin: 6px auto 12px;
  opacity: .8;
  font-size: 14px;
  text-align: left;
  padding-left: 4px;
}

/* ===== LISTA DE PRODUCTOS ===== */
.list {
  width: min(1100px, 92vw);
  margin: 0 auto;
  display: grid;
  gap: 12px;
}

/* Cada fila (producto) */
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: #322D59;
  border-radius: 16px;
  padding: 18px 22px;
  box-shadow: 0 6px 20px rgba(0,0,0,.35);
}

/* Izquierda: nombre y categoría */
.left {
  text-align: left;
  flex: 1;
}
.left .name {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 800;
}
.sub {
  margin: 0;
  font-size: 14px;
  opacity: .9;
}
.cat { opacity: .9; }
.dot { opacity: .5; margin: 0 6px; }
.qty { opacity: .9; }

/* Derecha: chips con listas */
.right .chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}
.chip {
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 13px;
  white-space: nowrap;
}

/* Texto vacío */
.empty {
  text-align: center;
  opacity: .7;
  padding: 20px 0;
}

/* ===== RESPONSIVO ===== */
/* Responsivo: en móviles apilamos */
@media (max-width: 640px) {
  .topbar {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  .topbar .left { justify-content: flex-start; }
  .search-wrap { min-width: 0; }

}
</style>