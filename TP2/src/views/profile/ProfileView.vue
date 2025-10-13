<template>
<div class="profile-view">
<div class="home-profile">
  <header class="topbar">
    <button class="home-btn" @click="goBack" aria-label="Go home">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
    </button>
    <h1>Profile</h1>
  </header>
</div>

<div class="profile-container">
  <!-- Left Column -->
  <div class="left-column">
    <!-- Profile Header -->
    <div class="profile-header card">
      <div class="profile-info">
        <img :src="avatarFallback" alt="Profile Picture" class="profile-picture" />
        <div class="profile-text">
          <h2>{{ user?.name }} {{ user?.surname }}</h2>
          <p class="muted-text">
            Organized shopper since
            <span v-if="user?.createdAt">
                  {{ new Date(user.createdAt).toLocaleDateString() }}
                </span>
            <span v-else>—</span>
          </p>
          <p class="small-text muted-text">{{ user?.email }}</p>
        </div>
      </div>

      <div class="profile-actions">
        <!-- Cambiar foto -->
        <!-- Ir a Settings -->
        <button class="edit-profile-btn" @click="goToSettings">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
               class="bi bi-gear-fill" viewBox="0 0 16 16">
            <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413-1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
          </svg>
          Edit Profile
        </button>
      </div>
    </div>

    <!-- Shopping Overview -->
    <div class="shopping-overview">
      <div class="overview-card card">
        <div class="overview-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
               fill="currentColor" class="bi bi-list-ul" viewBox="0 0 16 16">
            <path fill-rule="evenodd"
                  d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm-3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
          </svg>
        </div>
        <h3>{{ overview?.lists ?? 0 }}</h3>
        <p>Active Lists</p>
        <p class="caption muted-text">—</p>
      </div>
      <div class="overview-card card">
        <div class="overview-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
               fill="currentColor" class="bi bi-shop" viewBox="0 0 16 16">
            <path d="M2.97 1.35A1 1 0 0 1 3.73 1h8.54a1 1 0 0 1 .76.35l2.609 3.044A1.5 1.5 0 0 1 16 5.37v.255a2.375 2.375 0 0 1-4.25 1.458A2.371 2.371 0 0 1 9.875 8 2.37 2.37 0 0 1 8 7.083 2.37 2.37 0 0 1 6.125 8a2.37 2.37 0 0 1-1.875-.917A2.375 2.375 0 0 1 0 5.625V5.37a1.5 1.5 0 0 1 .361-.976l2.61-3.045zm1.78 4.275a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 1 0 2.75 0V5.37a.5.5 0 0 0-.12-.325L12.27 2H3.73L1.12 5.045A.5.5 0 0 0 1 5.37v.255a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0zM1.5 8.5A.5.5 0 0 1 2 9v6h12V9a.5.5 0 0 1 1 0v6h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1V9a.5.5 0 0 1 .5-.5zM4 15h3v-5H4v5zm5-5v5h3V10H9zm-4-1h3v.5a.5.5 0 0 1-1 0V9H4v1z"/>
          </svg>
        </div>
        <h3>{{ overview?.pantries ?? 0 }}</h3>
        <p>Pantries</p>
        <p class="caption muted-text">—</p>
      </div>

      <div class="overview-card card">
        <div class="overview-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
               fill="currentColor" class="bi bi-cart3" viewBox="0 0 16 16">
            <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .49.598l-1 5a.5.5 0 0 1-.465.401l-9.397.472L4.415 11H13a.5.5 0 0 1 0 1H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
          </svg>
        </div>
        <h3>{{ overview?.products ?? 0 }}</h3>
        <p>Products</p>
        <p class="caption muted-text">—</p>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="recent-activity">
      <h3>Recent Activity</h3>
      <div class="activity-list">
        <div v-if="activity.length === 0" class="muted-text small-text">No recent activity</div>

        <div v-for="item in activity" :key="item.id" class="activity-item card">
          <p>{{ item.title }}</p>
          <div class="activity-details">
                <span class="badge" :class="item.type === 'purchase' ? 'completed' : 'active'">
                  {{ item.type }}
                </span>
            <span class="muted-text" v-if="item.description">{{ item.description }}</span>
            <span class="muted-text">
                  {{ new Date(item.date).toLocaleString() }}
                </span>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- Right Column -->
  <div class="right-column">
    <!-- Notifications -->
    <div class="notifications card">
      <h3>Notifications</h3>
      <div class="notification-item">
        <label for="email-notifications">Email Notifications</label>
        <label class="switch">
          <input
              type="checkbox"
              id="email-notifications"
              v-model="notifications.emailNotifications"
              @change="saveNotifications"
          >
          <span class="slider round"></span>
        </label>
      </div>
      <div class="notification-item">
        <label for="push-notifications">Push Notifications</label>
        <label class="switch">
          <input
              type="checkbox"
              id="push-notifications"
              v-model="notifications.pushNotifications"
              @change="saveNotifications"
          >
          <span class="slider round"></span>
        </label>
      </div>
      <div class="notification-item">
        <label for="price-alerts">Price Alerts</label>
        <label class="switch">
          <input
              type="checkbox"
              id="price-alerts"
              v-model="notifications.priceAlerts"
              @change="saveNotifications"
          >
          <span class="slider round"></span>
        </label>
      </div>
    </div>

    <!-- Dietary Preferences -->
    <div class="dietary-preferences card">
      <h3>Dietary Preferences</h3>

      <div class="preferences-tags">
        <!-- Tags dinámicas (clic para quitar) -->
        <span
            v-for="pref in dietary"
            :key="pref"
            class="tag"
            title="Remove"
            @click="removePref(pref)"
        >
      {{ pref }} <span aria-hidden="true" style="margin-left:.4rem;">×</span>
    </span>

        <!-- Modo agregar -->
        <template v-if="addingPref">
          <input
              v-model="newPref"
              class="tag-input"
              type="text"
              placeholder="Add preference…"
              @keyup.enter="addPref"
              @blur="addingPref=false"
              autofocus
          />
          <button class="add-btn" @click="addPref">+</button>
        </template>
        <template v-else>
          <button class="add-btn" @click="addingPref = true">+</button>
        </template>
      </div>
    </div>

    <!-- Favorite Stores -->
    <div class="favorite-stores card">
      <h3>Favorite Stores</h3>
      <div class="preferences-tags">
        <span
            v-for="store in stores"
            :key="store"
            class="tag"
            @click="removeStore(store)"
            title="Click to remove"
        >
          {{ store }} <span aria-hidden="true" style="margin-left:.4rem;">×</span>
        </span>

        <!-- Add store mode -->
        <template v-if="addingStore">
          <input
              v-model="newStore"
              class="tag-input"
              type="text"
              placeholder="Add store…"
              @keyup.enter="addStore"
              @blur="addingStore=false"
              autofocus
          />
          <button class="add-btn" @click="addStore">+</button>
        </template>
        <template v-else>
          <button class="add-btn" @click="addingStore = true">+</button>
        </template>
      </div>
    </div>
  </div>
