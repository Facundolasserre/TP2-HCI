<template>
  <!-- WRAPPER TOPBAR -->
  <div class="layout-topbar">
    <Topbar
        v-model:query="q"
        :favorites-active="showFavoritesOnly"
        @toggle-sidebar="toggleSidebar"
        @filter="onFilter"
        @sort="onSort"
        @favorites="onFavs"
        @search="onSearch"
      />
    <!-- Profile Button -->
    <button class="profile-btn profile-pill" @click="goProfile">
      <img src="@/assets/fonts/account.png" alt="Profile" />
    </button>
  </div>

  <!-- WRAPPER GRID -->
  <div class="layout-grid">
    <div class="grid-container">
      <main v-if="filtered.length > 0" class="grid">
        <article
          v-for="card in filtered"
          :key="card.id"
          :class="['card', { 'menu-open': openMenuId === card.id }]"
          @click="openCard(card)"
        >
          <div class="card-icon-wrapper" :style="{ borderColor: card.color, backgroundColor: card.color + '20' }">
            <img :src="card.icon" :alt="card.title" class="card-icon" />
          </div>
          <div class="card-content">
            <h3 class="card-title">
              <span
                v-if="isFavorite(card.id)"
                class="favorite-indicator"
                aria-hidden="true"
              >
                ★
              </span>
              <span>{{ card.title }}</span>
              <span v-if="isFavorite(card.id)" class="sr-only">
                {{ t('home.favorite_badge') }}
              </span>
            </h3>
            <p class="card-sub">
              <em v-if="card.sharedWith?.length">
                {{ t('home.shared_with') }} {{ shareText(card.sharedWith) }}
              </em>
              <em v-else>{{ t('home.no_shares') }}</em>
            </p>
          </div>
          <div class="card-actions">
            <button
              class="actions-btn"
              type="button"
              @click.stop="toggleMenu(card.id)"
              :aria-expanded="openMenuId === card.id"
              aria-haspopup="true"
              :title="t('home.menu.open')"
            >
              <span class="sr-only">{{ t('home.menu.open') }}</span>
              <span aria-hidden="true" class="actions-icon">⋯</span>
            </button>
            <transition name="menu-fade">
              <div
                v-if="openMenuId === card.id"
                class="card-menu"
                role="menu"
                @click.stop
              >
                <button type="button" role="menuitem" @click="handleFavoriteAction(card.id)">
                  {{ isFavorite(card.id) ? t('home.menu.unfavorite') : t('home.menu.favorite') }}
                </button>
                <button type="button" role="menuitem" @click="handleReset(card.id)">
                  {{ t('home.menu.reset') }}
                </button>
                <button type="button" role="menuitem" class="danger" @click="handleDelete(card.id)">
                  {{ t('home.menu.delete') }}
                </button>
              </div>
            </transition>
          </div>
        </article>
      </main>
      
      <!-- Empty state -->
      <div v-else class="empty-state">
        <div class="empty-content">
          <div class="empty-icon">
            📝
          </div>
          <h2 class="empty-title">{{ t('history.empty_title') }}</h2>
          <p class="empty-text">{{ t('history.empty_text') }}</p>
        </div>
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useShoppingListsStore } from '@/stores/shoppingLists';
import { useToast } from '@/composables/useToast';
import { useI18n } from '@/composables/useI18n';

import Topbar from '@/components/layout/Topbar.vue';
import Sidebar from '@/components/layout/Sidebar.vue';

const router = useRouter();
const shoppingListsStore = useShoppingListsStore();
const toast = useToast();
const { t } = useI18n();

const q = ref('');
const active = ref<'home'|'history'|'pantries'|'products'>('history');
const sidebarOpen = ref(false);
const favorites = ref<Set<number>>(new Set());
const showFavoritesOnly = ref(false);
const openMenuId = ref<number | null>(null);

// Icon mapping using proper URL resolution for Vite
const iconMap: Record<string, string> = {
  'shopping_cart.svg': new URL('@/assets/shopping_cart.svg', import.meta.url).href,
  'family.svg': new URL('@/assets/family.svg', import.meta.url).href,
  'travel.svg': new URL('@/assets/travel.svg', import.meta.url).href,
  'liquor.svg': new URL('@/assets/liquor.svg', import.meta.url).href,
  'grid_view.svg': new URL('@/assets/grid_view.svg', import.meta.url).href,
  'lists.svg': new URL('@/assets/lists.svg', import.meta.url).href,
  'house.svg': new URL('@/assets/house.svg', import.meta.url).href,
  'work.svg': new URL('@/assets/work.svg', import.meta.url).href,
};

