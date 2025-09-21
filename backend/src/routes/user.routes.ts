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
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Profile retrieved successfully"
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                       example: "123e4567-e89b-12d3-a456-426614174000"
   *                     email:
   *                       type: string
   *                       example: "user@example.com"
   *                     name:
   *                       type: string
   *                       example: "John Doe"
   *                     role:
   *                       type: string
   *                       example: "user"
   *                     avatar:
   *                       type: string
   *                       nullable: true
   *                       example: "https://example.com/avatar.jpg"
   *                     preferences:
   *                       type: object
   *                       properties:
   *                         theme:
   *                           type: string
   *                           example: "light"
   *                         notifications:
   *                           type: boolean
   *                           example: true
   *                         language:
   *                           type: string
   *                           example: "en"
   *                         timezone:
   *                           type: string
   *                           example: "UTC"
   *                     createdAt:
   *                       type: string
   *                       format: date-time
   *                     updatedAt:
   *                       type: string
   *                       format: date-time
   *       401:
   *         description: Unauthorized - Invalid or missing token
   *       403:
   *         description: Account is not accessible (inactive user)
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
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 example: "Jane Doe"
   *               avatar:
   *                 type: string
   *                 nullable: true
   *                 example: "https://example.com/new-avatar.jpg"
   *               preferences:
   *                 type: object
   *                 properties:
   *                   theme:
   *                     type: string
   *                     enum: ["light", "dark", "auto"]
   *                     example: "dark"
   *                   notifications:
   *                     type: boolean
   *                     example: false
   *                   language:
   *                     type: string
   *                     enum: ["en", "es", "fr"]
   *                     example: "es"
   *                   timezone:
   *                     type: string
   *                     example: "America/New_York"
   *     responses:
   *       200:
   *         description: Profile updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Profile updated successfully"
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                     email:
   *                       type: string
   *                     name:
   *                       type: string
   *                     role:
   *                       type: string
   *                     avatar:
   *                       type: string
   *                       nullable: true
   *                     preferences:
   *                       type: object
   *                     createdAt:
   *                       type: string
   *                       format: date-time
   *                     updatedAt:
   *                       type: string
   *                       format: date-time
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Account is not accessible
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
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Account deleted successfully"
   *                 data:
   *                   type: object
   *                   nullable: true
   *                   example: null
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Account is not accessible
   *       409:
   *         description: Account is already deleted
   */
  router.delete('/account', userController.deleteAccount.bind(userController));

  return router;
}
