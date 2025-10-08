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
import CategoriesListView from '@/views/CategoriesListView.vue'
import CategoryFormView from '@/views/CategoryFormView.vue'
import CategoryDetailView from '@/views/CategoryDetailView.vue'
import ShoppingListsView from '@/views/ShoppingListsView.vue'
import ShoppingListFormView from '@/views/ShoppingListFormView.vue'
import ShoppingListDetailView from '@/views/ShoppingListDetailView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
    { path: '/ForgotPassword', name: 'ForgotPassword', component: ForgotPassword},
    { path: '/Home', name:'Home', component: HomeView},
    { path: '/AddList', name:'AddList', component: AddListView},
    { path: '/List/:id', name:'List', component: ListView, props: true},
    { path:'/products', name:'products', component: Products},
    
    // Categories routes
    { path: '/categories', name: 'categories', component: CategoriesListView },
    { path: '/categories/new', name: 'categories-create', component: CategoryFormView },
    { path: '/categories/:id', name: 'category-detail', component: CategoryDetailView },
    { path: '/categories/:id/edit', name: 'category-edit', component: CategoryFormView },

    // Shopping Lists routes (API-connected)
    { path: '/lists', name: 'shopping-lists', component: ShoppingListsView },
    { path: '/lists/new', name: 'shopping-list-create', component: ShoppingListFormView },
    { path: '/lists/:id', name: 'shopping-list-detail', component: ShoppingListDetailView },
    { path: '/lists/:id/edit', name: 'shopping-list-edit', component: ShoppingListFormView },
  ],
})

export default router   