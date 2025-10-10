import { Router } from "express";
import {
    getPantryItems,
    addPantryItem,
    updatePantryItem,
    deletePantryItem
} from "../controllers/pantryItem.controller";
import { authenticateJWT } from "../middleware/authToken";

const router = Router();

/**
 * @swagger
 * /api/pantries/{id}/items:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Create new pantry item
 *     tags: [Pantry Items]
 *     operationId: addPantryItem
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Pantry ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *               quantity:
 *                 type: number
 *               unit:
 *                 type: string
 *                 description: Free text (pack, dozen, kilogram, liter, etc.)
 *               metadata:
 *                 type: object
 *                 nullable: true
 *             example:
 *               product:
 *                 id: 1
 *               quantity: 2
 *               unit: l
 *               metadata: {}
 *     responses:
 *       201:
 *         description: Pantry item successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/PantryItem'
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
router.post("/:id/items", authenticateJWT, addPantryItem);

/**
 * @swagger
 * /api/pantries/{id}/items:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get pantry items
 *     tags: [Pantry Items]
 *     operationId: getPantryItems
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Pantry ID
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
 *           enum: [name, quantity, unit, productName]
 *         description: Sort field
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Sort order
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Product name
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: integer
 *         description: Category ID
 *     responses:
 *       200:
 *         description: List of pantry items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/definitions/PantryItem'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total number of pantry items
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
 *                   metadata: {}
 *                   createdAt: "2025-01-15 10:30:00"
 *                   updatedAt: "2025-01-15 10:30:00"
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
router.get("/:id/items", authenticateJWT, getPantryItems);


/**
 * @swagger
 * /api/pantries/{id}/items/{item_id}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     summary: Update pantry item
 *     tags: [Pantry Items]
 *     operationId: updatePantryItem
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Pantry ID
 *       - in: path
 *         name: item_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Pantry Item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: number
 *               unit:
 *                 type: string
 *                 description: Free text (pack, dozen, kilogram, liter, etc.)
 *               metadata:
 *                 type: object
 *                 nullable: true
 *           example:
 *             quantity: 3
 *             unit: kg
 *             metadata: {}
 *     responses:
 *       200:
 *         description: Pantry item updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/PantryItem'
 *       400:
 *         $ref: '#/responses/BadRequest'
 *       401:
 *         $ref: '#/responses/Unauthorized'
 *       404:
 *         $ref: '#/responses/NotFound'
 *       500:
 *         $ref: '#/responses/ServerError'
 */
router.put("/:id/items/:item_id", authenticateJWT, updatePantryItem);

/**
 * @swagger
 * /api/pantries/{id}/items/{item_id}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Delete pantry item
 *     tags: [Pantry Items]
 *     operationId: deletePantryItem
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Pantry ID
 *       - in: path
 *         name: item_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Pantry Item ID
 *     responses:
 *       200:
 *         description: Pantry item successfully deleted
 *       400:
 *         $ref: '#/responses/BadRequest'
 *       401:
 *         $ref: '#/responses/Unauthorized'
 *       404:
 *         $ref: '#/responses/NotFound'
 *       500:
 *         $ref: '#/responses/ServerError'
 */
router.delete("/:id/items/:item_id", authenticateJWT, deletePantryItem);

export default router;
