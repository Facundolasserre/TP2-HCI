import { User } from "../entities/user";
import { ILike } from "typeorm";
import { ERROR_MESSAGES } from './errorMessages';

export type RegisterProductData = {
    name: string;
    owner: User;
    category?: { id: number };
    metadata?: Record<string, any>;
}

export interface GetProductsData {
    owner: User;
    name?: string;
    category_id?: number;
    page?: number;
    per_page?: number;
    sort_by?: "name" | "categoryName" | "createdAt" | "updatedAt";
    order?: "ASC" | "DESC";
}

export interface ProductUpdateData {
    name?: string;
    category?: { id: number };
    metadata?: Record<string, any>;
}

export function isValidProductData(body: any): { isValid: boolean; message?: string } {
    if (!body) {
        return { isValid: false, message: ERROR_MESSAGES.VALIDATION.REQUIRED("body") };
    }
    if (!body.name) {
        return { isValid: false, message: ERROR_MESSAGES.VALIDATION.MISSING_FIELD("name") };
    }
    if (typeof body.name !== "string") {
        return { isValid: false, message: ERROR_MESSAGES.VALIDATION.INVALID("name") };
    }
    if (body.category) {
        if (typeof body.category !== "object" || !body.category.id) {
            return { isValid: false, message: ERROR_MESSAGES.VALIDATION.INVALID("category") };
        }
        if (typeof body.category.id !== "number") {
            return { isValid: false, message: ERROR_MESSAGES.VALIDATION.INVALID_ID_WITH_TYPE("Category") };
        }
    }
    if (body.metadata && typeof body.metadata !== "object") {
        return { isValid: false, message: ERROR_MESSAGES.VALIDATION.INVALID("metadata") };
    }

    return { isValid: true };
}

export function isValidProductId(params: any): { isValid: boolean; message?: string } {
    if (!params.id || params.id === '') {
        return { isValid: false, message: ERROR_MESSAGES.VALIDATION.MISSING_FIELD("ID") };
    }
    
    const id = parseInt(params.id, 10);
    if (isNaN(id) || id < 0) {
        return { isValid: false, message: ERROR_MESSAGES.VALIDATION.INVALID_ID };
    }
    
    return { isValid: true };
}

export function generateProductsFilteringOptions(productData: GetProductsData): any {
    const whereOptions: any = {
        owner: { id: productData.owner.id },
    };

    if (productData.name) {
        whereOptions.name = ILike(`%${productData.name}%`);
    }

    if (productData.category_id) {
        whereOptions.category = { id: productData.category_id };
    }

    whereOptions.deletedAt = null;

    return whereOptions;
}