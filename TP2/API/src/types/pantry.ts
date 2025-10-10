import { User } from "../entities/user";
import { ERROR_MESSAGES } from './errorMessages';

export type RegisterPantryData = {
  name: string;
  metadata?: Record<string, any>;
  owner: User;
}

export interface PantryFilterOptions {
  owner: User;
  name?: string;
  page?: number;
  per_page?: number;
  sort_by?: "name" | "createdAt" | "updatedAt";
  order?: "ASC" | "DESC";
}

export interface PantryUpdateData {
  name?: string;
  metadata?: Record<string, any>;
}

export function isValidPantryData(body: any): { isValid: boolean; message?: string } {
  if (!body) {
    return { isValid: false, message: ERROR_MESSAGES.VALIDATION.REQUIRED("body") };
  }
  if (!body.name) {
    return { isValid: false, message: ERROR_MESSAGES.VALIDATION.MISSING_FIELD("name") };
  }
  if (typeof body.name !== "string") {
    return { isValid: false, message: ERROR_MESSAGES.VALIDATION.INVALID("name") };
  }
  if (body.metadata && typeof body.metadata !== "object") {
    return { isValid: false, message: ERROR_MESSAGES.VALIDATION.INVALID("metadata") };
  }
  return { isValid: true };
}

export function isValidPantryId(params: any): { isValid: boolean; message?: string } {
  if (!params.id || params.id === '') {
    return { isValid: false, message: ERROR_MESSAGES.VALIDATION.MISSING_FIELD("ID") };
  }
  
  const id = parseInt(params.id, 10);
  if (isNaN(id) || id < 0) {
    return { isValid: false, message: ERROR_MESSAGES.VALIDATION.INVALID_ID };
  }
  return { isValid: true };
}

export function isValidUserId(params: any): { isValid: boolean; message?: string } {
  if (!params.user_id || params.user_id === '') {
    return { isValid: false, message: ERROR_MESSAGES.VALIDATION.MISSING_FIELD("User ID") };
  }
  
  const id = parseInt(params.user_id, 10);
  if (isNaN(id) || id < 0) {
    return { isValid: false, message: ERROR_MESSAGES.VALIDATION.INVALID_ID_WITH_TYPE("User") };
  }
  return { isValid: true };
}