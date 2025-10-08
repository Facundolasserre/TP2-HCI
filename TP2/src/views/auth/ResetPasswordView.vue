<template>
  <section class="card">
    <!-- Logo -->
    <div class="logo-wrap">
      <img src="@/assets/LogoHCI.png" alt="BagIt logo" class="logo-img" />
    </div>

    <!-- Título -->
    <h1 class="title">Reset Password</h1>
    <p class="subtitle">Enter the code sent to {{ email }} and your new password</p>

    <!-- Form -->
    <form class="form" @submit.prevent="onSubmit">
      <label class="label">Recovery Code</label>
      <input
        class="input"
        v-model.trim="code"
        type="text"
        placeholder="Enter 16-character code"
        maxlength="16"
        required
      />

      <label class="label">New Password</label>
      <input
        class="input"
        v-model="newPassword"
        type="password"
        autocomplete="new-password"
        placeholder="Min. 6 characters"
        required
      />

      <label class="label">Confirm Password</label>
      <input
        class="input"
        v-model="confirmPassword"
        type="password"
        autocomplete="new-password"
        placeholder="Repeat new password"
        required
      />

      <!-- Error message -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <!-- Success message -->
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>

      <button class="btn" type="submit" :disabled="!isValid || isLoading">
        {{ isLoading ? 'Resetting...' : 'Reset Password' }}
      </button>

      <div class="links-row">
        <a class="link" href="#" @click.prevent="resendCode">Resend code</a>
        <span class="separator">|</span>
        <a class="link" href="#" @click.prevent="goToLogin">Back to login</a>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const code = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const email = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const isLoading = ref(false)

const isValid = computed(() => {
  return (
    code.value.trim().length > 0 &&
    newPassword.value.length >= 6 &&
    newPassword.value === confirmPassword.value
  )
})

onMounted(() => {
  // Get email from query params
  email.value = (route.query.email as string) || ''
})

async function onSubmit() {
  if (!isValid.value) {
    errorMessage.value = 'Por favor complete todos los campos correctamente'
    return
  }

  errorMessage.value = ''
  successMessage.value = ''
  isLoading.value = true

  try {
    // Reset password
    await authStore.resetPassword(code.value.trim(), newPassword.value)

    successMessage.value = '✓ Contraseña restablecida! Redirigiendo al login...'
    
    // Redirect to login after 2 seconds
    setTimeout(() => {
      router.push('/login')
    }, 2000)
    
  } catch (err: any) {
    console.error('Error resetting password:', err)
    errorMessage.value = err.response?.data?.message || err.message || 'Código inválido o expirado'
  } finally {
    isLoading.value = false
  }
}

async function resendCode() {
  if (!email.value) {
    errorMessage.value = 'No se encontró el email'
    return
  }

  errorMessage.value = ''
  successMessage.value = ''
  isLoading.value = true

  try {
    await authStore.sendPasswordRecovery(email.value)
    successMessage.value = '✓ Código reenviado! Revisa tu email'
  } catch (err: any) {
    errorMessage.value = err.response?.data?.message || err.message || 'Error al reenviar código'
  } finally {
    isLoading.value = false
  }
}

function goToLogin() {
  router.push('/login')
}
</script>

<style scoped>
.card {
  width: 460px;
  background: #322D59;
  color: #EDEAF6;
  border-radius: 20px;
  padding: 40px 48px 28px;
  box-shadow: 0 12px 40px rgba(0,0,0,.35);
}

.logo-wrap {
  display: flex;
  justify-content: center;
  margin-top: -56px;
  margin-bottom: 6px;
}

.logo-img {
  width: 200px;
  height: auto;
  object-fit: contain;
}

.title {
  text-align: center;
  font-size: 40px;
  font-weight: 800;
  margin: 10px 0 12px;
}

.subtitle {
  text-align: center;
  color: #CFC9E6;
  font-size: 14px;
  margin: 0 0 24px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.label {
  font-size: 14px;
  color: #CFC9E6;
  text-align: left;
  margin-left: 0;
}

.input {
  background: transparent;
  color: #EDEAF6;
  border: none;
  border-bottom: 1px solid rgba(255,255,255,.35);
  height: 36px;
  outline: none;
  padding-left: 0;
}

.input:focus {
  border-bottom-color: #fff;
}

.error-message {
  color: #ff6b6b;
  font-size: 14px;
  padding: 10px;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 8px;
  text-align: center;
  margin-top: -10px;
}

.success-message {
  color: #51cf66;
  font-size: 14px;
  padding: 10px;
  background: rgba(81, 207, 102, 0.1);
  border-radius: 8px;
  text-align: center;
  margin-top: -10px;
}

.btn {
  margin: 12px auto 10px;
  width: 304px;
  height: 40px;
  border-radius: 999px;
  border: none;
  background: #FFFFFF;
  color: #000;
  font-weight: 800;
  font-size: 18px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn:hover:not(:disabled) {
  opacity: 0.9;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.links-row {
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
  padding-top: 14px;
  margin-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.25);
}

.link {
  color: #DAD4FF;
  font-size: 14px;
  cursor: pointer;
  text-decoration: underline;
}

.link:hover {
  color: #fff;
}

.separator {
  color: #CFC9E6;
  opacity: 0.5;
}
</style>
