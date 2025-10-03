import { Router } from 'express';
import { UserController } from '@/controllers/UserController';
import { AuthMiddleware } from '@/middleware/AuthMiddleware';
import { ValidationMiddleware } from '@/middleware/ValidationMiddleware';
import { UpdateProfileDto } from '@/dto/user/UpdateProfileDto';

export function createUserRoutes(userController: UserController): Router {
  const router = Router();

  // All user routes require authentication
  router.use(AuthMiddleware.authenticate);

  /**
   * @swagger
   * /api/users/profile:
   *   get:
   *     summary: Get current user profile
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Profile retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       401:
   *         description: Unauthorized - Invalid or missing token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       403:
   *         description: Account is not accessible (inactive user)
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.get('/profile', userController.getProfile.bind(userController));

  /**
   * @swagger
   * /api/users/profile:
   *   put:
   *     summary: Update user profile
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: false
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateProfileDto'
   *     responses:
   *       200:
   *         description: Profile updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       400:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       403:
   *         description: Account is not accessible
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.put('/profile',
    ValidationMiddleware.validateDto(UpdateProfileDto),
    userController.updateProfile.bind(userController)
  );

  /**
   * @swagger
   * /api/users/account:
   *   delete:
   *     summary: Delete user account (soft delete)
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     description: Permanently deletes the user account using soft delete (account becomes inactive but data is preserved for audit purposes)
   *     responses:
   *       200:
   *         description: Account deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/SuccessResponse'
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       403:
   *         description: Account is not accessible
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       409:
   *         description: Account is already deleted
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.delete('/account', userController.deleteAccount.bind(userController));

  return router;
}
