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
        @new="onNew" 
        @search="onSearch"
      />
    <!-- Profile Button -->
    <button class="profile-btn" @click="goProfile">
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
          class="card"
          @click="openCard(card)"
        >
          <div class="card-icon-wrapper" :style="{ borderColor: card.color, backgroundColor: card.color + '20' }">
            <img :src="card.icon" :alt="card.title" class="card-icon" />
          </div>
          <div class="card-content">
            <h3 class="card-title">{{ card.title }}</h3>
            <p class="card-sub">
              <em v-if="card.sharedWith?.length">
                {{ t('home.shared_with') }} {{ shareText(card.sharedWith) }}
              </em>
              <em v-else>{{ t('home.no_shares') }}</em>
            </p>
          </div>
          <button 
            class="favorite-btn" 
            :class="{ active: isFavorite(card.id) }"
            @click.stop="toggleFavorite(card.id)"
            :title="isFavorite(card.id) ? t('home.remove_favorite') : t('home.add_favorite')"
          >
            <img :src="IconStar" alt="Favorite" class="star-icon" />
          </button>
        </article>
      </main>
      
      <!-- Empty state -->
      <div v-else class="empty-state">
        <div class="empty-content">
          <div class="empty-icon">
            <img src="@/assets/emptyLogo.png"/>
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useShoppingListsStore } from '@/stores/shoppingLists';
import { useToast } from '@/composables/useToast';
import { useI18n } from '@/composables/useI18n';

import Topbar from '@/components/layout/Topbar.vue';
import Sidebar from '@/components/layout/Sidebar.vue';
import IconStar from '@/assets/star.svg';

const router = useRouter();
const shoppingListsStore = useShoppingListsStore();
const toast = useToast();
const { t } = useI18n();

const q = ref('');
const active = ref<'home'|'edit'|'history'|'pantries'|'products'>('history');
const sidebarOpen = ref(false);
const favorites = ref<Set<number>>(new Set());
const showFavoritesOnly = ref(false);

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
onMounted(async () => {
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
  try {
    await shoppingListsStore.fetchLists({ page: 1, per_page: 50 });
  } catch (error) {
    console.error('Error loading shopping lists:', error);
    toast.error(t('history.error_loading_lists'));
  }
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
  router.push(`/List/${card.id}`);
};

const goProfile = () => {
  router.push('/profile');
};

const onNew = () => {
  router.push('/lists/new');
};

// Favorites handlers
const isFavorite = (id: number): boolean => {
  return favorites.value.has(id);
};

const toggleFavorite = (id: number) => {
  if (favorites.value.has(id)) {
    favorites.value.delete(id);
  } else {
    favorites.value.add(id);
  }

  // Save to localStorage
  localStorage.setItem('favorites', JSON.stringify(Array.from(favorites.value)));
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
  top: 18px;
  right: 32px;
  z-index: 1100;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--bg);
  border: 2px solid var(--ink);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.15s;
}
.profile-btn img {
  width: 28px;
  height: 28px;
  object-fit: contain;
  filter: brightness(0) invert(1);
}
.profile-btn:hover {
  opacity: 0.8;
  transform: scale(1.07);
}
@media (max-width: 600px) {
  .profile-btn {
    top: 12px;
    right: 16px;
    width: 38px;
    height: 38px;
    padding: 4px;
  }
}
.layout-topbar {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: var(--bg);
  padding: 10px 0;
  min-height: 64px;
  display: flex;
  align-items: center;
  position: relative;
}

.layout-grid{
  margin-top: 60px;
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
  height: 44px;
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
}
.card:hover{ transform: translateY(-2px); }

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

.card-title{ margin:0; font-weight:800; color:#fff; font-size: 20px; text-align: left; }
.card-sub{ margin:4px 0 0; color:#CFC9E6; font-size:14px; text-align: left; }

/* Favorite Button */
.favorite-btn {
  position: absolute;
  bottom: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;
  padding: 0;
}

.favorite-btn .star-icon {
  width: 24px;
  height: 24px;
  filter: brightness(0) saturate(100%) invert(85%) sepia(8%) saturate(670%) hue-rotate(201deg) brightness(98%) contrast(91%);
  transition: filter 0.2s ease, transform 0.2s ease;
}

.favorite-btn:hover .star-icon {
  filter: brightness(0) saturate(100%) invert(78%) sepia(61%) saturate(471%) hue-rotate(3deg) brightness(104%) contrast(101%);
  transform: scale(1.15);
}

.favorite-btn.active .star-icon {
  filter: brightness(0) saturate(100%) invert(78%) sepia(61%) saturate(471%) hue-rotate(3deg) brightness(104%) contrast(101%);
  transform: scale(1.1);
}

.favorite-btn.active:hover .star-icon {
  transform: scale(1.2);
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