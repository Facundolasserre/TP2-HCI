import AppDataSource from "../db";
import {BadRequestError, handleCaughtError, NotFoundError, ConflictError} from "../types/errors";
import {User} from "../entities/user";
import {List} from "../entities/list";
import {ListFilterOptions, ListUpdateData, RegisterListData} from "../types/list";
import {ListItem} from "../entities/listItem";
import {removeUserForListShared, removeUserPrivateValues} from "../utils/users";
import {PantryItem} from "../entities/pantryItem";
import {Purchase} from "../entities/purchase";
import { ERROR_MESSAGES } from '../types/errorMessages';
import { Mailer, EmailType } from './email.service';
import { PaginatedResponse, createPaginationMeta } from '../types/pagination';

/**
 * Creates a new list.
 * Runs inside a transaction to avoid race conditions.
 *
 * @param {RegisterListData} listData - Creation data
 * @returns {Promise<{ list: List }>} Created list
 * @throws {Error} If any error occurs during the process
 */
export async function createListService(listData: RegisterListData): Promise<List> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const list = new List();
        list.name = listData.name;
        list.description = listData.description;
        list.recurring = listData.recurring ?? false;
        list.metadata = listData.metadata ?? null;
        list.owner = listData.owner!;

        await queryRunner.manager.save(list);
        await queryRunner.commitTransaction();

        return list.getFormattedList();
    } catch (err: any) {
        if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
        
        if (err.code === 'SQLITE_CONSTRAINT' && err.message.includes('unique_list_name_per_owner')) {
            throw new ConflictError(ERROR_MESSAGES.CONFLICT.LIST_NAME_EXISTS);
        }
        
        handleCaughtError(err);
    } finally {
        await queryRunner.release();
    }
}

/**
 * Retrieves shopping lists based on filter options.
 *
 * @param {ListFilterOptions} listData - Authenticated user object
 * @returns {Promise<List[]>} List information
 * @throws {NotFoundError} If the list is not found
 */
export async function getListsService(listData: ListFilterOptions): Promise<PaginatedResponse<any>> {
    try {
        const queryBuilder = List.createQueryBuilder("list")
            .leftJoinAndSelect("list.owner", "owner")
            .leftJoinAndSelect("list.sharedWith", "sharedWith")
            .leftJoinAndSelect("list.items", "items")
            .andWhere("list.deletedAt IS NULL");

        if (listData.owner === true) {
            queryBuilder.andWhere("list.owner.id = :userId", { userId: listData.user.id });
        } else if (listData.owner === false) {
            queryBuilder.andWhere("sharedWith.id = :userId", { userId: listData.user.id });
        } else {
            queryBuilder.andWhere(
                "(list.owner.id = :userId OR sharedWith.id = :userId)",
                { userId: listData.user.id }
            );
        }

        if (listData.name) {
            queryBuilder.andWhere("list.name LIKE :name", { name: `%${listData.name}%` });
        }
        if (listData.recurring !== undefined) {
            queryBuilder.andWhere("list.recurring = :recurring", { recurring: listData.recurring });
        }

        let orderField: string;
        switch (listData.sort_by) {
            case "owner":
                orderField = "owner.id";
                break;
            case "createdAt":
                orderField = "list.createdAt";
                break;
            case "updatedAt":
                orderField = "list.updatedAt";
                break;
            case "lastPurchasedAt":
                orderField = "list.lastPurchasedAt";
                break;
            case "name":
            default:
                orderField = "list.name";
        }
        const orderDirection = listData.order ?? "ASC";

        queryBuilder
            .orderBy(orderField, orderDirection)
            .take(listData.per_page)
            .skip((listData.page! - 1) * (listData.per_page ?? 10));

        const [lists, total] = await queryBuilder.getManyAndCount();

        const formattedLists = lists.map(list => list.getFormattedList());
        
        return {
            data: formattedLists,
            pagination: createPaginationMeta(total, listData.page!, listData.per_page!)
        };
    } catch (err) {
        handleCaughtError(err);
    }
}

