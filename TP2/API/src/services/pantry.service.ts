import AppDataSource from "../db";
import { Pantry } from "../entities/pantry";
import { User } from "../entities/user";
import {NotFoundError, handleCaughtError, BadRequestError, ConflictError, ForbiddenError} from "../types/errors";
import {removeUserForListShared} from "../utils/users";
import {Product} from "../entities/product";
import {PantryItem} from "../entities/pantryItem";
import { ERROR_MESSAGES } from '../types/errorMessages';
import { QueryFailedError } from 'typeorm';
import { Mailer, EmailType } from './email.service';
import { PaginatedResponse, createPaginationMeta } from '../types/pagination';

/**
 * Creates a new pantry for the given user.
 * Runs inside a transaction to avoid race conditions.
 *
 * @param {{ name: string, metadata?: any }} data - Pantry creation data
 * @param {User} user - Authenticated user
 * @returns {Promise<Pantry>} The created pantry (formatted)
 * @throws {Error} If any error occurs during the process
 */
export async function createPantryService(data: { name: string, metadata?: any }, user: User): Promise<Pantry> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const pantry = new Pantry();
        pantry.name = data.name;
        pantry.metadata = data.metadata ?? null;
        pantry.owner = user;
        await queryRunner.manager.save(pantry);
        await queryRunner.commitTransaction();
        return pantry.getFormattedPantry();
    } catch (err) {
        if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
        
        if (err instanceof QueryFailedError && err.driverError?.message?.includes('UNIQUE constraint failed: pantry.name, pantry.ownerId')) {
            throw new ConflictError(ERROR_MESSAGES.CONFLICT.PANTRY_EXISTS);
        }
        
        handleCaughtError(err);
    } finally {
        await queryRunner.release();
    }
}

/**
 * Retrieves all pantries owned by the user.
 *
 * @param {User} user - Authenticated user
 * @param {boolean} owner - If true, only return pantries where user is owner; if false, only where sharedWith; if undefined, return all
 * @param {"createdAt" | "updatedAt" | "name"} sort_by - Field to sort by
 * @param {"ASC" | "DESC"} order - Sort order
 * @param {number} page - Page number for pagination
 * @param {number} per_page - Number of items per page for pagination
 * @returns {Promise<Pantry[]>} Array of formatted pantries
 * @throws {Error} If any error occurs during the process
 */
export async function getPantriesService(user: User, owner?: boolean, sort_by: "createdAt" | "updatedAt" | "name" = "createdAt", order: "ASC" | "DESC" = "ASC", page: number = 1, per_page: number = 10): Promise<PaginatedResponse<any>> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        let pantries: Pantry[] = [];
        let total = 0;
        const skip = (page - 1) * per_page;
        const take = per_page;
        
        if (owner === undefined) {
            total = await queryRunner.manager
                .createQueryBuilder(Pantry, "pantry")
                .leftJoin("pantry.owner", "owner")
                .leftJoin("pantry.sharedWith", "sharedWith")
                .where("pantry.deletedAt IS NULL")
                .andWhere(
                    "owner.id = :userId OR sharedWith.id = :userId",
                    { userId: user.id }
                )
                .getCount();
                
            pantries = await queryRunner.manager
                .createQueryBuilder(Pantry, "pantry")
                .leftJoinAndSelect("pantry.owner", "owner")
                .leftJoinAndSelect("pantry.sharedWith", "sharedWith")
                .where("pantry.deletedAt IS NULL")
                .andWhere(
                    "owner.id = :userId OR sharedWith.id = :userId",
                    { userId: user.id }
                )
                .orderBy(`pantry.${sort_by}`, order)
                .skip(skip)
                .take(take)
                .getMany();
        } else if (owner === true) {
            total = await queryRunner.manager.count(Pantry, {
                where: { owner: { id: user.id }, deletedAt: null }
            });
            
            pantries = await queryRunner.manager.find(Pantry, {
                where: { owner: { id: user.id }, deletedAt: null },
                relations: ["owner", "sharedWith"],
                order: { [sort_by]: order },
                skip,
                take
            });
        } else {
            total = await queryRunner.manager
                .createQueryBuilder(Pantry, "pantry")
                .leftJoin("pantry.owner", "owner")
                .leftJoin("pantry.sharedWith", "sharedWith")
                .where("pantry.deletedAt IS NULL")
                .andWhere(
                    "sharedWith.id = :userId AND owner.id != :userId",
                    { userId: user.id }
                )
                .getCount();
                
            pantries = await queryRunner.manager
                .createQueryBuilder(Pantry, "pantry")
                .leftJoinAndSelect("pantry.owner", "owner")
                .leftJoinAndSelect("pantry.sharedWith", "sharedWith")
                .where("pantry.deletedAt IS NULL")
                .andWhere(
                    "sharedWith.id = :userId AND owner.id != :userId",
                    { userId: user.id }
                )
                .orderBy(`pantry.${sort_by}`, order)
                .skip(skip)
                .take(take)
                .getMany();
        }
        await queryRunner.commitTransaction();
        
        const formattedPantries = pantries.map(p => p.getFormattedPantry());
        
        return {
            data: formattedPantries,
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
 * Retrieves a pantry by its ID, only if it belongs to the user.
 *
 * @param {number} pantryId - Pantry ID
 * @param {User} user - Authenticated user
 * @returns {Promise<Pantry>} The formatted pantry
 * @throws {NotFoundError} If the pantry is not found or does not belong to the user
 */
export async function getPantryByIdService(pantryId: number, user: User): Promise<Pantry> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const pantry = await queryRunner.manager.findOne(Pantry, {
            where: { id: pantryId, deletedAt: null },
            relations: ["owner", "sharedWith", "items", "items.product"]
        });
        if (!pantry || (pantry.owner.id !== user.id && !pantry.sharedWith.some(u => u.id === user.id))) {
            throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND.PANTRY);
        }
        await queryRunner.commitTransaction();
        return pantry.getFormattedPantry();
    } catch (err) {
        if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
        handleCaughtError(err);
    } finally {
        await queryRunner.release();
    }
}

