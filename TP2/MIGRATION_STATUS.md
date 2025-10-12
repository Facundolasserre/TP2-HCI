# Cambios Aplicados y Pendientes - API v1.0.1

## ✅ COMPLETADO

### 1. Infraestructura Base
- ✅ **`/src/types/pagination.ts`**: Creado con `PaginatedResponse<T>` y `PaginationMeta`
- ✅ **`MIGRATION_GUIDE_v1.0.1.md`**: Guía completa con patrón de migración

### 2. Categories (100% migrado)
- ✅ `/src/api/categories.service.ts`: `listCategories()` retorna `PaginatedResponse<GetCategory>`
- ✅ `/src/stores/categories.ts`: Store actualizado con `pagination` ref y getters computados
- ✅ Exports: `pagination`, `total`, `currentPage`, `perPage`, `totalPages`, `hasNextPage`, `hasPrevPage`

### 3. Products (Service migrado)
- ✅ `/src/api/products.service.ts`: `listProducts()` retorna `PaginatedResponse<Product>`
- ⚠️ PENDIENTE: `/src/stores/products.ts` - aplicar mismo patrón que categories

## 🔧 PENDIENTE (Alta Prioridad)

### 4. Products Store
**Archivo**: `/src/stores/products.ts`

Aplicar patrón de categories:
```typescript
import type { PaginationMeta } from '@/types/pagination'

// Reemplazar total/currentPage/perPage por:
const pagination = ref<PaginationMeta>({
  total: 0, page: 1, per_page: 10, total_pages: 0,
  has_next: false, has_prev: false
})

// En fetchProducts:
const response = await productsService.listProducts(params)
items.value = response.data
pagination.value = response.pagination

// Agregar computed getters:
const total = computed(() => pagination.value.total)
const currentPage = computed(() => pagination.value.page)
const perPage = computed(() => pagination.value.per_page)
const totalPages = computed(() => pagination.value.total_pages)
const hasNextPage = computed(() => pagination.value.has_next)
const hasPrevPage = computed(() => pagination.value.has_prev)

// En reset():
pagination.value = { total: 0, page: 1, per_page: 10, total_pages: 0, has_next: false, has_prev: false }

// En return:
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

### 5. Shopping Lists
**Archivos**:
- `/src/api/shopping-lists.service.ts`: Actualizar `listLists()` para retornar `PaginatedResponse<ShoppingList>`
- `/src/stores/shoppingLists.ts`: Aplicar patrón de categories

**IMPORTANTE**: Agregar manejo de 409 Conflict en create/update

### 6. List Items
**Archivos**:
- `/src/api/list-items.service.ts`: Actualizar `getItems()` para `PaginatedResponse<ListItem>`
- `/src/stores/listItems.ts`: Aplicar patrón

### 7. Pantries + Pantry Items
**Archivos**:
- `/src/api/pantries.service.ts`: `PaginatedResponse<Pantry>`
- `/src/api/pantry-items.service.ts`: `PaginatedResponse<PantryItem>`
- `/src/stores/pantries.ts`: Aplicar patrón

### 8. Purchases
**Archivo**: `/src/api/purchases.service.ts` (si existe)
- Aplicar `PaginatedResponse<Purchase>`

### 9. Validación 409 Conflict (CRÍTICO)

**Ubicación**: Crear/editar listas (probablemente en `/src/views/AddListView.vue`)

```typescript
// En submit handler:
try {
  const result = await shoppingListsStore.createList({
    name: formData.name,
    description: formData.description,
    recurring: formData.recurring,
    metadata: formData.metadata
  })
  toast.success(t('addList.success'))
  router.push(`/List/${result.id}`)
} catch (error: any) {
  if (error.status === 409 || error.code === 409) {
    // Mostrar error inline en campo name
    nameError.value = t('addList.error.name_exists')
    // O directamente: 'Ya existe una lista con ese nombre'
    return
  }
  // Otros errores
  toast.error(t('addList.error.generic'))
}
```

**Agregar traducciones** en `/src/locales/es.json`:
```json
{
  "addList.error.name_exists": "Ya existe una lista con ese nombre",
  "addList.error.conflict": "El nombre de la lista ya está en uso"
}
```

Y en `/src/locales/en.json`:
```json
{
  "addList.error.name_exists": "A list with that name already exists",
  "addList.error.conflict": "The list name is already in use"
}
```

### 10. Verificar Share Lists

**Archivo**: `/src/components/ShareMembersModal.vue` (o similar)

Revisar que `shareList()` siga funcionando:
```typescript
const shareWithUser = async () => {
  try {
    await shoppingListsService.shareList(listId, email)
    toast.success(t('shareModal.shared'))
    await loadSharedUsers()
  } catch (error: any) {
    if (error.status === 404) {
      toast.error(t('shareModal.user_not_found'))
    } else {
      toast.error(t('shareModal.share_error'))
    }
  }
}
```

## 📋 QA Checklist (Probar después de migración)

### Categories
- [ ] Cambiar per_page a 5, 10, 20 - debe cambiar cantidad mostrada
- [ ] Navegar entre páginas - debe mostrar diferentes categorías
- [ ] Verificar total coincide con `pagination.total`
- [ ] Crear categoría - debe aparecer
- [ ] Editar categoría - debe actualizar
- [ ] Eliminar categoría - debe desaparecer

### Products
- [ ] Cambiar per_page - debe funcionar
- [ ] Navegar páginas - debe mostrar diferentes productos
- [ ] Filtrar por categoría - debe filtrar
- [ ] Filtrar por pantry - debe filtrar
- [ ] Buscar por nombre - debe buscar
- [ ] Ordenar (sort_by) - debe ordenar
- [ ] Verificar paginador muestra total correcto

### Shopping Lists
- [ ] Cambiar per_page - debe funcionar
- [ ] Navegar páginas
- [ ] **CRÍTICO**: Crear lista con nombre duplicado → debe mostrar "Ya existe una lista con ese nombre"
- [ ] Crear lista con nombre único → debe funcionar
- [ ] **CRÍTICO**: Compartir lista → debe funcionar sin error (bugfix v1.0.1)
- [ ] Editar lista con nombre duplicado → debe mostrar error 409

### List Items
- [ ] Paginación de items dentro de una lista
- [ ] Agregar item - debe aparecer
- [ ] Marcar purchased - debe actualizar
- [ ] Eliminar item - debe desaparecer

### Pantries
- [ ] Paginación de pantries
- [ ] Paginación de items dentro de pantry
- [ ] Compartir pantry - debe funcionar

### Purchases
- [ ] Si existe vista de histórico, verificar paginación

## 🚀 Orden Recomendado de Implementación

1. ✅ Types + Categories (HECHO)
2. ⚠️ Products Store (EN PROGRESO)
3. **Shopping Lists + 409 Conflict** (siguiente - es core)
4. List Items (depende de shopping lists)
5. Pantries + Pantry Items
6. Purchases
7. QA completo

## 🎯 Comandos Útiles

```bash
# Levantar API v1.0.1
cd TP2/api
npm install
npm run api
# Doc: http://localhost:8080/docs

# Levantar frontend
cd TP2
npm run dev

# Verificar errores TypeScript
npm run type-check
```

## 📖 Recursos

- Guía completa: `MIGRATION_GUIDE_v1.0.1.md`
- Swagger: `http://localhost:8080/docs`
- Spec JSON: `./api/docs/swagger.json`
- Tipos paginación: `./src/types/pagination.ts`

## ⚠️ Notas Importantes

1. **Backend debe estar corriendo**: Todos los cambios asumen que `./api` ya fue actualizado a v1.0.1
2. **No hardcodear puerto**: Usar `servers[0].url` del swagger.json
3. **409 Conflict es nuevo**: Implementar manejo en formularios de listas
4. **Mantener estética**: Solo adaptar datos, no cambiar colores/layouts
5. **JWT sigue igual**: El auth no cambió, solo verificar que funcione
