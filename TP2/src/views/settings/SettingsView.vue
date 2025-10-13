<template>
  <div class="settings-page">
  <div class="settings-wrap" v-if="!isLoading">
    <header class="topbar">
      <button class="home-btn" @click="goBack" aria-label="Go home">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      </button>
      <h1>Settings</h1>
    </header>

    <section class="card">
      <h2>Profile</h2>

      <div class="form-grid">
        <div>
          <div class="grid">
            <div class="col">
              <label for="name">Name</label>
              <input id="name" type="text" v-model="name" placeholder="Your name" />
            </div>
            <div class="col">
              <label for="username">Username</label>
              <input id="username" type="text" v-model="username" placeholder="Your username" />
            </div>
          </div>
        </div>
      </div>

      <div class="actions">
        <button class="btn primary" @click="handleProfileUpdate" :disabled="isSaving">
          {{ isSaving ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>

      <p v-if="profileMessage.text" class="msg" :class="profileMessage.type">
        {{ profileMessage.text }}
      </p>
    </section>

    <section class="card">
      <h2>Account Security</h2>
      <div class="form-grid">
        <div class="col full">
          <label for="email">Email</label>
          <input id="email" type="email" v-model="email" disabled />
        </div>

        <div class="col full">
          <label for="currentPassword">Current Password</label>
          <input
            id="currentPassword"
            type="password"
            v-model="currentPassword"
            autocomplete="current-password"
            placeholder="••••••••"
          />
        </div>

        <div class="grid">
          <div class="col">
            <label for="newPassword">New Password</label>
            <input id="newPassword" type="password" v-model="newPassword" placeholder="••••••••" />
          </div>
          <div class="col">
            <label for="confirmPassword">Repeat Password</label>
            <input id="confirmPassword" type="password" v-model="confirmPassword" placeholder="••••••••" />
          </div>
        </div>
      </div>

      <div class="actions">
        <button class="btn primary" @click="handleChangePassword" :disabled="isChangingPassword">
          {{ isChangingPassword ? 'Changing...' : 'Change Password' }}
        </button>
      </div>
      <p v-if="passwordMessage.text" class="msg" :class="passwordMessage.type">
        {{ passwordMessage.text }}
      </p>
    </section>

    <section class="card">
      <h2>Privacy & Data</h2>
      <div class="col full">
        <label>Delete Account</label>
        <p class="description">Once you delete your account, there is no going back. Please be certain.</p>
        <button class="btn danger" @click="deleteAccount">
          Delete permanently
        </button>
      </div>
    </section>
  </div>
  <div v-else class="loading">Loading…</div>
  </div>
</template>


<script setup lang="ts">
import { ref, computed, onMounted, reactive, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// --- State References ---
const name = ref('')
const username = ref('')
const photoUrl = ref('')
const email = ref('')
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

const isLoading = ref(true)
const isSaving = ref(false)
const isChangingPassword = ref(false)
const avatarUploading = ref(false)
let avatarPreviewUrl: string | null = null

// Use reactive objects for messages to keep them grouped
const profileMessage = reactive({ text: '', type: '' })
const passwordMessage = reactive({ text: '', type: '' })

// --- Computed Properties ---
const isProfileFormValid = computed(() => {
  return (
      name.value.trim().length > 0 &&
      name.value.length <= 50 &&
      username.value.trim().length > 0 &&
      username.value.length <= 50
  )
})

// --- Lifecycle Hooks ---
onMounted(async () => {
  try {
    await authStore.fetchCurrentUser()
    if (authStore.user) {
      name.value = authStore.user.name
      username.value = authStore.user.surname
      email.value = authStore.user.email
      // @ts-ignore - Assuming photoUrl might exist on the user object
      photoUrl.value = authStore.user.photoUrl || ''
    }
  } catch (err: any) {
    profileMessage.text = 'Error loading profile.'
    profileMessage.type = 'error'
    console.error(err)
  } finally {
    isLoading.value = false
  }
})

// --- Methods ---
async function handleProfileUpdate() {
  profileMessage.text = ''
  if (!isProfileFormValid.value) {
    profileMessage.text = 'Please fill in your name and username correctly.'
    profileMessage.type = 'error'
    return
  }
  isSaving.value = true
  try {
    await authStore.updateProfile({
      name: name.value.trim(),
      surname: username.value.trim(),
      // photoUrl: photoUrl.value.trim()
    })
    profileMessage.text = '✓ Profile updated successfully!'
    profileMessage.type = 'ok'
  } catch (err: any) {
    profileMessage.text = err.response?.data?.message || 'Error updating profile.'
    profileMessage.type = 'error'
  } finally {
    isSaving.value = false
  }
}

async function handleChangePassword() {
  passwordMessage.text = ''
  if (!currentPassword.value) {
    passwordMessage.text = 'Please provide your current password.'
    passwordMessage.type = 'error'
    return
  }
  if (!newPassword.value || !confirmPassword.value) {
    passwordMessage.text = 'Please fill in both password fields.'
    passwordMessage.type = 'error'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    passwordMessage.text = 'Passwords do not match.'
    passwordMessage.type = 'error'
    return
  }
  if (newPassword.value.length < 8) {
    passwordMessage.text = 'Password must be at least 8 characters long.'
    passwordMessage.type = 'error'
    return
  }
  isChangingPassword.value = true
  try {
    await authStore.changePassword(currentPassword.value, newPassword.value)
    passwordMessage.text = '✓ Password changed successfully!'
    passwordMessage.type = 'ok'
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (err: any) {
    passwordMessage.text = err.response?.data?.message || 'Error changing password.'
    passwordMessage.type = 'error'
  } finally {
    isChangingPassword.value = false
  }
}

async function onLogout() {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (err) {
    console.error('Error during logout:', err)
  }
}

async function deleteAccount() {
  if (confirm('This action is permanent. Are you sure?')) {
    try {
      // @ts-ignore
      if (typeof authStore.deleteAccount === 'function') {
        // @ts-ignore
        await authStore.deleteAccount()
        await onLogout()
      } else {
        alert('Delete functionality is not available.')
      }
    } catch (e) {
      alert('Could not delete the account.')
      console.error(e)
    }
  }
}

function goBack() {
  router.push('/home')
}

async function onAvatarChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) {
    return
  }

  avatarUploading.value = true

  try {
    const previewUrl = URL.createObjectURL(file)
    if (avatarPreviewUrl) {
      URL.revokeObjectURL(avatarPreviewUrl)
    }
    avatarPreviewUrl = previewUrl
    photoUrl.value = previewUrl
    profileMessage.text = 'Profile photo updated locally. Remember to save your changes.'
    profileMessage.type = 'ok'
  } catch (error) {
    console.error('Error updating avatar preview:', error)
    profileMessage.text = 'Could not update the profile photo.'
    profileMessage.type = 'error'
  } finally {
    avatarUploading.value = false
  }
}

onBeforeUnmount(() => {
  if (avatarPreviewUrl) {
    URL.revokeObjectURL(avatarPreviewUrl)
  }
})
</script>

<style scoped>

.settings-page {
  min-height: 140vh; /* fuerza que sea más alta que la pantalla */
}
/* ====== Base & Layout ====== */
.settings-wrap {
  width: min(800px, 92vw);
  margin: 0 auto 128px; /* aumentá este valor */
  min-height: 120vh; /* hace que el contenedor tenga más largo vertical */
  padding-top: 48px;
}

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

/* ====== User Profile Header ====== */

.profile-avatar-placeholder span {
  text-transform: uppercase;
}

.profile-name {
  font-size: 32px;
  font-weight: 500;
  color: #edeaf6;
  margin: 0 0 10px 0;
  letter-spacing: -0.5px;
}

.profile-description {
  font-size: 16px;
  color: #bdb7e3;
  line-height: 1.5;
  max-width: 500px;
  margin: 0 auto;
}

/* ====== Cards ====== */
.card {
  background: #26234a;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 10px 40px rgba(0,0,0,.3);
  text-align: left;
}
.card h2 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 20px;
  color: #edeaf6;
  opacity: .95;
}

/* ====== Forms ====== */
label {
  font-size: 13px;
  font-weight: 500;
  color: #bdb7e3;
  display: block;
  margin-bottom: 8px;
}

/* NEW: A parent grid for all form rows inside a card */
.form-grid {
  display: grid;
  gap: 20px; /* This now controls all vertical spacing */
}

input {
  width: 100%;
  height: 42px;
  border-radius: 8px;
  border: 1px solid #3a3768;
  background: #1f1d3b;
  color: #edeaf6;
  padding: 0 14px;
  font-size: 15px;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box; /* MODIFIED: Ensures padding/border don't affect width */
}
input:focus {
  outline: none;
  border-color: #6a6cf7;
  box-shadow: 0 0 0 3px rgba(106, 108, 247, 0.3);
}
input:disabled {
  background: #2a2745;
  color: #8a85a3;
  cursor: not-allowed;
}
input::placeholder {
  color: #6a6685;
}

.input-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #1f1d3b;
  border: 1px solid #3a3768;
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box; /* MODIFIED: Ensures padding/border don't affect width */
}
.input-group:focus-within {
  border-color: #6a6cf7;
  box-shadow: 0 0 0 3px rgba(106, 108, 247, 0.3);
}
.input-group input {
  border: none;
  background: transparent;
  border-radius: 0;
}
.input-group input:focus {
  box-shadow: none;
  outline: none;
}

