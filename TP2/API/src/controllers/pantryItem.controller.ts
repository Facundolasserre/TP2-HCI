import { Request, Response } from "express";
import * as PantryItemService from "../services/pantryItem.service";
import { replySuccess, replyCreated, replyWithError } from "../http";
import { BadRequestError } from "../types/errors";
import { User } from "../entities/user";
import { createInvalidIdMessage } from '../types/errorMessages';
import { ERROR_MESSAGES } from '../types/errorMessages';
import { isValidPantryItemData, isValidPantryItemId, isValidPantryItemUpdateData, RegisterPantryItemData } from '../types/pantryItem';

export async function getPantryItems(req: Request, res: Response): Promise<void> {
    try {
        const user = req.user as User;
        const pantryId = Number(req.params.id);
        if (!pantryId) throw new BadRequestError(ERROR_MESSAGES.VALIDATION.INVALID_ID);
        const page = req.query.page ? Number(req.query.page) : 1;
        const per_page = req.query.per_page ? Number(req.query.per_page) : 10;
        const order = req.query.order === 'ASC' ? 'ASC' : 'DESC';
        const allowedSortBy = ["name", "unit", "quantity", "productName"];
        const sort_by = allowedSortBy.includes(String(req.query.sort_by)) ? String(req.query.sort_by) as typeof allowedSortBy[number] : undefined;
        const search = req.query.search as string | undefined;
        const category_id = req.query.category_id ? Number(req.query.category_id) : undefined;
        if (category_id !== undefined && !category_id) throw new BadRequestError(createInvalidIdMessage("Category"));

        const result = await PantryItemService.getPantryItemsService(pantryId, user, page, per_page, order, sort_by, search, category_id);
        replySuccess(res, result);
    } catch (err) {
        replyWithError(res, err);
    }
}

export async function addPantryItem(req: Request, res: Response): Promise<void> {
    try {
        const validation = isValidPantryItemData(req.body);
        if (!validation.isValid) {
            throw new BadRequestError(validation.message);
        }

        const pantryId = Number(req.params.id);
        if (!pantryId) {
            throw new BadRequestError(ERROR_MESSAGES.VALIDATION.INVALID_ID);
        }

        const { product, quantity, unit, metadata } = req.body;
        const user = req.user as User;

        const itemData: RegisterPantryItemData = {
            product,
            quantity,
            unit,
            metadata
        };

        const item = await PantryItemService.addPantryItemService(pantryId, user, itemData);
        replyCreated(res, item);
    } catch (err) {
        replyWithError(res, err);
    }
}

export async function updatePantryItem(req: Request, res: Response): Promise<void> {
    try {
        const user = req.user as User;
        const pantryId = Number(req.params.id);
        const itemId = Number(req.params.item_id);
        
        if (!pantryId) throw new BadRequestError(ERROR_MESSAGES.VALIDATION.INVALID_ID);
        if (!itemId) throw new BadRequestError(createInvalidIdMessage("Item"));
        
        const validation = isValidPantryItemUpdateData(req.body);
        if (!validation.isValid) {
            throw new BadRequestError(validation.message);
        }
        
        const { quantity, unit, metadata } = req.body;
        const item = await PantryItemService.updatePantryItemService(pantryId, itemId, user, { quantity, unit, metadata });
        replySuccess(res, item);
    } catch (err) {
        replyWithError(res, err);
    }
}

export async function deletePantryItem(req: Request, res: Response): Promise<void> {
    try {
        const user = req.user as User;
        const pantryId = Number(req.params.id);
        const itemId = Number(req.params.item_id);
        if (!pantryId) throw new BadRequestError(ERROR_MESSAGES.VALIDATION.INVALID_ID);
        if (!itemId) throw new BadRequestError(createInvalidIdMessage("Item"));
        await PantryItemService.deletePantryItemService(pantryId, itemId, user);
        replySuccess(res, {});
    } catch (err) {
        replyWithError(res, err);
    }
}
