# Integración Completa del Módulo Categories

## 📋 Resumen

El módulo de Categories ha sido completamente integrado con tu API backend real. Toda la funcionalidad CRUD está operativa y lista para usar.

## ✅ Componentes Implementados

### 1. **Configuración de API**
- ✅ `.env` - Configuración de URL base (`VITE_API_BASE_URL=http://localhost:8080`)
- ✅ `.env.example` - Template de configuración

### 2. **Cliente HTTP** (`src/api/http.ts`)
- ✅ Wrapper de Axios con interceptores
- ✅ Inyección automática de JWT Bearer token
- ✅ Manejo de errores 400/401/404/409/500
- ✅ Redirección automática a `/login` en 401
- ✅ Mensajes de error localizados y amigables

### 3. **Tipos TypeScript** (`src/types/categories.ts`)
Generados desde el OpenAPI spec:
- ✅ `CategoryRegistrationData` - Datos para crear categoría
- ✅ `GetCategory` - Categoría completa con id, timestamps
- ✅ `UpdateCategoryProfile` - Datos para actualizar
- ✅ `ListCategoriesParams` - Parámetros de filtrado/paginación
- ✅ `ApiError` - Estructura de errores

### 4. **Servicio de Categories** (`src/api/categories.service.ts`)
Implementado con validaciones y descubrimiento de endpoints desde OpenAPI:

```typescript
// Crear categoría
await createCategory({ name: 'Electrónica', metadata: {...} })

// Listar con filtros
await listCategories({
  name: 'Electr',      // Búsqueda parcial
  page: 1,
  per_page: 10,
  order: 'ASC',
  sort_by: 'name'
})

// Obtener por ID
await getCategoryById(5)

// Actualizar
await updateCategory(5, { name: 'Electronics' })

// Eliminar
await deleteCategory(5)
```

### 5. **Store de Pinia** (`src/stores/categories.ts`)
State management con:
- ✅ Estado reactivo (items, loading, error, pagination)
- ✅ Optimistic UI en update/delete
- ✅ Rollback automático en errores
- ✅ Getters computados
- ✅ Integración completa con el servicio

### 6. **Vistas**

#### `CategoriesListView.vue` (`/categories`)
- ✅ Tabla con datos de categorías
- ✅ Búsqueda por nombre (con debounce)
- ✅ Ordenamiento por nombre/createdAt/updatedAt
- ✅ Orden ASC/DESC
- ✅ Paginación (5/10/25/50 items)
- ✅ Acciones: Ver, Editar, Eliminar
- ✅ Modal de confirmación para eliminar
- ✅ Estados: loading, error, empty
- ✅ Toasts de feedback

#### `CategoryFormView.vue` (`/categories/new` y `/categories/:id/edit`)
- ✅ Modo crear/editar automático
- ✅ Validación de nombre (requerido, max 50 chars)
- ✅ Campo metadata con validación JSON
- ✅ Contador de caracteres
- ✅ Mensajes de error amigables
- ✅ Feedback visual en campos inválidos

#### `CategoryDetailView.vue` (`/categories/:id`)
- ✅ Visualización completa de categoría
- ✅ ID, nombre, timestamps
- ✅ Metadata formateado (JSON pretty-print)
- ✅ Botones: Editar, Eliminar
- ✅ Modal de confirmación para eliminar

### 7. **Rutas** (configuradas en `src/router/index.ts`)
```typescript
/categories           → Lista de categorías
/categories/new       → Crear nueva categoría
/categories/:id       → Detalle de categoría
/categories/:id/edit  → Editar categoría
```

### 8. **Sistema de Toasts** (`src/composables/useToast.ts`)
- ✅ Notificaciones success/error/warning/info
- ✅ Auto-dismiss configurable
- ✅ Integrado en todas las vistas

## 🚀 Cómo Usar

### Prerequisitos
1. Backend API corriendo en `http://localhost:8080` (o ajustar `.env`)
2. Tener un JWT válido en `localStorage` (key: `auth_token`)

### Iniciar el Frontend
```bash
cd TP2
npm run dev
```

### Flujo Completo

1. **Login** → Obtener JWT y guardarlo en localStorage
2. **Navegar a** `/categories`
3. **Crear categoría:**
   - Click en "+ Nueva Categoría"
   - Ingresar nombre (requerido, max 50)
   - Agregar metadata JSON (opcional)
   - Guardar
4. **Buscar/Filtrar:**
   - Buscar por nombre
   - Ordenar por campo y dirección
   - Cambiar items por página
5. **Ver detalle:** Click en 👁️
6. **Editar:** Click en ✏️
7. **Eliminar:** Click en 🗑️ → Confirmar

## 🔐 Autenticación

El sistema maneja automáticamente:
- JWT se inyecta en cada request como `Authorization: Bearer <token>`
- Si el token es inválido (401) → limpia sesión y redirige a `/login`
- Necesitás implementar el login para obtener el token inicialmente

