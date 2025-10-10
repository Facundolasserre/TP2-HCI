import { Request, Response } from "express";
import { replyCreated, replySuccess, replyWithError } from '../http';
import * as ListService from '../services/list.service';
import { BadRequestError, ServerError } from '../types/errors';
import {
    isValidListData,
    isValidListId,
    RegisterListData,
   ListFilterOptions,
    ListUpdateData
} from "../types/list";
import { User } from "../entities/user";
import { createInvalidIdMessage } from '../types/errorMessages';
import { ERROR_MESSAGES } from '../types/errorMessages';
import { isValidEmail } from '../types/user';
import { Mailer } from '../services/email.service';

export async function registerList(req: Request, res: Response): Promise<void> {
    try {
        const validation = isValidListData(req.body);
        if (!validation.isValid) throw new BadRequestError(validation.message);

        const listData: RegisterListData = req.body as RegisterListData;
        listData.owner = req.user as User;

        const newList = await ListService.createListService(listData);
        replyCreated(res, newList);
    } catch (err) {
        replyWithError(res, err);
    }
}

export async function getLists(req: Request, res: Response): Promise<void> {
    try {
        const filterOptions: ListFilterOptions = {
            user: req.user as User,
            owner: req.query.owner !== undefined ? req.query.owner === "true" : undefined,
            name: req.query.name ? String(req.query.name) : undefined,
            recurring: req.query.recurring !== undefined ? req.query.recurring === "true" : undefined,
            page: req.query.page ? Number(req.query.page) : 1,
            per_page: req.query.per_page ? Number(req.query.per_page) : 10,
            sort_by: req.query.sort_by ? String(req.query.sort_by) as "name" | "owner" | "createdAt" | "updatedAt" | "lastPurchasedAt" : "name",
            order: req.query.order ? String(req.query.order).toUpperCase() as "ASC" | "DESC" : "ASC"
        };

        const result = await ListService.getListsService(filterOptions);
        replySuccess(res, result);
    } catch (err) {
        replyWithError(res, err);
    }
}

export async function getListById(req: Request, res: Response): Promise<void> {
    try {
        const validation = isValidListId(req.params);
        if (!validation.isValid) throw new BadRequestError(validation.message);

        const list = await ListService.getListByIdService(Number(req.params.id), req.user as User);
        replySuccess(res, list);
    } catch (err) {
        replyWithError(res, err);
    }
}

export async function updateList(req: Request, res: Response): Promise<void> {
    try {
        const validation = isValidListId(req.params);
        if (!validation.isValid) throw new BadRequestError(validation.message);

        const listData: ListUpdateData = req.body as ListUpdateData;
        const updatedList = await ListService.updateListService(parseInt(req.params.id), listData, req.user as User);
        replySuccess(res, updatedList);
    } catch (err) {
        replyWithError(res, err);
    }
}

export async function deleteList(req: Request, res: Response): Promise<void> {
    try {
        const validation = isValidListId(req.params);
        if (!validation.isValid) throw new BadRequestError(validation.message);

        const deleted = await ListService.deleteListService(Number(req.params.id), req.user as User);
        if (!deleted) throw new ServerError(ERROR_MESSAGES.SERVER.OPERATION_FAILED);

        replySuccess(res, {});
    } catch (err) {
        replyWithError(res, err);
    }
}

export async function purchaseShoppingList(req: Request, res: Response): Promise<void> {
    try {
        const validation = isValidListId(req.params);
        if (!validation.isValid) throw new BadRequestError(validation.message);
        const user = req.user as User;
        const result = await ListService.purchaseListService(Number(req.params.id), user, req.body.metadata ?? undefined);
        replyCreated(res, result);
    } catch (err) {
        replyWithError(res, err);
    }
}

export async function resetShoppingList(req: Request, res: Response): Promise<void> {
    try {
        const validation = isValidListId(req.params);
        if (!validation.isValid) throw new BadRequestError(validation.message);
        const user = req.user as User;
        const result = await ListService.resetListItemsService(Number(req.params.id), user);
        replySuccess(res, result);
    } catch (err) {
        replyWithError(res, err);
    }
}

export async function moveToPantry(req: Request, res: Response): Promise<void> {
    try {
        const validation = isValidListId(req.params);
        if (!validation.isValid) throw new BadRequestError(validation.message);
        const user = req.user as User;
        const result = await ListService.moveToPantryService(Number(req.params.id), user);
        replySuccess(res, result);
    } catch (err) {
        replyWithError(res, err);
    }
}

export async function shareShoppingList(req: Request, res: Response): Promise<void> {
    try {
        const validation = isValidListId(req.params);
        if (!validation.isValid) throw new BadRequestError(validation.message);
        
        const toUserEmail: string = req.body.email;
        if (!toUserEmail) throw new BadRequestError(ERROR_MESSAGES.VALIDATION.REQUIRED("email"));
        
        const emailValidation = isValidEmail(toUserEmail);
        if (!emailValidation.isValid) {
            throw new BadRequestError(emailValidation.message);
        }
        
        const fromUser = req.user as User;
        const mailer: Mailer = req.app.locals.mailer;
        const result = await ListService.shareListService(Number(req.params.id), fromUser, toUserEmail, mailer);
        replySuccess(res, result);
    } catch (err) {
        replyWithError(res, err);
    }
}

export async function sharedUsersShoppingList(req: Request, res: Response): Promise<void> {
    try {
        const validation = isValidListId(req.params);
        if (!validation.isValid) throw new BadRequestError(validation.message);
        const user = req.user as User;
        const users = await ListService.getSharedUsersService(Number(req.params.id), user);
        replySuccess(res, users);
    } catch (err) {
        replyWithError(res, err);
    }
}

export async function revokeShareShoppingList(req: Request, res: Response): Promise<void> {
    try {
        const validation = isValidListId(req.params);
        if (!validation.isValid) throw new BadRequestError(validation.message);
        const userId = Number(req.params.user_id);
        if (!userId) throw new BadRequestError(createInvalidIdMessage("User"));
        const fromUser = req.user as User;
        await ListService.revokeListShareService(Number(req.params.id), fromUser, userId);
        replySuccess(res, {});
    } catch (err) {
        replyWithError(res, err);
    }
}
