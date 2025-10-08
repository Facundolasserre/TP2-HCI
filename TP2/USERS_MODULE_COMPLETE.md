# Users Module - Complete Implementation

## 📋 Resumen de Implementación

Se ha completado la **auditoría e implementación completa del módulo de Users** alineado 100% con el OpenAPI specification (`./api/docs/swagger.json`).

---

## ✅ Archivos Creados/Actualizados

### **Nuevos Archivos**

1. **`src/types/user.ts`** - Todos los tipos TypeScript del OpenAPI:
   - `Credentials`, `RegistrationData`, `RegisteredUser`, `NewUser`
   - `GetUser`, `UpdateUserProfile`, `AuthenticationToken`
   - `VerificationCode`, `PasswordChange`, `PasswordReset`, `PasswordRecovery`
   - Validators: `isValidEmail()`, `isValidPassword()`, `isValidName()`, `isValidSurname()`
   - `ValidationMessages` con mensajes en español

2. **`src/api/users.service.ts`** - Servicio alineado con OpenAPI:
   - `register()` → POST `/api/users/register` (retorna `RegisteredUser` con `verificationToken`)
   - `login()` → POST `/api/users/login` (retorna `AuthenticationToken`)
   - `getProfile()` → GET `/api/users/profile` (JWT required)
   - `updateProfile()` → PUT `/api/users/profile` (JWT required)
   - `sendVerification(email)` → POST `/api/users/send-verification?email=`
   - `verifyAccount(code)` → POST `/api/users/verify-account`
   - `changePassword()` → POST `/api/users/change-password` (JWT required)
   - `sendPasswordRecovery(email)` → POST `/api/users/forgot-password?email=`
   - `resetPassword()` → POST `/api/users/reset-password`
   - `logout()` → POST `/api/users/logout` (JWT required)

3. **Vistas Nuevas:**
   - `src/views/auth/VerifyAccountView.vue` - Verificación de cuenta con código
   - `src/views/auth/ResetPasswordView.vue` - Reset password con código + nueva contraseña
   - `src/views/ProfileView.vue` - Ver/editar perfil (GET/PUT)
   - `src/views/ChangePasswordView.vue` - Cambiar contraseña (autenticado)

### **Archivos Actualizados**

1. **`src/stores/auth.ts`** - Store completamente reescrito:
   - Usa `users.service.ts` en lugar de `auth.service.ts`
   - `register()` ahora retorna `RegisteredUser` (user + verificationToken)
   - Nuevas actions: `verifyAccount()`, `sendVerification()`, `sendPasswordRecovery()`, `resetPassword()`
   - State: `verificationToken` para almacenar token de registro

2. **`src/views/auth/RegisterView.vue`**:
   - Muestra `verificationToken` después de registro
   - Redirige automáticamente a `/verify-account` después de 3 segundos
   - Mensaje de éxito con token visible

3. **`src/views/auth/ForgotPassword.vue`**:
   - Implementa llamada real a `sendPasswordRecovery()`
   - Redirige a `/reset-password` después de enviar código
   - Mensajes de éxito/error

4. **`src/router/index.ts`**:
   - Agregadas rutas: `/verify-account`, `/reset-password`, `/profile`, `/change-password`
   - **beforeEach guard** implementado:
     - Rutas protegidas requieren `meta: { requiresAuth: true }`
     - Redirige a `/login` si no autenticado
     - Redirige a `/Home` si autenticado y va a `/login` o `/register`

5. **`src/api/http.ts`** (ya estaba bien):
   - ✅ BASE_URL from env (`VITE_API_BASE_URL`)
   - ✅ JWT injection en headers
   - ✅ 401 handler con check de rutas auth
   - ✅ Error mapping 400/401/403/404/409/500

---

## 🧪 Testing End-to-End

### **1. Flujo de Registro + Verificación**

```bash
# Inicia el frontend (si no está corriendo)
cd TP2
npm run dev

# Inicia el backend (otra terminal)
cd TP2/api
npm run api
```

**Pasos:**
1. Ir a `http://localhost:5174/register`
2. Completar formulario:
   - Name: `Test` (max 50 chars)
   - Surname: `User` (max 50 chars)
   - Email: `testuser@example.com`
   - Password: `123456` (min 6 chars)
   - Rewrite password: `123456`
3. Click **Register**
4. **Verificar**:
   - ✅ Mensaje de éxito muestra `verificationToken` (ej: `a50c9cad6073f6f2`)
   - ✅ Redirige automáticamente a `/verify-account?email=testuser@example.com` después de 3s
5. En VerifyAccountView:
   - El código debe auto-llenarse (del store)
   - O copiar/pegar el token mostrado en el mensaje de éxito
6. Click **Verify**
7. **Verificar**:
   - ✅ Mensaje "Cuenta verificada!"
   - ✅ Redirige a `/login` después de 2s

