# Módulo de Categorías - Documentación

## Descripción

Módulo completo de gestión de categorías integrado con la API REST del backend. Permite crear, listar, ver, editar y eliminar categorías con autenticación JWT y manejo integral de errores.

## 📋 Índice

- [Configuración](#configuración)
- [Arquitectura](#arquitectura)
- [Rutas](#rutas)
- [Casos de Uso](#casos-de-uso)
- [API Endpoints](#api-endpoints)
- [Tipos y Validaciones](#tipos-y-validaciones)
- [Manejo de Errores](#manejo-de-errores)
- [Estado (Store)](#estado-store)
- [Accesibilidad y Responsivo](#accesibilidad-y-responsivo)

---

## ⚙️ Configuración

### Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
VITE_API_BASE_URL=http://localhost:8080
```

**Valores por defecto:**
- Si `VITE_API_BASE_URL` no está definida, se usa `http://localhost:8080`

### Instalación de Dependencias

```bash
npm install
```

Dependencias agregadas:
- `axios` - Cliente HTTP
- `pinia` - State management

### Servidor Backend

Asegurate de que el servidor backend esté corriendo en `http://localhost:8080` (o la URL configurada en `.env`).

---

## 🏗️ Arquitectura

### Estructura de Archivos

```
src/
├── api/
│   ├── http.ts                 # Cliente HTTP centralizado con interceptors
│   └── categories.service.ts   # Servicios CRUD de categorías
├── services/
│   └── auth.service.ts         # Gestión de JWT y autenticación
├── stores/
│   └── categories.ts           # Store Pinia con optimistic UI
├── types/
│   └── categories.ts           # Tipos TypeScript según OpenAPI
├── composables/
│   └── useToast.ts            # Composable para notificaciones
├── components/
│   └── ToastNotification.vue  # Componente de toast
└── views/
    ├── CategoriesListView.vue      # Lista con filtros y paginación
    ├── CategoryFormView.vue        # Crear/Editar categoría
    └── CategoryDetailView.vue      # Detalles de categoría
```

### Flujo de Datos

```
View → Store (Pinia) → Service → HTTP Client → API Backend
                ↓
            Toast Notification (feedback)
```

---

## 🚀 Rutas

| Ruta | Nombre | Componente | Descripción |
|------|--------|-----------|-------------|
| `/categories` | `categories` | `CategoriesListView` | Lista todas las categorías |
| `/categories/new` | `categories-create` | `CategoryFormView` | Crear nueva categoría |
| `/categories/:id` | `category-detail` | `CategoryDetailView` | Ver detalles de categoría |
| `/categories/:id/edit` | `category-edit` | `CategoryFormView` | Editar categoría existente |

### Navegación

```javascript
// Ir a lista
router.push('/categories')

// Crear nueva
router.push('/categories/new')

// Ver detalles
router.push(`/categories/${id}`)

// Editar
router.push(`/categories/${id}/edit`)
```

---

## 💼 Casos de Uso

### 1. Listar Categorías

**Vista:** `CategoriesListView`

**Características:**
- ✅ Tabla con paginación (5, 10, 25, 50 items por página)
- ✅ Filtro por nombre (debounced search)
- ✅ Ordenamiento (ASC/DESC)
- ✅ Ordenar por: nombre, fecha creación, última actualización
- ✅ Estados de carga y error
- ✅ Acciones: ver, editar, eliminar

**Uso:**
```
1. Navegar a /categories
2. Ver lista de categorías en tabla
3. Usar búsqueda, filtros y ordenamiento
4. Click en acciones (👁️ ver, ✏️ editar, 🗑️ eliminar)
```

### 2. Crear Categoría

**Vista:** `CategoryFormView` (modo create)

**Validaciones:**
- ✅ Nombre: requerido, máximo 50 caracteres
- ✅ Metadata: JSON válido (opcional)

**Uso:**
```
1. Click en "Nueva Categoría" desde lista
2. Completar formulario
3. Click en "Crear"
4. Toast de éxito → Redirige a lista
```

### 3. Editar Categoría

**Vista:** `CategoryFormView` (modo edit)

**Uso:**
```
1. Click en ✏️ desde lista o detalle
2. Formulario pre-cargado con datos actuales
3. Modificar campos
4. Click en "Actualizar"
5. Toast de éxito → Redirige a lista
```

### 4. Ver Detalles

**Vista:** `CategoryDetailView`

**Muestra:**
- ID
- Nombre
- Fecha de creación (formato: DD de MMMM de YYYY, HH:mm)
- Última actualización
- Metadata (JSON formateado)

**Uso:**
```
1. Click en 👁️ desde lista
2. Ver información completa
3. Opciones: editar, eliminar, volver
```

### 5. Eliminar Categoría

**Confirmación modal:** Sí

**Optimistic UI:** Sí (con rollback si falla)

**Uso:**
```
1. Click en 🗑️ desde lista o detalle
2. Confirmar en modal
3. Toast de éxito
4. Actualización automática de lista
```

---

## 🔌 API Endpoints

Base URL: `http://localhost:8080`

### POST `/api/categories`
**Crear categoría**

```typescript
Request Body:
{
  name: string,        // max 50 chars
  metadata?: object    // optional
}

Response 201:
{
  id: number,
  name: string,
  metadata?: object,
  createdAt: string,   // YYYY-mm-dd
  updatedAt: string    // YYYY-mm-dd
}
```

### GET `/api/categories`
**Listar categorías**

```typescript
Query Params:
- name?: string
- page?: number (default: 1)
- per_page?: number (default: 10)
- order?: 'ASC' | 'DESC' (default: 'ASC')
- sort_by?: 'name' | 'createdAt' | 'updatedAt' (default: 'createdAt')

Response 200: Array<GetCategory>
```

### GET `/api/categories/{categoryId}`
**Obtener categoría por ID**

```typescript
Path Params:
- categoryId: number

Response 200: GetCategory
```

### PUT `/api/categories/{id}`
**Actualizar categoría**

```typescript
Path Params:
- id: number

Request Body:
{
  name?: string,       // max 50 chars
  metadata?: object
}

Response 200: GetCategory
```

### DELETE `/api/categories/{id}`
**Eliminar categoría**

```typescript
Path Params:
- id: number

Response 200: void
```

---

## 📐 Tipos y Validaciones

### Tipos TypeScript

```typescript
// Registro de nueva categoría
interface CategoryRegistrationData {
  name: string              // max 50 chars
  metadata?: Record<string, any>
}

// Categoría completa
interface GetCategory {
  id: number
  name: string
  metadata?: Record<string, any>
  createdAt: string         // YYYY-mm-dd
  updatedAt: string         // YYYY-mm-dd
}

// Actualización de categoría
interface UpdateCategoryProfile {
  name?: string             // max 50 chars
  metadata?: Record<string, any>
}

// Parámetros de listado
interface ListCategoriesParams {
  name?: string
  page?: number             // >= 1
  per_page?: number         // >= 1
  order?: 'ASC' | 'DESC'
  sort_by?: 'name' | 'createdAt' | 'updatedAt'
}
```

### Validaciones de Formulario

**Campo `name`:**
- ✅ Requerido
- ✅ Máximo 50 caracteres
- ✅ No puede estar vacío (trim)

**Campo `metadata`:**
- ✅ Opcional
- ✅ Debe ser JSON válido si se proporciona
- ✅ Debe ser objeto (no array)

### Validaciones de Parámetros

**Paginación:**
- `page` >= 1
- `per_page` >= 1

**IDs:**
- Deben ser números enteros > 0

---

## ⚠️ Manejo de Errores

### Códigos HTTP y Mensajes

| Código | Mensaje | Acción |
|--------|---------|--------|
| **400** | "Datos inválidos o regla no cumplida" | Toast rojo |
| **401** | "Sesión expirada – iniciá sesión de nuevo" | Redirect a `/login` + clear token |
| **403** | "No tenés permisos para realizar esta acción" | Toast rojo |
| **404** | "Categoría no encontrada" | Toast rojo |
| **409** | "Conflicto con el recurso existente" | Toast rojo |
| **422** | "Error de validación" | Toast rojo |
| **500/502/503** | "Error interno del servidor. Intentá más tarde" | Toast rojo |
| **Network** | "Error de conexión. Verificá tu conexión a internet" | Toast rojo |

### Interceptor de Axios

**Request:**
- Inyecta `Authorization: Bearer <token>` automáticamente

**Response:**
- En 401: limpia token + redirige a login
- Mapea errores a mensajes user-friendly

### Toast Notifications

**Tipos:**
- ✅ `success` (verde) - duración: 3s
- ❌ `error` (rojo) - duración: 5s
- ⚠️ `warning` (naranja) - duración: 4s
- ℹ️ `info` (azul) - duración: 3s

**Uso:**
```typescript
import { useToast } from '@/composables/useToast'

const toast = useToast()

toast.success('Categoría creada exitosamente')
toast.error('Error al eliminar categoría')
```

---

## 🗂️ Estado (Store)

### Store Pinia: `categories`

**State:**
```typescript
{
  items: GetCategory[]           // Lista de categorías
  currentCategory: GetCategory | null
  loading: boolean               // Estado de carga
  error: ApiError | null         // Error actual
  total: number
  currentPage: number
  perPage: number
}
```

**Getters:**
```typescript
categoriesCount: number
hasCategories: boolean
isLoading: boolean
hasError: boolean
```

**Actions:**
```typescript
fetchCategories(params?: ListCategoriesParams): Promise<GetCategory[]>
fetchCategoryById(id: number): Promise<GetCategory>
createCategory(data: CategoryRegistrationData): Promise<GetCategory>
updateCategory(id: number, data: UpdateCategoryProfile): Promise<GetCategory>
deleteCategory(id: number): Promise<void>
clearError(): void
reset(): void
```

### Optimistic UI

**Update y Delete** implementan optimistic updates:
1. Actualiza estado local inmediatamente
2. Hace request a API
3. Si falla: rollback a estado anterior
4. Si éxito: confirma cambios

---

## ♿ Accesibilidad y Responsivo

### Accesibilidad

- ✅ Labels asociados a inputs (`for` / `id`)
- ✅ `aria-label` en botones de iconos
- ✅ Estados de foco visibles
- ✅ Mensajes de error descriptivos
- ✅ Confirmación antes de acciones destructivas

### Responsivo

**Mobile (< 768px):**
- Stack vertical de filtros
- Tabla con scroll horizontal
- Botones de acción full-width
- Modales adaptados

**Tablet (768px - 1024px):**
- Grid de 2 columnas (si aplica)
- Filtros en 2 filas

**Desktop (> 1024px):**
- Layout completo
- Máximo ancho 1100px centrado

---

## 🔐 Autenticación

### JWT Token

**Storage:** `localStorage` con key `auth_token`

**Formato:** `Bearer <token>`

**Ubicación:** Header `Authorization` en todas las requests

### Flujo de Login

```
1. Usuario ingresa credenciales en /login
2. Backend devuelve JWT
3. Frontend guarda en localStorage
4. Todas las requests incluyen token
5. Si 401: clear token + redirect a /login
```

### Servicio de Auth

```typescript
import { 
  setAuthToken, 
  getAuthToken, 
  removeAuthToken,
  isAuthenticated 
} from '@/services/auth.service'

// Guardar token
setAuthToken(token)

// Obtener token
const token = getAuthToken()

// Verificar sesión
if (isAuthenticated()) {
  // Usuario logueado
}

// Logout
removeAuthToken()
```

---

## 🎨 Estilos y Tema

El módulo respeta la paleta de colores del proyecto:

```css
--bg: #1C1C30       /* Background principal */
--panel: #322D59    /* Paneles y cards */
--ink: #EDEAF6      /* Texto principal */
--muted: #CFC9E6    /* Texto secundario */
--tile: #0E0F1A     /* Tiles oscuros */
--edge: #4B5CC7     /* Bordes y acentos */
```

**Componentes:**
- Bordes redondeados (`border-radius: 8px - 16px`)
- Sombras suaves para elevación
- Transiciones en hover (0.2s ease)
- Botones primarios blancos con texto negro
- Botones secundarios con fondo translúcido

---

## 📸 Screenshots

### Vista de Lista
![Lista de categorías con filtros, búsqueda y paginación]

### Vista de Formulario
![Formulario de crear/editar con validaciones en tiempo real]

### Vista de Detalle
![Detalles completos con metadata JSON formateada]

---

## 🧪 Testing

### Testing Manual

1. **Crear categoría:**
   - [ ] Validación de nombre requerido
   - [ ] Validación de 50 caracteres max
   - [ ] Validación de JSON en metadata
   - [ ] Toast de éxito
   - [ ] Redirección a lista

2. **Listar categorías:**
   - [ ] Carga inicial correcta
   - [ ] Filtro por nombre funciona
   - [ ] Paginación funciona
   - [ ] Ordenamiento funciona
   - [ ] Estados de carga y error

3. **Editar categoría:**
   - [ ] Pre-carga datos correctos
   - [ ] Actualización exitosa
   - [ ] Optimistic UI funciona

4. **Eliminar categoría:**
   - [ ] Modal de confirmación
   - [ ] Eliminación exitosa
   - [ ] Actualización de lista

5. **Manejo de errores:**
   - [ ] 401 redirige a login
   - [ ] Otros errores muestran toast
   - [ ] Network errors manejados

---

## 📝 Notas Adicionales

### Limitaciones Conocidas

- No hay paginación en el backend (se simula en frontend)
- Mock token en login (reemplazar con API real)
- No hay tests automatizados implementados

### Mejoras Futuras

- [ ] Agregar tests unitarios (Vitest)
- [ ] Agregar tests E2E (Playwright)
- [ ] Implementar búsqueda con debounce más sofisticada
- [ ] Agregar filtros avanzados (por fecha, metadata keys)
- [ ] Implementar caché de requests
- [ ] Agregar skeleton loaders
- [ ] Modo dark/light theme toggle

---

## 🤝 Soporte

Para problemas o preguntas:
1. Verificar que el backend esté corriendo
2. Verificar configuración de `.env`
3. Revisar console del browser para errores
4. Verificar network tab en DevTools

---

**Versión:** 1.0.0  
**Última actualización:** Octubre 2025  
**Autor:** Equipo HCI TP2