/**
 * Updates a pantry's name and metadata. Only the owner can update.
 *
 * @param {number} pantryId - Pantry ID
 * @param {string} name - New name
 * @param {any} metadata - New metadata
 * @param {User} user - Authenticated user
 * @returns {Promise<Pantry>} The updated pantry (formatted)
 * @throws {NotFoundError} If the pantry is not found or does not belong to the user
 */
export async function updatePantryService(pantryId: number, name: string, metadata?: any, user?: User): Promise<Pantry> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const pantry = await queryRunner.manager.findOne(Pantry, { where: { id: pantryId, deletedAt: null }, relations: ["owner", "sharedWith"] });
        if (!pantry) {
            throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND.PANTRY);
        }
        
        if (user && pantry.owner.id !== user.id) {
            throw new ForbiddenError(ERROR_MESSAGES.AUTHORIZATION.INSUFFICIENT_PERMISSIONS);
        }
        
        pantry.name = name;
        if (metadata !== undefined) pantry.metadata = metadata;
        
        await queryRunner.manager.save(pantry);
        await queryRunner.commitTransaction();
        
        return pantry.getFormattedPantry();
    } catch (err) {
        if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
        
        if (err instanceof QueryFailedError && err.driverError?.message?.includes('UNIQUE constraint failed: pantry.name, pantry.ownerId')) {
            throw new ConflictError(ERROR_MESSAGES.CONFLICT.PANTRY_EXISTS);
        }
        
        handleCaughtError(err);
    } finally {
        await queryRunner.release();
    }
}

/**
 * Deletes a pantry and all its items (soft delete). Only the owner can delete.
 *
 * @param {number} pantryId - Pantry ID
 * @param {User} user - Authenticated user
 * @returns {Promise<void>} Nothing
 * @throws {NotFoundError} If the pantry is not found or does not belong to the user
 */
export async function deletePantryService(pantryId: number, user: User): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const pantry = await queryRunner.manager.findOne(Pantry, { where: { id: pantryId, deletedAt: null }, relations: ["owner"] });
        if (!pantry) {
            throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND.PANTRY);
        }
        
        if (user && pantry.owner.id !== user.id) {
            throw new ForbiddenError(ERROR_MESSAGES.AUTHORIZATION.INSUFFICIENT_PERMISSIONS);
        }

        const pantryItems = await queryRunner.manager.find(PantryItem, { where: { pantry: { id: pantryId }, deletedAt: null } });
        for (const item of pantryItems) {
            await queryRunner.manager.softRemove(PantryItem, item);
        }
        const products = await queryRunner.manager.find(Product, { where: { pantry: { id: pantryId }, deletedAt: null } });
        for (const product of products) {
            product.pantry = null;
            await product.save()
        }
        await queryRunner.manager.softRemove(pantry);
        await queryRunner.commitTransaction();
    } catch (err) {
        if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
        handleCaughtError(err);
    } finally {
        await queryRunner.release();
    }
}

