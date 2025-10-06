<template>
  <div class="page">
    <!-- TOP BAR -->
    <header class="topbar">
      <button class="home" @click="$emit('go-home')" aria-label="Home">🏠</button>

      <div class="search-wrap">
        <input v-model.trim="q" class="search" type="text" placeholder="Search product" />
        <button class="search-ico" aria-label="Search">🔎</button>
      </div>

      <div class="top-actions">
        <button class="share" @click="$emit('share-list')" aria-label="Share">🔗</button>
      </div>
    </header>

    <!-- TITLE BAR -->
    <section class="titlebar">
      <div class="left-actions">
        <button class="round" title="Filter" @click="$emit('open-filter')">🜜</button>
        <button class="round" title="Sort" @click="$emit('open-sort')">☰</button>
      </div>

      <h1 class="title">{{ listName }}</h1>

      <div class="right-actions">
        <button class="round" title="Rename / Edit" @click="$emit('edit-list')">✎</button>
        <button class="add" @click="$emit('add-item')">
          <span>Add</span>
          <span class="plus">＋</span>
        </button>
      </div>
    </section>
    </div>
    <!-- LIST -->
    <main class="sheet">
      <article
        v-for="it in filtered"
        :key="it.id"
        class="row"
        @click="$emit('open-item', it)"
      >
        <div class="left">
          <div class="bullet">🍳</div>
          <div class="info">
            <div class="name">{{ it.name }}</div>
            <div class="hint">{{ it.note }}</div>
          </div>
        </div>

        <div class="right">
          <div class="qty">x{{ it.qty }}</div>
          <label class="box">
            <input type="checkbox" :checked="it.checked" @change="$emit('toggle', it)" />
            <span></span>
          </label>
        </div>
      </article>
    </main>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  listName: { type: String, default: 'Family' },
  items: {
    type: Array,
    default: () => ([
      { id: 1, name: 'Eggs', qty: 6, checked: false, note: 'already in cart' },
      { id: 2, name: 'Cookies', qty: 4, checked: false, note: 'added y/day' },
    ])
  }
})

const q = ref('')
const filtered = computed(() => {
  if (!q.value) return props.items
  const t = q.value.toLowerCase()
  return props.items.filter(i => i.name.toLowerCase().includes(t))
})
</script>


<style scoped>
html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
}

/* ===== Página a pantalla completa ===== */
.page {
  min-height: 100dvh;               /* alto total incluyendo barra móvil */
  width: 100vw;                     /* ancho total */
  margin: 0;
  padding: 24px clamp(16px, 4vw, 48px);
  box-sizing: border-box;

  color: #EDEAF6;

  display: grid;
  grid-template-rows: auto auto 1fr; /* topbar, titlebar, contenido */
  gap: 16px;
}

/* ===== Topbar (home / search / share) ===== */
.topbar {
  display: grid;
  grid-template-columns: 48px 1fr 48px;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.home,
.share {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: none;
  background: #1A1930;
  color: #fff;
  cursor: pointer;
}

/* ===== Search ===== */
.search-wrap {
  position: relative;
  width: 100%; /* ahora ocupa todo el ancho */
  margin: 0;
}

.search {
  width: 100%;
  height: 46px;
  border-radius: 26px;
  border: 2px solid rgba(255, 255, 255, 0.12);
  background: #201F34;
  color: #EDEAF6;
  padding: 0 44px 0 16px;
  outline: none;
  font-weight: 700;
  box-sizing: border-box;
}

.search::placeholder {
  color: #b9b5d1;
}

.search-ico {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 34px;
  height: 34px;
  border: none;
  background: transparent;
  color: #EDEAF6;
  cursor: pointer;
}

/* ===== Titlebar ===== */
.titlebar {
  display: grid;
  grid-template-columns: 180px 1fr 260px;
  align-items: center;
  background: #1C1C30;
  border-radius: 18px;
  padding: 14px 18px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
  width: 100%;
}

.title {
  margin: 0;
  text-align: center;
  font-size: 32px;
  font-weight: 800;
  color: #EDEAF6;
}

.left-actions,
.right-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: flex-start;
}

.right-actions {
  justify-content: flex-end;
}

.round {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: none;
  background: #2B2950;
  color: #EDEAF6;
  cursor: pointer;
}

.add {
  height: 40px;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  border-radius: 12px;
  background: linear-gradient(180deg, #7F89FF, #6B7CFF);
  color: #fff;
  font-weight: 800;
  font-size: 15px;
}

.add .plus {
  font-weight: 900;
  font-size: 18px;
}

/* ===== List sheet ===== */
.sheet {
  background: #2E2B52;
  border-radius: 22px;
  padding: 10px 0 18px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
  width: 100%;
  min-height: 0;      /* para que crezca dentro del grid */
  overflow-y: auto;   /* scroll interno si hay muchos ítems */
}

/* ===== Filas ===== */
.row {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}
.row:first-child {
  border-top: none;
}

.left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bullet {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  background: #0E0F1A;
  border-radius: 999px;
  font-size: 18px;
}

.info .name {
  font-weight: 800;
  font-size: 18px;
}

.info .hint {
  font-size: 12px;
  opacity: 0.65;
  margin-top: 2px;
}

.right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.qty {
  font-weight: 800;
  opacity: 0.85;
}

/* ===== Checkbox ===== */
.box {
  position: relative;
  width: 22px;
  height: 22px;
  display: inline-grid;
  place-items: center;
}

.box input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.box span {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  background: #0E0F1A;
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.25);
}

.box input:checked + span {
  background: #6B7CFF;
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0);
}

/* ===== Responsive ===== */
@media (max-width: 860px) {
  .titlebar {
    grid-template-columns: 120px 1fr 200px;
  }
  .title {
    font-size: 26px;
  }
}

@media (max-width: 560px) {
  .titlebar {
    grid-template-columns: 1fr;
    gap: 10px;
    text-align: center;
  }
  .left-actions,
  .right-actions {
    justify-content: center;
  }
}
</style>