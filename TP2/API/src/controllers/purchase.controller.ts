import { Request, Response } from "express";
import { replyCreated, replySuccess, replyWithError } from '../http';
import * as PurchaseService from '../services/purchase.service';
import { BadRequestError } from '../types/errors';
import { isValidPurchaseId, GetPurchasesData } from "../types/purchase";
import { User } from "../entities/user";

export async function getPurchases(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user as User;
    const filter: GetPurchasesData = {
      user,
      list_id: req.query.list_id ? Number(req.query.list_id) : undefined,
      page: req.query.page ? Number(req.query.page) : 1,
      per_page: req.query.per_page ? Number(req.query.per_page) : 10,
      sort_by: req.query.sort_by ? String(req.query.sort_by) as "createdAt" | "list" | "id" : "createdAt",
      order: req.query.order ? String(req.query.order).toUpperCase() as "ASC" | "DESC" : "DESC"
    };
    const result = await PurchaseService.getPurchasesService(filter);
    replySuccess(res, result);
  } catch (err) {
    replyWithError(res, err);
  }
}

export async function getPurchaseById(req: Request, res: Response): Promise<void> {
  try {
    const validation = isValidPurchaseId(req.params);
    if (!validation.isValid) throw new BadRequestError(validation.message);
    const user = req.user as User;
    const purchase = await PurchaseService.getPurchaseByIdService(Number(req.params.id), user);
    replySuccess(res, purchase);
  } catch (err) {
    replyWithError(res, err);
  }
}

export async function restorePurchase(req: Request, res: Response): Promise<void> {
  try {
    const validation = isValidPurchaseId(req.params);
    if (!validation.isValid) throw new BadRequestError(validation.message);
    const user = req.user as User;
    const newList = await PurchaseService.restorePurchaseService(Number(req.params.id), user);
    replyCreated(res, { list: newList });
  } catch (err) {
    replyWithError(res, err);
  }
}
