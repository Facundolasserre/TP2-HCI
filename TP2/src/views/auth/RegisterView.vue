<template>
  <section class="card">
    <div class="logo-wrap">
      <img src="@/assets/LogoHCI.png" alt="BagIt logo" class="logo-img" />
    </div>

    <h1 class="title">Welcome to BagIt</h1>

    <form class="form" @submit.prevent="onSubmit">
      <label class="label">Name</label>
      <input class="input" v-model.trim="name" type="text" autocomplete="given-name" required />

      <label class="label">Surname</label>
      <input class="input" v-model.trim="surname" type="text" autocomplete="family-name" required />

      <label class="label">Email</label>
      <input class="input" v-model.trim="email" type="email" autocomplete="email" required />

      <label class="label">Password</label>
      <input class="input" v-model="password" type="password" autocomplete="new-password" required />

      <label class="label">Rewrite password</label>
      <input class="input" v-model="password2" type="password" autocomplete="new-password" required />

      <!-- Error message -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <!-- Success message -->
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>

      <button class="btn" type="submit" :disabled="!isValid || isLoading">
        {{ isLoading ? 'Registering...' : 'Register' }}
      </button>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const name = ref('')
const surname = ref('')
const email = ref('')
const password = ref('')
const password2 = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const verificationToken = ref('')
const isLoading = ref(false)

const isEmail = (v: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

const isValid = computed(() =>
  name.value.trim().length > 0 &&
  name.value.length <= 50 &&
  surname.value.trim().length > 0 &&
  surname.value.length <= 50 &&
  isEmail(email.value) &&
  password.value.length >= 6 &&
  password.value === password2.value
)

async function onSubmit() {
  // Validación adicional
  if (!isValid.value) {
    errorMessage.value = 'Por favor complete todos los campos correctamente'
    return
  }

  errorMessage.value = ''
  successMessage.value = ''
  isLoading.value = true

  try {
    // Llamar al store para registrar
    const response = await authStore.register({
      name: name.value.trim(),
      surname: surname.value.trim(),
      email: email.value.trim(),
      password: password.value
    })

    // Mostrar token de verificación (el backend lo envía por email también)
    verificationToken.value = response.verificationToken
    successMessage.value = `✓ Registro exitoso! Revisa tu email para el código de verificación. Token: ${response.verificationToken}`
    
    console.log('✓ Registration successful')
    console.log('Verification token:', response.verificationToken)
    
    // Redirigir a verificación después de 3 segundos
    setTimeout(() => {
      router.push({ 
        name: 'verify-account',
        query: { email: email.value }
      })
    }, 3000)
    
  } catch (err: any) {
    console.error('Error en registro:', err)
    errorMessage.value = err.response?.data?.message || err.message || 'Error al registrarse. Por favor intenta de nuevo.'
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
  margin: 10px 0 24px;
}

.form{ display:flex; flex-direction:column; gap:20px; }
.label{ font-size:14px; color:#CFC9E6; text-align:left; margin-left:0; }
.input{
  background: transparent;
  color: #EDEAF6;
  border: none;
  border-bottom: 1px solid rgba(255,255,255,.35);
  height: 36px;
  outline: none;
  padding-left: 0;
}
.input:focus{ border-bottom-color: #fff; }

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
  word-break: break-all;
}

.links-row{ display:flex; justify-content:flex-end; }
.link{ color: #DAD4FF; font-size: 14px; cursor:pointer; }

.btn{
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

.signup-row{
  display:flex; gap:6px; justify-content:center;
  color:#CFC9E6;
  font-size:14px;
  border-top: 1px solid rgba(255,255,255,.25);
  padding-top: 14px;
  margin-top: 10px;
}
</style>