</div>
</div>
</template>

<script setup lang="ts">

import { onMounted, ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import UsersService, { type GetUser, type UpdateUserProfile } from '@/api/users.service'
import { useAuthStore } from "@/stores/auth";

import { useToast } from "@/composables/useToast";

const router = useRouter();
const { success: showSuccessToast, error: showErrorToast } = useToast();

const auth = useAuthStore();
const { user, loading } = storeToRefs(auth);


type OverviewCounts = { lists: number; purchases: number; pantries: number; products: number; } | null;
type ActivityItem = { id: string; type: string; title: string; date: string; description?: string } ;

const overview = ref<OverviewCounts>(null);
const activity = ref<ActivityItem[]>([]);

function goBack() {
  router.push('/home');
}

const avatarFallback = computed(() => {
  // Generate a stable avatar URL based on user email or ID
  const seed = user.value?.email || user.value?.id?.toString() || 'default';
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
});

const goToSettings = () => router.push("/settings");

// ---------- NUEVO: estado y lógica para Dietary Preferences ----------
const dietary = ref<string[]>([]);
const addingPref = ref(false);
const newPref = ref("");


/* API*/
watch(user, (u) => {
  dietary.value = Array.isArray(u?.metadata?.dietaryPreferences) ? [...u!.metadata.dietaryPreferences] : [];
}, { immediate: true });

async function saveDietary() {
  try {
    // Store dietary preferences in metadata
    const currentMetadata = user.value?.metadata || {};
    const updatedMetadata = {
      ...currentMetadata,
      dietaryPreferences: dietary.value
    };

    await UsersService.updateProfile({
      name: user.value?.name || '',
      surname: user.value?.surname || '',
      metadata: updatedMetadata
    });

    // 🔄 refresca el perfil desde el backend
    await auth.fetchCurrentUser();

    // sincroniza estado local con backend
    dietary.value = Array.isArray(user.value?.metadata?.dietaryPreferences)
        ? [...(user.value!.metadata.dietaryPreferences!)]
        : [];

    showSuccessToast('Dietary preferences saved');
  } catch (e: any) {
    showErrorToast(e?.response?.data?.message ?? 'Could not save dietary preferences');
  }
}

async function addPref() {
  const v = newPref.value.trim();
  if (!v) return;
  if (dietary.value.includes(v)) {
    showErrorToast("Already added");
    return;
  }
  dietary.value.push(v);
  newPref.value = "";
  addingPref.value = false;
  try {
    await saveDietary();
    showSuccessToast("Preference added");
  } catch (e: any) {
    showErrorToast(e?.response?.data?.message ?? "Could not save");
  }
}

async function removePref(pref: string) {
  dietary.value = dietary.value.filter(p => p !== pref);
  try {
    await saveDietary();
    showSuccessToast("Preference removed");
  } catch (e: any) {
    showErrorToast(e?.response?.data?.message ?? "Could not save");
  }
}

// ---------- Notifications state and logic ----------
const notifications = ref({
  emailNotifications: true,
  pushNotifications: true,
  priceAlerts: false
});

// Sync notifications with user metadata
watch(user, (u) => {
  if (u?.metadata?.notifications) {
    notifications.value = {
      emailNotifications: u.metadata.notifications.emailNotifications ?? true,
      pushNotifications: u.metadata.notifications.pushNotifications ?? true,
      priceAlerts: u.metadata.notifications.priceAlerts ?? false
    };
  }
}, { immediate: true });

async function saveNotifications() {
  try {
    const currentMetadata = user.value?.metadata || {};
    const updatedMetadata = {
      ...currentMetadata,
      notifications: notifications.value
    };

    await UsersService.updateProfile({
      name: user.value?.name || '',
      surname: user.value?.surname || '',
      metadata: updatedMetadata
    });

    await auth.fetchCurrentUser();
    showSuccessToast('Notification preferences saved');
  } catch (e: any) {
    showErrorToast(e?.response?.data?.message ?? 'Could not save notification preferences');
  }
}

// ---------- Favorite Stores ----------
const stores = ref<string[]>([]);
const addingStore = ref(false);
const newStore = ref("");

watch(user, (u) => {
  stores.value = Array.isArray(u?.metadata?.favoriteStores) ? [...u!.metadata.favoriteStores] : [];
}, { immediate: true });

async function saveStores() {
  try {
    // Store favorite stores in metadata
    const currentMetadata = user.value?.metadata || {};
    const updatedMetadata = {
      ...currentMetadata,
      favoriteStores: stores.value
    };

    await UsersService.updateProfile({
      name: user.value?.name || '',
      surname: user.value?.surname || '',
      metadata: updatedMetadata
    });

    // 🔄 refresca el perfil desde el backend
    await auth.fetchCurrentUser();

    // sincroniza estado local con backend
    stores.value = Array.isArray(user.value?.metadata?.favoriteStores)
        ? [...(user.value!.metadata.favoriteStores!)]
        : [];

    showSuccessToast('Favorite stores saved');
  } catch (e: any) {
    showErrorToast(e?.response?.data?.message ?? 'Could not save favorite stores');
  }
}

async function addStore() {
  const v = newStore.value.trim();
  if (!v) return;
  if (stores.value.includes(v)) {
    showErrorToast("Already added");
    return;
  }
  stores.value.push(v);
  newStore.value = "";
  addingStore.value = false;
  try {
    await saveStores();
    showSuccessToast("Store added");
  } catch (e: any) {
    showErrorToast(e?.response?.data?.message ?? "Could not save");
  }
}

async function removeStore(store: string) {
  stores.value = stores.value.filter(s => s !== store);
  try {
    await saveStores();
    showSuccessToast("Store removed");
  } catch (e: any) {
    showErrorToast(e?.response?.data?.message ?? "Could not save");
  }
}

// ---------- Carga de datos del perfil (sin romper si no hay overview/activity) ----------
async function loadData() {
  try {
    if (!user.value) await auth.fetchCurrentUser();

  } catch (e: any) {
    showErrorToast(e?.response?.data?.message ?? "Failed to load profile");
  }
}






onMounted(loadData);


</script>
<style scoped>

/*  ====== HOME & SETTINGS ====== */
.topbar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 28px 0 20px;
}

