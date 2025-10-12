import AppDataSource from "../db";
import { BadRequestError, NotFoundError, handleCaughtError, ConflictError } from "../types/errors";
import { ListItem } from "../entities/listItem";
import { List } from "../entities/list";
import { Product } from "../entities/product";
import { ERROR_MESSAGES } from '../types/errorMessages';
import {
    RegisterListItemData,
    ListItemUpdateData,
    ListItemFilterOptions,
} from "../types/listItem";
import { PaginatedResponse, createPaginationMeta } from '../types/pagination';

/**
 * Creates a new list item inside a shopping list.
 * Runs inside a transaction to avoid race conditions.
 *
 * @param {RegisterListItemData} itemData - Item data (name, quantity, metadata, listId)
 * @returns {Promise<{ item: ListItem }>} Created item
 * @throws {NotFoundError} If the parent list does not exist
 */
export async function addListItemService(
    itemData: RegisterListItemData
): Promise<{ item: ListItem }> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const list = await queryRunner.manager.findOne(List, {
            where: { id: itemData.listId, deletedAt: null },
            relations: ["owner", "items", "items.product"],
        });
        if (!list) throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND.LIST);

        const product = await queryRunner.manager.findOne(Product, {
            where: { id: itemData.product.id, deletedAt: null },
            relations: ["pantry", "pantry.owner"]
        });
        if (!product) throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND.PRODUCT);

        const itemsArray = Array.isArray(list.items) ? list.items : [];
        for (const auxItem of itemsArray) {
            if (auxItem.product.id === product.id) {
                throw new ConflictError(ERROR_MESSAGES.CONFLICT.ITEM_EXISTS);
            }
        }
        const item = new ListItem();
        item.product = product;
        item.quantity = itemData.quantity ?? 1;
        item.unit = itemData.unit;
        item.metadata = itemData.metadata ?? null;
        item.purchased = false;
        item.list = list.getFormattedList();

        await queryRunner.manager.save(item);
        await queryRunner.commitTransaction();

        const saved = await ListItem.findOne({
            where: { id: item.id },
            relations: ["list", "list.owner", "product", "product.pantry", "product.pantry.owner"],
        });

        return {
            item: saved ? (saved.getFormattedListItem() as unknown as ListItem) : item,
        };
    } catch (err) {
        if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
        throw err;
    } finally {
        await queryRunner.release();
    }
}

/**
 * Retrieves items from a list with optional filters (purchased, pagination).
 *
 * @param {ListItemFilterOptions} filterOptions - Filter and pagination options
 * @returns {Promise<ListItem[]>} List of items
 * @throws {NotFoundError} If no items are found
 */
export async function getListItemsService(filterOptions: ListItemFilterOptions): Promise<PaginatedResponse<any>> {
    try {
        const list = await List.findOne({
            where: { id: filterOptions.listId, deletedAt: null },
        });
        if (!list) throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND.LIST);

        const whereOptions: any = { list: { id: filterOptions.listId, deletedAt: null } };
        if (filterOptions.purchased !== undefined) whereOptions.purchased = filterOptions.purchased;

        if (filterOptions.pantry_id !== undefined) {
            whereOptions.product = whereOptions.product || {};
            whereOptions.product.pantry = { id: filterOptions.pantry_id };
        }
        if (filterOptions.category_id !== undefined) {
            whereOptions.product = whereOptions.product || {};
            whereOptions.product.category = { id: filterOptions.category_id };
        }

        if (filterOptions.search) {
            if (!whereOptions.product) whereOptions.product = {};
            whereOptions.product.name = () => `ILIKE '%${filterOptions.search.toLowerCase()}%'`;
        }

        let orderOptions: any;
        if (filterOptions.sort_by === "productName") {
            orderOptions = { product: { name: filterOptions.order ?? "ASC" } };
        } else {
            const orderField = filterOptions.sort_by ?? "createdAt";
            const orderDirection = filterOptions.order ?? "DESC";
            orderOptions = { [orderField]: orderDirection };
        }

        const [items, total] = await ListItem.findAndCount({
            where: whereOptions,
            relations: ["list", "list.owner", "product", "product.pantry", "product.pantry.owner", "owner", "product.category"],
            take: filterOptions.per_page,
            skip: (filterOptions.page - 1) * (filterOptions.per_page ?? 10),
            order: orderOptions,
        });

        const formattedItems = items.map(i => i.getFormattedListItem());
        
        return {
            data: formattedItems,
            pagination: createPaginationMeta(total, filterOptions.page, filterOptions.per_page)
        };
    } catch (err) {
        handleCaughtError(err);
    }
}