**Verificación en base de datos:**
```bash
cd TP2/api
sqlite3 src/db/init.sqlite "SELECT id, email, name, isVerified FROM user WHERE email = 'testuser@example.com';"
# Debería mostrar: id|email|name|1 (isVerified = 1)
```

---

### **2. Flujo de Login**

1. Ir a `http://localhost:5174/login`
2. Email: `testuser@example.com`
3. Password: `123456`
4. Click **Login**
5. **Verificar**:
   - ✅ Token JWT guardado en `localStorage.auth_token`
   - ✅ Perfil cargado en `authStore.user`
   - ✅ Redirige a `/Home`
   - ✅ Console log: "✓ Login successful"

**Si el usuario NO está verificado:**
- Backend retorna 401 Unauthorized
- Error: "User not verified" o similar

---

### **3. Flujo de Perfil (GET/PUT)**

1. Estando autenticado, ir a `http://localhost:5174/profile`
2. **Verificar**:
   - ✅ Campos pre-llenados con datos del usuario
   - ✅ Email deshabilitado (no se puede cambiar)
3. Cambiar `Name` a `Updated Name`
4. Click **Save Changes**
5. **Verificar**:
   - ✅ Mensaje "✓ Profile updated successfully!"
   - ✅ Datos actualizados en el store (`authStore.user.name`)

**API Call:**
```http
PUT /api/users/profile
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "name": "Updated Name",
  "surname": "User"
}
```

---

### **4. Flujo de Cambio de Contraseña**

1. En Profile View, click **Change Password**
2. Completer:
   - Current Password: `123456`
   - New Password: `newpass123`
   - Confirm Password: `newpass123`
3. Click **Change Password**
4. **Verificar**:
   - ✅ Mensaje "✓ Contraseña cambiada exitosamente!"
   - ✅ Redirige a `/profile` después de 2s
5. **Logout** y probar login con nueva contraseña:
   - Email: `testuser@example.com`
   - Password: `newpass123`
   - ✅ Debe funcionar

**API Call:**
```http
POST /api/users/change-password
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "currentPassword": "123456",
  "newPassword": "newpass123"
}
```

---

### **5. Flujo de Forgot/Reset Password**

1. En Login View, click **Forgot Password?**
2. Ingresar email: `testuser@example.com`
3. Click **Reset**
4. **Verificar**:
   - ✅ Mensaje "✓ Código de recuperación enviado! Revisa tu email"
   - ✅ Redirige a `/reset-password?email=testuser@example.com` después de 2s
   - ✅ Backend envía email con código (o devuelve código en desarrollo)
5. En ResetPasswordView:
   - Recovery Code: `{código recibido por email}` (ej: `08e8cc040b7ce56c`)
   - New Password: `resetpass123`
   - Confirm Password: `resetpass123`
6. Click **Reset Password**
7. **Verificar**:
   - ✅ Mensaje "✓ Contraseña restablecida!"
   - ✅ Redirige a `/login` después de 2s
8. Login con nueva contraseña: `resetpass123`

**API Calls:**
```http
# 1. Enviar código
POST /api/users/forgot-password?email=testuser@example.com

# 2. Resetear
POST /api/users/reset-password
Content-Type: application/json

{
  "code": "08e8cc040b7ce56c",
  "password": "resetpass123"
}
```

---

### **6. Flujo de Logout**

1. Estando autenticado, ir a `/profile`
2. Click **Logout**
3. **Verificar**:
   - ✅ Token eliminado de `localStorage`
   - ✅ `authStore.user` = `null`
   - ✅ `authStore.isAuthenticated` = `false`
   - ✅ Redirige a `/login`
   - ✅ Console log: "✓ Logout successful"

**API Call:**
```http
POST /api/users/logout
Authorization: Bearer {JWT_TOKEN}
```

---

### **7. Testing de Guards**

**Guard 1: Rutas protegidas sin autenticación**
1. Cerrar sesión (logout)
2. Intentar acceder a `http://localhost:5174/Home` directamente
3. **Verificar**:
   - ✅ Redirige automáticamente a `/login`
   - ✅ Console log: "⚠️ Route requires authentication, redirecting to login"

**Guard 2: Login cuando ya estás autenticado**
1. Estando logueado, intentar acceder a `http://localhost:5174/login`
2. **Verificar**:
   - ✅ Redirige automáticamente a `/Home`
   - ✅ Console log: "✓ User already authenticated, redirecting to Home"

---

## 📝 Validaciones Implementadas (del OpenAPI)

| Campo | Validación | Mensaje |
|-------|------------|---------|
| `email` | Format email | "El formato del email es inválido" |
| `password` | Min 6 chars | "La contraseña debe tener al menos 6 caracteres" |
| `name` | Required, Max 50 | "El nombre no puede superar los 50 caracteres" |
| `surname` | Required, Max 50 | "El apellido no puede superar los 50 caracteres" |
| `code` | Required | "El código de verificación es requerido" |
| `currentPassword` | Min 6 chars | "La contraseña actual es requerida" |
| `newPassword` | Min 6 chars | "La nueva contraseña es requerida" |

