// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue' 
import RegisterView from '../views/RegisterView.vue'
import ForgotPassword from '@/views/ForgotPassword.vue'
import HomeView from '@/views/HomeView.vue'


const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
    { path: '/ForgotPassword', name: 'ForgotPassword', component: ForgotPassword},
     { path: '/Home', name:'Home', component: HomeView}
    
  ],
})

export default router   