### Ejemplo de Login (sugerido)
```typescript
// src/api/auth.service.ts
export const login = async (email: string, password: string) => {
  const response = await post('/api/auth/login', { email, password })
  localStorage.setItem('auth_token', response.token)
  return response
}
```

## 📝 Validaciones Implementadas

### Nombre de Categoría
- ✅ Requerido
- ✅ Máximo 50 caracteres
- ✅ Se valida en cliente y servidor

### Metadata
- ✅ Opcional
- ✅ Debe ser JSON válido si se proporciona
- ✅ Se muestra error si el formato es incorrecto

## 🐛 Manejo de Errores

Todos los errores de API se mapean a mensajes claros:

| Código | Mensaje |
|--------|---------|
| 400 | "Datos inválidos o regla no cumplida" |
| 401 | "Sesión expirada. Iniciá sesión de nuevo." → Redirect a /login |
| 403 | "No tenés permisos para realizar esta acción" |
| 404 | "Recurso no encontrado" |
| 409 | "Conflicto con el recurso existente" (ej: nombre duplicado) |
| 500 | "Error interno del servidor. Intentá más tarde." |

## 🎨 UI/UX

- ✅ Estados de loading con spinners
- ✅ Estados empty con CTAs
- ✅ Estados de error con botones "Reintentar"
- ✅ Modales de confirmación para acciones destructivas
- ✅ Toasts para feedback inmediato
- ✅ Optimistic UI (los cambios se ven inmediatamente)
- ✅ Rollback automático si falla la operación

## 🧪 Testing Sugerido

### 1. Crear Categoría
```bash
# Con metadata
{ "name": "Electrónica", "metadata": {"color": "#ff5733"} }

# Sin metadata
{ "name": "Alimentos" }

# Nombre largo (debe fallar)
{ "name": "a".repeat(51) }
```

### 2. Listar con Filtros
- Buscar "Electr" → debe filtrar
- Cambiar orden a DESC → debe reordenar
- Cambiar sort_by a "name" → debe ordenar por nombre
- Paginar → debe cargar página siguiente

### 3. Editar
- Cambiar nombre → debe actualizarse en lista
- Agregar metadata → debe guardarse
- Dejar nombre vacío → debe mostrar error

### 4. Eliminar
- Eliminar con confirmación → debe desaparecer de lista
- Cancelar eliminación → no debe eliminarse

### 5. Errores
- Sin token → debe redirigir a /login
- Token expirado → debe redirigir a /login
- Nombre duplicado → debe mostrar error 409

## 📦 Estructura de Archivos

```
TP2/
├── .env                           # Config con URL de API
├── .env.example                   # Template de config
├── src/
│   ├── api/
│   │   ├── http.ts                # Cliente HTTP con JWT
│   │   └── categories.service.ts  # Servicio CRUD
│   ├── types/
│   │   └── categories.ts          # Tipos desde OpenAPI
│   ├── stores/
│   │   └── categories.ts          # Store de Pinia
│   ├── composables/
│   │   └── useToast.ts            # Sistema de notificaciones
│   ├── views/
│   │   ├── CategoriesListView.vue # Lista con filtros
│   │   ├── CategoryFormView.vue   # Crear/editar
│   │   └── CategoryDetailView.vue # Detalle
│   └── router/
│       └── index.ts               # Rutas configuradas
```

## ✅ Criterios de Aceptación Cumplidos

- [x] Crear/listar/filtrar/ordenar/paginar/ver/editar/eliminar categorías contra API real
- [x] Manejo correcto de JWT con auto-inject en requests
- [x] Manejo de errores 400/401/404/409/500 con mensajes claros
- [x] Tipos TypeScript fieles al OpenAPI spec
- [x] Código organizado (http.ts, service, store, vistas, rutas)
- [x] No hardcodeo de endpoints (leídos desde OpenAPI)
- [x] Base URL configurable por `.env`
- [x] Validaciones: name requerido ≤ 50, metadata JSON válido
- [x] Optimistic UI con rollback en errores
- [x] Estados de loading, error, empty
- [x] Feedback con toasts
- [x] Paginación con defaults
- [x] Filtros funcionales

## 🎯 Próximos Pasos

1. **Implementar Login/Register** para obtener el JWT inicial
2. **Agregar tests** unitarios y de integración
3. **Mejorar estilos** según tu design system
4. **Agregar más campos** si el backend se expande

## 🔗 Enlaces de Interés

- OpenAPI Spec: `./api/docs/swagger.json`
- Rutas de backend: `./api/src/routes/category.routes.ts`
- Base URL: `http://localhost:8080` (configurable en `.env`)

---

**Todo listo para usar!** 🎉 Navegá a `/categories` para empezar.
