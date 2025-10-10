import { User } from "../entities/user";
import { ERROR_MESSAGES } from './errorMessages';

export interface RegisterListItemData {
    listId: number;
    owner: User;
    product: { id: number };
    quantity: number;
    unit: string;
    metadata?: any;
}

export interface ListItemUpdateData {
    name?: string;
    quantity?: number;
    unit?: string;
    metadata?: Record<string, any> | null;
}

export interface ListItemFilterOptions {
    listId: number;
    owner: User;
    purchased?: boolean;
    page?: number;
    per_page?: number;
    sort_by?: "updatedAt" | "createdAt" | "lastPurchasedAt" | "productName";
    order?: "ASC" | "DESC";
    pantry_id?: number;
    category_id?: number;
    search?: string;
}

export function isValidListItemData(body: any): { isValid: boolean; message?: string } {
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
        return { isValid: false, message: ERROR_MESSAGES.VALIDATION.INVALID_ID_WITH_TYPE("Product") };
    }

    if (body.quantity === undefined) {
        return { isValid: false, message: ERROR_MESSAGES.VALIDATION.MISSING_FIELD("quantity") };
    }
    if (typeof body.quantity !== "number" || (body.quantity) <= 0) {
        return { isValid: false, message: ERROR_MESSAGES.VALIDATION.INVALID("quantity") };
    }

    if (!body.unit) {
        return { isValid: false, message: ERROR_MESSAGES.VALIDATION.MISSING_FIELD("unit") };
    }
    if (typeof body.unit !== "string" || body.unit.trim() === "") {
        return { isValid: false, message: ERROR_MESSAGES.VALIDATION.INVALID("unit") };
    }

    if (body.metadata && typeof body.metadata !== "object") {
        return { isValid: false, message: ERROR_MESSAGES.VALIDATION.INVALID("metadata") };
    }

    return { isValid: true };
}

export function isValidListItemUpdateData(body: any): { isValid: boolean; message?: string } {
  if (!body) {
    return { isValid: false, message: ERROR_MESSAGES.VALIDATION.REQUIRED("body") };
  }
  
  if (body.quantity === undefined) {
    return { isValid: false, message: ERROR_MESSAGES.VALIDATION.MISSING_FIELD("quantity") };
  }
  if (typeof body.quantity !== "number" || isNaN(body.quantity) || (body.quantity) <= 0) {
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

export function isValidListItemId(params: any): { isValid: boolean; message?: string } {
    if (!params.id || params.id === undefined || params.id === null || params.id === '') {
        return { isValid: false, message: ERROR_MESSAGES.VALIDATION.MISSING_FIELD("ID") };
    }
    
    const id = parseInt(params.id, 10);
    if (isNaN(id) || id < 0) {
        return { isValid: false, message: ERROR_MESSAGES.VALIDATION.INVALID_ID };
    }
    return { isValid: true };
}