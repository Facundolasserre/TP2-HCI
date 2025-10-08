<template>
  <div class="change-password-page">
    <div class="password-card">
      <h1 class="title">Change Password</h1>
      <p class="subtitle">Enter your current password and choose a new one</p>

      <form class="form" @submit.prevent="onSubmit">
        <div class="field-group">
          <label class="label">Current Password</label>
          <input
            class="input"
            v-model="currentPassword"
            type="password"
            autocomplete="current-password"
            required
          />
        </div>

        <div class="field-group">
          <label class="label">New Password</label>
          <input
            class="input"
            v-model="newPassword"
            type="password"
            autocomplete="new-password"
            placeholder="Min. 6 characters"
            required
          />
        </div>

        <div class="field-group">
          <label class="label">Confirm New Password</label>
          <input
            class="input"
            v-model="confirmPassword"
            type="password"
            autocomplete="new-password"
            placeholder="Repeat new password"
            required
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
          <button class="btn btn-primary" type="submit" :disabled="!isValid || isLoading">
            {{ isLoading ? 'Changing...' : 'Change Password' }}
          </button>

          <button class="btn btn-ghost" type="button" @click="goBack">
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const isLoading = ref(false)

const isValid = computed(() => {
  return (
    currentPassword.value.length >= 6 &&
    newPassword.value.length >= 6 &&
    newPassword.value === confirmPassword.value
  )
})

async function onSubmit() {
  if (!isValid.value) {
    errorMessage.value = 'Por favor complete todos los campos correctamente'
    return
  }

  if (currentPassword.value === newPassword.value) {
    errorMessage.value = 'La nueva contraseña debe ser diferente a la actual'
    return
  }

  errorMessage.value = ''
  successMessage.value = ''
  isLoading.value = true

  try {
    await authStore.changePassword(currentPassword.value, newPassword.value)

    successMessage.value = '✓ Contraseña cambiada exitosamente! Redirigiendo...'
    
    // Clear form
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    
    // Redirect to profile after 2 seconds
    setTimeout(() => {
      router.push('/profile')
    }, 2000)
    
  } catch (err: any) {
    console.error('Error changing password:', err)
    errorMessage.value = err.response?.data?.message || err.message || 'Error al cambiar contraseña. Verifica tu contraseña actual.'
  } finally {
    isLoading.value = false
  }
}

function goBack() {
  router.push('/profile')
}
</script>

<style scoped>
.change-password-page {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: #23273A;
}

.password-card {
  width: 100%;
  max-width: 480px;
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
  margin: 0 0 8px;
  color: #EDEAF6;
}

.subtitle {
  text-align: center;
  color: #CFC9E6;
  font-size: 14px;
  margin: 0 0 32px;
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