/**
 * Shares a pantry with another user by email. Only the owner can share.
 *
 * @param {number} pantryId - Pantry ID
 * @param {User} user - Authenticated user (owner)
 * @param {string} email - Email of the user to share with
 * @param {Mailer} mailer - Mailer service to send the verification email
 * @returns {Promise<User>} The user the pantry was shared with
 * @throws {NotFoundError} If the pantry or user is not found, or if sharing with the owner
 */
export async function sharePantryService(pantryId: number, user: User, email: string, mailer?: Mailer): Promise<User> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const pantry = await queryRunner.manager.findOne(Pantry, { where: { id: pantryId, deletedAt: null }, relations: ["sharedWith", "owner"] });
        if (!pantry || (pantry.owner.id !== user.id && !pantry.sharedWith.some(u => u.id === user.id))) {
            throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND.PANTRY);
        }
        const toUser = await queryRunner.manager.findOne(User, { where: { email, deletedAt: null } });
        if (!toUser) throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND.USER);
        if (toUser.id === user.id) throw new BadRequestError(ERROR_MESSAGES.BUSINESS_RULE.CANNOT_SHARE_WITH_YOURSELF);
        if (pantry.sharedWith && pantry.sharedWith.some(u => u.id === toUser.id)) throw new ConflictError(ERROR_MESSAGES.CONFLICT.ALREADY_SHARED);
        pantry.sharedWith = [...(pantry.sharedWith || []), toUser];
        await queryRunner.manager.save(pantry);
        await queryRunner.commitTransaction();
        
        if (mailer) {
            try {
                await mailer.sendEmail(
                    EmailType.PANTRY_SHARED,
                    toUser.name,
                    pantry.name,
                    user.name
                );
            } catch (emailError) {
                console.error('Failed to send pantry shared notification email:', emailError);
            }
        }
        
        return toUser.getFormattedUser()
    } catch (err) {
        if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
        handleCaughtError(err);
        throw err;
    } finally {
        await queryRunner.release();
    }
}

/**
 * Retrieves all users the pantry is shared with. Only the owner can view.
 *
 * @param {number} pantryId - Pantry ID
 * @param {User} user - Authenticated user (owner)
 * @returns {Promise<User[]>} Array of shared users
 * @throws {NotFoundError} If the pantry is not found or does not belong to the user
 */
export async function getSharedUsersService(pantryId: number, user: User): Promise<User[]> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const pantry = await queryRunner.manager.findOne(Pantry, { where: { id: pantryId, owner: { id: user.id }, deletedAt: null }, relations: ["sharedWith"] });
        if (!pantry) throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND.PANTRY);
        await queryRunner.commitTransaction();
        const sharedUsers = pantry.sharedWith.map((user) => {
            return user.getFormattedUser()
        });
        return sharedUsers;
    } catch (err) {
        if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
        handleCaughtError(err);
    } finally {
        await queryRunner.release();
    }
}

/**
 * Revokes a user's access to a shared pantry. Only the owner can revoke.
 *
 * @param {number} pantryId - Pantry ID
 * @param {User} user - Authenticated user (owner)
 * @param {number} toUserId - ID of the user to revoke
 * @returns {Promise<void>} Nothing
 * @throws {NotFoundError} If the pantry or user is not found, or if the user is not shared
 */
export async function revokePantryShareService(pantryId: number, user: User, toUserId: number): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const pantry = await queryRunner.manager.findOne(Pantry, { where: { id: pantryId, owner: { id: user.id }, deletedAt: null }, relations: ["sharedWith", "owner"] });
        if (!pantry) throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND.PANTRY);
        const toUser = await queryRunner.manager.findOne(User, { where: { id: toUserId, deletedAt: null } });
        if (!toUser) throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND.USER);
        const wasShared = pantry.sharedWith.some(u => u.id === toUserId);
        if (!wasShared) throw new BadRequestError("Pantry not shared with user");
        pantry.sharedWith = pantry.sharedWith.filter(u => u.id !== toUserId);
        await queryRunner.manager.save(pantry);
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
