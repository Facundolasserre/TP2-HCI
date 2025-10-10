import { Router } from "express";
import {
    getListItems,
    addListItem,
    updateListItem,
    toggleListItemPurchased,
    deleteListItem,
} from "../controllers/listItem.controller";
import { authenticateJWT } from "../middleware/authToken";

const router = Router();

/**
 * @swagger
 * /api/shopping-lists/{id}/items:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Create new list item
 *     tags: [Shopping List Items]
 *     operationId: addListItem
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Shopping list ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/ListItemCreate'
 *     responses:
 *       201:
 *         description: Item successfully added
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ListItem'
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
router.post("/:id/items", authenticateJWT, addListItem);

/**
 * @swagger
 * /api/shopping-lists/{id}/items:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get list items
 *     tags: [Shopping List Items]
 *     operationId: getListItems
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Shopping list ID
 *       - in: query
 *         name: purchased
 *         schema:
 *           type: boolean
 *         description: Purchased status
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
 *           enum: [updatedAt, createdAt, lastPurchasedAt, productName]
 *           default: createdAt
 *         description: Sort field
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Sort order
 *       - in: query
 *         name: pantry_id
 *         schema:
 *           type: integer
 *         description: Pantry ID
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: integer
 *         description: Category ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Product name
 *     responses:
 *       200:
 *         description: List of items in the shopping list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/definitions/ListItem'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total number of list items
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
 *                   quantity: 2
 *                   unit: "kg"
 *                   purchased: false
 *                   metadata: {}
 *                   createdAt: "2025-01-15 10:30:00"
 *                   updatedAt: "2025-01-15 10:30:00"
 *                   lastPurchasedAt: null
 *                   product:
 *                     id: 1
 *                     name: "Milk"
 *                     metadata: {}
 *                     createdAt: "2025-01-15 10:30:00"
 *                     updatedAt: "2025-01-15 10:30:00"
 *                     category:
 *                       id: 1
 *                       name: "Dairy"
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
 *       404:
 *         $ref: '#/responses/NotFound'
 *       500:
 *         $ref: '#/responses/ServerError'
 */
router.get("/:id/items", authenticateJWT, getListItems);

/**
 * @swagger
 * /api/shopping-lists/{id}/items/{item_id}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     summary: Update list item
 *     tags: [Shopping List Items]
 *     operationId: updateListItem
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Shopping list ID
 *       - in: path
 *         name: item_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/ListItemUpdate'
 *     responses:
 *       200:
 *         description: Item successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ListItem'
 *       400:
 *         $ref: '#/responses/BadRequest'
 *       401:
 *         $ref: '#/responses/Unauthorized'
 *       404:
 *         $ref: '#/responses/NotFound'
 *       500:
 *         $ref: '#/responses/ServerError'
 */
router.put("/:id/items/:item_id", authenticateJWT, updateListItem);

/**
 * @swagger
 * /api/shopping-lists/{id}/items/{item_id}:
 *   patch:
 *     security:
 *       - bearerAuth: []
 *     summary: Toggle list item purchased status
 *     tags: [Shopping List Items]
 *     operationId: toggleListItemPurchased
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Shopping list ID
 *       - in: path
 *         name: item_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               purchased:
 *                 type: boolean
 *             required: []
 *     responses:
 *       200:
 *         description: Item purchased status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ListItem'
 *       400:
 *         $ref: '#/responses/BadRequest'
 *       401:
 *         $ref: '#/responses/Unauthorized'
 *       404:
 *         $ref: '#/responses/NotFound'
 *       500:
 *         $ref: '#/responses/ServerError'
 */
router.patch("/:id/items/:item_id", authenticateJWT, toggleListItemPurchased);

/**
 * @swagger
 * /api/shopping-lists/{id}/items/{item_id}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Delete list item
 *     tags: [Shopping List Items]
 *     operationId: deleteListItem
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Shopping list ID
 *       - in: path
 *         name: item_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Item ID
 *     responses:
 *       200:
 *         description: Item successfully deleted
 *       400:
 *         $ref: '#/responses/BadRequest'
 *       401:
 *         $ref: '#/responses/Unauthorized'
 *       404:
 *         $ref: '#/responses/NotFound'
 *       500:
 *         $ref: '#/responses/ServerError'
 */
router.delete("/:id/items/:item_id", authenticateJWT, deleteListItem);

export default router;