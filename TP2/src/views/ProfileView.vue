<template>
  <div class="profile-page">
    <div class="profile-card">
      <h1 class="title">My Profile</h1>

      <div v-if="isLoading" class="loading">Loading...</div>

      <form v-else class="form" @submit.prevent="onSave">
        <div class="field-group">
          <label class="label">Name</label>
          <input
            class="input"
            v-model.trim="name"
            type="text"
            maxlength="50"
            required
          />
        </div>

        <div class="field-group">
          <label class="label">Surname</label>
          <input
            class="input"
            v-model.trim="surname"
            type="text"
            maxlength="50"
            required
          />
        </div>

        <div class="field-group">
          <label class="label">Email</label>
          <input
            class="input"
            v-model="email"
            type="email"
            disabled
            title="Email cannot be changed"
          />
        </div>

        <!-- Error message -->
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <!-- Success message -->
        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>

        <div class="button-group">
          <button class="btn btn-primary" type="submit" :disabled="!isValid || isSaving">
            {{ isSaving ? 'Saving...' : 'Save Changes' }}
          </button>

          <button class="btn btn-secondary" type="button" @click="goToChangePassword">
            Change Password
          </button>

          <button class="btn btn-danger" type="button" @click="onLogout">
            Logout
          </button>

          <button class="btn btn-ghost" type="button" @click="goBack">
            Back to Home
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const name = ref('')
const surname = ref('')
const email = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const isLoading = ref(true)
const isSaving = ref(false)

const isValid = computed(() => {
  return (
    name.value.trim().length > 0 &&
    name.value.length <= 50 &&
    surname.value.trim().length > 0 &&
    surname.value.length <= 50
  )
})

onMounted(async () => {
  try {
    // Load user profile
    await authStore.fetchCurrentUser()
    
    if (authStore.user) {
      name.value = authStore.user.name
      surname.value = authStore.user.surname
      email.value = authStore.user.email
    }
  } catch (err: any) {
    errorMessage.value = 'Error loading profile'
    console.error(err)
  } finally {
    isLoading.value = false
  }
})

async function onSave() {
  if (!isValid.value) {
    errorMessage.value = 'Por favor complete todos los campos correctamente'
    return
  }

  errorMessage.value = ''
  successMessage.value = ''
  isSaving.value = true

  try {
    await authStore.updateProfile({
      name: name.value.trim(),
      surname: surname.value.trim(),
    })

    successMessage.value = '✓ Profile updated successfully!'
  } catch (err: any) {
    errorMessage.value = err.response?.data?.message || err.message || 'Error updating profile'
  } finally {
    isSaving.value = false
  }
}

function goToChangePassword() {
  router.push('/change-password')
}

async function onLogout() {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (err) {
    console.error('Error during logout:', err)
  }
}

function goBack() {
  router.push('/Home')
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: #23273A;
}

.profile-card {
  width: 100%;
  max-width: 500px;
  background: #322D59;
  color: #EDEAF6;
  border-radius: 20px;
  padding: 40px 48px;
  box-shadow: 0 12px 40px rgba(0,0,0,.35);
}

.title {
  text-align: center;
  font-size: 40px;
  font-weight: 800;
  margin: 0 0 32px;
  color: #EDEAF6;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #CFC9E6;
  font-size: 18px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label {
  font-size: 14px;
  color: #CFC9E6;
  font-weight: 600;
}

.input {
  background: transparent;
  color: #EDEAF6;
  border: none;
  border-bottom: 2px solid rgba(255,255,255,.35);
  height: 40px;
  outline: none;
  padding: 0 4px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.input:focus {
  border-bottom-color: #fff;
}

.input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  color: #ff6b6b;
  font-size: 14px;
  padding: 12px;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 8px;
  text-align: center;
}

.success-message {
  color: #51cf66;
  font-size: 14px;
  padding: 12px;
  background: rgba(81, 207, 102, 0.1);
  border-radius: 8px;
  text-align: center;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}

.btn {
  width: 100%;
  height: 44px;
  border-radius: 12px;
  border: none;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #6B7CFF;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: #7F89FF;
  transform: translateY(-2px);
}

.btn-secondary {
  background: #4B497C;
  color: #EDEAF6;
}

.btn-secondary:hover {
  background: #5B5990;
}

.btn-danger {
  background: #ff6b6b;
  color: #fff;
}

.btn-danger:hover {
  background: #ff5252;
}

.btn-ghost {
  background: transparent;
  color: #CFC9E6;
  border: 1px solid rgba(255,255,255,.25);
}

.btn-ghost:hover {
  background: rgba(255,255,255,.05);
  border-color: rgba(255,255,255,.4);
}
</style>
