// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue' 
import RegisterView from '../views/RegisterView.vue'
import ListPage from '@/views/ListPage.vue'
import ForgotPassword from '@/views/ForgotPassword.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
    { path: '/ListPage', name: 'ListPage', component: ListPage}, 
    { path: '/ForgotPassword', name: 'ForgotPassword', component: ForgotPassword}
  ],
})

export default router   