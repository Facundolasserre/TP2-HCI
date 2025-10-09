<template>
  <header class="topbar" data-topbar-build="v3">
    <!-- botón con imagen (siempre a la izquierda) -->
    <button class="burger" @click="$emit('toggle-sidebar')" aria-label="Open menu">
      <img src="@/assets/fonts/burgerIcon.png" alt="Menu" class="topbar-icon" />
    </button>

    <div class="topbar-content">
      <div class="icon-group">
        <button class="round-btn" title="Filter" @click="$emit('filter')">
          <img src="@/assets/fonts/filter.png" alt="Menu" class="topbar-icon"/>
        </button>
        <button class="round-btn" title="Sort" @click="$emit('sort')">
          <img src="@/assets/fonts/sort.png" alt="Menu" class="topbar-icon"/>
        </button>
      </div>

      <input
        :value="query"
        @input="$emit('update:query', ($event.target as HTMLInputElement).value)"
        class="search"
        type="text"
        placeholder="Search"
      />

      <div class="icon-group">
        <button class="star" title="Favorites" @click="$emit('favorites')">
          <img src="@/assets/fonts/favIcon.png" alt="Menu" class="topbar-icon" />
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
  position: fixed;                  /* ocupa todo el ancho de la ventana */
  top: 10px;                        /* baja apenas la barra */
  left: 0;
  right: 0;
  z-index: 1000;
  width: 100vw;
  margin: 0;
  height: 72px;                     /* botones +30% requieren algo más de alto */
  display: flex;
  align-items: center;
  justify-content: space-between;   /* left burger, center content, right settings */
  background: transparent;
  padding: 0 40px;                        /* extremos reales */
  box-sizing: border-box;
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
  width: 52px;                      /* +30% */
  height: 52px;                     /* +30% */
  flex-shrink: 0;
}

.topbar-icon{
  width: 36px;                      /* +30% del ícono */
  height: 36px;
  object-fit: contain;
  display: block;
}

/* ======= CONTENEDOR CENTRAL ======= */
.topbar-content{
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(8px, 2vw, 16px);
  flex: 1 1 auto;
  min-width: 0;                     /* permite encoger el search en pantallas chicas */
  max-width: none;
  margin: 0;
  flex-wrap: nowrap;                /* una sola línea siempre */
}

/* ======= ICONOS IZQUIERDA ======= */
.icon-group{
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

/* ======= BOTONES REDONDOS ======= */
.round-btn,
.search-ico,
.star,
.plus{
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;                      /* +30% */
  height: 52px;                     /* +30% */
  border-radius: 999px;
  border: none;
  cursor: pointer;
  background: #080A14;
  color: #fff;
  font-size: 24px;                  /* +33% aprox para matching visual */
  transition:  0.2s ease;
}

.round-btn:hover,
.search-ico:hover,
.star:hover,
.plus:hover{
  background: #101223;
}

/* ======= SEARCH BAR ======= */
.search{
  flex: 1 1 auto;
  height: 52px;                     /* +30% */
  border-radius: 999px;
  border: none;
  background: #0E0F1A;
  color: #fff;
  padding: 0 24px;
  outline: none;
  font-size: 18px;
  font-family: 'Roboto', sans-serif;
  font-weight: 700;                 /* negrita */
  min-width: 140px;
  max-width: 350px;
  text-align: left;                 /* alineado a la izquierda */
}
.search::placeholder{
  color: rgba(255,255,255,0.6);
  font-family: 'Roboto', sans-serif;
  font-weight: 700;
}



/* ======= RESPONSIVE ======= */
/* no wrapping: mantener una sola fila; solo ajustamos gaps/ancho buscador en muy chico */
@media (max-width: 520px){
  .topbar-content{ gap: 6px; }
}
</style>
