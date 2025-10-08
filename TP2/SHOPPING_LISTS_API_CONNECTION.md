# 🛒 Shopping Lists - Guía de Conexión con API

## ⚠️ IMPORTANTE: Conectar con el Backend

La aplicación está configurada para conectarse con la API backend en **`http://localhost:8080`**.

### Opciones de Uso:

---

## **Opción 1: Usar el Backend Real (Recomendado)**

### 1. Iniciar el Backend

Abre una terminal separada y navega a la carpeta del backend, luego ejecuta:

```bash
cd ruta/a/tu/backend
npm run dev
# o
go run main.go
# o el comando que uses para iniciar tu backend
```

Asegúrate de que el backend esté corriendo en **`http://localhost:8080`**

### 2. Verificar que el Backend esté corriendo

Abre tu navegador y visita:
```
http://localhost:8080/api/docs/swagger.json
```

Si ves el JSON de Swagger, ¡el backend está funcionando correctamente! ✅

### 3. Obtener un Token JWT Real

**Opción A: Usar el endpoint de login del backend**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"tu@email.com","password":"tupassword"}'
```

Esto te devolverá un token JWT real. Guárdalo.

**Opción B: Usar la vista de Login**
1. Ve a `/login` en tu app
2. Ingresa tus credenciales
3. El token se guardará automáticamente en `localStorage`

### 4. Configurar el Token (si usas curl)

Abre la consola del navegador (F12) y ejecuta:
```javascript
localStorage.setItem('auth_token', 'TU_TOKEN_JWT_AQUI')
```

### 5. Recargar la Página

Recarga la página y ¡las vistas deberían cargar datos desde la API! 🎉

---

## **Opción 2: Modo Desarrollo (Sin Backend)**

Si **NO TIENES el backend corriendo**, la aplicación automáticamente usará **datos mock** para desarrollo.

Verás este mensaje en la consola:
```
⚠️ Backend not available - using mock data for development
```

### Datos Mock Disponibles:

**Shopping Lists:**
- Weekly Groceries (icono: 🛒, color: #6B7CFF)
- Party Supplies (icono: 👨‍👩‍👧, color: #FF6B9D)

**List Items (ejemplo):**
- Tomatoes (2 kg)
- Milk (1 unit)

**Funcionalidades Limitadas en Modo Mock:**
- ✅ Ver listas
- ✅ Ver items
- ✅ Navegar entre vistas
- ❌ Crear nuevas listas (se simulará)
- ❌ Editar/eliminar (se simulará)
- ❌ Compartir listas (no disponible)

---

## 🎯 Vistas que Necesitan Conexión API

Estas son las vistas principales que el usuario ve al navegar:

### 1. **HomeView** (`/Home`)
- **Qué hace**: Muestra el grid de shopping lists
- **Endpoint usado**: `GET /api/shopping-lists`
- **Estado actual**: ✅ Conectada con fallback a mock data

### 2. **AddListView** (`/AddList`)
- **Qué hace**: Modal para crear nueva lista
- **Endpoint usado**: `POST /api/shopping-lists`
- **Estado actual**: ✅ Conectada con fallback a mock data

### 3. **ListView** (`/List/:id`)
- **Qué hace**: Muestra items de una lista específica
- **Endpoints usados**: 
  - `GET /api/shopping-lists/:id`
  - `GET /api/shopping-lists/:id/items`
  - `PATCH /api/shopping-lists/:id/items/:itemId`
- **Estado actual**: ✅ Conectada con fallback a mock data

### 4. **ShoppingListDetailView** (`/lists/:id`)
- **Qué hace**: Vista completa con tabs de Items y Share
- **Endpoints usados**: Todos los de shopping lists + share
- **Estado actual**: ✅ Conectada (pero requiere backend)

---

## 🔧 Troubleshooting

### Error: "Error de conexión"

**Causa**: El backend no está corriendo o no es accesible.

**Solución**:
1. Verifica que el backend esté corriendo: `curl http://localhost:8080/health`
2. Verifica el puerto en `.env`: `VITE_API_BASE_URL=http://localhost:8080`
3. Si no puedes iniciar el backend, la app usará datos mock automáticamente

### Error: "Sesión expirada"

**Causa**: El token JWT expiró o es inválido.

**Solución**:
1. Ve a `/login` e inicia sesión de nuevo
2. O borra el token y recarga: `localStorage.removeItem('auth_token')`

### No veo mis datos

**Causa**: Estás usando datos mock porque el backend no está disponible.

**Solución**:
1. Inicia el backend
2. Obtén un token JWT válido
3. Recarga la página

### El backend está corriendo pero no se conecta

**Causa**: CORS no configurado en el backend.

**Solución**: Agrega estos headers en tu backend:
```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## 📋 Checklist de Conexión

Antes de reportar un problema, verifica:

- [ ] El backend está corriendo en `http://localhost:8080`
- [ ] Puedes acceder a `http://localhost:8080/api/docs/swagger.json`
- [ ] Tienes un token JWT válido en localStorage
- [ ] CORS está habilitado en el backend
- [ ] El archivo `.env` tiene `VITE_API_BASE_URL=http://localhost:8080`

---

## 🚀 Inicio Rápido

### Con Backend:
```bash
# Terminal 1: Backend
cd ruta/backend
npm run dev

# Terminal 2: Frontend
cd TP2
npm run dev
```

### Sin Backend (Modo Mock):
```bash
# Solo Frontend
cd TP2
npm run dev
```

---

## 📞 Soporte

Si sigues teniendo problemas:
1. Abre la consola del navegador (F12)
2. Ve a la tab "Console"
3. Busca mensajes que digan "⚠️ Backend not available"
4. Copia el error completo y compártelo

¡Listo! Ahora deberías poder usar la aplicación con o sin backend. 🎉
