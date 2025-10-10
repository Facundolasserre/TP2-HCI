/**
 * Standardized error messages for the API
 * Provides consistency in all error messages
 */

export const ERROR_MESSAGES = {
  VALIDATION: {
    REQUIRED: (field: string) => `${field} is required`,
    INVALID: (field: string) => `Invalid ${field}`,
    INVALID_EMAIL: "Invalid email",
    INVALID_PASSWORD: "Invalid password",
    PASSWORD_TOO_SHORT: "Password must be at least 6 characters long",
    INVALID_ID: "Invalid ID",
    INVALID_ID_WITH_TYPE: (entityType: string) => `Invalid ${entityType} ID`,
    INVALID_DATA: "Invalid data",
    MISSING_FIELD: (field: string) => `Missing ${field}`,
    INVALID_FORMAT: (field: string) => `Invalid ${field} format`
  },

  AUTH: {
    UNAUTHORIZED: "Unauthorized",
    INVALID_TOKEN: "Invalid token",
    TOKEN_REQUIRED: "Token required",
    TOKEN_MISSING: "Token missing",
    INVALID_CREDENTIALS: "Invalid credentials",
    ACCOUNT_NOT_VERIFIED: "Account not verified"
  },

  AUTHORIZATION: {
    ACCESS_DENIED: "Access denied",
    INSUFFICIENT_PERMISSIONS: "Insufficient permissions"
  },

  NOT_FOUND: {
    RESOURCE: "Resource not found",
    USER: "User not found",
    PRODUCT: "Product not found",
    CATEGORY: "Category not found",
    PANTRY: "Pantry not found",
    LIST: "Shopping list not found",
    ITEM: "Item not found",
    PURCHASE: "Purchase not found"
  },

  CONFLICT: {
    EMAIL_EXISTS: "Email already exists",
    NAME_EXISTS: "Name already exists",
    LIST_NAME_EXISTS: "Shopping list name already exists",
    RESOURCE_EXISTS: "Resource already exists",
    ALREADY_SHARED: "Already shared",
    DUPLICATE: "Duplicate resource",
    CATEGORY_EXISTS: "Category already exists",
    PANTRY_EXISTS: "Pantry already exists",
    PRODUCT_EXISTS: "Product already exists",
    ITEM_EXISTS: "Item already exists",
    ACCOUNT_ALREADY_VERIFIED: "Account already verified"
  },

  BUSINESS_RULE: {
    CANNOT_RESTORE_RECURRING_LIST: "Cannot restore a recurring list",
    NO_ITEMS_IN_SHOPPING_LIST: "No items in the shopping list",
    NO_ITEMS_PURCHASED_IN_SHOPPING_LIST: "No items purchased in the shopping list",
    QUANTITY_POSITIVE: "Quantity must be a positive number",
    UNIT_NON_EMPTY: "Unit must be a non-empty string",
    METADATA_OBJECT_OR_NULL: "Metadata must be an object or null",
    EMAIL_ALREADY_EXISTS: "Email already registered",
    CANNOT_SHARE_WITH_YOURSELF: "Cannot share with yourself",
    CANNOT_CHANGE_EMAIL: "Cannot change email"
  },

  SERVER: {
    INTERNAL_ERROR: "Internal server error",
    DATABASE_ERROR: "Database error",
    EXTERNAL_SERVICE_ERROR: "External service error",
    OPERATION_FAILED: "Operation failed",
    MAILER_SERVICE_NOT_INITIALIZED: "Mailer service not initialized"
  }
};

/**
 * Helper function to create consistent error messages
 */
export function createErrorMessage(type: 'required' | 'invalid' | 'missing', field: string): string {
  switch (type) {
    case 'required':
      return ERROR_MESSAGES.VALIDATION.REQUIRED(field);
    case 'invalid':
      return ERROR_MESSAGES.VALIDATION.INVALID(field);
    case 'missing':
      return ERROR_MESSAGES.VALIDATION.MISSING_FIELD(field);
    default:
      return ERROR_MESSAGES.VALIDATION.INVALID(field);
  }
}

/**
 * Helper function to create entity-specific ID error messages
 */
export function createInvalidIdMessage(entityType?: string): string {
  if (entityType) {
    return ERROR_MESSAGES.VALIDATION.INVALID_ID_WITH_TYPE(entityType);
  }
  return ERROR_MESSAGES.VALIDATION.INVALID_ID;
}
