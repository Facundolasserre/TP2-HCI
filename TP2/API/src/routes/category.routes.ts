import { Router } from 'express';
import {
    getCategories,
    getCategoryById,
    registerCategory, updateCategory, deleteCategory
} from '../controllers/category.controller';
import {authenticateJWT} from "../middleware/authToken";

const router = Router();

/**
 * @swagger
 * /api/categories:
 *  post:
 *      security:
 *        - bearerAuth: []
 *      summary: Create new category
 *      tags: [Categories]
 *      operationId: registerCategory
 *      produces:
 *         - application/json
 *      requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/CategoryRegistrationData'
 *      responses:
 *          201:
 *              description: Category successfully created
 *              content:
 *                application/json:
 *                  schema:
 *                    $ref: '#/definitions/GetCategory'
 *          400:
 *              $ref: '#/responses/BadRequest'
 *          401:
 *              $ref: '#/responses/Unauthorized'
 *          409:
 *              $ref: '#/responses/Conflict'
 *          500:
 *              $ref: '#/responses/ServerError'
 */
router.post('/', authenticateJWT, registerCategory);

/**
 * @swagger
 * /api/categories:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get categories
 *     tags: [Categories]
 *     operationId: getCategories
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Category name
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         default: 1
 *         description: Page number
 *       - in: query
 *         name: per_page
 *         schema:
 *           type: integer
 *         default: 10
 *         description: Results per page
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: ["ASC", "DESC"]
 *         default: "ASC"
 *         description: Sort order
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: ["name", "createdAt", "updatedAt"]
 *         default: "createdAt"
 *         description: Sort field
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/definitions/GetCategory'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total number of categories
 *                     page:
 *                       type: integer
 *                       description: Current page number
 *                     per_page:
 *                       type: integer
 *                       description: Number of items per page
 *                     total_pages:
 *                       type: integer
 *                       description: Total number of pages
 *                     has_next:
 *                       type: boolean
 *                       description: Whether there is a next page
 *                     has_prev:
 *                       type: boolean
 *                       description: Whether there is a previous page
 *             example:
 *               data:
 *                 - id: 1
 *                   name: "Dairy"
 *                   metadata: {}
 *                   createdAt: "2025-01-15 10:30:00"
 *                   updatedAt: "2025-01-15 10:30:00"
 *                   owner:
 *                     id: 1
 *                     name: "John"
 *                     surname: "Doe"
 *                     email: "john@example.com"
 *                 - id: 2
 *                   name: "Bakery"
 *                   metadata: {}
 *                   createdAt: "2025-01-15 10:30:00"
 *                   updatedAt: "2025-01-15 10:30:00"
 *                   owner:
 *                     id: 1
 *                     name: "John"
 *                     surname: "Doe"
 *                     email: "john@example.com"
 *               pagination:
 *                 total: 1
 *                 page: 1
 *                 per_page: 10
 *                 total_pages: 1
 *                 has_next: false
 *                 has_prev: false
 *       400:
 *         $ref: '#/responses/BadRequest'
 *       401:
 *         $ref: '#/responses/Unauthorized'
 *       500:
 *         $ref: '#/responses/ServerError'
 */
router.get('/', authenticateJWT, getCategories);

/**
 * @swagger
 * /api/categories/{id}:
 *  get:
 *      security:
 *        - bearerAuth: []
 *      summary: Get category
 *      tags: [Categories]
 *      operationId: getCategoryById
 *      parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             - type: integer
 *           description: Category ID
 *      responses:
 *          200:
 *              description: Category
 *              content:
 *                application/json:
 *                  schema:
 *                    $ref: '#/definitions/GetCategory'
 *          404:
 *              $ref: '#/responses/NotFound'
 *          400:
 *              $ref: '#/responses/BadRequest'
 *          401:
 *              $ref: '#/responses/Unauthorized'
 *          500:
 *              $ref: '#/responses/ServerError'
 */
router.get('/:id', authenticateJWT, getCategoryById);

/**
 * @swagger
 * /api/categories/{id}:
 *  put:
 *      security:
 *        - bearerAuth: []
 *      summary: Update category
 *      tags: [Categories]
 *      operationId: updateCategory
 *      produces:
 *         - application/json
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: integer
 *          description: Category ID
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/UpdateCategoryProfile'
 *      responses:
 *          200:
 *              description: Category successfully updated
 *              content:
 *                application/json:
 *                  schema:
 *                    $ref: '#/definitions/GetCategory'
 *          400:
 *              $ref: '#/responses/BadRequest'
 *          401:
 *              $ref: '#/responses/Unauthorized'
 *          404:
 *              $ref: '#/responses/NotFound'
 *          409:
 *              $ref: '#/responses/Conflict'
 *          500:
 *              $ref: '#/responses/ServerError'
 */
router.put('/:id', authenticateJWT, updateCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *  delete:
 *      security:
 *        - bearerAuth: []
 *      summary: Delete category
 *      tags: [Categories]
 *      operationId: deleteCategory
 *      produces:
 *         - application/json
 *      parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *           description: Category ID
 *      responses:
 *          200:
 *              description: Category successfully deleted
 *          400:
 *              $ref: '#/responses/BadRequest'
 *          401:
 *              $ref: '#/responses/Unauthorized'
 *          404:
 *              $ref: '#/responses/NotFound'
 *          500:
 *              $ref: '#/responses/ServerError'
 */
router.delete('/:id', authenticateJWT, deleteCategory);

export default router;
