// Types for Lists and Products

export interface Product {
  id: string
  name: string
  amount: number
  notes?: string
  checked: boolean
  addedBy: string
  createdAt: string
}

export interface ShoppingList {
  id: string
  title: string
  icon: string
  sharedWith: string[]
  products: Product[]
  createdAt: string
  updatedAt: string
}

export interface CreateProductData {
  name: string
  amount: number
  notes?: string
  listId: string
}

export interface CreateListData {
  title: string
  icon: string
  sharedWith?: string[]
}