/**
 * Retrieves a shopping list by ID.
 * @param {number} listId - List ID
 * @param {User} user - Authenticated user
 * @returns {Promise<List>} List information
 * @throws {NotFoundError} If the list is not found or not accessible
 */
export async function getListByIdService(listId: number, user: User): Promise<List> {
    try {
        const list = await List.findOne({ where: { id: listId }, relations: ["owner", "sharedWith", "items"] });
        if (!list || (list.owner.id !== user.id && !list.sharedWith.some(u => u.id === user.id))) {
            throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND.LIST);
        }
        return list.getFormattedList();
    } catch (err) {
        handleCaughtError(err);
    }
}

/**
 * Updates the list. Runs inside a tx to avoid race condition.
 *
 * @param {number} listId - List ID
 * @param {ListUpdateData} data - New list data
 * @param {User} user - Authenticated user
 * @returns {Promise<List>} Updated list object
 * @throws {NotFoundError} If the list is not found or not accessible
 */
export async function updateListService(listId: number, data: ListUpdateData, user: User): Promise<List> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const list = await queryRunner.manager.findOne(List, {
            where: { id: listId } as any,
            relations: ["owner", "sharedWith", "items"],
        });
        if (!list || (list.owner.id !== user.id && !list.sharedWith.some(u => u.id === user.id))) {
            throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND.LIST);
        }
        if (data.name !== undefined) list.name = data.name;
        if (data.description !== undefined) list.description = data.description;
        if (data.recurring !== undefined) list.recurring = data.recurring;
        if (data.metadata !== undefined) list.metadata = data.metadata;
        await queryRunner.manager.save(list);
        await queryRunner.commitTransaction();
        const refreshed = await queryRunner.manager.findOne(List, { where: { id: list.id }, relations: ["owner", "sharedWith", "items"] });
        return refreshed ? (refreshed.getFormattedList() as unknown as List)  : list;
    } catch (err) {
        if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
        throw err;
    } finally {
        await queryRunner.release();
    }
}


/**
 * Deletes a shopping list by ID.
 *
 * @param {User} user - Authenticated user
 * @param {number} listId - List ID
 * @returns {Promise<boolean>} True if deletion was successful
 * @throws {NotFoundError} If the list is not found
 */
export async function deleteListService(listId: number, user: User): Promise<boolean> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const list = await queryRunner.manager.findOne(List, { where:
                { id: listId, owner:
                        { id: user.id },
                        deletedAt: null} });
        if (!list) throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND.LIST);

        await queryRunner.manager.softRemove(list);
        await queryRunner.commitTransaction();
        return true;
    } catch (err) {
        if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
        handleCaughtError(err);
        throw err;
    } finally {
        await queryRunner.release();
    }
}

/**
 * Marks a shopping list as purchased and, if not recurring, moves it to purchase history.
 *
 * @param {number} listId - Shopping list ID
 * @param {User} user - Authenticated user
 * @param {Record<string, any>} metadata - Metadata for the purchase
 * @returns {Promise<List>} The updated or moved list
 * @throws {NotFoundError} If the list is not found or not accessible
 */
export async function purchaseListService(listId: number, user: User, metadata: Record<string, any> | undefined): Promise<List> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const list = await queryRunner.manager.findOne(List, {
            where: { id: listId },
            relations: ["items", "owner", "sharedWith"]
        });
        if (!list || (list.owner.id !== user.id && !list.sharedWith.some(u => u.id === user.id))) {
            throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND.LIST);
        }

        if(list.items.length <= 0) {
            throw new BadRequestError(ERROR_MESSAGES.BUSINESS_RULE.NO_ITEMS_IN_SHOPPING_LIST);
        }

        const listItems: ListItem[] = [];
        for (const item of list.items) {
            const listItem = await queryRunner.manager.findOne(ListItem, { where: { id: item.id } });
            if (listItem) {
                if(listItem.purchased) {
                    listItem.lastPurchasedAt = new Date();
                    listItems.push(listItem);
                    await queryRunner.manager.save(listItem);
                }
            } else {
                throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND.ITEM);
            }
        }

        if(listItems.length <= 0) {
            throw new BadRequestError(ERROR_MESSAGES.BUSINESS_RULE.NO_ITEMS_PURCHASED_IN_SHOPPING_LIST);
        }

        const purchase = new Purchase();
        list.lastPurchasedAt = new Date();
        await queryRunner.manager.save(list);
        purchase.owner = user;
        purchase.list = list;
        purchase.items = listItems;
        purchase.metadata = metadata ?? {};
        await queryRunner.manager.save(purchase);

        if (!list.recurring) {
            await queryRunner.manager.softRemove(list);
        }

        await queryRunner.commitTransaction();
        return list.getFormattedList();
    } catch (err) {
        if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
        handleCaughtError(err);
        throw err;
    } finally {
        await queryRunner.release();
    }
}

