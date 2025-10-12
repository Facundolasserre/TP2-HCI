<template>
  <header class="topbar" data-topbar-build="v3">
    <!-- Botón con imagen (siempre a la izquierda) -->
    <button
        class="burger"
        @click="$emit('toggle-sidebar')"
        :aria-label="t('topbar.open_menu')"
    >
      <img
          src="../../assets/fonts/burgerIcon.png"
          :alt="t('topbar.menu_icon')"
          class="topbar-icon"
      />
    </button>

    <div class="topbar-content">
      <div class="icon-group">
        <button class="round-btn" :title="t('topbar.filter')" @click="$emit('filter')">
          <img
              src="../../assets/fonts/filter.png"
              :alt="t('topbar.filter_icon')"
              class="topbar-icon"
          />
        </button>
        <button class="round-btn" :title="t('topbar.sort')" @click="$emit('sort')">
          <img
              src="../../assets/fonts/sort.png"
              :alt="t('topbar.sort_icon')"
              class="topbar-icon"
          />
        </button>
      </div>

      <input
          :value="query"
          @input="$emit('update:query', ($event.target as HTMLInputElement).value)"
          class="search"
          type="text"
          :placeholder="t('topbar.search')"
      />

      <div class="icon-group">
        <button 
          class="star" 
          :class="{ active: favoritesActive }"
          :title="t('topbar.favorites')" 
          @click="$emit('favorites')"
        >
          <img
              :src="IconStar"
              :alt="t('topbar.favorites_icon')"
              class="topbar-icon star-icon"
              width="24"
              height="24"
          />
        </button>
        <button 
          v-if="showNewButton"
          class="plus special-plus" 
          :title="t('topbar.new')" 
          @click="$emit('new')"
        >
          ＋
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
import IconStar from '@/assets/star.svg';

defineProps<{ 
  query: string;
  favoritesActive?: boolean;
  showNewButton?: boolean;
}>();
defineEmits<{
  (e: 'toggle-sidebar'): void;
  (e: 'filter'): void;
  (e: 'sort'): void;
  (e: 'favorites'): void;
  (e: 'new'): void;
  (e: 'search'): void;
  (e: 'update:query', v: string): void;
}>();

const { t } = useI18n();
</script>


<style scoped>
:root{
  --ink: #EDEAF6;
}
.topbar{
  width: 100%;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
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
  transition: all 0.2s ease;
}

.star .star-icon {
  filter: brightness(0) saturate(100%) invert(92%) sepia(6%) saturate(488%) hue-rotate(201deg) brightness(101%) contrast(94%);
  transition: filter 0.2s ease, transform 0.2s ease;
}

.round-btn:hover,
.search-ico:hover,
.star:hover,
.plus:hover{
  background: #101223;
}

.star:hover .star-icon {
  transform: scale(1.1);
}

.star.active {
  background: #101223;
}

.star.active .star-icon {
  filter: brightness(0) saturate(100%) invert(78%) sepia(61%) saturate(471%) hue-rotate(3deg) brightness(104%) contrast(101%);
  transform: scale(1.05);
}

.star.active:hover .star-icon {
  transform: scale(1.15);
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