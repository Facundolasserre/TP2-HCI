import { User } from "../entities/user";
import { ERROR_MESSAGES } from './errorMessages';

export type RegisterListData = {
    name: string;
    description: string;
    recurring: boolean;
    metadata?: Record<string, any>;
    owner?: User;
};

export interface ListFilterOptions {
    user: User;
    owner?: boolean; 
    name?: string;
    recurring?: boolean;
    page?: number;
    per_page?: number;
    sort_by?: "name" | "owner" | "createdAt" | "updatedAt" | "lastPurchasedAt";
    order?: "ASC" | "DESC";
}

export interface ListUpdateData {
    name?: string;
    description?: string;
    recurring?: boolean;
    metadata?: Record<string, any>;
}

export function isValidListData(body: any): { isValid: boolean; message?: string } {
    if (!body) {
        return { isValid: false, message: ERROR_MESSAGES.VALIDATION.REQUIRED("body") };
    }
    if (!body.name) {
        return { isValid: false, message: ERROR_MESSAGES.VALIDATION.MISSING_FIELD("name") };
    }
    if (typeof body.name !== "string") {
        return { isValid: false, message: ERROR_MESSAGES.VALIDATION.INVALID("name") };
    }
    
    if (!('description' in body) || body.description === undefined || body.description === null) {
        return { isValid: false, message: ERROR_MESSAGES.VALIDATION.MISSING_FIELD("description") };
    }
    if (typeof body.description !== "string") {
        return { isValid: false, message: ERROR_MESSAGES.VALIDATION.INVALID("description") };
    }
    
    if (!('recurring' in body) || body.recurring === undefined || body.recurring === null) {
        return { isValid: false, message: ERROR_MESSAGES.VALIDATION.MISSING_FIELD("recurring") };
    }
    if (typeof body.recurring !== "boolean") {
        return { isValid: false, message: ERROR_MESSAGES.VALIDATION.INVALID("recurring") };
    }
    
    if (body.metadata && typeof body.metadata !== "object") {
        return { isValid: false, message: ERROR_MESSAGES.VALIDATION.INVALID("metadata") };
    }
    return { isValid: true };
}

export function isValidListId(params: any): { isValid: boolean; message?: string } {
    if (!params.id || params.id === undefined || params.id === null || params.id === '') {
        return { isValid: false, message: ERROR_MESSAGES.VALIDATION.MISSING_FIELD("ID") };
    }
    
    const id = parseInt(params.id, 10);
    if (isNaN(id) || id < 0) {
        return { isValid: false, message: ERROR_MESSAGES.VALIDATION.INVALID_ID };
    }
    
    return { isValid: true };
}

