import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ShoppingList, Product, CreateProductData, CreateListData } from '@/types/lists'

const STORAGE_KEY = 'shopping_lists'

// Load initial data from localStorage or return empty array
const loadListsFromStorage = (): ShoppingList[] => {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return []
    }
  }
  return []
}

export const useListsStore = defineStore('lists', () => {
  // State
  const lists = ref<ShoppingList[]>(loadListsFromStorage())
  const currentListId = ref<string | null>(null)

  // Getters
  const allLists = computed(() => lists.value)
  
  const currentList = computed(() => {
    if (!currentListId.value) return null
    return lists.value.find(l => l.id === currentListId.value) || null
  })

  const getListById = (id: string) => {
    return lists.value.find(l => l.id === id)
  }

  const getListByTitle = (title: string) => {
    return lists.value.find(l => l.title.toLowerCase() === title.toLowerCase())
  }

  // Actions
  const saveToStorage = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lists.value))
  }

  const setCurrentList = (listId: string) => {
    currentListId.value = listId
  }

  const createList = (data: CreateListData): ShoppingList => {
    const newList: ShoppingList = {
      id: `list_${Date.now()}`,
      title: data.title,
      icon: data.icon,
      color: data.color,
      sharedWith: data.sharedWith || [],
      products: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    lists.value.push(newList)
    saveToStorage()
    return newList
  }

  const deleteList = (listId: string) => {
    const index = lists.value.findIndex(l => l.id === listId)
    if (index !== -1) {
      lists.value.splice(index, 1)
      saveToStorage()
    }
  }

  const addProduct = (data: CreateProductData): Product => {
    const list = lists.value.find(l => l.id === data.listId)
    if (!list) throw new Error('List not found')

    const newProduct: Product = {
      id: `product_${Date.now()}`,
      name: data.name,
      amount: data.amount,
      notes: data.notes || '',
      checked: false,
      addedBy: 'You',
      createdAt: new Date().toISOString(),
    }

    list.products.push(newProduct)
    list.updatedAt = new Date().toISOString()
    saveToStorage()
    return newProduct
  }

  const addProductToMultipleLists = (productData: Omit<CreateProductData, 'listId'>, listIds: string[]) => {
    listIds.forEach(listId => {
      addProduct({ ...productData, listId })
    })
  }

  const updateProduct = (listId: string, productId: string, updates: Partial<Product>) => {
    const list = lists.value.find(l => l.id === listId)
    if (!list) return

    const product = list.products.find(p => p.id === productId)
    if (!product) return

    Object.assign(product, updates)
    list.updatedAt = new Date().toISOString()
    saveToStorage()
  }

  const toggleProductCheck = (listId: string, productId: string) => {
    const list = lists.value.find(l => l.id === listId)
    if (!list) return

    const product = list.products.find(p => p.id === productId)
    if (!product) return

    product.checked = !product.checked
    list.updatedAt = new Date().toISOString()
    saveToStorage()
  }

  const deleteProduct = (listId: string, productId: string) => {
    const list = lists.value.find(l => l.id === listId)
    if (!list) return

    const index = list.products.findIndex(p => p.id === productId)
    if (index !== -1) {
      list.products.splice(index, 1)
      list.updatedAt = new Date().toISOString()
      saveToStorage()
    }
  }

  const updateListAmount = (listId: string, productId: string, delta: number) => {
    const list = lists.value.find(l => l.id === listId)
    if (!list) return

    const product = list.products.find(p => p.id === productId)
    if (!product) return

    product.amount = Math.max(1, product.amount + delta)
    list.updatedAt = new Date().toISOString()
    saveToStorage()
  }

  return {
    // State
    lists,
    currentListId,

    // Getters
    allLists,
    currentList,
    getListById,
    getListByTitle,

    // Actions
    setCurrentList,
    createList,
    deleteList,
    addProduct,
    addProductToMultipleLists,
    updateProduct,
    toggleProductCheck,
    deleteProduct,
    updateListAmount,
  }
})
