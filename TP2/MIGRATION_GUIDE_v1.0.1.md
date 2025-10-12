# Gu

ía de Migración a API v1.0.1

## ✅ Completado

### 1. Tipos de Paginación
- ✅ Creado `/src/types/pagination.ts` con `PaginatedResponse<T>` y `PaginationMeta`
- ✅ Estructura: `{ data: T[], pagination: { total, page, per_page, total_pages, has_next, has_prev } }`

### 2. Categories Service + Store
- ✅ `categories.service.ts`: Actualizado `listCategories()` para retornar `PaginatedResponse<GetCategory>`
- ✅ `categories.ts` store: Actualizado con `pagination` ref y getters computados
- ✅ Exports: `total`, `currentPage`, `perPage`, `totalPages`, `hasNextPage`, `hasPrevPage`

## 🔄 Pendiente

### 3. Products Service + Store
**Archivo**: `/src/api/products.service.ts`
```typescript
// Agregar import
import type { PaginatedResponse } from '@/types/pagination'

// Actualizar función listProducts
export const listProducts = async (
  params?: ProductsListParams
): Promise<PaginatedResponse<Product>> => {
  // ... build query params ...
  const response = await get<PaginatedResponse<Product>>(url)
  return response
}
```

**Archivo**: `/src/stores/products.ts`
```typescript
import type { PaginationMeta } from '@/types/pagination'

// Reemplazar total/currentPage/perPage por:
const pagination = ref<PaginationMeta>({
  total: 0, page: 1, per_page: 10, total_pages: 0,
  has_next: false, has_prev: false
})

// Actualizar fetchProducts:
const response = await productsService.listProducts(params)
items.value = response.data
pagination.value = response.pagination

// Agregar getters computados:
const total = computed(() => pagination.value.total)
const currentPage = computed(() => pagination.value.page)
// etc...
```

### 4. Shopping Lists Service + Store
**Archivos**: 
- `/src/api/shopping-lists.service.ts`
- `/src/stores/shoppingLists.ts`

Aplicar mismo patrón que categories.

### 5. List Items Service + Store
**Archivos**:
- `/src/api/list-items.service.ts`
- `/src/stores/listItems.ts`

Aplicar mismo patrón.

### 6. Pantries Service + Store
**Archivos**:
- `/src/api/pantries.service.ts` 
- `/src/api/pantry-items.service.ts`
- `/src/stores/pantries.ts`

Aplicar mismo patrón.

### 7. Purchases Service
**Archivo**: `/src/api/purchases.service.ts`

Si existe histórico de compras, aplicar mismo patrón.

### 8. Validación Nombre Único en Shopping Lists

**Archivo**: `/src/views/AddListView.vue` (o componente de creación/edición de listas)

```typescript
// En el submit handler:
try {
  await shoppingListsStore.createList(formData)
  // success...
} catch (error: any) {
  if (error.status === 409) {
    // Mostrar error inline en el campo name
    nameError.value = 'Ya existe una lista con ese nombre'
    return
  }
  // otros errores...
}
```

**Agregar traducción** en `/src/locales/es.json` y `/src/locales/en.json`:
```json
{
  "addList.error.name_exists": "Ya existe una lista con ese nombre",
  "addList.error.conflict": "Ya existe una lista con ese nombre"
}
```

### 9. Verificar Share Lists

**Archivo**: `/src/api/shopping-lists.service.ts`

Revisar `shareList()` - debería seguir funcionando con v1.0.1 (bugfix aplicado en backend)

```typescript
export const shareList = async (listId: number, email: string): Promise<any> => {
  const url = `${LISTS_ENDPOINT}/${listId}/share`
  const response = await post<any>(url, { email })
  return response
}
```

Si la respuesta cambió, actualizar tipo de retorno.

### 10. QA Checklist

- [ ] Categories: Cambiar per_page, navegar páginas, verificar total coincide
- [ ] Products: Cambiar per_page, navegar páginas, filtrar por categoría/pantry
- [ ] Shopping Lists: Cambiar per_page, navegar páginas
  - [ ] Crear lista con nombre duplicado → ver 409
  - [ ] Compartir lista → funciona sin error
- [ ] List Items: Paginación de items dentro de una lista
- [ ] Pantries: Paginación de pantries
- [ ] Pantry Items: Paginación de items de pantry
- [ ] Purchases: Si existe, verificar paginación

## Patrón General para Migración

### Service (*.service.ts)
```typescript
import type { PaginatedResponse } from '@/types/pagination'

export const listItems = async (params?): Promise<PaginatedResponse<ItemType>> => {
  // build query params...
  const response = await get<PaginatedResponse<ItemType>>(url)
  return response
}
```

### Store (*.ts)
```typescript
import type { PaginationMeta } from '@/types/pagination'

const pagination = ref<PaginationMeta>({
  total: 0, page: 1, per_page: 10, total_pages: 0,
  has_next: false, has_prev: false
})

const fetchItems = async (params?) => {
  const response = await service.listItems(params)
  items.value = response.data
  pagination.value = response.pagination
  return response
}

// Getters
const total = computed(() => pagination.value.total)
const currentPage = computed(() => pagination.value.page)
const perPage = computed(() => pagination.value.per_page)
const totalPages = computed(() => pagination.value.total_pages)
const hasNextPage = computed(() => pagination.value.has_next)
const hasPrevPage = computed(() => pagination.value.has_prev)

// En el return del store, exportar pagination y los getters
return {
  pagination,
  total,
  currentPage,
  perPage,
  totalPages,
  hasNextPage,
  hasPrevPage,
  // ... rest
}
```

### View (*.vue)
```typescript
// En la vista, usar los getters del store:
const store = useXStore()
const { total, currentPage, totalPages, hasNextPage, hasPrevPage } = storeToRefs(store)

// Para paginador:
<div class="pagination">
  <button @click="goToPage(currentPage - 1)" :disabled="!hasPrevPage">Anterior</button>
  <span>Página {{ currentPage }} de {{ totalPages }} ({{ total }} total)</span>
  <button @click="goToPage(currentPage + 1)" :disabled="!hasNextPage">Siguiente</button>
</div>
```

## Notas Importantes

1. **No hardcodear**: La API corre en `http://localhost:8080` pero esto debe venir de `./api/docs/swagger.json` → `servers[0].url`
2. **Verificar swagger.json**: Antes de asumir nombres de campos, revisar el spec
3. **409 Conflict**: Capturar y mostrar error amigable en creación/edición de listas
4. **JWT Bearer**: El cliente HTTP ya maneja auth, solo verificar que siga funcionando
5. **No cambiar estética**: Solo adaptar datos y paginación, mantener colores/layout

## Comandos

```bash
# Levantar API
cd TP2/api
npm install
npm run api

# Doc en: http://localhost:8080/docs
```

## Endpoints Afectados (todos ahora retornan paginación)

- `GET /api/categories` → `{ data: Category[], pagination: {...} }`
- `GET /api/products` → `{ data: Product[], pagination: {...} }`
- `GET /api/shopping-lists` → `{ data: ShoppingList[], pagination: {...} }`
- `GET /api/shopping-lists/{id}/items` → `{ data: ListItem[], pagination: {...} }`
- `GET /api/pantries` → `{ data: Pantry[], pagination: {...} }`
- `GET /api/pantries/{id}/items` → `{ data: PantryItem[], pagination: {...} }`
- `GET /api/purchases` → `{ data: Purchase[], pagination: {...} }`
