import http from './http';

/**
 * Tipos de datos para autenticación basados en la API
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  name: string;
  surname: string;
  password: string;
  metadata?: Record<string, any>;
}

export interface AuthToken {
  token: string;
}

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  surname: string;
  verified: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserProfile {
  name?: string;
  surname?: string;
  metadata?: Record<string, any>;
}

export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}

/**
 * Servicio de autenticación
 * Maneja login, registro, perfil de usuario y cambio de contraseña
 */
class AuthService {
  /**
   * Inicia sesión con email y contraseña
   * POST /api/users/login
   */
  async login(credentials: LoginCredentials): Promise<AuthToken> {
    // Validaciones
    if (!credentials.email?.trim()) {
      throw new Error('El email es requerido');
    }
    if (!credentials.password) {
      throw new Error('La contraseña es requerida');
    }
    if (credentials.password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    const response = await http.post<AuthToken>('/api/users/login', credentials);
    return response.data;
  }

  /**
   * Registra un nuevo usuario
   * POST /api/users/register
   */
  async register(data: RegisterData): Promise<{ id: number; email: string; token: string }> {
    // Validaciones
    if (!data.email?.trim()) {
      throw new Error('El email es requerido');
    }
    if (!data.name?.trim()) {
      throw new Error('El nombre es requerido');
    }
    if (data.name.length > 50) {
      throw new Error('El nombre no puede superar los 50 caracteres');
    }
    if (!data.surname?.trim()) {
      throw new Error('El apellido es requerido');
    }
    if (data.surname.length > 50) {
      throw new Error('El apellido no puede superar los 50 caracteres');
    }
    if (!data.password) {
      throw new Error('La contraseña es requerida');
    }
    if (data.password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    const response = await http.post<{ id: number; email: string; token: string }>(
      '/api/users/register',
      data
    );
    return response.data;
  }

  /**
   * Obtiene el perfil del usuario autenticado
   * GET /api/users/profile
   * Requiere JWT token
   */
  async getCurrentUser(): Promise<UserProfile> {
    const response = await http.get<UserProfile>('/api/users/profile');
    return response.data;
  }

  /**
   * Actualiza el perfil del usuario autenticado
   * PUT /api/users/profile
   * Requiere JWT token
   */
  async updateProfile(data: UpdateUserProfile): Promise<UserProfile> {
    // Validaciones
    if (data.name !== undefined && data.name.length > 50) {
      throw new Error('El nombre no puede superar los 50 caracteres');
    }
    if (data.surname !== undefined && data.surname.length > 50) {
      throw new Error('El apellido no puede superar los 50 caracteres');
    }

    const response = await http.put<UserProfile>('/api/users/profile', data);
    return response.data;
  }

  /**
   * Cambia la contraseña del usuario autenticado
   * POST /api/users/change-password
   * Requiere JWT token
   */
  async changePassword(data: ChangePasswordData): Promise<void> {
    // Validaciones
    if (!data.oldPassword) {
      throw new Error('La contraseña actual es requerida');
    }
    if (!data.newPassword) {
      throw new Error('La nueva contraseña es requerida');
    }
    if (data.newPassword.length < 6) {
      throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
    }

    await http.post('/api/users/change-password', data);
  }

  /**
   * Cierra la sesión del usuario
   * POST /api/users/logout
   * Requiere JWT token
   */
  async logout(): Promise<void> {
    await http.post('/api/users/logout');
  }

  /**
   * Envía código de verificación de cuenta
   * POST /api/users/send-verification-code
   */
  async sendVerificationCode(email: string): Promise<void> {
    if (!email?.trim()) {
      throw new Error('El email es requerido');
    }
    await http.post('/api/users/send-verification-code', { email });
  }

  /**
   * Verifica la cuenta con el código recibido
   * POST /api/users/verify-account
   */
  async verifyAccount(code: string): Promise<void> {
    if (!code?.trim()) {
      throw new Error('El código de verificación es requerido');
    }
    await http.post('/api/users/verify-account', { code });
  }

  /**
   * Envía código de recuperación de contraseña
   * POST /api/users/send-password-recovery-code
   */
  async sendPasswordRecoveryCode(email: string): Promise<void> {
    if (!email?.trim()) {
      throw new Error('El email es requerido');
    }
    await http.post('/api/users/send-password-recovery-code', { email });
  }

  /**
   * Resetea la contraseña con el código de recuperación
   * POST /api/users/reset-password
   */
  async resetPassword(code: string, newPassword: string): Promise<void> {
    if (!code?.trim()) {
      throw new Error('El código de recuperación es requerido');
    }
    if (!newPassword) {
      throw new Error('La nueva contraseña es requerida');
    }
    if (newPassword.length < 6) {
      throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
    }
    await http.post('/api/users/reset-password', { code, password: newPassword });
  }
}

export default new AuthService();
