import AppDataSource from "../db";
import { Product } from "../entities/product";
import { Category } from "../entities/category";
import { User } from "../entities/user";
import { NotFoundError, BadRequestError, ConflictError, handleCaughtError } from "../types/errors";
import { ERROR_MESSAGES } from '../types/errorMessages';
import {
  generateProductsFilteringOptions,
  GetProductsData,
  ProductUpdateData, RegisterProductData
} from "../types/product";
import { PaginatedResponse, createPaginationMeta } from '../types/pagination';

/**
* Retrieves user's products.
*
* @param {GetProductsData} productData - Filtering and pagination options
* @returns {Promise<PaginatedResponse<Product>>} Product information with pagination
* @throws {NotFoundError} If no products are found
*/
export async function getProductsService(productData: GetProductsData): Promise<PaginatedResponse<any>> {
  try {
    if (productData.category_id) {
      const category = await Category.findOne({ where: { id: productData.category_id, deletedAt: null } });
      if (!category) {
        throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND.CATEGORY);
      }
    }

    const whereOptions = generateProductsFilteringOptions(productData);

    const orderDirection = productData.order && String(productData.order).toUpperCase() === "ASC" ? "ASC" : "DESC";
    let order: any = {};
    if (productData.sort_by) {
      if (productData.sort_by === "categoryName") {
        order = { category: { name: orderDirection } };
      } else if (productData.sort_by === "name") {
        order = { name: orderDirection };
      } else if (productData.sort_by === "createdAt") {
        order = { createdAt: orderDirection };
      } else if (productData.sort_by === "updatedAt") {
        order = { updatedAt: orderDirection };
      } else {
        order = { name: orderDirection };
      }
    } else {
      order = { name: orderDirection };
    }

    const total = await Product.count({ where: whereOptions });

    const products: Product[] = await Product.find({
      where: whereOptions,
      relations: ["owner", "category"],
      order,
      take: productData.per_page,
      skip: (productData.page - 1) * (productData.per_page || 10),
    });

    const formattedProducts = products.map((p) => p.getFormattedProduct());
    
    return {
      data: formattedProducts,
      pagination: createPaginationMeta(total, productData.page, productData.per_page)
    };
  } catch (err: unknown) {
    handleCaughtError(err);
  }
}

/**
 * Retrieves a product by its ID for a specific user.
 *
 * @param {number} id - Product ID
 * @param {User} owner - Authenticated user
 * @returns {Promise<Product>} Product information
 * @throws {NotFoundError} If product is not found
 */
export async function getProductByIdService(id: number, owner: User): Promise<Product> {
  try {
    const product = await Product.findOne({
      where: { id, owner: { id: owner.id }, deletedAt: null },
      relations: ["category"],
    });
    if (!product) throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND.PRODUCT);
    return product.getFormattedProduct();
  } catch (err) {
    handleCaughtError(err);
  }
}

/**
 * Creates a new product for a user.
 * Runs inside a transaction to avoid race conditions.
 *
 * @param {RegisterProductData} data - Product creation data
 * @returns {Promise<Product>} Created product
 * @throws {BadRequestError} If category is not found
 */
export async function createProductService(data: RegisterProductData): Promise<Product> {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    let category = null;
    if(data.category?.id) {
      category = await queryRunner.manager.findOne(Category, { where: { id: data.category.id } });
      if (!category) throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND.CATEGORY);
    }
    const product = new Product();
    product.name = data.name;
    product.category = category;
    product.metadata = data.metadata || {};
    product.owner = data.owner;
    await queryRunner.manager.save(product);
    await queryRunner.commitTransaction();
    return product.getFormattedProduct();
  } catch (err: any) {
    if (queryRunner.isTransactionActive) {
      await queryRunner.rollbackTransaction();
    }
    
    if (err.code === 'SQLITE_CONSTRAINT' || err.code === 'SQLITE_CONSTRAINT_UNIQUE' || err.code === '23505') {
      throw new ConflictError(ERROR_MESSAGES.CONFLICT.PRODUCT_EXISTS);
    }
    
    handleCaughtError(err);
  } finally {
    await queryRunner.release();
  }
}

/**
 * Updates an existing product for a user.
 * Runs inside a transaction to avoid race conditions.
 *
 * @param {number} id - Product ID
 * @param {User} owner - Authenticated user
 * @param {ProductUpdateData} data - Product update data
 * @returns {Promise<Product>} Updated product
 * @throws {NotFoundError} If product is not found
 * @throws {BadRequestError} If category is not found
 */
export async function updateProductService(id: number, owner: User, data: ProductUpdateData): Promise<Product> {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    const product = await queryRunner.manager.findOne(Product, { where: { id, owner: { id: owner.id }, deletedAt: null }, relations: ["category"] });
    if (!product) throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND.PRODUCT);
    
    if (data.name !== undefined) {
      product.name = data.name;
    }
    
    if (data.category !== undefined) {
      if (data.category === null) {
        product.category = null;
      } else if (data.category.id) {
        const category = await queryRunner.manager.findOne(Category, { where: { id: data.category.id } });
        if (!category) throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND.CATEGORY);
        product.category = category;
      }
    }
    
    if (data.metadata !== undefined) {
      product.metadata = data.metadata;
    }
    await queryRunner.manager.save(product);
    await queryRunner.commitTransaction();
    return product.getFormattedProduct();
  } catch (err: any) {
    if (queryRunner.isTransactionActive) {
      await queryRunner.rollbackTransaction();
    }
    
    if (err.code === 'SQLITE_CONSTRAINT' || err.code === 'SQLITE_CONSTRAINT_UNIQUE' || err.code === '23505') {
      throw new ConflictError(ERROR_MESSAGES.CONFLICT.PRODUCT_EXISTS);
    }
    
    handleCaughtError(err);
  } finally {
    await queryRunner.release();
  }
}

/**
 * Deletes a product for a user.
 * Runs inside a transaction to avoid race conditions.
 *
 * @param {number} id - Product ID
 * @param {User} owner - Authenticated user
 * @returns {Promise<boolean>} True if deleted
 * @throws {NotFoundError} If product is not found
 */
export async function deleteProductService(id: number, owner: User): Promise<boolean> {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    const product = await queryRunner.manager.findOne(Product,
        { where: { id, owner: { id: owner.id }, deletedAt: null } });
    if (!product) throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND.PRODUCT);
    await queryRunner.manager.softRemove(product);
    await queryRunner.commitTransaction();
    return true;
  } catch (err) {
    if (queryRunner.isTransactionActive) {
      await queryRunner.rollbackTransaction();
    }
    handleCaughtError(err);
    throw err;
  } finally {
    await queryRunner.release();
  }
}