/**
 * Resets the items of a shopping list, marking them as not purchased.
 *
 * @param {number} listId - Shopping list ID
 * @param {User} user - Authenticated user
 * @returns {Promise<List>} The updated list with reset items
 * @throws {NotFoundError} If the list is not found or not accessible
 */
export async function resetListItemsService(listId: number, user: User): Promise<List> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const list = await queryRunner.manager.findOne(List, {
            where: { id: listId },
            relations: ["items", "owner", "sharedWith"]
        });
        if (!list || (list.owner.id !== user.id && !list.sharedWith.some(u => u.id === user.id))) {
            throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND.LIST);
        }

        for (const item of list.items) {
            item.purchased = false;
            await queryRunner.manager.save(item);
        }

        await queryRunner.commitTransaction();
        return list.getFormattedList();
    } catch (err) {
        if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
        handleCaughtError(err);
        throw err;
    } finally {
        await queryRunner.release();
    }
}

/**
 * Moves purchased items of a shopping list to the pantry.
 *
 * @param {number} listId - Shopping list ID
 * @param {User} user - Authenticated user
 * @returns {Promise<PantryItem[]>} The updated list with items moved to pantry
 * @throws {NotFoundError} If the list is not found
 */
export async function moveToPantryService(listId: number, user: User): Promise<PantryItem[]> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const list = await queryRunner.manager.findOne(List, {
            where: { id: listId, owner: { id: user.id }, deletedAt: null },
            relations: ["items", "items.product", "items.product.pantry", "owner"]
        });
        if (!list) throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND.LIST);

        const movedItems: PantryItem[] = [];
        for (const item of list.items) {
            if (item.purchased) {
                if (!item.product.pantry) {
                    continue;
                }
                let pantryItem = await queryRunner.manager.findOne(PantryItem, {
                    where: {
                        product: { id: item.product.id },
                        owner: { id: user.id },
                        pantry: { id: item.product.pantry.id },
                        deletedAt: null
                    }
                });
                if (pantryItem) {
                    pantryItem.quantity += item.quantity;
                    if (item.unit && item.unit !== pantryItem.unit) {
                        pantryItem.unit = item.unit;
                    }
                    if (item.metadata) {
                        pantryItem.metadata = { ...pantryItem.metadata, ...item.metadata };
                    }
                    await queryRunner.manager.save(pantryItem);
                    movedItems.push(pantryItem);
                } else {
                    pantryItem = new PantryItem();
                    pantryItem.product = item.product;
                    pantryItem.quantity = item.quantity;
                    pantryItem.unit = item.unit;
                    pantryItem.metadata = item.metadata;
                    pantryItem.owner = user;
                    pantryItem.pantry = item.product.pantry;
                    await queryRunner.manager.save(pantryItem);
                    movedItems.push(pantryItem);
                }
            }
        }

        await queryRunner.commitTransaction();
        return movedItems.map(item => item.getFormattedListItem() ? item.getFormattedListItem() : item);
    } catch (err) {
        if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
        handleCaughtError(err);
        throw err;
    } finally {
        await queryRunner.release();
    }
}

