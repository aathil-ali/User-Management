import { Router } from 'express';
import { AdminController } from '@/controllers/AdminController';
import { AuthMiddleware } from '@/middleware/AuthMiddleware';
import { RoleMiddleware } from '@/middleware/RoleMiddleware';

export function createAdminRoutes(adminController: AdminController): Router {
  const router = Router();

  // All admin routes require authentication and admin role
  router.use(AuthMiddleware.authenticate);
  router.use(RoleMiddleware.requireAdmin);

  /**
   * @swagger
   * /api/admin/users:
   *   get:
   *     summary: Get all users with pagination (admin only)
   *     tags: [Admin]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *         description: Page number for pagination
   *         example: 1
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 10
   *         description: Number of users per page
   *         example: 20
   *       - in: query
   *         name: role
   *         schema:
   *           type: string
   *           enum: ["admin", "user"]
   *         description: Filter by user role
   *         example: "user"
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: ["active", "inactive"]
   *         description: Filter by account status
   *         example: "active"
   *     responses:
   *       200:
   *         description: Users retrieved successfully
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
   *                   example: "Users retrieved successfully"
   *                 data:
   *                   type: object
   *                   properties:
   *                     users:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: string
   *                             example: "123e4567-e89b-12d3-a456-426614174000"
   *                           email:
   *                             type: string
   *                             example: "user@example.com"
   *                           name:
   *                             type: string
   *                             example: "John Doe"
   *                           role:
   *                             type: string
   *                             example: "user"
   *                           isActive:
   *                             type: boolean
   *                             example: true
   *                           avatar:
   *                             type: string
   *                             nullable: true
   *                           createdAt:
   *                             type: string
   *                             format: date-time
   *                           updatedAt:
   *                             type: string
   *                             format: date-time
   *                     pagination:
   *                       type: object
   *                       properties:
   *                         total:
   *                           type: integer
   *                           example: 150
   *                         pages:
   *                           type: integer
   *                           example: 8
   *                         page:
   *                           type: integer
   *                           example: 1
   *                         limit:
   *                           type: integer
   *                           example: 20
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Admin access required
   */
  router.get('/users', adminController.getAllUsers.bind(adminController));

  /**
   * @swagger
   * /api/admin/users/{id}:
   *   get:
   *     summary: Get specific user with full details (admin only)
   *     tags: [Admin]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: User ID (UUID)
   *         example: "123e4567-e89b-12d3-a456-426614174000"
   *     responses:
   *       200:
   *         description: User retrieved successfully
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
   *                   example: "User retrieved successfully"
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
   *                     isActive:
   *                       type: boolean
   *                       example: true
   *                     avatar:
   *                       type: string
   *                       nullable: true
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
   *         description: Unauthorized
   *       403:
   *         description: Admin access required
   *       404:
   *         description: User not found
   */
  router.get('/users/:id', adminController.getUserById.bind(adminController));

  /**
   * @swagger
   * /api/admin/users/{id}:
   *   put:
   *     summary: Update user (admin can modify role and status)
   *     tags: [Admin]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: User ID (UUID)
   *         example: "123e4567-e89b-12d3-a456-426614174000"
   *     requestBody:
   *       required: false
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 example: "Jane Smith"
   *               role:
   *                 type: string
   *                 enum: ["admin", "user"]
   *                 example: "admin"
   *               isActive:
   *                 type: boolean
   *                 example: false
   *               avatar:
   *                 type: string
   *                 nullable: true
   *                 example: "https://example.com/avatar.jpg"
   *               preferences:
   *                 type: object
   *                 properties:
   *                   theme:
   *                     type: string
   *                     enum: ["light", "dark", "auto"]
   *                   notifications:
   *                     type: boolean
   *                   language:
   *                     type: string
   *                     enum: ["en", "es", "fr"]
   *                   timezone:
   *                     type: string
   *     responses:
   *       200:
   *         description: User updated successfully
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
   *                   example: "User updated successfully"
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
   *                     isActive:
   *                       type: boolean
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
   *         description: Admin access required
   *       404:
   *         description: User not found
   */
  // router.put('/users/:id', adminController.updateUser.bind(adminController));

  /**
   * @swagger
   * /api/admin/users/{id}:
   *   delete:
   *     summary: Delete user account (admin - soft delete)
   *     tags: [Admin]
   *     security:
   *       - bearerAuth: []
   *     description: Allows admin to delete any user account using soft delete (preserving data for audit purposes)
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: User ID (UUID) to delete
   *         example: "123e4567-e89b-12d3-a456-426614174000"
   *       - in: query
   *         name: hard
   *         required: false
   *         schema:
   *           type: boolean
   *           default: false
   *         description: Set to true for hard delete (permanently removes data)
   *         example: false
   *     responses:
   *       200:
   *         description: User deleted successfully
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
   *                   example: "User deleted successfully"
   *                 data:
   *                   type: object
   *                   nullable: true
   *                   example: null
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Admin access required
   *       404:
   *         description: User not found
   *       409:
   *         description: Cannot delete - User has dependencies or is already inactive
   */
  // router.delete('/users/:id', adminController.deleteUser.bind(adminController));

  /**
   * @swagger
   * /api/admin/stats:
   *   get:
   *     summary: Get system statistics (admin only)
   *     tags: [Admin]
   *     security:
   *       - bearerAuth: []
   *     description: Retrieve system-wide statistics including user counts, activity metrics, etc.
   *     responses:
   *       200:
   *         description: Statistics retrieved successfully
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
   *                   example: "Statistics retrieved successfully"
   *                 data:
   *                   type: object
   *                   properties:
   *                     users:
   *                       type: object
   *                       properties:
   *                         total:
   *                           type: integer
   *                           example: 1250
   *                         active:
   *                           type: integer
   *                           example: 1180
   *                         inactive:
   *                           type: integer
   *                           example: 70
   *                         admins:
   *                           type: integer
   *                           example: 5
   *                         newThisMonth:
   *                           type: integer
   *                           example: 45
   *                     activity:
   *                       type: object
   *                       properties:
   *                         loginsToday:
   *                           type: integer
   *                           example: 320
   *                         loginsThisWeek:
   *                           type: integer
   *                           example: 1850
   *                         registrationsToday:
   *                           type: integer
   *                           example: 8
   *                         registrationsThisWeek:
   *                           type: integer
   *                           example: 32
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Admin access required
   */
  // router.get('/stats', adminController.getStats.bind(adminController));

  return router;
}
