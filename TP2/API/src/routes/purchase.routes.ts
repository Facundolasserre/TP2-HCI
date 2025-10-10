import { Router } from 'express';
import { getPurchases, getPurchaseById, restorePurchase } from '../controllers/purchase.controller';
import { authenticateJWT } from '../middleware/authToken';

const router = Router();

/**
 * @swagger
 * /api/purchases:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get purchases
 *     tags: [Purchases]
 *     operationId: getPurchases
 *     parameters:
 *       - in: query
 *         name: list_id
 *         schema:
 *           type: integer
 *         description: Shopping list ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: per_page
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Results per page
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [createdAt, list, id]
 *           default: createdAt
 *         description: Sort field
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of purchases
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/definitions/Purchase'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total number of purchases
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
 *                   metadata: {}
 *                   createdAt: "2025-01-15 10:30:00"
 *                   updatedAt: "2025-01-15 10:30:00"
 *                   list:
 *                     id: 1
 *                     name: "Weekly Groceries"
 *                     description: "Weekly shopping list"
 *                     recurring: true
 *                     metadata: {}
 *                     createdAt: "2025-01-15 10:30:00"
 *                     updatedAt: "2025-01-15 10:30:00"
 *                     lastPurchasedAt: "2025-01-14 15:20:00"
 *                     owner:
 *                       id: 1
 *                       name: "John"
 *                       surname: "Doe"
 *                       email: "john@example.com"
 *                     sharedWith: []
 *                   items:
 *                     - id: 1
 *                       quantity: 2
 *                       unit: "kg"
 *                       purchased: true
 *                       metadata: {}
 *                       createdAt: "2025-01-15 10:30:00"
 *                       updatedAt: "2025-01-15 10:30:00"
 *                       lastPurchasedAt: "2025-01-15 10:30:00"
 *                       product:
 *                         id: 1
 *                         name: "Milk"
 *                         metadata: {}
 *                         createdAt: "2025-01-15 10:30:00"
 *                         updatedAt: "2025-01-15 10:30:00"
 *                         category:
 *                           id: 1
 *                           name: "Dairy"
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
router.get('/', authenticateJWT, getPurchases);

/**
 * @swagger
 * /api/purchases/{id}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get purchase
 *     tags: [Purchases]
 *     operationId: getPurchaseById
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Purchase ID
 *     responses:
 *       200:
 *         description: Purchase details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Purchase'
 *       400:
 *         $ref: '#/responses/BadRequest'
 *       401:
 *         $ref: '#/responses/Unauthorized'
 *       404:
 *         $ref: '#/responses/NotFound'
 *       500:
 *         $ref: '#/responses/ServerError'
 */
router.get('/:id', authenticateJWT, getPurchaseById);

/**
 * @swagger
 * /api/purchases/{id}/restore:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Restore purchase
 *     tags: [Purchases]
 *     operationId: restorePurchase
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Purchase ID
 *     responses:
 *       201:
 *         description: Shopping list successfully created from purchase
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ShoppingList'
 *       400:
 *         $ref: '#/responses/BadRequest'
 *       401:
 *         $ref: '#/responses/Unauthorized'
 *       404:
 *         $ref: '#/responses/NotFound'
 *       500:
 *         $ref: '#/responses/ServerError'
 */
router.post('/:id/restore', authenticateJWT, restorePurchase);

export default router;
