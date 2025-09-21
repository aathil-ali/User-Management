import { Router } from 'express';
import { AuthController } from '@/controllers/AuthController';
import { ValidationMiddleware } from '@/middleware/ValidationMiddleware';
import { RegisterDto } from '@/dto/auth/RegisterDto';
import { LoginDto } from '@/dto/auth/LoginDto';
import { LogoutDto } from '@/dto/auth/LogoutDto';

export function createAuthRoutes(authController: AuthController): Router {
  const router = Router();
  
  /**
   * @swagger
   * /api/auth/test:
   *   get:
   *     summary: Test auth routes availability
   *     tags: [Authentication]
   *     responses:
   *       200:
   *         description: Auth routes are working
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Auth routes are working!"
   */
  router.get('/test', (req, res) => {
    res.json({ message: 'Auth routes are working!' });
  });

  /**
   * @swagger
   * /api/auth/register:
   *   post:
   *     summary: Register a new user
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *               - name
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 example: "user@example.com"
   *               password:
   *                 type: string
   *                 minLength: 8
   *                 example: "Password123!"
   *               name:
   *                 type: string
   *                 example: "John Doe"
   *     responses:
   *       201:
   *         description: User registered successfully
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
   *                   example: "User registered successfully"
   *                 data:
   *                   type: object
   *                   properties:
   *                     accessToken:
   *                       type: string
   *                     refreshToken:
   *                       type: string
   *                     user:
   *                       type: object
   *                       properties:
   *                         id:
   *                           type: string
   *                         email:
   *                           type: string
   *                         name:
   *                           type: string
   *                         role:
   *                           type: string
   *       400:
   *         description: Validation error
   *       409:
   *         description: Email already exists
   */
  router.post('/register', ValidationMiddleware.validateDto(RegisterDto), authController.register.bind(authController));

  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     summary: Login user
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 example: "user@example.com"
   *               password:
   *                 type: string
   *                 example: "Password123!"
   *     responses:
   *       200:
   *         description: Login successful
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
   *                   example: "Login successful"
   *                 data:
   *                   type: object
   *                   properties:
   *                     accessToken:
   *                       type: string
   *                     refreshToken:
   *                       type: string
   *                     user:
   *                       type: object
   *       401:
   *         description: Invalid credentials
   *       404:
   *         description: User not found
   */
  router.post('/login', ValidationMiddleware.validateDto(LoginDto), authController.login.bind(authController));

  /**
   * @swagger
   * /api/auth/refresh:
   *   post:
   *     summary: Refresh access token
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - refreshToken
   *             properties:
   *               refreshToken:
   *                 type: string
   *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   *     responses:
   *       200:
   *         description: Token refreshed successfully
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
   *                   example: "Token refreshed successfully"
   *                 data:
   *                   type: object
   *                   properties:
   *                     accessToken:
   *                       type: string
   *       401:
   *         description: Invalid refresh token
   */
  router.post('/refresh', authController.refreshToken.bind(authController));

  /**
   * @swagger
   * /api/auth/logout:
   *   post:
   *     summary: Logout user
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - userId
   *             properties:
   *               userId:
   *                 type: string
   *                 example: "123e4567-e89b-12d3-a456-426614174000"
   *     responses:
   *       200:
   *         description: Logout successful
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
   *                   example: "Logout successful"
   *                 data:
   *                   type: object
   *                   nullable: true
   *                   example: null
   *       401:
   *         description: Invalid user
   *       404:
   *         description: User not found
   */
  router.post('/logout', ValidationMiddleware.validateDto(LogoutDto), authController.logout.bind(authController));

  return router;
}