---

## 🔒 Endpoints OpenAPI vs Implementación

| Endpoint | Method | OpenAPI | Implementado | Requiere JWT |
|----------|--------|---------|--------------|--------------|
| `/api/users/register` | POST | ✅ | ✅ | ❌ |
| `/api/users/login` | POST | ✅ | ✅ | ❌ |
| `/api/users/profile` | GET | ✅ | ✅ | ✅ |
| `/api/users/profile` | PUT | ✅ | ✅ | ✅ |
| `/api/users/verify-account` | POST | ✅ | ✅ | ❌ |
| `/api/users/send-verification` | POST | ✅ | ✅ | ❌ |
| `/api/users/change-password` | POST | ✅ | ✅ | ✅ |
| `/api/users/forgot-password` | POST | ✅ | ✅ | ❌ |
| `/api/users/reset-password` | POST | ✅ | ✅ | ❌ |
| `/api/users/logout` | POST | ✅ | ✅ | ✅ |

---

## 🎯 Criterios de Aceptación

- [x] **Registro + verificación por email funcionando**
  - RegisterView muestra verificationToken
  - VerifyAccountView verifica cuenta con código
  - Backend actualiza `isVerified = 1`

- [x] **Login guardando JWT y usándolo en llamadas protegidas**
  - Token guardado en `localStorage.auth_token`
  - Interceptor inyecta `Authorization: Bearer {token}`
  - 401 redirige a `/login` (excepto en rutas auth)

- [x] **Perfil GET/PUT operativo**
  - ProfileView carga datos del usuario
  - Permite editar name/surname
  - Guarda cambios con PUT `/api/users/profile`

- [x] **Cambio de contraseña funcionando**
  - ChangePasswordView con validaciones
  - POST `/api/users/change-password`
  - Requiere contraseña actual + nueva

- [x] **Reset password con código funcionando**
  - ForgotPassword envía código por email
  - ResetPasswordView resetea con código + nueva password
  - POST `/api/users/forgot-password` + `/api/users/reset-password`

- [x] **Logout cerrando sesión en backend y front**
  - POST `/api/users/logout`
  - Limpia token y estado local
  - Redirige a `/login`

- [x] **Tipos TS fieles al OpenAPI**
  - Todos los DTOs en `src/types/user.ts`
  - Constraints respetados (minLength, maxLength, format)

- [x] **Manejo de errores completo**
  - Validaciones client-side con mensajes claros
  - Error mapping en `http.ts` (400/401/403/404/409/500)
  - Mensajes en español

- [x] **Guards de rutas funcionando**
  - `router.beforeEach` implementado
  - Rutas protegidas con `meta: { requiresAuth: true }`
  - Redirección automática según autenticación

---

## 🚀 Comandos Rápidos

```bash
# 1. Instalar dependencias (si es necesario)
cd TP2
npm install
cd api
npm install

# 2. Correr backend
cd TP2/api
npm run api
# Swagger: http://localhost:8080/docs

# 3. Correr frontend (otra terminal)
cd TP2
npm run dev
# App: http://localhost:5174

# 4. Verificar usuarios en BD
cd TP2/api
sqlite3 src/db/init.sqlite "SELECT * FROM user;"

# 5. Ver tokens de verificación
sqlite3 src/db/init.sqlite "SELECT * FROM user_verification_token WHERE userId = 1;"
```

---

## 📦 Archivos Eliminados

- `src/api/auth.service.ts` (reemplazado por `users.service.ts`)
- `src/services/auth.service.ts` (duplicado, no se usaba)

---

## ✨ Mejoras Implementadas

1. **Mensajes en español** para UX consistente
2. **Validaciones client-side** antes de llamar API
3. **Auto-fill** de códigos cuando están disponibles en el store
4. **Redirecciones automáticas** con timeouts para mejor UX
5. **Console logs** claros para debugging (`✓ Success`, `⚠️ Warning`)
6. **Feedback visual** con mensajes de error/éxito en todas las vistas
7. **Guards robustos** con checks de autenticación en todas las rutas

---

## 🐛 Troubleshooting

### **Error: "Sesión expirada"**
- Verificar que el usuario esté verificado: `SELECT isVerified FROM user WHERE email = 'xxx';`
- Si `isVerified = 0`, usar VerifyAccountView

### **Error: "Cannot find module users.service"**
- Verificar que `src/api/users.service.ts` existe
- Ejecutar `npm run dev` para recompilar

### **Error: Token inválido**
- Limpiar localStorage: `localStorage.removeItem('auth_token')`
- Logout y login nuevamente

### **Error: 404 en endpoints**
- Verificar que el backend esté corriendo en puerto 8080
- Verificar `VITE_API_BASE_URL` en `.env`

---

**Implementación completada exitosamente! ✅**