.topbar h1 {
  font-size: 28px;
  margin: 0;
  font-weight: 600;
  color: #edeaf6;
}

.home-btn {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: #26234a;
  color: #bdb7e3;
  border: none;
  padding: 0;
  cursor: pointer;
}
.home-btn:hover {
  background: #312e5a;
  border-color: transparent;
}


/* Using styles from src/assets/styles.css */
.profile-view {
  background-color: #1C1C30;
  color: #EDEAF6;
  padding: 2rem;
  font-family: 'Roboto', sans-serif;
}

.profile-container {
  display: flex;
  gap: 2rem;
}

.left-column {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.right-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.card {
  background-color: #322D59;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.muted-text {
  color: #BDB7E3;
}

.small-text {
  font-size: 0.875rem;
}

/* Profile Header */
.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.profile-picture {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid #8B7CFF;
}

.edit-profile-btn{
  background-color: #8B7CFF;
  color: #EDEAF6;
  border: none
}

.profile-text h2 {
  margin: 0;
  font-weight: bold;
}

.profile-text p {
  margin: 0.25rem 0 0;
}


/* Shopping Overview */
.shopping-overview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.overview-card {
  text-align: center;
}

.icon {
  color: #8b7cf6; /* violet */
  width: 32px;
  height: 32px;
}

.overview-icon {
  color: #8B7CFF;
  margin-bottom: 1rem;
}

.overview-card h3 {
  margin: 0;
  font-size: 2rem;
}

.overview-card p {
  margin: 0.25rem 0 0;
}

.overview-card .caption {
  font-size: 0.875rem;
}

/* Recent Activity */
.recent-activity h3 {
  margin-bottom: 1rem;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
}

.activity-details {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: bold;
}

.badge.completed {
  background-color: #4CAF50;
  color: white;
}

.badge.active {
  background-color: #FFC107;
  color: #1C1C30;
}

/* Notifications */
.notifications h3,
.dietary-preferences h3,
.favorite-stores h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
}

