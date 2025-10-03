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
   *                 users:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/User'
   *                 pagination:
   *                   type: object
   *                   properties:
   *                     total:
   *                       type: integer
   *                     pages:
   *                       type: integer
   *                     page:
   *                       type: integer
   *                     limit:
   *                       type: integer
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       403:
   *         description: Admin access required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
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
   *               $ref: '#/components/schemas/User'
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       403:
   *         description: Admin access required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       404:
   *         description: User not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
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
   *             $ref: '#/components/schemas/UpdateProfileDto'
   *     responses:
   *       200:
   *         description: User updated successfully
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
   *         description: Admin access required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       404:
   *         description: User not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
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
   *               $ref: '#/components/schemas/SuccessResponse'
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       403:
   *         description: Admin access required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       404:
   *         description: User not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       409:
   *         description: Cannot delete - User has dependencies or is already inactive
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
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
   *               $ref: '#/components/schemas/SuccessResponse'
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       403:
   *         description: Admin access required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  // router.get('/stats', adminController.getStats.bind(adminController));

  return router;
}
