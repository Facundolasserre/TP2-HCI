// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Auth views
import LoginView from '../views/auth/LoginView.vue' 
import RegisterView from '../views/auth/RegisterView.vue'
import VerifyAccountView from '../views/auth/VerifyAccountView.vue'
import ForgotPassword from '@/views/auth/ForgotPassword.vue'
import ResetPasswordView from '@/views/auth/ResetPasswordView.vue'

// Protected views
import HomeView from '@/views/HomeView.vue'
import ProfileView from '@/views/ProfileView.vue'
import ChangePasswordView from '@/views/ChangePasswordView.vue'
import AddListView from '@/views/AddListView.vue'
import ListView from '@/views/ListView.vue'
import Product from '@/views/Product.vue'
import Products from '@/views/products.vue'

// Categories
import CategoriesListView from '@/views/CategoriesListView.vue'
import CategoryFormView from '@/views/CategoryFormView.vue'
import CategoryDetailView from '@/views/CategoryDetailView.vue'

// Shopping Lists
import ShoppingListsView from '@/views/ShoppingListsView.vue'
import ShoppingListFormView from '@/views/ShoppingListFormView.vue'
import ShoppingListDetailView from '@/views/ShoppingListDetailView.vue'

// Pantries
import PantriesListView from '@/views/PantriesListView.vue'
import PantryFormView from '@/views/PantryFormView.vue'
import PantryDetailView from '@/views/PantryDetailView.vue'

// Products
import ProductsListView from '@/views/ProductsListView.vue'
import ProductFormView from '@/views/ProductFormView.vue'
import ProductDetailView from '@/views/ProductDetailView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Public routes
    { 
      path: '/', 
      redirect: '/login' 
    },
    { 
      path: '/login', 
      name: 'login', 
      component: LoginView,
      meta: { requiresAuth: false }
    },
    { 
      path: '/register', 
      name: 'register', 
      component: RegisterView,
      meta: { requiresAuth: false }
    },
    { 
      path: '/verify-account', 
      name: 'verify-account', 
      component: VerifyAccountView,
      meta: { requiresAuth: false }
    },
    { 
      path: '/forgot-password', 
      name: 'ForgotPassword', 
      component: ForgotPassword,
      meta: { requiresAuth: false }
    },
    { 
      path: '/reset-password', 
      name: 'reset-password', 
      component: ResetPasswordView,
      meta: { requiresAuth: false }
    },

    // Protected routes
    { 
      path: '/Home', 
      name: 'Home', 
      component: HomeView,
      meta: { requiresAuth: true }
    },
    { 
      path: '/profile', 
      name: 'profile', 
      component: ProfileView,
      meta: { requiresAuth: true }
    },
    { 
      path: '/change-password', 
      name: 'change-password', 
      component: ChangePasswordView,
      meta: { requiresAuth: true }
    },
    { 
      path: '/AddList', 
      name: 'AddList', 
      component: AddListView,
      meta: { requiresAuth: true }
    },
    { 
      path: '/List/:id', 
      name: 'List', 
      component: ListView, 
      props: true,
      meta: { requiresAuth: true }
    },
    { 
      path: '/products', 
      name: 'products', 
      component: Products,
      meta: { requiresAuth: true }
    },
    
    // Categories routes (protected)
    { 
      path: '/categories', 
      name: 'categories', 
      component: CategoriesListView,
      meta: { requiresAuth: true }
    },
    { 
      path: '/categories/new', 
      name: 'categories-create', 
      component: CategoryFormView,
      meta: { requiresAuth: true }
    },
    { 
      path: '/categories/:id', 
      name: 'category-detail', 
      component: CategoryDetailView,
      meta: { requiresAuth: true }
    },
    { 
      path: '/categories/:id/edit', 
      name: 'category-edit', 
      component: CategoryFormView,
      meta: { requiresAuth: true }
    },

    // Shopping Lists routes (protected)
    { 
      path: '/lists', 
      name: 'shopping-lists', 
      component: ShoppingListsView,
      meta: { requiresAuth: true }
    },
    { 
      path: '/lists/new', 
      name: 'shopping-list-create', 
      component: ShoppingListFormView,
      meta: { requiresAuth: true }
    },
    { 
      path: '/lists/:id', 
      name: 'shopping-list-detail', 
      component: ShoppingListDetailView,
      meta: { requiresAuth: true }
    },
    { 
      path: '/lists/:id/edit', 
      name: 'shopping-list-edit', 
      component: ShoppingListFormView,
      meta: { requiresAuth: true }
    },

    // Pantries routes (protected)
    { 
      path: '/pantries', 
      name: 'pantries', 
      component: PantriesListView,
      meta: { requiresAuth: true }
    },
    { 
      path: '/pantries/new', 
      name: 'pantry-create', 
      component: PantryFormView,
      meta: { requiresAuth: true }
    },
    { 
      path: '/pantries/:id', 
      name: 'pantry-detail', 
      component: PantryDetailView,
      meta: { requiresAuth: true }
    },
    { 
      path: '/pantries/:id/edit', 
      name: 'pantry-edit', 
      component: PantryFormView,
      meta: { requiresAuth: true }
    },

    // Products routes (protected)
    { 
      path: '/products', 
      name: 'products-list', 
      component: ProductsListView,
      meta: { requiresAuth: true }
    },
    { 
      path: '/products/new', 
      name: 'product-create', 
      component: ProductFormView,
      meta: { requiresAuth: true }
    },
    { 
      path: '/products/:id', 
      name: 'product-detail', 
      component: ProductDetailView,
      meta: { requiresAuth: true }
    },
    { 
      path: '/products/:id/edit', 
      name: 'product-edit', 
      component: ProductFormView,
      meta: { requiresAuth: true }
    },
  ],
})

// Navigation guard - check authentication
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.meta.requiresAuth !== false // Default to true

  // If route requires auth and user is not authenticated
  if (requiresAuth && !authStore.isAuthenticated) {
    console.warn('⚠️ Route requires authentication, redirecting to login')
    next('/login')
  } 
  // If user is authenticated and trying to access login/register
  else if (authStore.isAuthenticated && (to.path === '/login' || to.path === '/register')) {
    console.log('✓ User already authenticated, redirecting to Home')
    next('/Home')
  }
  // Allow navigation
  else {
    next()
  }
})

export default router   