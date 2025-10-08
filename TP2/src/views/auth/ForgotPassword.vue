<template>
  <section class="card">
    <!-- Logo -->
    <div class="logo-wrap">
      <img src="@/assets/LogoHCI.png" alt="BagIt logo" class="logo-img" />
    </div>

    <!-- Título -->
    <h1 class="title">Reset password</h1>
    <p class="subtitle">Please enter your email address</p>

    <!-- Form -->
    <form class="form" @submit.prevent="onSubmit">
      <input
        class="input"
        v-model.trim="email"
        type="email"
        autocomplete="email"
        placeholder="your@email.com"
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
      
      <button class="btn" type="submit" :disabled="!isEmail(email) || isLoading">
        {{ isLoading ? 'Sending...' : 'Reset' }}
      </button>
    </form>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const email = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const isLoading = ref(false)

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

async function onSubmit() {
  if (!isEmail(email.value)) {
    errorMessage.value = 'Por favor ingresa un email válido'
    return
  }
  
  errorMessage.value = ''
  successMessage.value = ''
  isLoading.value = true

  try {
    // Send password recovery code
    await authStore.sendPasswordRecovery(email.value.trim())
    
    successMessage.value = '✓ Código de recuperación enviado! Revisa tu email'
    
    // Redirect to reset password page after 2 seconds
    setTimeout(() => {
      router.push({
        name: 'reset-password',
        query: { email: email.value }
      })
    }, 2000)
    
  } catch (err: any) {
    console.error('Error sending recovery code:', err)
    errorMessage.value = err.response?.data?.message || err.message || 'Error al enviar código de recuperación'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.card{
  width: 460px;
  background: #322D59;
  color: #EDEAF6;
  border-radius: 20px;
  padding: 40px 48px 28px;
  box-shadow: 0 12px 40px rgba(0,0,0,.35);
}

.logo-wrap{ display:flex; justify-content:center; margin-top:-56px; margin-bottom:6px; }

.logo-img { width: 200px; height: auto; object-fit: contain; }

.title{
  text-align:center;
  font-size: 40px;
  font-weight: 800;
  margin: 6px 0 6px;
}

.subtitle{
  text-align:center;
  color:#CFC9E6;
  font-size:14px;
  margin: 0 0 16px;
}

.form{ display:flex; flex-direction:column; gap:18px; }

.input{
  background: transparent;
  color: #EDEAF6;
  border: none;
  border-bottom: 1px solid rgba(255,255,255,.35);
  height: 36px;
  outline: none;
  padding: 0 2px;
}
.input:focus{ border-bottom-color:#fff; }

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

.btn{
  margin: 8px auto 0;
  width: 304px;           /* W:304 */
  height: 40px;           /* H:40 */
  border-radius: 999px;
  border: none;
  background: #FFFFFF;
  color: #000;
  font-weight: 800;
  font-size: 18px;
  cursor: pointer;
  transition: transform .06s ease, opacity .2s;
}
.btn:active{ transform: translateY(1px) scale(.995); }
.btn:disabled{ opacity:.9; cursor:not-allowed; }
</style>