/**
 * Updates a list item (name, quantity, metadata).
 * Runs inside a transaction to avoid race condition.
 *
 * @param {number} listId - Parent list ID
 * @param {number} itemId - Item ID
 * @param {ListItemUpdateData} updateData - Data to update
 * @returns {Promise<ListItem>} Updated item
 * @throws {NotFoundError} If item is not found
 */
export async function updateListItemService(
    listId: number,
    itemId: number,
    updateData: ListItemUpdateData
): Promise<ListItem> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const list = await queryRunner.manager
            .createQueryBuilder(List, "list")
            .leftJoinAndSelect("list.owner", "owner")
            .where("list.id = :listId", { listId })
            .andWhere("list.deletedAt IS NULL")
            .getOne();
        if (!list) {
            throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND.LIST);
        }
        
        const item = await queryRunner.manager.findOne(ListItem, {
            where: { id: itemId, list: { id: listId }, deletedAt: null },
            relations: ["list", "list.owner", "product", "product.pantry", "product.pantry.owner", "product.category"],
        });

        if (!item) throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND.ITEM);

        if (updateData.quantity !== undefined) {
            if (typeof updateData.quantity !== "number" || updateData.quantity <= 0) {
                throw new BadRequestError(ERROR_MESSAGES.BUSINESS_RULE.QUANTITY_POSITIVE);
            }
            item.quantity = updateData.quantity;
        }

        if (updateData.unit !== undefined) {
            if (typeof updateData.unit !== "string" || updateData.unit.trim() === "") {
                throw new BadRequestError(ERROR_MESSAGES.BUSINESS_RULE.UNIT_NON_EMPTY);
            }
            item.unit = updateData.unit.trim();
        }

        if (updateData.metadata !== undefined) {
            if (typeof updateData.metadata !== "object" && updateData.metadata !== null) {
                throw new BadRequestError(ERROR_MESSAGES.BUSINESS_RULE.METADATA_OBJECT_OR_NULL);
            }
            item.metadata = updateData.metadata;
        }

        await queryRunner.manager.save(item);
        await queryRunner.commitTransaction();

        const refreshed = await queryRunner.manager.findOne(ListItem, {
            where: { id: item.id },
            relations: ["list", "list.owner"],
        });

        return item.getFormattedListItem();
    } catch (err) {
        if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
        throw err;
    } finally {
        await queryRunner.release();
    }
}

/**
 * Toggles the purchased status of a list item.
 *
 * @param {number} listId - Parent list ID
 * @param {number} itemId - Item ID
 * @param {boolean} purchased - New purchased status
 * @returns {Promise<ListItem>} Updated item
 * @throws {NotFoundError} If item is not found
 */
export async function toggleListItemPurchasedService(
    listId: number,
    itemId: number,
    purchased: boolean
): Promise<ListItem> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const item = await queryRunner.manager.findOne(ListItem, {
            where: { id: itemId, list: { id: listId }, deletedAt: null },
            relations: ["list", "list.owner", "product", "product.pantry", "product.pantry.owner", "product.category"],
        });

        if (!item) throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND.ITEM);

        item.purchased = purchased;
        await queryRunner.manager.save(item);

        await queryRunner.commitTransaction();
        return item.getFormattedListItem() as unknown as ListItem;
    } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
    } finally {
        await queryRunner.release();
    }
}

/**
 * Deletes a list item from a shopping list.
 * Runs inside a tx to avoid race condition.
 *
 * @param {number} listId - Parent list ID
 * @param {number} itemId - Item ID
 * @returns {Promise<boolean>} True if deletion was successful
 * @throws {NotFoundError} If item is not found
 */
export async function deleteListItemService(listId: number, itemId: number): Promise<boolean> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const item = await queryRunner.manager.findOne(ListItem, {
            where: { id: itemId, list: { id: listId }, deletedAt: null },
        });

        if (!item) throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND.ITEM);

        await queryRunner.manager.softRemove(item);

        await queryRunner.commitTransaction();
        return true;
    } catch (err) {
        await queryRunner.rollbackTransaction();
        handleCaughtError(err);
        throw err;
    } finally {
        await queryRunner.release();
    }
}
