import AppDataSource from "../db";
import { Pantry } from "../entities/pantry";
import { PantryItem } from "../entities/pantryItem";
import { Product } from "../entities/product";
import { User } from "../entities/user";
import {NotFoundError, handleCaughtError, ConflictError} from "../types/errors";
import { ERROR_MESSAGES } from '../types/errorMessages';
import { PaginatedResponse, createPaginationMeta } from '../types/pagination';

/**
 * Retrieves pantry items for a given pantry, with support for pagination, sorting, and search.
 *
 * @param {number} pantryId - Pantry ID
 * @param {User} user - Authenticated user
 * @param {number} page - Page number for pagination
 * @param {number} per_page - Results per page
 * @param {'ASC' | 'DESC'} order - Sort order (ASC or DESC)
 * @param {string} [sort_by] - Field to sort by (name, quantity, unit)
 * @param {string} [search] - Search by product name (case-insensitive, partial match)
 * @param {number} [category_id] - Filter by category ID
 * @returns {Promise<{PantryItem[]}>} Paginated pantry items
 * @throws {NotFoundError} If the pantry is not found or not accessible by the user
 */
export async function getPantryItemsService(
    pantryId: number,
    user: User,
    page: number = 1,
    per_page: number = 10,
    order: 'ASC' | 'DESC' = 'DESC',
    sort_by?: string,
    search?: string,
    category_id?: number
): Promise<PaginatedResponse<any>> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const pantry = await queryRunner.manager
            .createQueryBuilder(Pantry, "pantry")
            .leftJoin("pantry.sharedWith", "sharedWith")
            .leftJoin("pantry.owner", "owner")
            .where("pantry.id = :pantryId", { pantryId })
            .andWhere("pantry.deletedAt IS NULL")
            .andWhere("owner.id = :userId OR sharedWith.id = :userId", { userId: user.id })
            .getOne();
        if (!pantry) throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND.PANTRY);

        const qb = queryRunner.manager
            .createQueryBuilder(PantryItem, "item")
            .leftJoinAndSelect("item.product", "product")
            .leftJoinAndSelect("product.category", "category")
            .leftJoinAndSelect("product.pantry", "pantry")
            .leftJoinAndSelect("pantry.owner", "owner")
            .where("item.pantry = :pantryId", { pantryId })
            .andWhere("item.deletedAt IS NULL");

        if (search) {
            qb.andWhere("LOWER(product.name) LIKE :search", { search: `%${search.toLowerCase()}%` });
        }
        if (category_id) {
            qb.andWhere("category.id = :category_id", { category_id });
        }

        if (sort_by === 'name') {
            qb.orderBy("product.name", order);
        } else if (sort_by === 'quantity') {
            qb.orderBy("item.quantity", order);
        } else if (sort_by === 'unit') {
            qb.orderBy("item.unit", order);
        } else if (sort_by === 'productName') {
            qb.orderBy("product.name", order);
        } else {
            qb.orderBy("item.createdAt", "DESC");
        }

        qb.skip((page - 1) * per_page).take(per_page);
        const [items, total] = await qb.getManyAndCount();

        await queryRunner.commitTransaction();
        
        const formattedItems = items.map(i => i.getFormattedListItem());
        
        return {
            data: formattedItems,
            pagination: createPaginationMeta(total, page, per_page)
        };
    } catch (err) {
        if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
        handleCaughtError(err);
    } finally {
        await queryRunner.release();
    }
}

/**
 * Adds a new item to the pantry, or updates the existing item if the product already exists in the pantry.
 * Runs inside a transaction to avoid race conditions.
 *
 * @param {number} pantryId - Pantry ID
 * @param {User} user - Authenticated user
 * @param {{ product_id: number, quantity: number, unit?: string, metadata?: any }} data - Item data
 * @returns {Promise<object>} The created or updated pantry item (id, product_id, quantity, unit, metadata, added_at, pantry_id)
 * @throws {NotFoundError} If the pantry or product is not found or not accessible by the user
 * @throws {BadRequestError} If the item already exists in the pantry
 */
