import {User} from "../entities/user";
import { Like } from "typeorm";
import { ERROR_MESSAGES } from './errorMessages';

export type RegisterCategoryData = {
  name: string;
  owner: User;
  metadata?: Record<string, any>;
}

export type GetCategoryData = {
  name?: string;
  owner: User;
  per_page?: number;
  page?: string;
  sort_by?: 'name' | 'createdAt' | 'updatedAt';
  order?: 'ASC' | 'DESC';
}

export function isValidCategoryData(data: any): { isValid: boolean; message?: string } {
  if (!('name' in data) || data.name.length <= 0) {
    return { isValid: false, message: ERROR_MESSAGES.VALIDATION.MISSING_FIELD("name") };
  }

  if (typeof data.name !== 'string') {
    return { isValid: false, message: ERROR_MESSAGES.VALIDATION.INVALID("name") };
  }

  return { isValid: true };
}

export function isValidCategoryId(data: any): { isValid: boolean; message?: string } {
  if (!data.id || data.id === undefined || data.id === null || data.id === '') {
    return { isValid: false, message: ERROR_MESSAGES.VALIDATION.MISSING_FIELD("ID") };
  }
  
  const id = parseInt(data.id, 10);
  if (isNaN(id) || id < 0) {
    return { isValid: false, message: ERROR_MESSAGES.VALIDATION.INVALID_ID };
  }

  return { isValid: true };
}

export function generateCategoriesFilteringOptions(categoryData: GetCategoryData) {
  let whereOptions: any = {
    owner: { id: categoryData.owner.id },
  };

  if (categoryData.name) {
    whereOptions = { ...whereOptions, name: Like(`%${categoryData.name}%`) };
  }

  whereOptions.deletedAt = null;

  return whereOptions;
}