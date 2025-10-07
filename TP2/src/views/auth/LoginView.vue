<template>
  <section class="card">
    <!-- Logo -->
    <div class="logo-wrap">
      <div class="logo-circle">
        <img src="@/assets/LogoHCI.png" alt="BagIt logo" class="logo-img" />
      </div>
    </div>

    <!-- Título -->
    <h1 class="title">BagIt</h1>

    <!-- Form -->
    <form class="form" @submit.prevent="onSubmit">
      <label class="label">Username</label>
      <input class="input" v-model="username" type="text" autocomplete="username" />

      <label class="label">Password</label>
      <input class="input" v-model="password" type="password" autocomplete="current-password" />

      <div class="links-row">
        <a class="link" href="#" @click.prevent="onForgot">Forgot Password?</a>
      </div>

      <button class="btn" type="submit">Login</button>

      <div class="signup-row">
        <span>Don’t have an account?</span>
        <a class="link" href="#" @click.prevent="onSignUp">Sign Up</a>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { setAuthToken, setAuthUser } from '@/services/auth.service'

const username = ref('')
const password = ref('')
const router = useRouter()

function onSubmit() {
  console.log('login', { username: username.value, password: password.value })
  
  // TODO: Replace with actual API call
  // For now, simulate a successful login with a mock token
  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpZCI6MSwiZXhwIjoxOTk5OTk5OTk5fQ.mock'
  setAuthToken(mockToken)
  setAuthUser({ username: username.value })
  
  router.push('/Home')  // 👈 redirige después del login
}
function onForgot() {
  router.push('/ForgotPassword')
}
function onSignUp() {
  router.push('/register')
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


.label{ 
  font-size:14px;
  color:#CFC9E6; 
  text-align:left; 
  margin-left:0; 

}
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

.links-row{ 
  display:flex; 
  justify-content:flex-end;
  text-decoration: underline;

}
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
}
.signup-row {
  display: flex;
  gap: 6px;
  justify-content: flex-start; /* antes estaba center */
  color: #CFC9E6;
  font-size: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.25);
  padding-top: 14px;
  margin-top: 10px;
}

.signup-row a {
  color: #CFC9E6;
  text-decoration: underline;   /* subraya el texto */
  font-weight: 600;             /* opcional, para hacerlo más visible */
}

.signup-row a:hover {
  color: #ffffff;               /* opcional: cambia de color al pasar el mouse */
}
</style>