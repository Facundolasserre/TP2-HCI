<template>
  <header class="topbar">
    <!-- botón con imagen -->
    <button class="burger" @click="$emit('toggle-sidebar')" aria-label="Open menu">
      <img src="@/assets/fonts/burgerIcon.png" alt="Menu" class="burger-img" />
    </button>

    <div class="topbar-content">
      <div class="top-icons">
        <button class="round-btn" title="Filter" @click="$emit('filter')">
          <img src="@/assets/fonts/filter.png" alt="Menu" class="burger-img"/>
        </button>
        <button class="round-btn" title="Sort" @click="$emit('sort')">
          <img src="@/assets/fonts/sort.png" alt="Menu" class="burger-img"/>
        </button>
      </div>

      <div class="search-wrap">
        <input
          :value="query"
          @input="$emit('update:query', ($event.target as HTMLInputElement).value)"
          class="search"
          type="text"
          placeholder="Search"
        />
        <button class="star" title="Favorites" @click="$emit('favorites')">
          <img src="@/assets/fonts/favIcon.png" alt="Menu" class="burger-img" />
        </button>
        <button class="plus special-plus" title="New" @click="$emit('new')">＋</button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{ query: string }>()
defineEmits<{
  (e: 'toggle-sidebar'): void
  (e: 'filter'): void
  (e: 'sort'): void
  (e: 'favorites'): void
  (e: 'new'): void
  (e: 'search'): void
  (e: 'update:query', v: string): void
}>()



</script>


<style scoped>
:root{
  --ink: #EDEAF6;
  --edge: #4B5CC7;
}

/* ======= TOPBAR ======= */
.topbar{
  position: relative;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  background: transparent;
  padding: 0 26px;
}

/* ======= BURGER ICON ======= */
.burger{
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  margin-right: 24px;
}

.burger-img{
  width: 48px;
  height: 48px;
  object-fit: contain;
  display: block;
}

/* ======= CONTENEDOR CENTRAL ======= */
.topbar-content{
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex: 1;
  max-width: 900px;
  margin: 0 auto;
  margin-right: 72px;
}

/* ======= ICONOS IZQUIERDA ======= */
.top-icons{
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

/* ======= BOTONES REDONDOS ======= */
.round-btn,
.search-ico,
.star,
.plus{
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  background: #080A14;
  color: #fff;
  font-size: 22px;                 /* íconos grandes */
  transition:  0.2s ease;
}

.round-btn:hover,
.search-ico:hover,
.star:hover,
.plus:hover{
  background: #101223;
}

/* ======= SEARCH BAR ======= */
.search-wrap{
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex: 1;
  max-width: 500px;
}
.search{
  flex: 1;
  height: 46px;
  border-radius: 999px;
  border: none;
  background: #0E0F1A;
  color: #fff;
  padding: 0 20px;
  outline: none;
  font-size: 16px;
}
.search::placeholder{
  color: rgba(255,255,255,0.6);
}

/* ======= RESPONSIVE ======= */
@media (max-width: 768px){
  .topbar-content{ flex-direction: column; gap: 12px; }
  .search-wrap{ max-width: 100%; }
  .round-btn, .search-ico, .star, .plus{ width: 44px; height: 44px; font-size: 18px; }
}
</style>