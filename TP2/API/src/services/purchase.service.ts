import AppDataSource from "../db";
import { Purchase } from "../entities/purchase";
import { List } from "../entities/list";
import { User } from "../entities/user";
import { NotFoundError, BadRequestError, handleCaughtError } from "../types/errors";
import { GetPurchasesData, generatePurchasesFilteringOptions } from "../types/purchase";
import {ListItem} from "../entities/listItem";
import { ERROR_MESSAGES } from '../types/errorMessages';
import { PaginatedResponse, createPaginationMeta } from '../types/pagination';
import { generateUniqueListName } from '../utils/listNameUtils';

/**
 * Retrieves purchases with optional filters and pagination.
 *
 * @param {GetPurchasesData} filter - Purchase data for filtering and pagination
 * @returns {Promise<Category>} Purchase information
 * @throws {NotFoundError} If purchase is not found
 */
export async function getPurchasesService(filter: GetPurchasesData): Promise<PaginatedResponse<any>> {
  try {
    const whereOptions = generatePurchasesFilteringOptions(filter);
    const take = filter.per_page || 10;
    const skip = ((filter.page || 1) - 1) * take;

    let order: any = {};
    const orderDirection = filter.order && String(filter.order).toUpperCase() === "ASC" ? "ASC" : "DESC";
    switch (filter.sort_by) {
      case "createdAt":
        order = { createdAt: orderDirection };
        break;
      case "list":
        order = { list: { name: orderDirection } };
        break;
      case "id":
        order = { id: orderDirection };
        break;
      default:
        order = { createdAt: orderDirection };
    }

    const [purchases, total] = await Purchase.findAndCount({
      where: whereOptions,
      relations: ["list", "list.owner", "list.sharedWith", "owner", "items", "items.product", "items.product.category", "items.product.pantry", "items.product.pantry.owner"],
      order,
      take,
      skip,
      withDeleted: true
    });

    for (const purchase of purchases) {
      if (!purchase.list && purchase.listId) {
        purchase.list = await AppDataSource.getRepository(List).findOne({
          where: { id: purchase.listId },
          relations: ["owner", "sharedWith"],
          withDeleted: true
        });
      }
    }

    const formattedPurchases = purchases.map(p => p.getFormattedPurchase());
    
    return {
      data: formattedPurchases,
      pagination: createPaginationMeta(total, filter.page || 1, filter.per_page || 10)
    };
  } catch (err) {
    handleCaughtError(err);
  }
}

/**
 * Retrieves a purchase by its ID for a specific user.
 *
 * @param {number} id - Purchase ID
 * @param {User} user - Authenticated user
 * @returns {Promise<Purchase>} Purchase information
 * @throws {NotFoundError} If purchase is not found
 */
export async function getPurchaseByIdService(id: number, user: User): Promise<Purchase> {
  try {
    const purchase = await AppDataSource.getRepository(Purchase)
        .createQueryBuilder("purchase")
        .leftJoinAndSelect("purchase.owner", "owner")
        .leftJoinAndSelect("purchase.items", "items")
        .leftJoinAndSelect("items.product", "product")
        .leftJoinAndSelect("product.category", "productCategory")
        .leftJoinAndSelect("product.pantry", "productPantry")
        .leftJoinAndSelect("productPantry.owner", "productPantryOwner")
        .where("purchase.id = :id", { id })
        .andWhere("purchase.ownerId = :ownerId", { ownerId: user.id })
        .withDeleted()
        .getOne();

    if (!purchase) throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND.PURCHASE);

    if (purchase.listId) {
      purchase.list = await AppDataSource.getRepository(List).findOne({
        where: { id: purchase.listId },
        relations: ["owner", "sharedWith"],
        withDeleted: true
      });
    }

    return purchase.getFormattedPurchase();
  } catch (err) {
    handleCaughtError(err);
    throw err;
  }
}

/**
 * Restores a purchase by creating a new list from a previous purchase (non-recurring only).
 *
 * @param {number} id - Purchase ID
 * @param {User} user - Authenticated user
 * @returns {Promise<List>} Restored purchased list information
 * @throws {NotFoundError} If purchase is not found
 */
export async function restorePurchaseService(id: number, user: User): Promise<List> {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    let purchase = await queryRunner.manager
        .getRepository(Purchase)
        .createQueryBuilder("purchase")
        .leftJoinAndSelect("purchase.list", "list")
        .leftJoinAndSelect("purchase.items", "items")
        .leftJoinAndSelect("items.product", "product")
        .leftJoinAndSelect("product.category", "productCategory")
        .leftJoinAndSelect("product.pantry", "productPantry")
        .leftJoinAndSelect("productPantry.owner", "productPantryOwner")
        .leftJoinAndSelect("purchase.owner", "owner")
        .addSelect("purchase.listId")
        .where("purchase.id = :id", { id })
        .andWhere("purchase.ownerId = :ownerId", { ownerId: user.id })
        .withDeleted()
        .getOne();

    if (!purchase) throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND.PURCHASE);

    if (!purchase.list && purchase.listId) {
      purchase.list = await queryRunner.manager.findOne(List, {
        where: { id: purchase.listId },
        relations: ["owner", "sharedWith", "items"],
        withDeleted: true,
      });
    }

    if (!purchase.list) throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND.LIST);
    if (purchase.list.recurring) throw new BadRequestError(ERROR_MESSAGES.BUSINESS_RULE.CANNOT_RESTORE_RECURRING_LIST);

    const newList = new List();
    newList.name = await generateUniqueListName(purchase.list.name, user, queryRunner);
    newList.description = purchase.list.description;
    newList.recurring = false;
    newList.metadata = purchase.list.metadata;
    newList.owner = user;

    await queryRunner.manager.save(newList);

    if (purchase.items && purchase.items.length > 0) {
      for (const item of purchase.items) {
        const newItem = new ListItem();
        Object.assign(newItem, item);
        newItem.id = undefined;
        newItem.quantity = item.quantity;
        newItem.unit = item.unit;
        newItem.metadata = item.metadata;
        newItem.purchased = false;
        newItem.lastPurchasedAt = null;
        newItem.product = item.product;
        newItem.owner = user;
        newItem.list = newList;
        newItem.purchase = null;

        await queryRunner.manager.save(newItem);
      }
    }

    await queryRunner.commitTransaction();
    return newList.getFormattedList();
  } catch (err) {
    if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
    handleCaughtError(err);
    throw err;
  } finally {
    await queryRunner.release();
  }
}
