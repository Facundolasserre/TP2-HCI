<template>
  <!-- BARRA DE BÚSQUEDA ARRIBA, CENTRADA -->
  <div class="search-bar">
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
  </div>

  <!-- TOPBAR: TÍTULO A LA IZQUIERDA -->
  <header class="topbar">
    <h1 class="title">Products</h1>
  </header>

  <!-- CONTADOR -->
  <p class="meta" v-if="filtered.length">
    {{ filtered.length }} product{{ filtered.length === 1 ? '' : 's' }} found
  </p>

  <!-- LISTA CONSOLIDADA (filas más anchas) -->
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

interface ListItem { id: number; name: string; category?: string; qty?: number }
interface ShoppingList { id: number; name: string; items: ListItem[] }
interface AggregatedProduct {
  key: string; name: string; category?: string; totalQty: number; listNames: string[]
}

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
/* Fondo base */
:host, :root, body {
  background: #0F1020;
  color: #EDEAF6;
}

/* ===== BARRA DE BÚSQUEDA ARRIBA, CENTRADA ===== */
.search-bar {
  display: flex;
  justify-content: center;
  margin: 18px 0 8px;
}
.search-wrap {
  position: relative;
  width: min(720px, 92vw);
}
.search {
  width: 100%;
  height: 46px;
  padding: 0 44px 0 14px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.12);
  background: #1A1940;
  color: #EDEAF6;
  outline: none;
  font-size: 15px;
  transition: box-shadow .15s ease, border-color .15s ease;
}
.search:focus {
  box-shadow: 0 0 0 3px rgba(111, 103, 222, 0.25);
  border-color: rgba(111, 103, 222, 0.65);
}
.search-ico {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  opacity: .8;
}

/* ===== TÍTULO (🛒 Products) ===== */
.topbar {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 min(5vw, 40px);
  margin-bottom: 6px;
}

.title {
  font-size: 32px;
  font-weight: 800;
  margin: 0;
  text-align: left;      /* ⬅️ alinea el texto a la izquierda */
  padding-left: 22px;    /* ⬅️ lo deja en línea con las tarjetas */
}

/* ===== CONTADOR ===== */
.meta {
  width: min(1100px, 92vw);
  margin: 6px auto 12px;
  opacity: .8;
  font-size: 14px;
  text-align: left;         /* ⬅️ cambia de center a left */
  padding-left: 22px;       /* ⬅️ mismo padding que las tarjetas */
}

/* ===== LISTA ===== */
.list {
  width: min(1100px, 92vw);
  margin: 0 auto;
  display: grid;
  gap: 12px;
}

/* ===== ROW (producto individual) ===== */
.row {
  display: flex;
  align-items: center;
  justify-content: space-between; /* texto izq + chips der */
  gap: 12px;
  background: #322D59;
  border-radius: 16px;
  padding: 18px 22px;
  box-shadow: 0 6px 20px rgba(0,0,0,.35);
}

/* Izquierda */
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

/* Derecha: chips */
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
@media (max-width: 640px) {
  .row {
    flex-direction: column;
    align-items: flex-start;
  }
  .right .chips {
    justify-content: flex-start;
  }
}
</style>