.notification-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.notification-item:last-child {
  margin-bottom: 0;
}

/* Toggle Switch */
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 28px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #4A4472;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
}

input:checked + .slider {
  background-color: #8B7CFF;
}

input:focus + .slider {
  box-shadow: 0 0 1px #8B7CFF;
}

input:checked + .slider:before {
  transform: translateX(22px);
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

/* Dietary Preferences & Favorite Stores */
.preferences-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

.tag {
  background-color: rgba(139, 124, 255, 0.2);
  color: #BDB7E3;
  padding: 0.5rem 1rem;
  border-radius: 16px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.tag:hover {
  background-color: rgba(139, 124, 255, 0.4);
}

.add-btn {
  background-color: #4A4472;
  color: #EDEAF6;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  font-size: 1.5rem;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  justify-content: center;
  align-items: center;
  line-height: 1;
}

.add-btn:hover {
  background-color: #5f589c;
}

.tag-input {
  background-color: #4A4472;
  color: #EDEAF6;
  border: 1px solid #8B7CFF;
  border-radius: 16px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  outline: none;
  min-width: 150px;
}

.tag-input:focus {
  border-color: #BDB7E3;
  box-shadow: 0 0 0 2px rgba(139, 124, 255, 0.2);
}

.tag-input::placeholder {
  color: #BDB7E3;
}

/* Responsive */
@media (max-width: 1024px) {
  .profile-container {
    flex-direction: column;
  }
  .shopping-overview {
    grid-template-columns: 1fr;
  }
}
</style>