.input-group input:first-child {
  border-right: 1px solid #3a3768;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  /* REMOVED: margin-bottom is no longer needed */
}

/* REMOVED: The .row class is replaced by the parent .form-grid gap */

.col.full {
  grid-column: 1 / -1;
}
.description {
  font-size: 14px;
  color: #8a85a3;
  margin: -4px 0 12px 0;
  line-height: 1.6;
}
/* ====== Buttons & Actions ====== */
.actions {
  margin-top: 20px;
  text-align: left; /* MODIFIED: Default alignment for all action containers is now left */
}

.btn {
  border: none;
  color: #fff;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-block; /* MODIFIED: Ensures buttons align correctly */
  text-align: center;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn.primary {
  background: #6a6cf7;
  min-width: 160px; /* Optional: A minimum width for primary buttons */
}

.btn.primary:hover:not(:disabled) {
  background: #535bf2;
}

.btn.danger {
  background: #e53e3e;
}

.btn.danger:hover:not(:disabled) {
  background: #c53030;
}

/* REMOVED: The complex, overriding rules for centering and right-aligning buttons are no longer needed.
   The simpler code above now handles all cases consistently. */
/* ====== Messages ====== */
.msg {
  margin-top: 16px;
  font-size: 14px;
  text-align: center;
  padding: 8px;
  border-radius: 6px;
}
.msg.ok {
  color: #48bb78;
  background-color: rgba(72, 187, 120, 0.1);
}
.msg.error {
  color: #f56565;
  background-color: rgba(245, 101, 101, 0.1);
}
.card:first-of-type .msg {
  text-align: right;
  background-color: transparent;
  padding-right: 0;
  margin-bottom: 0;
}

/* ====== Loading State ====== */
.loading {
  width: 100%;
  text-align: center;
  padding: 40px 0;
  color: #bdb7e3;
}

/* ====== Responsive Design ====== */
@media (max-width: 720px) {
  .grid, .input-group {
    grid-template-columns: 1fr;
  }
  .input-group .col:first-child {
    border-right: none;
    border-bottom: 1px solid #3a3768;
  }
  .card {
    padding: 16px;
  }
  .card .actions,
  .card:first-of-type .actions {
    text-align: center;
  }
  .card .actions .btn.primary,
  .card:first-of-type .actions .btn.primary {
    width: 100%;
    max-width: none;
  }
}

/* ==== change photo ==== */

.photo-grid {
  display: flex;
  justify-content: center; /* o flex-start si querés alinearlo a la izquierda */
  align-items: center;
  margin-top: 1rem;
}

.edit-profile-btn {
  background-color: #8B7CFF;
  color: #EDEAF6;
  border: none;
  border-radius: 10px;
  width: 120px;            /* ancho fijo */
  height: 120px;           /* alto fijo para hacerlo cuadrado */
  font-weight: bold;
  cursor: pointer;
  display: flex;
  flex-direction: column;  /* ícono arriba, texto abajo */
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.3s;
  margin: 1rem auto;       /* centrado */
}

.edit-profile-btn:hover {
  background-color: #7a6ad9;
}

.edit-profile-btn svg {
  width: 28px;
  height: 28px;
}

</style>