// Color palette for lists
const colors = [
  '#6B7CFF', // Primary blue
  '#5EC5A7', // Teal
  '#F0B429', // Yellow
  '#E76F51', // Coral
  '#E91E63', // Pink
  '#9B59B6', // Purple
  '#3498DB', // Blue
  '#F39C12', // Orange
];

// Type for card items
interface CardItem {
  id: number;
  title: string;
  icon: string;
  color: string;
  sharedWith: any[];
}

// Load favorites from localStorage and fetch lists
const saveFavorites = () => {
  localStorage.setItem('favorites', JSON.stringify(Array.from(favorites.value)));
};

const closeMenu = () => {
  openMenuId.value = null;
};

const toggleMenu = (id: number) => {
  openMenuId.value = openMenuId.value === id ? null : id;
};

const handleGlobalClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.card-menu') && !target.closest('.actions-btn')) {
    closeMenu();
  }
};

const refreshLists = async () => {
  try {
    await shoppingListsStore.fetchLists({ page: 1, per_page: 50 }, true);
  } catch (error) {
    console.error('Error loading shopping lists:', error);
    toast.error(t('history.error_loading_lists'));
  }
};

onMounted(async () => {
  document.addEventListener('click', handleGlobalClick);

  const storedFavorites = localStorage.getItem('favorites');
  if (storedFavorites) {
    try {
      const parsed = JSON.parse(storedFavorites);
      favorites.value = new Set(parsed);
    } catch (error) {
      console.error('Error parsing favorites from localStorage:', error);
    }
  }

  // Load shopping lists to filter completed ones
  await refreshLists();
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleGlobalClick);
});

// Computed list of completed lists
const completedLists = computed<CardItem[]>(() => {
  // Filter only completed lists (all items are purchased)
  const completed = shoppingListsStore.itemsWithCompletion.filter(list => list.completed);
  
  return completed.map(list => {
    const iconName = (list.metadata as any)?.icon || 'shopping_cart.svg';
    const icon = iconMap[iconName] || iconMap['shopping_cart.svg'];
    const color = (list.metadata as any)?.color || colors[list.id % colors.length];
    
    return {
      id: list.id,
      title: list.name,
      icon,
      color,
      sharedWith: list.sharedWith.map(u => `${u.name} ${u.surname}`),
    };
  });
});

// Filter lists based on search and favorites
const filtered = computed(() => {
  let lists = completedLists.value;

  // Filter by favorites
  if (showFavoritesOnly.value) {
    lists = lists.filter(card => favorites.value.has(card.id));
  }

  // Filter by search
  if (q.value.trim()) {
    const search = q.value.toLowerCase();
    lists = lists.filter(card => card.title.toLowerCase().includes(search));
  }

  return lists;
});

// Format shared with text
const shareText = (sharedWith: string[]) => {
  if (!sharedWith || sharedWith.length === 0) return '';
  if (sharedWith.length === 1) return sharedWith[0];
  return `${sharedWith.length} ${t('home.people')}`;
};

// Sidebar handlers
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

const closeSidebar = () => {
  sidebarOpen.value = false;
};

// Navigation handlers
const openCard = (card: any) => {
  closeMenu();
  router.push(`/List/${card.id}`);
};

const goProfile = () => {
  router.push('/profile');
};

// Favorites handlers
const isFavorite = (id: number): boolean => {
  return favorites.value.has(id);
};

const toggleFavorite = (id: number) => {
  if (favorites.value.has(id)) {
    favorites.value.delete(id);
    toast.info(t('home.favorite_removed'));
  } else {
    favorites.value.add(id);
    toast.success(t('home.favorite_added'));
  }

  // Save to localStorage
  saveFavorites();
};

const handleFavoriteAction = (id: number) => {
  toggleFavorite(id);
  closeMenu();
};

const handleReset = async (id: number) => {
  try {
    await shoppingListsStore.resetList(id);
    toast.success(t('home.menu.reset_success'));
    await refreshLists();
  } catch (error) {
    console.error('Error resetting list:', error);
    toast.error(t('home.menu.reset_error'));
  } finally {
    closeMenu();
  }
};

