import { ERROR_MESSAGES } from './errorMessages';

export type RegisterUserData = {
  email: string;
  password: string;
  name: string;
  surname: string;
  metadata?: Record<string, any>;
}

export type LoginUserData = {
  email: string;
  password: string;
}

export type VerificationData = {
  code: string;
}

export type PasswordRecoveryData = {
  email: string;
}

export type PasswordResetData = {
  code: string;
  password: string;
}

export function isValidUserId(data: any): { isValid: boolean; message?: string } {
  if (!data.userId || data.userId === undefined || data.userId === null || data.userId === '') {
    return { isValid: false, message: ERROR_MESSAGES.VALIDATION.MISSING_FIELD("ID") };
  }
  
  const id = parseInt(data.userId, 10);
  if (isNaN(id) || id < 0) {
    return { isValid: false, message: ERROR_MESSAGES.VALIDATION.INVALID_ID };
  }

  return { isValid: true };
}

export function isValidEmail(email: string): { isValid: boolean, message?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      message: ERROR_MESSAGES.VALIDATION.INVALID_EMAIL
    };
  }
  return { isValid: true };
}


export function isValidRegistrationData(data: any): { isValid: boolean; message?: string } {
  if (!('email' in data) || data.email.length <= 0) {
    return { isValid: false, message: ERROR_MESSAGES.VALIDATION.MISSING_FIELD("email") };
  }

  const emailValidation = isValidEmail(data.email);
  if (!emailValidation.isValid) {
    return { isValid: false, message: emailValidation.message };
  }

  if (!('password' in data) || data.password.length <= 0) {
    return { isValid: false, message: ERROR_MESSAGES.VALIDATION.MISSING_FIELD("password") };
  }

  if (!('name' in data) || data.name.length <= 0) {
    return { isValid: false, message: ERROR_MESSAGES.VALIDATION.MISSING_FIELD("name") };
  }

  if (!('surname' in data) || data.surname.length <= 0) {
    return { isValid: false, message: ERROR_MESSAGES.VALIDATION.MISSING_FIELD("surname") };
  }

  return { isValid: true };
}


export function isValidLoginData(data: any): { isValid: boolean; message?: string } {
  if (!('email' in data) || data.email.length <= 0) {
    return { isValid: false, message: ERROR_MESSAGES.VALIDATION.MISSING_FIELD("email") };
  }

  if (!('password' in data) || data.password.length <= 0) {
    return { isValid: false, message: ERROR_MESSAGES.VALIDATION.MISSING_FIELD("password") };
  }

  return { isValid: true };

}

export function isValidVerificationTokenData(data: any): { isValid: boolean; message?: string } {
  if (!('code' in data) || data.code.length <= 0) {
    return { isValid: false, message: ERROR_MESSAGES.VALIDATION.MISSING_FIELD("code") };
  }

  return { isValid: true };
}

export function isValidPasswordRecoveryData(data: any): { isValid: boolean; message?: string } {
  if (!('email' in data) || data.email.length <= 0) {
    return { isValid: false, message: ERROR_MESSAGES.VALIDATION.MISSING_FIELD("email") };
  }

  return { isValid: true };
}

export function isValidPasswordResetData(data: any): { isValid: boolean; message?: string } {
  if (!('code' in data) || data.code.length <= 0) {
    return { isValid: false, message: ERROR_MESSAGES.VALIDATION.MISSING_FIELD("code") };
  }

  if (!('password' in data) || data.password === undefined || data.password === null || data.password === '') {
    return { isValid: false, message: ERROR_MESSAGES.VALIDATION.MISSING_FIELD("password") };
  }

  if (data.password.length < 6) {
    return { isValid: false, message: ERROR_MESSAGES.VALIDATION.INVALID_PASSWORD };
  }

  return { isValid: true };
}

export function isValidChangePassword(data: any): { isValid: boolean; message?: string } {
  if (!('currentPassword' in data) || data.currentPassword.length <= 6) {
    return { isValid: false, message: ERROR_MESSAGES.VALIDATION.INVALID_PASSWORD };
  }

  if (!('newPassword' in data) || data.newPassword.length <= 6) {
    return { isValid: false, message: ERROR_MESSAGES.VALIDATION.INVALID_PASSWORD };
  }

  return { isValid: true };
}

export function isValidModificationData(data: any): { isValid: boolean; message?: string } {
  if ('email' in data) {
    return { isValid: false, message: ERROR_MESSAGES.BUSINESS_RULE.CANNOT_CHANGE_EMAIL };
  }

  if (!('name' in data) || data.name === undefined || data.name === null) {
    return { isValid: false, message: ERROR_MESSAGES.VALIDATION.MISSING_FIELD("name") };
  }
  
  if (typeof data.name !== 'string' || data.name.trim().length === 0) {
    return { isValid: false, message: ERROR_MESSAGES.VALIDATION.INVALID("name") };
  }

  if (!('surname' in data) || data.surname === undefined || data.surname === null) {
    return { isValid: false, message: ERROR_MESSAGES.VALIDATION.MISSING_FIELD("surname") };
  }
  
  if (typeof data.surname !== 'string' || data.surname.trim().length === 0) {
    return { isValid: false, message: ERROR_MESSAGES.VALIDATION.INVALID("surname") };
  }

  return { isValid: true };
}