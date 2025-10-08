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

/**
 * Auth Store - Aligned with OpenAPI specification
 * Manages user authentication state, JWT token, and user profile
 */
export const useAuthStore = defineStore('auth', () => {
  // ===== STATE =====
  const token = ref<string | null>(localStorage.getItem('auth_token'));
  const user = ref<GetUser | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const verificationToken = ref<string | null>(null); // Store verification token from registration

  // ===== COMPUTED =====
  const isAuthenticated = computed(() => !!token.value);
  const userFullName = computed(() => 
    user.value ? `${user.value.name} ${user.value.surname}` : ''
  );
  const isVerified = computed(() => {
    // User is verified if they can successfully login
    // Backend requires isVerified = 1 to login
    return isAuthenticated.value;
  });

  // ===== ACTIONS =====

  /**
   * Save token to localStorage and state
   */
  function setToken(newToken: string) {
    token.value = newToken;
    localStorage.setItem('auth_token', newToken);
  }

  /**
   * Clear token from localStorage and state
   */
  function clearToken() {
    token.value = null;
    localStorage.removeItem('auth_token');
  }

  /**
   * Login user
   * POST /api/users/login
   */
  async function login(credentials: Credentials): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      // Call API to login
      const response = await usersService.login(credentials);
      
      // Save JWT token
      setToken(response.token);

      // Try to fetch user profile (don't throw error if fails)
      try {
        await fetchCurrentUser();
      } catch (profileError) {
        console.warn('Could not fetch profile immediately, continuing...', profileError);
      }

      console.log('✓ Login successful');
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
   * Register new user
   * POST /api/users/register
   * Returns RegisteredUser with verificationToken
   */
  async function register(data: RegistrationData): Promise<RegisteredUser> {
    loading.value = true;
    error.value = null;

    try {
      // Call API to register - returns RegisteredUser (user + verificationToken)
      const response = await usersService.register(data);
      
      // Store verification token for later use
      verificationToken.value = response.verificationToken;
      
      // Note: User is NOT logged in yet - must verify account first
      // Backend returns verificationToken that must be used with verify-account endpoint
      
      console.log('✓ Registration successful, verification required');
      console.log('Verification token:', response.verificationToken);
      
      return response;
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Error al registrarse';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Verify account with code
   * POST /api/users/verify-account
   */
  async function verifyAccount(code: string): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      // Call API to verify
      await usersService.verifyAccount({ code });
      
      // Clear stored verification token
      verificationToken.value = null;
      
      console.log('✓ Account verified successfully');
      
      // Note: User still needs to login after verification
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Error al verificar cuenta';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Send verification code to email
   * POST /api/users/send-verification?email={email}
   */
  async function sendVerification(email: string): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      await usersService.sendVerification(email);
      console.log('✓ Verification code sent');
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Error al enviar código';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Get current user profile
   * GET /api/users/profile
   */
  async function fetchCurrentUser(): Promise<void> {
    if (!token.value) {
      user.value = null;
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      user.value = await usersService.getProfile();
      console.log('✓ User profile loaded:', user.value);
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      error.value = err.response?.data?.message || err.message || 'Error al obtener perfil';
      
      // Don't auto-logout here - let caller decide
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Update user profile
   * PUT /api/users/profile
   */
  async function updateProfile(data: UpdateUserProfile): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      user.value = await usersService.updateProfile(data);
      console.log('✓ Profile updated');
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Error al actualizar perfil';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Change password
   * POST /api/users/change-password
   */
  async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      await usersService.changePassword({ currentPassword, newPassword });
      console.log('✓ Password changed');
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Error al cambiar contraseña';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Send password recovery code
   * POST /api/users/forgot-password?email={email}
   */
  async function sendPasswordRecovery(email: string): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      await usersService.sendPasswordRecovery(email);
      console.log('✓ Password recovery code sent');
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Error al enviar código';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Reset password with recovery code
   * POST /api/users/reset-password
   */
  async function resetPassword(code: string, newPassword: string): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      await usersService.resetPassword({ code, password: newPassword });
      console.log('✓ Password reset successfully');
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Error al resetear contraseña';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Logout user
   * POST /api/users/logout
   */
  async function logout(): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      // Try to logout on backend
      if (token.value) {
        try {
          await usersService.logout();
        } catch (err) {
          // Ignore backend logout errors
          console.warn('Error logging out on backend:', err);
        }
      }

      // Clear local state
      clearToken();
      user.value = null;
      verificationToken.value = null;

      console.log('✓ Logout successful');
    } finally {
      loading.value = false;
    }
  }

  /**
   * Initialize store (load user if token exists)
   */
  async function initialize(): Promise<void> {
    if (token.value) {
      try {
        await fetchCurrentUser();
      } catch (err) {
        // If token is invalid, clear it
        console.warn('Invalid token, clearing...');
        clearToken();
        user.value = null;
      }
    }
  }

  return {
    // State
    token,
    user,
    loading,
    error,
    verificationToken,
    
    // Computed
    isAuthenticated,
    userFullName,
    isVerified,
    
    // Actions
    login,
    register,
    verifyAccount,
    sendVerification,
    fetchCurrentUser,
    updateProfile,
    changePassword,
    sendPasswordRecovery,
    resetPassword,
    logout,
    initialize,
    setToken,
    clearToken,
  };
});
