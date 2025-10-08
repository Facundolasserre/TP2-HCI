import http from './http';
import type {
  Credentials,
  RegistrationData,
  RegisteredUser,
  GetUser,
  UpdateUserProfile,
  AuthenticationToken,
  VerificationCode,
  PasswordChange,
  PasswordReset,
  NewUser,
} from '@/types/user';
import { 
  ValidationMessages, 
  isValidEmail, 
  isValidPassword, 
  isValidName, 
  isValidSurname 
} from '@/types/user';

/**
 * Users Service - Aligned with OpenAPI specification
 * All endpoints match /api/docs/swagger.json exactly
 */
class UsersService {
  /**
   * Register a new user
   * POST /api/users/register
   * @returns RegisteredUser (user + verificationToken)
   */
  async register(data: RegistrationData): Promise<RegisteredUser> {
    // Validations per OpenAPI spec
    if (!data.email?.trim()) {
      throw new Error(ValidationMessages.EMAIL_REQUIRED);
    }
    if (!isValidEmail(data.email)) {
      throw new Error(ValidationMessages.EMAIL_INVALID);
    }
    if (!data.name?.trim()) {
      throw new Error(ValidationMessages.NAME_REQUIRED);
    }
    if (!isValidName(data.name)) {
      throw new Error(ValidationMessages.NAME_MAX_LENGTH);
    }
    if (!data.surname?.trim()) {
      throw new Error(ValidationMessages.SURNAME_REQUIRED);
    }
    if (!isValidSurname(data.surname)) {
      throw new Error(ValidationMessages.SURNAME_MAX_LENGTH);
    }
    if (!data.password) {
      throw new Error(ValidationMessages.PASSWORD_REQUIRED);
    }
    if (!isValidPassword(data.password)) {
      throw new Error(ValidationMessages.PASSWORD_MIN_LENGTH);
    }

    const response = await http.post<RegisteredUser>('/api/users/register', data);
    return response.data;
  }

  /**
   * Login user
   * POST /api/users/login
   * @returns AuthenticationToken
   */
  async login(credentials: Credentials): Promise<AuthenticationToken> {
    // Validations
    if (!credentials.email?.trim()) {
      throw new Error(ValidationMessages.EMAIL_REQUIRED);
    }
    if (!isValidEmail(credentials.email)) {
      throw new Error(ValidationMessages.EMAIL_INVALID);
    }
    if (!credentials.password) {
      throw new Error(ValidationMessages.PASSWORD_REQUIRED);
    }
    if (!isValidPassword(credentials.password)) {
      throw new Error(ValidationMessages.PASSWORD_MIN_LENGTH);
    }

    const response = await http.post<AuthenticationToken>('/api/users/login', credentials);
    return response.data;
  }

  /**
   * Get current user profile
   * GET /api/users/profile
   * Requires JWT token
   */
  async getProfile(): Promise<GetUser> {
    const response = await http.get<GetUser>('/api/users/profile');
    return response.data;
  }

  /**
   * Update user profile
   * PUT /api/users/profile
   * Requires JWT token
   */
  async updateProfile(data: UpdateUserProfile): Promise<GetUser> {
    // Validations per OpenAPI spec
    if (!data.name?.trim()) {
      throw new Error(ValidationMessages.NAME_REQUIRED);
    }
    if (!isValidName(data.name)) {
      throw new Error(ValidationMessages.NAME_MAX_LENGTH);
    }
    if (!data.surname?.trim()) {
      throw new Error(ValidationMessages.SURNAME_REQUIRED);
    }
    if (!isValidSurname(data.surname)) {
      throw new Error(ValidationMessages.SURNAME_MAX_LENGTH);
    }

    const response = await http.put<GetUser>('/api/users/profile', data);
    return response.data;
  }

  /**
   * Send verification code to email
   * POST /api/users/send-verification?email={email}
   * Query parameter: email
   */
  async sendVerification(email: string): Promise<void> {
    if (!email?.trim()) {
      throw new Error(ValidationMessages.EMAIL_REQUIRED);
    }
    if (!isValidEmail(email)) {
      throw new Error(ValidationMessages.EMAIL_INVALID);
    }

    await http.post(`/api/users/send-verification?email=${encodeURIComponent(email)}`);
  }

  /**
   * Verify user account with code
   * POST /api/users/verify-account
   * @returns NewUser (verified user)
   */
  async verifyAccount(payload: VerificationCode): Promise<NewUser> {
    if (!payload.code?.trim()) {
      throw new Error(ValidationMessages.CODE_REQUIRED);
    }

    const response = await http.post<NewUser>('/api/users/verify-account', payload);
    return response.data;
  }

  /**
   * Change password (authenticated user)
   * POST /api/users/change-password
   * Requires JWT token
   */
  async changePassword(payload: PasswordChange): Promise<void> {
    // Validations per OpenAPI spec
    if (!payload.currentPassword) {
      throw new Error(ValidationMessages.CURRENT_PASSWORD_REQUIRED);
    }
    if (!isValidPassword(payload.currentPassword)) {
      throw new Error(ValidationMessages.PASSWORD_MIN_LENGTH);
    }
    if (!payload.newPassword) {
      throw new Error(ValidationMessages.NEW_PASSWORD_REQUIRED);
    }
    if (!isValidPassword(payload.newPassword)) {
      throw new Error(ValidationMessages.PASSWORD_MIN_LENGTH);
    }

    await http.post('/api/users/change-password', payload);
  }

  /**
   * Send password recovery code
   * POST /api/users/forgot-password?email={email}
   * Query parameter: email
   */
  async sendPasswordRecovery(email: string): Promise<void> {
    if (!email?.trim()) {
      throw new Error(ValidationMessages.EMAIL_REQUIRED);
    }
    if (!isValidEmail(email)) {
      throw new Error(ValidationMessages.EMAIL_INVALID);
    }

    await http.post(`/api/users/forgot-password?email=${encodeURIComponent(email)}`);
  }

  /**
   * Reset password with recovery code
   * POST /api/users/reset-password
   */
  async resetPassword(payload: PasswordReset): Promise<void> {
    if (!payload.code?.trim()) {
      throw new Error(ValidationMessages.CODE_REQUIRED);
    }
    if (!payload.password) {
      throw new Error(ValidationMessages.NEW_PASSWORD_REQUIRED);
    }
    if (!isValidPassword(payload.password)) {
      throw new Error(ValidationMessages.PASSWORD_MIN_LENGTH);
    }

    await http.post('/api/users/reset-password', payload);
  }

  /**
   * Logout user
   * POST /api/users/logout
   * Requires JWT token
   */
  async logout(): Promise<void> {
    await http.post('/api/users/logout');
  }
}

export default new UsersService();

// Export types for convenience
export type {
  Credentials,
  RegistrationData,
  RegisteredUser,
  GetUser,
  UpdateUserProfile,
  AuthenticationToken,
  VerificationCode,
  PasswordChange,
  PasswordReset,
  NewUser,
};
