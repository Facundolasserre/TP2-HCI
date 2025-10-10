import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import usersService from '@/api/users.service';
import type {
  Credentials,
  RegistrationData,
  GetUser,
  UpdateUserProfile,
  PasswordChange,
  PasswordReset,
  VerificationCode,
  RegisteredUser,
} from '@/api/users.service';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('auth_token'));
  const user = ref<GetUser | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!token.value);

  function setToken(newToken: string) {
    token.value = newToken;
    localStorage.setItem('auth_token', newToken);
  }

  function clearToken() {
    token.value = null;
    localStorage.removeItem('auth_token');
  }

  async function login(credentials: Credentials): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      const response = await usersService.login(credentials);
      setToken(response.token);
      await fetchCurrentUser();
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Error al iniciar sesión';
      clearToken();
      user.value = null;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function register(data: RegistrationData): Promise<RegisteredUser> {
    loading.value = true;
    error.value = null;
    try {
      const response = await usersService.register(data);
      return response;
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Error al registrarse';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function sendVerification(email: string): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      await usersService.sendVerification(email);
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Error al enviar código de verificación';
      throw err;
    }
    finally {
      loading.value = false;
    }
  }

  async function verifyAccount(code: string): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      await usersService.verifyAccount({ code });
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Error al verificar la cuenta';
      throw err;
    }
    finally {
      loading.value = false;
    }
  }

  async function fetchCurrentUser(): Promise<void> {
    if (!token.value) return;
    loading.value = true;
    error.value = null;
    try {
      user.value = await usersService.getProfile();
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Error al obtener perfil';
      clearToken();
      user.value = null;
    }
  }

  async function logout(): Promise<void> {
    try {
      await usersService.logout();
    } catch (err) {
      console.warn('Error logging out on backend:', err);
    }
    clearToken();
    user.value = null;
  }

  async function initialize(): Promise<void> {
    if (token.value) {
      await fetchCurrentUser();
    }
  }

  return {
    token,
    user,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    sendVerification,
    verifyAccount,
    fetchCurrentUser,
    logout,
    initialize,
  };
});
