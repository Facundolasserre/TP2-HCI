# 🚀 Quick Start - Módulo de Categorías

## Instalación y Ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
# Crear archivo .env en la raíz del proyecto TP2/
echo "VITE_API_BASE_URL=http://localhost:8080" > .env

# 3. Iniciar servidor de desarrollo
npm run dev
```

## 🔗 Acceso Rápido

Una vez iniciado el servidor:

- **Lista de categorías:** http://localhost:5173/categories
- **Crear categoría:** http://localhost:5173/categories/new
- **Login:** http://localhost:5173/login

## 📦 Nuevo Contenido Agregado

### Archivos Core
- ✅ `src/api/http.ts` - Cliente HTTP con JWT
- ✅ `src/api/categories.service.ts` - Servicios CRUD
- ✅ `src/services/auth.service.ts` - Gestión de autenticación
- ✅ `src/stores/categories.ts` - Store Pinia con optimistic UI
- ✅ `src/types/categories.ts` - Tipos TypeScript

### Vistas
- ✅ `src/views/CategoriesListView.vue` - Lista con filtros y paginación
- ✅ `src/views/CategoryFormView.vue` - Crear/Editar
- ✅ `src/views/CategoryDetailView.vue` - Detalles

### Componentes y Composables
- ✅ `src/composables/useToast.ts` - Sistema de notificaciones
- ✅ `src/components/ToastNotification.vue` - Componente toast

### Configuración
- ✅ `.env` - Variables de entorno
- ✅ `src/main.ts` - Integración de Pinia
- ✅ `src/router/index.ts` - Rutas de categorías
- ✅ `src/App.vue` - Toast global

### Documentación
- ✅ `CATEGORIES_MODULE.md` - Documentación completa

## 🎯 Flujo de Prueba Rápida

1. **Login** (guarda JWT mock en localStorage)
   ```
   http://localhost:5173/login
   Usuario: cualquiera
   Password: cualquiera
   ```

2. **Ir a categorías**
   ```
   http://localhost:5173/categories
   ```

3. **Crear categoría**
   - Click en "Nueva Categoría"
   - Nombre: "Electrónica"
   - Metadata (opcional): `{"color": "#ff5733", "icon": "devices"}`
   - Click en "Crear"

4. **Probar filtros**
   - Buscar por nombre
   - Cambiar ordenamiento
   - Cambiar paginación

5. **Ver detalles**
   - Click en 👁️ en cualquier categoría

6. **Editar**
   - Click en ✏️ desde lista o detalle
   - Modificar campos
   - Guardar

7. **Eliminar**
   - Click en 🗑️
   - Confirmar en modal

## ⚠️ Importante

- **Backend requerido:** El backend debe estar corriendo en `http://localhost:8080`
- **JWT:** Por ahora usa un token mock. Para producción, reemplazar en `LoginView.vue` con llamada real a API de login
- **CORS:** Si hay problemas de CORS, verificar configuración del backend

## 🔧 Troubleshooting

### Error: "Network Error"
- ✅ Verificar que el backend esté corriendo
- ✅ Verificar URL en `.env`
- ✅ Verificar CORS en backend

### Error: "401 Unauthorized"
- ✅ Hacer login nuevamente
- ✅ Verificar que el token se guardó en localStorage
- ✅ Abrir DevTools → Application → Local Storage → verificar `auth_token`

### Categorías no cargan
- ✅ Abrir DevTools → Network → verificar requests a `/api/categories`
- ✅ Verificar respuesta del backend
- ✅ Ver console para errores

## 📚 Documentación Completa

Ver `CATEGORIES_MODULE.md` para:
- Arquitectura detallada
- API endpoints completos
- Tipos y validaciones
- Casos de uso
- Manejo de errores
- Y más...

## 🎨 Screenshots

### Lista con Filtros
Tabla completa con búsqueda, ordenamiento y paginación.

### Formulario de Creación
Validaciones en tiempo real y editor JSON para metadata.

### Vista de Detalles
Información completa con metadata formateada.

---

**¿Necesitás ayuda?** Revisa `CATEGORIES_MODULE.md` o abre un issue en el repositorio.