/**
 * Shares a shopping list with another user.
 *
 * @param {number} listId - Shopping list ID
 * @param {User} fromUser - Authenticated user sharing the list
 * @param {string} toUserEmail - Email of the user to share the list with
 * @param {Mailer} mailer - Mailer service to send the verification email
 * @returns {Promise<List>} The shared list
 * @throws {NotFoundError} If the list or user is not found or not accessible
 */
export async function shareListService(listId: number, fromUser: User, toUserEmail: string, mailer?: Mailer): Promise<List> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const list = await queryRunner.manager.findOne(List, {
            where: { id: listId },
            relations: ["sharedWith", "owner"]
        });
        if (!list || (list.owner.id !== fromUser.id && !list.sharedWith.some(u => u.id === fromUser.id))) {
            throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND.LIST);
        }

        const toUser = await queryRunner.manager.findOne(User, { where: { email: toUserEmail, deletedAt: null } });
        if (!toUser) throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND.USER);

        if (toUser.id === fromUser.id) throw new BadRequestError(ERROR_MESSAGES.BUSINESS_RULE.CANNOT_SHARE_WITH_YOURSELF);

        if (list.sharedWith && list.sharedWith.some(u => u.id === toUser.id)) {
            await queryRunner.release();
            throw new ConflictError(ERROR_MESSAGES.CONFLICT.ALREADY_SHARED);
        }

        list.sharedWith = [...(list.sharedWith || []), toUser];
        await queryRunner.manager.save(list);

        await queryRunner.commitTransaction();
        
        if (mailer) {
            try {
                await mailer.sendEmail(
                    EmailType.LIST_SHARED,
                    toUser.name,
                    list.name,
                    fromUser.name
                );
            } catch (emailError) {
                console.error('Failed to send list shared notification email:', emailError);
            }
        }
        
        return list.getFormattedList();
    } catch (err) {
        if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
        handleCaughtError(err);
        throw err;
    } finally {
        await queryRunner.release();
    }
}

/**
 * Retrieves the users with whom a shopping list is shared.
 *
 * @param {number} listId - Shopping list ID
 * @param {User} user - Authenticated user requesting the info
 * @returns {Promise<User[]>} List of users with whom the list is shared
 * @throws {NotFoundError} If the list is not found or not accessible
 */
export async function getSharedUsersService(listId: number, user: User): Promise<User[]> {
    try {
        const list = await List.findOne({
            where: { id: listId },
            relations: ["sharedWith", "owner"]
        });

        if (!list) throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND.LIST);

        if (list.owner.id !== user.id && !(list.sharedWith && list.sharedWith.some(u => u.id === user.id))) {
            throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND.LIST);
        }

        if (!list.sharedWith || list.sharedWith.length === 0) {
            return [];
        }

        return list.sharedWith.map(user => {
            return user.getFormattedUser();
        });

    } catch (err) {
        handleCaughtError(err);
        throw err;
    }
}

/**
 * Revokes the access of a user to a shared shopping list.
 *
 * @param {number} listId - Shopping list ID
 * @param {User} fromUser - Authenticated user revoking access
 * @param {number} toUserId - ID of the user whose access is to be revoked
 * @returns {Promise<void>} The updated list
 * @throws {NotFoundError} If the list or user is not found
 */
export async function revokeListShareService(listId: number, fromUser: User, toUserId: number): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const list = await queryRunner.manager.findOne(List, {
            where: { id: listId, owner: { id: fromUser.id }, deletedAt: null },
            relations: ["items", "owner", "sharedWith"]
        });
        if (!list) throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND.LIST);
        const wasShared = list.sharedWith.some(u => u.id === toUserId);
        if (!wasShared) throw new BadRequestError("Shopping list not shared with user");

        list.sharedWith = list.sharedWith.filter(user => user.id !== toUserId);
        await queryRunner.manager.save(list);

        await queryRunner.commitTransaction();
        return;
    } catch (err) {
        if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
        handleCaughtError(err);
        throw err;
    } finally {
        await queryRunner.release();
    }
}
