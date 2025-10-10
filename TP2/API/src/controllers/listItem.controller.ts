import { Request, Response } from "express";
import { replyCreated, replySuccess, replyWithError } from "../http";
import * as ListItemService from "../services/listItem.service";
import { BadRequestError, ServerError } from "../types/errors";
import {
    isValidListItemData,
    isValidListItemId,
    isValidListItemUpdateData,
    RegisterListItemData,
    ListItemUpdateData,
    ListItemFilterOptions,
} from "../types/listItem";
import { isValidListId } from "../types/list";
import { User } from "../entities/user";
import { ERROR_MESSAGES } from '../types/errorMessages';

/**
 * Get all items from a shopping list.
 */
export async function getListItems(req: Request, res: Response): Promise<void> {
    try {
        const validation = isValidListId(req.params);
        if (!validation.isValid) throw new BadRequestError(validation.message);

        const allowedSortBy = ["updatedAt", "createdAt", "lastPurchasedAt", "productName"];
        const sortBy = req.query.sort_by ? String(req.query.sort_by) : "createdAt";
        const sort_by = allowedSortBy.includes(sortBy) ? sortBy as "updatedAt" | "createdAt" | "lastPurchasedAt" | "productName" : "createdAt";
        const order = req.query.order && ["ASC", "DESC"].includes(String(req.query.order).toUpperCase()) ? String(req.query.order).toUpperCase() as "ASC" | "DESC" : "DESC";
        const pantry_id = req.query.pantry_id ? Number(req.query.pantry_id) : undefined;
        const category_id = req.query.category_id ? Number(req.query.category_id) : undefined;
        const search = req.query.search ? String(req.query.search) : undefined;

        const filterOptions: ListItemFilterOptions = {
            listId: Number(req.params.id),
            owner: req.user as User,
            purchased:
                req.query.purchased !== undefined
                    ? req.query.purchased === "true"
                    : undefined,
            page: req.query.page ? Number(req.query.page) : 1,
            per_page: req.query.per_page ? Number(req.query.per_page) : 10,
            sort_by,
            order,
            pantry_id,
            category_id,
            search,
        };

        const result = await ListItemService.getListItemsService(filterOptions);
        replySuccess(res, result);
    } catch (err) {
        replyWithError(res, err);
    }
}

/**
 * Add a new item to a shopping list.
 */
export async function addListItem(req: Request, res: Response): Promise<void> {
    try {
        const validation = isValidListId(req.params);
        if (!validation.isValid) throw new BadRequestError(validation.message);

        const bodyValidation = isValidListItemData(req.body);
        if (!bodyValidation.isValid) throw new BadRequestError(bodyValidation.message);

        const { product, quantity, unit, metadata } = req.body;

        const itemData: RegisterListItemData = {
            listId: Number(req.params.id),
            owner: req.user as User,
            product: product,
            quantity: Number(quantity),
            unit: String(unit),
            metadata: metadata ?? null,
        };

        const newItem = await ListItemService.addListItemService(itemData);
        replyCreated(res, newItem);
    } catch (err) {
        replyWithError(res, err);
    }
}

/**
 * Update a shopping list item.
 */
export async function updateListItem(req: Request, res: Response): Promise<void> {
    try {
        const validation = isValidListItemId(req.params);
        if (!validation.isValid) throw new BadRequestError(validation.message);

        const updateValidation = isValidListItemUpdateData(req.body);
        if (!updateValidation.isValid) throw new BadRequestError(updateValidation.message);

        const listId = Number(req.params.id);
        const itemId = Number(req.params.item_id);
        const { quantity, unit, metadata } = req.body;

        const updatedItem = await ListItemService.updateListItemService(listId, itemId, { quantity, unit, metadata });
        replySuccess(res, updatedItem);
    } catch (err) {
        replyWithError(res, err);
    }
}

/**
 * Toggle purchased status of a shopping list item.
 */
export async function toggleListItemPurchased(req: Request, res: Response): Promise<void> {
    try {
        const validation = isValidListItemId(req.params);
        if (!validation.isValid) throw new BadRequestError(validation.message);

        if (typeof req.body.purchased !== "boolean") {
            throw new BadRequestError(ERROR_MESSAGES.VALIDATION.INVALID("purchased"));
        }

        const listId = Number(req.params.id);
        const itemId = Number(req.params.item_id);

        const toggledItem = await ListItemService.toggleListItemPurchasedService(
            listId,
            itemId,
            req.body.purchased
        );
        replySuccess(res, toggledItem);
    } catch (err) {
        replyWithError(res, err);
    }
}

/**
 * Delete a shopping list item.
 */
export async function deleteListItem(req: Request, res: Response): Promise<void> {
    try {
        const validation = isValidListItemId(req.params);
        if (!validation.isValid) throw new BadRequestError(validation.message);

        const listId = Number(req.params.id);
        const itemId = Number(req.params.item_id);

        const deleted = await ListItemService.deleteListItemService(listId, itemId);
        if (!deleted) throw new ServerError(ERROR_MESSAGES.SERVER.OPERATION_FAILED);

        replySuccess(res, {});
    } catch (err) {
        replyWithError(res, err);
    }
}