export async function addPantryItemService(pantryId: number, user: User, data: { product: { id: number }, quantity: number, unit?: string, metadata?: any }): Promise<object> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const pantry = await queryRunner.manager
            .createQueryBuilder(Pantry, "pantry")
            .leftJoin("pantry.sharedWith", "sharedWith")
            .leftJoin("pantry.owner", "owner")
            .where("pantry.id = :pantryId", { pantryId })
            .andWhere("pantry.deletedAt IS NULL")
            .andWhere("owner.id = :userId OR sharedWith.id = :userId", { userId: user.id })
            .getOne();
        if (!pantry) throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND.PANTRY);
        const product = await queryRunner.manager.findOne(Product, { where: { id: data.product.id, deletedAt: null }, relations: ["category", "pantry", "pantry.owner"]});
        if (!product) throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND.PRODUCT);

        let item = await queryRunner.manager.findOne(PantryItem, {
            where: {
                pantry: { id: pantry.id },
                product: { id: product.id },
                deletedAt: null
            },
            relations: ["pantry", "product"]
        });
        if (!item) {
            item = new PantryItem();
            item.pantry = pantry;
            item.product = product;
            item.quantity = data.quantity;
            item.unit = data.unit;
            item.metadata = data.metadata ?? null;
            item.owner = user;
            item.addedAt = new Date();
            await queryRunner.manager.save(item);
        } else {
            throw new ConflictError(ERROR_MESSAGES.CONFLICT.ITEM_EXISTS);
        }
        await queryRunner.commitTransaction();
        return item.getFormattedListItem();
    } catch (err) {
        if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
        handleCaughtError(err);
    } finally {
        await queryRunner.release();
    }
}

/**
 * Updates an existing pantry item. Only the pantry owner or shared users can update.
 *
 * @param {number} pantryId - Pantry ID
 * @param {number} itemId - Pantry item ID
 * @param {User} user - Authenticated user
 * @param {{ quantity?: number, unit?: string, metadata?: any }} data - Fields to update
 * @returns {Promise<object>} The updated pantry item
 * @throws {NotFoundError} If the item or pantry is not found or not accessible by the user
 */
export async function updatePantryItemService(pantryId: number, itemId: number, user: User, data: { quantity: number, unit: string, metadata?: any }): Promise<object> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const pantry = await queryRunner.manager
            .createQueryBuilder(Pantry, "pantry")
            .leftJoinAndSelect("pantry.sharedWith", "sharedWith")
            .leftJoinAndSelect("pantry.owner", "owner")
            .where("pantry.id = :pantryId", { pantryId })
            .andWhere("pantry.deletedAt IS NULL")
            .getOne();
        if (!pantry || (pantry.owner?.id !== user.id && !pantry.sharedWith?.some(u => u.id === user.id))) {
            throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND.PANTRY);
        }
        
        const item = await queryRunner.manager.findOne(PantryItem, { where: { id: itemId, pantry: { id: pantryId }, deletedAt: null }, relations: ["pantry", "product", "product.category", "product.pantry", "product.pantry.owner"] });
        if (!item) throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND.ITEM);
        
        item.quantity = data.quantity;
        item.unit = data.unit;
        if (data.metadata !== undefined) item.metadata = data.metadata;
        await queryRunner.manager.save(item);
        await queryRunner.commitTransaction();
        return item.getFormattedListItem();
    } catch (err) {
        if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
        handleCaughtError(err);
    } finally {
        await queryRunner.release();
    }
}

/**
 * Deletes a pantry item (soft delete). Only the pantry owner or shared users can delete.
 *
 * @param {number} pantryId - Pantry ID
 * @param {number} itemId - Pantry item ID
 * @param {User} user - Authenticated user
 * @returns {Promise<void>} Nothing
 * @throws {NotFoundError} If the item or pantry is not found or not accessible by the user
 */
export async function deletePantryItemService(pantryId: number, itemId: number, user: User): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const pantry = await queryRunner.manager
            .createQueryBuilder(Pantry, "pantry")
            .leftJoinAndSelect("pantry.sharedWith", "sharedWith")
            .leftJoinAndSelect("pantry.owner", "owner")
            .where("pantry.id = :pantryId", { pantryId })
            .andWhere("pantry.deletedAt IS NULL")
            .getOne();
        
        if (!pantry || (pantry.owner?.id !== user.id && !pantry.sharedWith?.some(u => u.id === user.id))) {
            throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND.PANTRY);
        }
        
        const item = await queryRunner.manager.findOne(PantryItem, { 
            where: { id: itemId, deletedAt: null }, 
            relations: ["pantry"] 
        });
        if (!item || item.pantry.id !== pantryId) throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND.ITEM);
        
        await queryRunner.manager.softRemove(item);
        await queryRunner.commitTransaction();
        return;
    } catch (err) {
        if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
        handleCaughtError(err);
    } finally {
        await queryRunner.release();
    }
}
