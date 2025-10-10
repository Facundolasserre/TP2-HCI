import { Request, Response } from "express";
import {replyCreated, replySuccess, replyWithError} from '../http';
import * as CategoryService from '../services/category.service';
import { BadRequestError, ServerError } from '../types/errors';
import {isValidCategoryData, isValidCategoryId, RegisterCategoryData} from "../types/category";
import {User} from "../entities/user";
import {deleteCategoryService, getUserCategoriesService} from "../services/category.service";
import { ERROR_MESSAGES } from '../types/errorMessages';

export async function registerCategory(req: Request, res: Response): Promise<void> {
  try {
    const validation = isValidCategoryData(req.body);
    if (!validation.isValid) {
      throw new BadRequestError(validation.message);
    }

    const categoryData: RegisterCategoryData = req.body as RegisterCategoryData;
    categoryData.owner = req.user as User;

    replyCreated(res, await CategoryService.createNewCategoryService(categoryData));
  } catch (err) {
    replyWithError(res, err);
  }
}

export async function getCategories(req: Request, res: Response): Promise<void> {
  try {
    const page: string = (req.query.page as string) || "1";
    const per_page: number = req.query.per_page ? Number(req.query.per_page) : 10;
    const sort_by: "name" | "createdAt" | "updatedAt" = req.query.sort_by
        ? String(req.query.sort_by) as "name" | "createdAt" | "updatedAt"
        : "createdAt";
    const order: "ASC" | "DESC" = req.query.order
        ? String(req.query.order).toUpperCase() as "ASC" | "DESC"
        : "DESC";

    const name: string | undefined = req.query.name ? String(req.query.name) : undefined;

    const categoryData = {
      owner: req.user as User,
      page,
      per_page,
      sort_by,
      order,
      name,
    };

    const result = await getUserCategoriesService(categoryData);
    replySuccess(res, result);
  } catch (err) {
    replyWithError(res, err);
  }
}

export async function getCategoryById(req: Request, res: Response): Promise<void> {
  try {
    const validation = isValidCategoryId(req.params);
    if (!validation.isValid) {
      throw new BadRequestError(validation.message);
    }

    replySuccess(res, await CategoryService.getCategoryByIdService(parseInt(req.params.id)));
  } catch (err) {
    replyWithError(res, err);
  }
}

export async function updateCategory(req: Request, res: Response): Promise<void> {
  try {
    const validation = isValidCategoryId(req.params);
    if (!validation.isValid) {
      throw new BadRequestError(validation.message);
    }

    const bodyValidation = isValidCategoryData(req.body);
    if (!bodyValidation.isValid) {
      throw new BadRequestError(bodyValidation.message);
    }

    const { name, metadata } = req.body;
    replySuccess(res, await CategoryService.updateCategoryService(parseInt(req.params.id), name, metadata));
  } catch (err) {
    replyWithError(res, err);
  }
}

export async function deleteCategory(req: Request, res: Response): Promise<void> {
  try {
    const validation = isValidCategoryId(req.params);
    if (!validation.isValid) {
      throw new BadRequestError(validation.message);
    }
    const categoryDeleted: boolean = await deleteCategoryService(req.user as User, parseInt(req.params.id));
    if(!categoryDeleted) throw new ServerError(ERROR_MESSAGES.SERVER.OPERATION_FAILED);
    replySuccess(res, {});
  } catch(err) {
    replyWithError(res, err);
  }
}