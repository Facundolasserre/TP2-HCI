import { User } from "../entities/user";
import { ERROR_MESSAGES } from './errorMessages';

export interface GetPurchasesData {
  user: User;
  list_id?: number;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
  sort_by?: "date" | "createdAt" | "updatedAt" | "list" | "id";
  order?: "ASC" | "DESC";
}

export function isValidPurchaseId(params: any): { isValid: boolean; message?: string } {
  if (!params.id || params.id === undefined || params.id === null || params.id === '') {
    return { isValid: false, message: ERROR_MESSAGES.VALIDATION.MISSING_FIELD("ID") };
  }
  
  const id = parseInt(params.id, 10);
  if (isNaN(id) || id < 0) {
    return { isValid: false, message: ERROR_MESSAGES.VALIDATION.INVALID_ID };
  }
  return { isValid: true };
}

export function generatePurchasesFilteringOptions(filter: GetPurchasesData): any {
  const whereOptions: any = {
    owner: { id: filter.user.id },
    deletedAt: null
  };
  if (filter.list_id) {
    whereOptions.list = { id: filter.list_id };
  }

  return whereOptions;
}
