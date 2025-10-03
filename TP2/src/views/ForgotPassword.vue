<template>
  <section class="card">
    <!-- Logo -->
    <div class="logo-wrap">
      <img src="../assets/LogoHCI.png" alt="BagIt logo" class="logo-img" />
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
        placeholder=""
      />
      <button class="btn" type="submit" :disabled="!isEmail(email)">Reset</button>
    </form>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

async function onSubmit () {
  if (!isEmail(email.value)) return
  // Aquí iría tu llamada a API para enviar el mail de reseteo
  console.log('reset password for', email.value)

  // Llevar al login (o a una pantalla de "check your inbox")
  router.push('/login')
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