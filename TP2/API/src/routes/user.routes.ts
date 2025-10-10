import { Router } from 'express';
import {
    getUser,
    loginUser,
    logoutUser,
    sendVerificationCode,
    registerUser,
    resetPassword,
    verifyUser,
    changePassword,
    updateUserProfile, sendPasswordRecoveryCode
} from '../controllers/user.controller';
import {authenticateJWT} from "../middleware/authToken";

const router = Router();

/**
 * @swagger
 * /api/users/register:
 *  post:
 *      security: []
 *      summary: Create new user
 *      tags: [Users]
 *      operationId: registerUser
 *      produces:
 *         - application/json
 *      requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/RegistrationData'
 *      responses:
 *          201:
 *              description: User successfully created
 *              content:
 *                application/json:
 *                  schema:
 *                    $ref: '#/definitions/NewUser'
 *          400:
 *              $ref: '#/responses/BadRequest'
 *          500:
 *              $ref: '#/responses/ServerError'
 */
router.post('/register', registerUser);

/**
 * @swagger
 * /api/users/login:
 *  post:
 *      security: []
 *      summary: Log user in
 *      tags: [Users]
 *      operationId: loginUser
 *      produces:
 *         - application/json
 *      requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Credentials'
 *      responses:
 *          200:
 *              description: User successfully logged in
 *              content:
 *                application/json:
 *                  schema:
 *                    $ref: '#/definitions/AuthenticationToken'
 *          400:
 *              $ref: '#/responses/BadRequest'
 *          401:
 *              $ref: '#/responses/Unauthorized'
 *          500:
 *              $ref: '#/responses/ServerError'
 */
router.post('/login', loginUser);

/**
 * @swagger
 * /api/users/profile:
 *  get:
 *      security:
 *        - bearerAuth: []
 *      summary: Get user
 *      tags: [Users]
 *      operationId: getUser
 *      produces:
 *         - application/json
 *      responses:
 *          200:
 *              description: Logged user data
 *              content:
 *                application/json:
 *                  schema:
 *                    $ref: '#/definitions/GetUser'
 *          401:
 *              $ref: '#/responses/Unauthorized'
 *          404:
 *              $ref: '#/responses/NotFound'
 *          500:
 *              $ref: '#/responses/ServerError'
 */
router.get('/profile', authenticateJWT, getUser);

/**
 * @swagger
 * /api/users/profile:
 *  put:
 *      security:
 *        - bearerAuth: []
 *      summary: Update user
 *      tags: [Users]
 *      operationId: updateUserProfile
 *      produces:
 *         - application/json
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/UpdateUserProfile'
 *      responses:
 *          200:
 *              description: User profile successfully updated
 *              content:
 *                application/json:
 *                  schema:
 *                    $ref: '#/definitions/GetUser'
 *          400:
 *              $ref: '#/responses/BadRequest'
 *          401:
 *              $ref: '#/responses/Unauthorized'
 *          404:
 *              $ref: '#/responses/NotFound'
 *          500:
 *              $ref: '#/responses/ServerError'
 */
router.put('/profile', authenticateJWT, updateUserProfile);

/**
 * @swagger
 * /api/users/verify-account:
 *  post:
 *      security: []
 *      summary: Verify user
 *      tags: [Users]
 *      operationId: verifyUser
 *      produces:
 *         - application/json
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/VerificationCode'
 *      responses:
 *          200:
 *              description: User successfully verified
 *              content:
 *                application/json:
 *                  schema:
 *                    $ref: '#/definitions/NewUser'
 *          400:
 *              $ref: '#/responses/BadRequest'
 *          409:
 *              $ref: '#/responses/Conflict'
 *          500:
 *              $ref: '#/responses/ServerError'
 */
router.post('/verify-account', verifyUser);

/**
 * @swagger
 * /api/users/forgot-password:
 *  post:
 *      security: []
 *      summary: Send password recovery code
 *      tags: [Users]
 *      operationId: sendPasswordRecoveryCode
 *      produces:
 *         - application/json
 *      parameters:
 *        - in: query
 *          name: email
 *          required: true
 *          schema:
 *            type: string
 *          description: User email
 *      responses:
 *          200:
 *              description: Recovery instructions successfully sent 
 *          400:
 *              $ref: '#/responses/BadRequest'
 *          404:
 *              $ref: '#/responses/NotFound'
 *          500:
 *              $ref: '#/responses/ServerError'
 */
router.post('/forgot-password', sendPasswordRecoveryCode);


/**
 * @swagger
 * /api/users/reset-password:
 *  post:
 *      security: []
 *      summary: Reset password
 *      tags: [Users]
 *      operationId: resetPassword
 *      produces:
 *         - application/json
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/PasswordReset'
 *      responses:
 *          200:
 *              description: User password successfully reseted
 *          400:
 *              $ref: '#/responses/BadRequest'
 *          404:
 *              $ref: '#/responses/NotFound'
 *          500:
 *              $ref: '#/responses/ServerError'
 */
router.post('/reset-password', resetPassword);

/**
 * @swagger
 * /api/users/send-verification:
 *  post:
 *      security: []
 *      summary: Send verification code
 *      tags: [Users]
 *      operationId: sendVerificationCode
 *      produces:
 *         - application/json
 *      parameters:
 *        - in: query
 *          name: email
 *          required: true
 *          schema:
 *            type: string
 *          description: User email
 *      responses:
 *          200:
 *              description: Verification code successfully sent
 *              content:
 *                application/json:
 *                  schema:
 *                    type: object
 *                    properties:
 *                      code:
 *                        type: string
 *                    example:
 *                      code: "a50c9cad6073f6f2"
 *          400:
 *              $ref: '#/responses/BadRequest'
 *          404:
 *              $ref: '#/responses/NotFound'
 *          409:
 *              $ref: '#/responses/Conflict'
 *          500:
 *              $ref: '#/responses/ServerError'
 */
router.post('/send-verification', sendVerificationCode);

/**
 * @swagger
 * /api/users/change-password:
 *  post:
 *      security:
 *        - bearerAuth: []
 *      summary: Change password
 *      tags: [Users]
 *      operationId: changePassword
 *      produces:
 *         - application/json
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/PasswordChange'
 *      responses:
 *          200:
 *              description: User password successfully changed
 *          400:
 *              $ref: '#/responses/BadRequest'
 *          401:
 *              $ref: '#/responses/Unauthorized'
 *          500:
 *              $ref: '#/responses/ServerError'
 */
router.post('/change-password', authenticateJWT, changePassword);

/**
 * @swagger
 * /api/users/logout:
 *  post:
 *      security:
 *        - bearerAuth: []   # Usualmente, se asegura con el token JWT
 *      summary: Log user out
 *      tags: [Users]
 *      operationId: logoutUser
 *      produces:
 *        - application/json
 *      requestBody:
 *        description: Optional payload (can be empty or omitted for logout)
 *        required: false
 *      responses:
 *        200:
 *          description: User successfully logged out
 *        401:
 *          $ref: '#/responses/Unauthorized'
 *        500:
 *          $ref: '#/responses/ServerError'
 */
router.post('/logout', authenticateJWT, logoutUser);

export default router;