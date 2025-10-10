import AppDataSource from "../db";
import { BadRequestError, NotFoundError, UnauthorizedError, ConflictError, handleCaughtError } from "../types/errors";
import {RegisterCategoryData, GetCategoryData, generateCategoriesFilteringOptions} from "../types/category";
import {Category} from "../entities/category";
import {User} from "../entities/user";
import { ERROR_MESSAGES } from '../types/errorMessages';
import { PaginatedResponse, createPaginationMeta } from '../types/pagination';

/**
 * Creates a new category.
 * Runs inside a transaction to avoid race conditions.
 *
 * @param {RegisterCategoryData} categoryData - Registration data (name, metadata)
 * @returns {Promise<Category>} Created category
 * @throws {Error} If any error occurs during the process
 */
export async function createNewCategoryService(categoryData: RegisterCategoryData): Promise<{ category: Category }> {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const category = new Category();
    category.name = categoryData.name;
    category.owner = categoryData.owner;
    category.metadata = categoryData.metadata ?? null;

    await queryRunner.manager.save(category);
    await queryRunner.commitTransaction();

    return category.getFormattedCategory();
  } catch (err: any) {
    if (queryRunner.isTransactionActive) {
      await queryRunner.rollbackTransaction();
    }
    
    if (err.code === 'SQLITE_CONSTRAINT' || err.code === 'SQLITE_CONSTRAINT_UNIQUE' || err.code === '23505') {
      throw new ConflictError(ERROR_MESSAGES.CONFLICT.CATEGORY_EXISTS);
    }
    
    throw err;
  } finally {
    await queryRunner.release();
  }

}

/**
 * Retrieves user's categories.
 *
 * @param {GetCategoryData} categoryData - Category data for filtering and pagination
 * @returns {Promise<Category>} Category information
 * @throws {NotFoundError} If category is not found
 */
export async function getUserCategoriesService(categoryData: GetCategoryData): Promise<PaginatedResponse<any>> {
  try {
    const whereOptions = generateCategoriesFilteringOptions(categoryData)

    const sortField = categoryData.sort_by || "createdAt";
    const orderDirection = categoryData.order && String(categoryData.order).toUpperCase() === "ASC" ? "ASC" : "DESC";
    const order: any = {};
    order[sortField] = orderDirection;
    const [categories, total] = await Category.findAndCount({
      where: whereOptions,
      relations: ['owner'],
      order,
      take: categoryData.per_page,
      skip: (parseInt(categoryData.page) - 1) * (categoryData.per_page || 10),
    });

    const formattedCategories = categories.map(c => c.getFormattedCategory());
    
    return {
      data: formattedCategories,
      pagination: createPaginationMeta(total, parseInt(categoryData.page), categoryData.per_page)
    };
  } catch (err: unknown) {
    handleCaughtError(err);
  }
}

/**
 * Retrieves a category by id.
 *
 * @param {number} id - Category id to filter by
 * @returns {Promise<Category>} Category information
 * @throws {NotFoundError} If category is not found
 */
export async function getCategoryByIdService(
  id: number
): Promise<Category> {

  try {
    const category: Category | null = await Category.findOne({ where: { id: id, deletedAt: null }, relations: ['owner'] });

    if (!category) throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND.CATEGORY);

    return category.getFormattedCategory() as unknown as Category;
  } catch (err: unknown) {
    handleCaughtError(err);
  }
}

/**
 * Updates the category (name and metadata).
 * Runs inside a tx to avoid race condition.
 *
 * @param {number} id - Category ID
 * @param {string} name - New name
 * @param {any} metadata - New metadata
 * @returns {Promise<Category>} Updated category object
 * @throws {NotFoundError} If category is not found
 */
export async function updateCategoryService(id: number, name: string, metadata?: any): Promise<Category> {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const category: Category | null = await queryRunner.manager.findOne(Category, { where: { id: id, deletedAt: null }, relations: ['owner'] });
    if (!category) throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND.CATEGORY);

    category.name = name;
    if (metadata !== undefined) category.metadata = metadata;
    await queryRunner.manager.save(category);

    await queryRunner.commitTransaction();
    const refreshed = await queryRunner.manager.findOne(Category, { where: { id: category.id }, relations: ['owner'] });
    return refreshed ? (refreshed.getFormattedCategory() as unknown as Category) : category;
  } catch (err: any) {
    await queryRunner.rollbackTransaction();
    
    if (err.code === 'SQLITE_CONSTRAINT' || err.code === 'SQLITE_CONSTRAINT_UNIQUE' || err.code === '23505') {
      throw new ConflictError(ERROR_MESSAGES.CONFLICT.CATEGORY_EXISTS);
    }
    
    throw err;
  } finally {
    await queryRunner.release();
  }
}

/**
 * Deletes a category owned by the current user.
 * Runs inside a tx to avoid race condition.
 *
 * @param {User} currentUser - Authenticated user
 * @param {number} id - Category ID
 * @returns {Promise<boolean>} True if deletion was successful
 * @throws {NotFoundError} If category is not found
 */
export async function deleteCategoryService(currentUser: User, id: number): Promise<boolean> {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const category: Category | null = await queryRunner.manager.findOne(Category, {
      where: {
        id: id,
        owner: { id: currentUser.id },
        deletedAt: null
      },
    });

    if (!category) throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND.CATEGORY);

    await queryRunner.manager.createQueryBuilder()
        .update("Product")
        .set({ category: null })
        .where("categoryId = :id", { id })
        .andWhere("deletedAt IS NULL")
        .execute();

    await queryRunner.manager.softRemove(category);

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
