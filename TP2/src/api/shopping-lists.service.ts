import { get, post, put, del } from './http';
import type {
  ShoppingList,
  ShoppingListsArray,
  ShoppingListCreate,
  ShoppingListUpdate,
  ListShoppingListsParams,
  ShareRequest,
  PurchaseRequest,
  ListItemArray,
  User,
} from '@/types/shopping-lists';

const ENDPOINT = '/api/shopping-lists';

export const createList = (data: ShoppingListCreate): Promise<ShoppingList> => {
  return post<ShoppingList>(ENDPOINT, data);
};

export const listLists = (params?: ListShoppingListsParams): Promise<ShoppingListsArray> => {
  return get<ShoppingListsArray>(ENDPOINT, { params });
};

export const getListById = (id: number): Promise<ShoppingList> => {
  return get<ShoppingList>(`${ENDPOINT}/${id}`);
};

export const updateList = (id: number, data: ShoppingListUpdate): Promise<ShoppingList> => {
  return put<ShoppingList>(`${ENDPOINT}/${id}`, data);
};

export const deleteList = (id: number): Promise<void> => {
  return del<void>(`${ENDPOINT}/${id}`);
};

export const purchaseList = (id: number, data?: PurchaseRequest): Promise<ShoppingList> => {
  return post<ShoppingList>(`${ENDPOINT}/${id}/purchase`, data || {});
};

export const resetList = (id: number): Promise<ListItemArray> => {
  return post<ListItemArray>(`${ENDPOINT}/${id}/reset`);
};

export const moveToPantry = (id: number): Promise<void> => {
  return post<void>(`${ENDPOINT}/${id}/move-to-pantry`);
};

export const shareList = (id: number, email: string): Promise<void> => {
  const data: ShareRequest = { email };
  return post<void>(`${ENDPOINT}/${id}/share`, data);
};

export const getSharedUsers = (id: number): Promise<User[]> => {
  return get<User[]>(`${ENDPOINT}/${id}/shared-users`);
};

export const revokeShare = (id: number, userId: number): Promise<void> => {
  return del<void>(`${ENDPOINT}/${id}/share/${userId}`);
};