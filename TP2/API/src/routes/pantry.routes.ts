import { Router } from "express";
import {
    getPantries,
    getPantryById,
    createPantry,
    updatePantry,
    deletePantry,
    sharePantry,
    sharedUsersPantry,
    revokeSharePantry
} from "../controllers/pantry.controller";
import { authenticateJWT } from "../middleware/authToken";

const router = Router();

/**
 * @swagger
 * /api/pantries:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Create new pantry
 *     tags: [Pantries]
 *     operationId: createPantry
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Fridge
 *               metadata:
 *                 type: object
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Pantry successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Pantry'
 *       400:
 *         $ref: '#/responses/BadRequest'
 *       401:
 *         $ref: '#/responses/Unauthorized'
 *       409:
 *         $ref: '#/responses/Conflict'
 *       500:
 *         $ref: '#/responses/ServerError'
 */
router.post("/", authenticateJWT, createPantry);

/**
 * @swagger
 * /api/pantries:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get pantries
 *     tags: [Pantries]
 *     operationId: getPantries
 *     parameters:
 *       - in: query
 *         name: owner
 *         required: false
 *         schema:
 *           type: boolean
 *           nullable: true
 *           description: 'If true, only pantries you own. If false, only pantries shared with you. If omitted, all.'
 *         description: Filter by ownership (true=me, false=others, unspecified=any)
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
 *           enum: [createdAt, updatedAt, name]
 *           default: createdAt
 *         description: Sort field
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: ASC
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of pantries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/definitions/Pantry'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total number of pantries
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
 *                   name: "Home Pantry"
 *                   metadata: {}
 *                   createdAt: "2025-01-15 10:30:00"
 *                   updatedAt: "2025-01-15 10:30:00"
 *                   owner:
 *                     id: 1
 *                     name: "John"
 *                     surname: "Doe"
 *                     email: "john@example.com"
 *                   sharedWith: []
 *               pagination:
 *                 total: 1
 *                 page: 1
 *                 per_page: 10
 *                 total_pages: 1
 *                 has_next: false
 *                 has_prev: false
 *       401:
 *         $ref: '#/responses/Unauthorized'
 *       500:
 *         $ref: '#/responses/ServerError'
 */
router.get("/", authenticateJWT, getPantries);

/**
 * @swagger
 * /api/pantries/{id}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get pantry
 *     tags: [Pantries]
 *     operationId: getPantryById
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Pantry ID
 *     responses:
 *       200:
 *         description: Pantry data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Pantry'
 *       400:
 *         $ref: '#/responses/BadRequest'
 *       401:
 *         $ref: '#/responses/Unauthorized'
 *       404:
 *         $ref: '#/responses/NotFound'
 *       500:
 *         $ref: '#/responses/ServerError'
 */
router.get("/:id", authenticateJWT, getPantryById);

/**
 * @swagger
 * /api/pantries/{id}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     summary: Update pantry
 *     tags: [Pantries]
 *     operationId: updatePantry
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
 *               name:
 *                 type: string
 *                 example: Cupboard
 *               metadata:
 *                 type: object
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Pantry successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Pantry'
 *       400:
 *         $ref: '#/responses/BadRequest'
 *       401:
 *         $ref: '#/responses/Unauthorized'
 *       403:
 *         $ref: '#/responses/Forbidden'
 *       404:
 *         $ref: '#/responses/NotFound'
 *       409:
 *         $ref: '#/responses/Conflict'
 *       500:
 *         $ref: '#/responses/ServerError'
 */
router.put("/:id", authenticateJWT, updatePantry);

/**
 * @swagger
 * /api/pantries/{id}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Delete pantry
 *     tags: [Pantries]
 *     operationId: deletePantry
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Pantry ID
 *     responses:
 *       200:
 *         description: Pantry successfully deleted
 *       400:
 *         $ref: '#/responses/BadRequest'
 *       401:
 *         $ref: '#/responses/Unauthorized'
 *       403:
 *         $ref: '#/responses/Forbidden'
 *       404:
 *         $ref: '#/responses/NotFound'
 *       500:
 *         $ref: '#/responses/ServerError'
 */
router.delete("/:id", authenticateJWT, deletePantry);

/**
 * @swagger
 * /api/pantries/{id}/share:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Share pantry
 *     tags: [Pantries]
 *     operationId: sharePantry
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
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email
 *           example:
 *             email: "janedoe@email.com"
 *     responses:
 *       200:
 *         description: Pantry successfully shared
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/GetUser'
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
router.post("/:id/share", authenticateJWT, sharePantry);

/**
 * @swagger
 * /api/pantries/{id}/shared-users:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get shared users
 *     tags: [Pantries]
 *     operationId: sharedUsersPantry
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Pantry ID
 *     responses:
 *       200:
 *         description: List of users with access to the shared pantry
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/definitions/GetUser'
 *       400:
 *         $ref: '#/responses/BadRequest'
 *       401:
 *         $ref: '#/responses/Unauthorized'
 *       404:
 *         $ref: '#/responses/NotFound'
 *       500:
 *         $ref: '#/responses/ServerError'
 */
router.get("/:id/shared-users", authenticateJWT, sharedUsersPantry);

/**
 * @swagger
 * /api/pantries/{id}/share/{user_id}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Revoke pantry access
 *     tags: [Pantries]
 *     operationId: revokeSharePantry
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Pantry ID
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User access successfullyrevoked
 *       400:
 *         $ref: '#/responses/BadRequest'
 *       401:
 *         $ref: '#/responses/Unauthorized'
 *       403:
 *         $ref: '#/responses/Forbidden'
 *       404:
 *         $ref: '#/responses/NotFound'
 *       500:
 *         $ref: '#/responses/ServerError'
 */
router.delete("/:id/share/:user_id", authenticateJWT, revokeSharePantry);

export default router;
