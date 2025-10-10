import { User } from "../entities/user";
import { ERROR_MESSAGES } from './errorMessages';

export interface RegisterPantryItemData {
  product: { id: number };
  quantity: number;
  unit: string;
  metadata?: Record<string, any>;
}

export interface PantryItemUpdateData {
  quantity: number;
  unit: string;
  metadata?: Record<string, any> | null;
}

export interface PantryItemFilterOptions {
  pantryId: number;
  owner: User;
  page?: number;
  per_page?: number;
  sort_by?: "name" | "unit" | "quantity" | "productName";
  order?: "ASC" | "DESC";
  search?: string;
  category_id?: number;
}

export function isValidPantryItemData(body: any): { isValid: boolean; message?: string } {
  if (!body) {
    return { isValid: false, message: ERROR_MESSAGES.VALIDATION.REQUIRED("body") };
  }
  if (!body.product) {
    return { isValid: false, message: ERROR_MESSAGES.VALIDATION.MISSING_FIELD("product") };
  }
  if (typeof body.product !== "object" || !body.product.id) {
    return { isValid: false, message: ERROR_MESSAGES.VALIDATION.INVALID("product") };
  }
  if (typeof body.product.id !== "number") {
    return { isValid: false, message: ERROR_MESSAGES.VALIDATION.INVALID("product") };
  }
  
  if (body.quantity === undefined) {
    return { isValid: false, message: ERROR_MESSAGES.VALIDATION.MISSING_FIELD("quantity") };
  }
  if (typeof body.quantity !== "number" || (body.quantity) < 0) {
    return { isValid: false, message: ERROR_MESSAGES.VALIDATION.INVALID("quantity") };
  }
  
  if (!body.unit) {
    return { isValid: false, message: ERROR_MESSAGES.VALIDATION.MISSING_FIELD("unit") };
  }
  if (typeof body.unit !== "string") {
    return { isValid: false, message: ERROR_MESSAGES.VALIDATION.INVALID("unit") };
  }
  if (body.unit.trim() === "") {
    return { isValid: false, message: ERROR_MESSAGES.BUSINESS_RULE.UNIT_NON_EMPTY };
  }
  if (body.metadata && typeof body.metadata !== "object") {
    return { isValid: false, message: ERROR_MESSAGES.VALIDATION.INVALID("metadata") };
  }
  return { isValid: true };
}

export function isValidPantryItemUpdateData(body: any): { isValid: boolean; message?: string } {
  if (!body) {
    return { isValid: false, message: ERROR_MESSAGES.VALIDATION.REQUIRED("body") };
  }
  
  if (body.quantity === undefined) {
    return { isValid: false, message: ERROR_MESSAGES.VALIDATION.MISSING_FIELD("quantity") };
  }
  if (typeof body.quantity !== "number" || isNaN(body.quantity) || (body.quantity) < 0) {
    return { isValid: false, message: ERROR_MESSAGES.VALIDATION.INVALID("quantity") };
  }
  
  if (body.unit === undefined) {
    return { isValid: false, message: ERROR_MESSAGES.VALIDATION.MISSING_FIELD("unit") };
  }
  if (typeof body.unit !== "string" || body.unit.trim() === "") {
    return { isValid: false, message: ERROR_MESSAGES.VALIDATION.INVALID("unit") };
  }
  
  if (body.metadata !== undefined && body.metadata !== null && typeof body.metadata !== "object") {
    return { isValid: false, message: ERROR_MESSAGES.VALIDATION.INVALID("metadata") };
  }
  
  return { isValid: true };
}

export function isValidPantryItemId(params: any): { isValid: boolean; message?: string } {
  if (!params.item_id || params.item_id === undefined || params.item_id === null || params.item_id === '') {
    return { isValid: false, message: ERROR_MESSAGES.VALIDATION.MISSING_FIELD("ID") };
  }
  
  const id = parseInt(params.item_id, 10);
  if (isNaN(id) || id < 0) {
    return { isValid: false, message: ERROR_MESSAGES.VALIDATION.INVALID_ID_WITH_TYPE("Item") };
  }
  return { isValid: true };
}

