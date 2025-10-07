// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/auth/LoginView.vue' 
import RegisterView from '../views/auth/RegisterView.vue'
import ForgotPassword from '@/views/auth/ForgotPassword.vue'
import HomeView from '@/views/HomeView.vue'
import AddListView from '@/views/AddListView.vue'
import ListView from '@/views/ListView.vue'
import Product from '@/views/Product.vue'
import Products from '@/views/products.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
    { path: '/ForgotPassword', name: 'ForgotPassword', component: ForgotPassword},
    { path: '/Home', name:'Home', component: HomeView},
    { path: '/AddList', name:'AddList', component: AddListView},
    { path: '/List', name:'List', component: ListView, props: true},
    { path:'/products', name:'products', component: Products}
  ],
})

export default router   