const handleDelete = async (id: number) => {
  try {
    await shoppingListsStore.deleteList(id);
    favorites.value.delete(id);
    saveFavorites();
    toast.success(t('home.menu.delete_success'));
    await refreshLists();
  } catch (error) {
    console.error('Error deleting list:', error);
    toast.error(t('home.menu.delete_error'));
  } finally {
    closeMenu();
  }
};

const onFavs = () => {
  showFavoritesOnly.value = !showFavoritesOnly.value;
};

// Placeholder handlers
const onFilter = () => {
  toast.info(t('home.filter_coming_soon'));
};

const onSort = () => {
  toast.info(t('home.sort_coming_soon'));
};

const onSearch = () => {
  // Search is handled reactively by the computed property
};
</script>

<style scoped>
:root {
  --bg: #1C1C30;
  --ink: #EDEAF6;
}

.profile-btn {
  position: absolute;
  top: 50%;
  right: 32px;
  transform: translateY(-50%);
  z-index: 1100;
  cursor: pointer;
  transition: transform 0.15s ease, opacity 0.15s ease;
}
.profile-btn:hover {
  transform: translateY(-50%) scale(1.05);
  opacity: 0.9;
}
@media (max-width: 600px) {
  .profile-btn {
    right: 16px;
  }
}
.layout-topbar {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: #322D59;
  height: 72px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
}

.layout-grid{
  margin-top: 72px;
  width: 100%;
  display: flex;
  justify-content: center;
}

.grid-container{
  max-width: 1280px;
  width: 100%;
  padding: 0 26px;
}

:deep(.topbar){
  display: flex;
  align-items: center;
  gap: 12px;
}
:deep(.topbar button),
:deep(.topbar .search),
:deep(.topbar input){
  height: 52px;
  display: inline-flex;
  align-items: center;
}

:deep(.search-wrap){
  display: inline-flex;
  align-items: center;
}

.grid{
  display:grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 34px;
  width: 100%;
}
@media (max-width: 860px){
  .grid{ grid-template-columns: 1fr; }
}

.card{
  background:#0E0F1A;
  border-radius:16px;
  display:flex;
  align-items:center;
  gap: 20px;
  padding: 20px;
  box-shadow: 0 10px 24px rgba(0,0,0,.35);
  transition: transform .08s ease;
  cursor:pointer;
  position: relative;
  z-index: 0;
}
.card:hover{ transform: translateY(-2px); }
.card.menu-open { z-index: 20; }

.card-icon-wrapper {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid;
  flex-shrink: 0;
}

.card-icon {
  width: 32px;
  height: 32px;
  filter: brightness(0) invert(1);
}

.card-content {
  flex-grow: 1;
}

.card-title{
  margin:0;
  font-weight:800;
  color:#fff;
  font-size: 20px;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 10px;
}
.favorite-indicator{
  color: #FFD166;
  font-size: 22px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 0 6px rgba(255, 209, 102, 0.45));
}
.card-sub{ margin:4px 0 0; color:#CFC9E6; font-size:14px; text-align: left; }

.card-actions {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  z-index: 25;
}

.actions-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: #EDEAF6;
  cursor: pointer;
  transition: color 0.15s ease, background 0.15s ease, transform 0.15s ease;
}

.actions-btn:hover {
  color: #FFFFFF;
  background: rgba(107, 124, 255, 0.18);
  transform: translateY(-1px);
}

.actions-btn:focus-visible {
  outline: 2px solid rgba(107, 124, 255, 0.6);
  outline-offset: 2px;
}

.actions-icon {
  font-size: 26px;
  letter-spacing: 6px;
  font-weight: 700;
  transform: translateY(-1px);
}

.card-actions .card-menu {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  min-width: 190px;
  background: rgba(18, 20, 38, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45);
  display: flex;
  flex-direction: column;
  padding: 8px 0;
  z-index: 30;
  backdrop-filter: blur(6px);
}

.card-menu button {
  width: 100%;
  background: transparent;
  border: none;
  color: #EDEAF6;
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  padding: 10px 18px;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.card-menu button + button {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.card-menu button:hover {
  background: rgba(107, 124, 255, 0.15);
}

.card-menu button.danger {
  color: #FF7B7B;
}

.card-menu button.danger:hover {
  background: rgba(255, 107, 107, 0.18);
  color: #FFE1E1;
}

.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: opacity 0.14s ease, transform 0.14s ease;
}

.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

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
