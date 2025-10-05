<template>
  <section class="card">
    <div class="logo-wrap">
      <img src="@/assets/LogoHCI.png" alt="BagIt logo" class="logo-img" />
    </div>

    <h1 class="title">Welcome to BagIt</h1>

    <form class="form" @submit.prevent="onSubmit">
      <label class="label">Email</label>
      <input class="input" v-model.trim="email" type="email" autocomplete="email" />

      <label class="label">Password</label>
      <input class="input" v-model="password" type="password" autocomplete="new-password" />

      <label class="label">Rewrite password</label>
      <input class="input" v-model="password2" type="password" autocomplete="new-password" />

      <button class="btn" type="submit" :disabled="isValid">Register</button> <!--chequear flag de isValid-->
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const email = ref('')
const password = ref('')
const password2 = ref('')

const isEmail = (v: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

const isValid = computed(() =>
  isEmail(email.value) &&
  password.value.length >= 6 &&
  password.value === password2.value
)

function onSubmit () {
  console.log('SUBMIT!')   // para verificar
  router.push('/ListPage')
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