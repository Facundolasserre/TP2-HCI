<template>
  <Teleport to="body">
    <transition name="fade">
      <div v-if="open" class="overlay" @click.self="emitClose" @keydown.esc="emitClose" tabindex="-1">
        <aside class="sidebar">
          <!-- ENCABEZADO CON 3 ICONOS -->
          <div class="sb-top">
            <button class="top-icon" @click="goToProfile" :aria-label="t('sidebar.account')">
              <img src="../../assets/fonts/settings.png" :alt="t('sidebar.account_icon')" />
            </button>
            <button class="top-icon brand-logo" :aria-label="t('sidebar.logo')">
              <img src="../../assets/LogoHCI.png" :alt="t('sidebar.logo_icon')" />
            </button>
            <button class="top-icon" @click="toggleLanguage" :aria-label="t('sidebar.language')">
              <img src="../../assets/fonts/language.png" :alt="t('sidebar.language_icon')" />
            </button>
          </div>

          <!-- MENÚ -->
          <ul class="sb-menu">
            <li
              :class="{ active: active === 'home' }"
              @click="goHome"
            >
              <svg class="ico" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <span>{{ t('sidebar.home') }}</span>
            </li>

            <li
              :class="{ active: active === 'edit' }"
              @click="set('edit')"
            >
              <svg class="ico" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              <span>{{ t('sidebar.edit_lists') }}</span>
            </li>

            <li
              :class="{ active: active === 'history' }"
              @click="goToHistory"
            >
              <svg class="ico" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <span>{{ t('sidebar.history') }}</span>
            </li>

            <li
              :class="{ active: active === 'pantries' }"
              @click="goToPantries"
            >
              <img src="../../assets/warehouse.svg" :alt="t('sidebar.pantries_icon')" class="ico-img" />
              <span>{{ t('sidebar.pantries') }}</span>
            </li>

            <li
              :class="{ active: active === 'products' }"
              @click="goToProducts"
            >
              <img src="../../assets/shopping_cart.svg" :alt="t('sidebar.products_icon')" class="ico-img" />
              <span>{{ t('sidebar.products') }}</span>
            </li>
          </ul>

          <!-- PIE -->
          <div class="sb-bottom">
            <button class="logout" @click="logout">
              <span>{{ t('sidebar.logout') }}</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
          </button>
        </div>
        </aside>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useI18n } from '@/composables/useI18n';
import { useLanguageStore } from '@/stores/language';

const router = useRouter();
const authStore = useAuthStore();
const { t } = useI18n();
const languageStore = useLanguageStore();

const props = defineProps<{
  open: boolean;
  active: 'home' | 'edit' | 'history' | 'pantries' | 'products';
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'update:active', v: 'home' | 'edit' | 'history' | 'pantries' | 'products'): void;
}>();

function emitClose() {
  emit('close');
}

function set(v: 'home' | 'edit' | 'history' | 'pantries' | 'products') {
  emit('update:active', v);
  emitClose();
}

async function logout() {
  await authStore.logout();
  emitClose();
  router.push('/login');
}

function goHome() {
  set('home');
  router.push('/Home');
  emitClose();
}

function goToProfile() {
  router.push('/settings');
  emitClose();
}

function goToPantries() {
  set('pantries');
  router.push('/pantries');
  emitClose();
}

function goToProducts() {
  set('products');
  router.push('/products');
  emitClose();
}

function toggleLanguage() {
  const newLang = languageStore.language === 'es' ? 'en' : 'es';
  languageStore.setLanguage(newLang);
}

function goToHistory(){
  set('history');
  router.push('/purchase-history');
  emitClose();
}
</script>

<style scoped>
:root {
  --panel: #322D59;
  --ink: #EDEAF6;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  z-index: 1000;
}

.sidebar {
  width: 300px;
  max-width: 85vw;
  height: 100%;
  background: #3D3A5C;
  display: flex;
  flex-direction: column;
  box-shadow: 6px 0 24px rgba(0, 0, 0, 0.45);
  z-index: 1001;
}

/* ===== TOP BAR CON 3 ICONOS ===== */
.sb-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px;
  gap: 16px;
}

.top-icon {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: background 0.2s ease;
  flex-shrink: 0;
}

.top-icon:hover {
  background: rgba(255, 255, 255, 0.08);
}

.top-icon img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.brand-logo img {
  width: 32px;
  height: 32px;
}

/* ===== MENÚ ===== */
.sb-menu {
  list-style: none;
  padding: 12px 16px;
  margin: 0;
  flex: 1;
}

.sb-menu li {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.15s ease;
  color: #fff;
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 4px;
}

.sb-menu li:hover {
  background: rgba(255, 255, 255, 0.08);
}

.sb-menu li.active {
  background: #2D2947;
}

.sb-menu .ico {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.sb-menu .ico-img {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

/* ===== BOTTOM (LOG OUT) ===== */
.sb-bottom {
  margin-top: auto;
  padding: 20px 16px 24px;
}

.logout {
  width: 100%;
  height: 48px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  background: #5B5DD9;
  color: #fff;
  font-weight: 700;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: 0.2s ease;
}

.logout:hover {
  background: #6B6FE8;
}

.logout svg {
  width: 20px;
  height: 20px;
}
</style>
