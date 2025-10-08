/**
 * User Types - Generated from OpenAPI Specification
 * Based on: /api/docs/swagger.json definitions
 */

/**
 * Credentials for login
 * POST /api/users/login
 */
export interface Credentials {
  email: string; // format: email
  password: string; // minLength: 6
}

/**
 * Registration data for new user
 * POST /api/users/register
 */
export interface RegistrationData {
  email: string; // format: email, required
  name: string; // maxLength: 50, required
  surname: string; // maxLength: 50, required
  password: string; // minLength: 6, required
  metadata?: Record<string, any>; // optional
}

/**
 * NewUser response (basic user info without verificationToken)
 * Used in: POST /api/users/verify-account
 */
export interface NewUser {
  id: number; // int64
  email: string; // format: email
  name: string; // maxLength: 50
  surname: string; // maxLength: 50
  metadata?: Record<string, any>;
  updatedAt: string; // format: YYYY-mm-dd HH:MM:SS
  createdAt: string; // format: YYYY-mm-dd HH:MM:SS
}

/**
 * RegisteredUser response (includes verification token)
 * POST /api/users/register returns this
 */
export interface RegisteredUser {
  user: NewUser;
  verificationToken: string;
}

/**
 * GetUser response (user profile)
 * GET /api/users/profile
 * PUT /api/users/profile
 */
export interface GetUser {
  id: number; // int64
  name: string;
  surname: string;
  email: string;
  metadata?: Record<string, any>;
  updatedAt?: string; // format: YYYY-mm-dd HH:MM:SS
  createdAt?: string; // format: YYYY-mm-dd HH:MM:SS
}

/**
 * UpdateUserProfile payload
 * PUT /api/users/profile
 */
export interface UpdateUserProfile {
  name: string; // maxLength: 50, required
  surname: string; // maxLength: 50, required
  metadata?: Record<string, any>; // optional
}

/**
 * AuthenticationToken response
 * POST /api/users/login returns this
 */
export interface AuthenticationToken {
  token: string; // JWT token
}

/**
 * VerificationCode payload
 * POST /api/users/verify-account
 */
export interface VerificationCode {
  code: string; // required
}

/**
 * PasswordChange payload (for authenticated users)
 * POST /api/users/change-password (requires JWT)
 */
export interface PasswordChange {
  currentPassword: string; // minLength: 6, required
  newPassword: string; // minLength: 6, required
}

/**
 * PasswordRecovery payload
 * POST /api/users/send-verification (query param: email)
 */
export interface PasswordRecovery {
  email: string; // format: email, required
}

/**
 * PasswordReset payload
 * POST /api/users/reset-password (or similar endpoint)
 */
export interface PasswordReset {
  code: string; // required
  password: string; // minLength: 6, required (new password)
}

/**
 * Full User entity (from spec definition)
 * Used internally by backend
 */
export interface User {
  id: number; // int64
  email: string; // format: email
  name: string; // maxLength: 50
  surname: string; // maxLength: 50
  password?: string; // minLength: 6 (never returned in API responses)
  metadata?: Record<string, any>;
  updatedAt: string; // format: YYYY-mm-dd HH:MM:SS
  createdAt?: string; // format: YYYY-mm-dd HH:MM:SS
}

/**
 * Type guards for validation
 */

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

export function isValidName(name: string): boolean {
  return name.trim().length > 0 && name.length <= 50;
}

export function isValidSurname(surname: string): boolean {
  return surname.trim().length > 0 && surname.length <= 50;
}

/**
 * Validation errors
 */
export const ValidationMessages = {
  EMAIL_REQUIRED: 'El email es requerido',
  EMAIL_INVALID: 'El formato del email es inválido',
  PASSWORD_REQUIRED: 'La contraseña es requerida',
  PASSWORD_MIN_LENGTH: 'La contraseña debe tener al menos 6 caracteres',
  NAME_REQUIRED: 'El nombre es requerido',
  NAME_MAX_LENGTH: 'El nombre no puede superar los 50 caracteres',
  SURNAME_REQUIRED: 'El apellido es requerido',
  SURNAME_MAX_LENGTH: 'El apellido no puede superar los 50 caracteres',
  CODE_REQUIRED: 'El código de verificación es requerido',
  CURRENT_PASSWORD_REQUIRED: 'La contraseña actual es requerida',
  NEW_PASSWORD_REQUIRED: 'La nueva contraseña es requerida',
  PASSWORDS_DONT_MATCH: 'Las contraseñas no coinciden',
} as const;
