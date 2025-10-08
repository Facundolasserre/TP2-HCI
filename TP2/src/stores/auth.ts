import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import authService, { type LoginCredentials, type RegisterData, type UserProfile } from '@/api/auth.service';

/**
 * Store de autenticación
 * Maneja el estado del usuario, token JWT, login y logout
 */
export const useAuthStore = defineStore('auth', () => {
  // Estado
  const token = ref<string | null>(localStorage.getItem('auth_token'));
  const user = ref<UserProfile | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Computed
  const isAuthenticated = computed(() => !!token.value);
  const userFullName = computed(() => 
    user.value ? `${user.value.name} ${user.value.surname}` : ''
  );

  /**
   * Guarda el token en localStorage y en el estado
   */
  function setToken(newToken: string) {
    token.value = newToken;
    localStorage.setItem('auth_token', newToken);
  }

  /**
   * Elimina el token de localStorage y del estado
   */
  function clearToken() {
    token.value = null;
    localStorage.removeItem('auth_token');
  }

  /**
   * Inicia sesión
   */
  async function login(credentials: LoginCredentials): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      // Llamar a la API de login
      const response = await authService.login(credentials);
      
      // Guardar el token
      setToken(response.token);

      // Obtener perfil del usuario (no lanzar error si falla)
      try {
        await fetchCurrentUser();
      } catch (profileError) {
        console.warn('No se pudo cargar perfil inmediatamente, continuando...', profileError);
      }

      console.log('✓ Login exitoso');
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Error al iniciar sesión';
      clearToken();
      user.value = null;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Registra un nuevo usuario
   */
  async function register(data: RegisterData): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      // Llamar a la API de registro
      const response = await authService.register(data);
      
      // Guardar el token (la API devuelve token al registrarse)
      setToken(response.token);

      // Obtener perfil del usuario (no lanzar error si falla)
      try {
        await fetchCurrentUser();
      } catch (profileError) {
        console.warn('No se pudo cargar perfil inmediatamente, continuando...', profileError);
      }

      console.log('✓ Registro exitoso');
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Error al registrarse';
      clearToken();
      user.value = null;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Obtiene el perfil del usuario actual
   */
  async function fetchCurrentUser(): Promise<void> {
    if (!token.value) {
      user.value = null;
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      user.value = await authService.getCurrentUser();
      console.log('✓ Perfil de usuario cargado:', user.value);
    } catch (err: any) {
      console.error('Error al obtener perfil:', err);
      error.value = err.response?.data?.message || err.message || 'Error al obtener perfil';
      
      // NO hacer logout automáticamente aquí - dejar que el llamador decida
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Cierra sesión
   */
  async function logout(): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      // Intentar cerrar sesión en el backend
      if (token.value) {
        try {
          await authService.logout();
        } catch (err) {
          // Ignorar errores al hacer logout en el backend
          console.warn('Error al hacer logout en backend:', err);
        }
      }

      // Limpiar estado local
      clearToken();
      user.value = null;

      console.log('✓ Logout exitoso');
    } finally {
      loading.value = false;
    }
  }

  /**
   * Actualiza el perfil del usuario
   */
  async function updateProfile(data: { name?: string; surname?: string; metadata?: Record<string, any> }): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      user.value = await authService.updateProfile(data);
      console.log('✓ Perfil actualizado');
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Error al actualizar perfil';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Cambia la contraseña del usuario
   */
  async function changePassword(oldPassword: string, newPassword: string): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      await authService.changePassword({ oldPassword, newPassword });
      console.log('✓ Contraseña cambiada');
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Error al cambiar contraseña';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Inicializa el store (cargar usuario si hay token)
   */
  async function initialize(): Promise<void> {
    if (token.value) {
      try {
        await fetchCurrentUser();
      } catch (err) {
        // Si falla, limpiar token inválido
        console.warn('Token inválido, limpiando...');
        clearToken();
        user.value = null;
      }
    }
  }

  return {
    // Estado
    token,
    user,
    loading,
    error,
    
    // Computed
    isAuthenticated,
    userFullName,
    
    // Acciones
    login,
    register,
    logout,
    fetchCurrentUser,
    updateProfile,
    changePassword,
    initialize,
    setToken,
    clearToken
  };
});
