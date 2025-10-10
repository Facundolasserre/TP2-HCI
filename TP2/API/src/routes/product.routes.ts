import { Router } from 'express';
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} from '../controllers/product.controller';
import { authenticateJWT } from "../middleware/authToken";

const router = Router();

/**
 * @swagger
 * /api/products:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Create new product
 *     tags: [Products]
 *     operationId: createProduct
 *     produces:
 *       - application/json
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/ProductRegistrationData'
 *     responses:
 *       201:
 *         description: Product successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/GetProduct'
 *       400:
 *         $ref: '#/responses/BadRequest'
 *       401:
 *         $ref: '#/responses/Unauthorized'
 *       409:
 *         $ref: '#/responses/Conflict'
 *       500:
 *         $ref: '#/responses/ServerError'
 */
router.post('/', authenticateJWT, createProduct);

/**
 * @swagger
 * /api/products:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get products
 *     tags: [Products]
 *     operationId: getProducts
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Product name
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: integer
 *         description: Category ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         default: 1
 *         description: Page number (default 1)
 *       - in: query
 *         name: per_page
 *         schema:
 *           type: integer
 *         default: 10
 *         description: Results per page (default 10)
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [name, categoryName, createdAt, updatedAt]
 *         default: name
 *         description: Sort field (default name)
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: ASC
 *         description: Sort order (default ASC)
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/definitions/GetProduct'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total number of products
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
 *                   name: "Milk"
 *                   metadata: {}
 *                   createdAt: "2025-01-15 10:30:00"
 *                   updatedAt: "2025-01-15 10:30:00"
 *                   category:
 *                     id: 1
 *                     name: "Dairy"
 *                     metadata: {}
 *                     createdAt: "2025-01-15 10:30:00"
 *                     updatedAt: "2025-01-15 10:30:00"
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
router.get('/', authenticateJWT, getProducts);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get product
 *     tags: [Products]
 *     operationId: getProductById
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/GetProduct'
 *       404:
 *         $ref: '#/responses/NotFound'
 *       400:
 *         $ref: '#/responses/BadRequest'
 *       401:
 *         $ref: '#/responses/Unauthorized'
 *       500:
 *         $ref: '#/responses/ServerError'
 */
router.get('/:id', authenticateJWT, getProductById);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     summary: Update product
 *     tags: [Products]
 *     operationId: updateProduct
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/ProductRegistrationData'
 *     responses:
 *       200:
 *         description: Product successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/GetProduct'
 *       400:
 *         $ref: '#/responses/BadRequest'
 *       401:
 *         $ref: '#/responses/Unauthorized'
 *       404:
 *         $ref: '#/responses/NotFound'
 *       409:
 *         $ref: '#/responses/Conflict'
 *       500:
 *         $ref: '#/responses/ServerError'
 */
router.put('/:id', authenticateJWT, updateProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Delete product
 *     tags: [Products]
 *     operationId: deleteProduct
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product successfully deleted
 *       400:
 *         $ref: '#/responses/BadRequest'
 *       401:
 *         $ref: '#/responses/Unauthorized'
 *       404:
 *         $ref: '#/responses/NotFound'
 *       500:
 *         $ref: '#/responses/ServerError'
 */
router.delete('/:id', authenticateJWT, deleteProduct);

export default router;