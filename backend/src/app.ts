import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';

import { DatabaseConfig } from '@/config/database';
import { swaggerSpec } from '@/config/swagger';
import { ErrorMiddleware } from '@/middleware/ErrorMiddleware';
import { LanguageMiddleware } from '@/middleware/LanguageMiddleware';
import { RequestContextMiddleware, RequestLoggingMiddleware } from '@/middleware/RequestContextMiddleware';
import { AuthMiddleware } from '@/middleware/AuthMiddleware';
import { logger } from '@/utils/logger';
import { t } from '@/services/TranslationService';

// Import repositories
import { UserAuthRepository } from '@/repositories/UserAuthRepository';
import { UserProfileRepository } from '@/repositories/UserProfileRepository';

// Import services
import { AuthService } from '@/services/AuthService';
import { UserService } from '@/services/UserService';
import { AuditService } from '@/services/AuditService';

// Import controllers
import { AuthController } from '@/controllers/AuthController';
import { UserController } from '@/controllers/UserController';
import { AdminController } from '@/controllers/AdminController';

// Import routes
import { createAuthRoutes } from '@/routes/auth.routes';
import { createUserRoutes } from '@/routes/user.routes';
import { createAdminRoutes } from '@/routes/admin.routes';

// Load environment variables
dotenv.config();

class App {
  private app: express.Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '8000');
    this.initializeGlobalErrorHandlers();
    this.initializeMiddlewares();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet());
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')
    });
    this.app.use(limiter);

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Request context middleware (first, to add correlation IDs)
    this.app.use(RequestContextMiddleware.create());

    // Language detection middleware (before other middlewares that need translations)
    this.app.use(LanguageMiddleware.detectLanguage);

    // Request logging middleware (after context and language setup)
    this.app.use(RequestLoggingMiddleware.logRequests());

    // Logging middleware
    this.app.use(morgan('combined', {
      stream: { write: (message) => logger.info(message.trim()) }
    }));

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV 
      });
    });



    // API documentation
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }

  public async initializeRoutes(): Promise<void> {
    try {
      console.log('🔧 Connecting to real databases (PostgreSQL + MongoDB)');
      
      // Test database connections first
      console.log('Testing PostgreSQL connection...');
      const postgresPool = DatabaseConfig.getPostgresPool();
      await postgresPool.query('SELECT 1');
      console.log('✅ PostgreSQL connected successfully');
      
      console.log('Testing MongoDB connection...');
      const mongoClient = await DatabaseConfig.getMongoClient();
      await mongoClient.db().admin().ping();
      console.log('✅ MongoDB connected successfully');

      // Initialize repositories
      const userAuthRepository = new UserAuthRepository(postgresPool);
      const userProfileRepository = new UserProfileRepository(mongoClient);

      // Initialize services
      const authService = new AuthService(userAuthRepository, userProfileRepository);
      const userService = new UserService(userAuthRepository, userProfileRepository);
      const auditService = new AuditService(postgresPool);

      // Initialize controllers
      const authController = new AuthController(authService);
      const userController = new UserController(userService);
      const adminController = new AdminController(userService);

      // Setup routes
      this.app.use('/api/auth', createAuthRoutes(authController));
      this.app.use('/api/users', createUserRoutes(userController));
      this.app.use('/api/admin', createAdminRoutes(adminController));

      console.log('✅ Routes initialized successfully with real database connections');
      logger.info('Routes initialized successfully');
    } catch (error) {
      console.error('❌ Route initialization failed:', error);
      logger.error('Route initialization failed', error);
      
      // Instead of throwing, create fallback routes
      console.log('🔄 Creating fallback routes...');
      this.app.get('/api/auth/test', (req, res) => {
        res.json({ 
          message: 'Routes failed to initialize properly - using fallback', 
          error: (error as Error).message,
          timestamp: new Date().toISOString()
        });
      });
      
      this.app.post('/api/auth/*', (req, res) => {
        res.status(503).json({
          success: false,
          message: 'Service temporarily unavailable - database connection issues',
          error: (error as Error).message,
          timestamp: new Date().toISOString()
        });
      });
    }
  }

  private initializeGlobalErrorHandlers(): void {
    // Initialize global process error handlers
    ErrorMiddleware.initializeGlobalHandlers();
  }

  public initializeErrorHandling(): void {
    // 404 handler
    this.app.use(ErrorMiddleware.notFound);
    
    // Global error handler (must be last)
    this.app.use(ErrorMiddleware.handle);
  }

  public listen(): void {
    this.app.listen(this.port, () => {
      logger.info(`🚀 ${t.server('server_starting', { port: this.port })}`);
      logger.info(`📚 API Documentation: http://localhost:${this.port}/api-docs`);
      logger.info(`🏥 Health Check: http://localhost:${this.port}/health`);
    });
  }

  public getApp(): express.Application {
    return this.app;
  }

  public async waitForInitialization(): Promise<void> {
    // This can be used to wait for async route initialization if needed
    return Promise.resolve();
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  (async () => {
    const app = new App();
    // Initialize routes first, then set up error handling
    await app.initializeRoutes();
    app.initializeErrorHandling();
    app.listen();
  })().catch(console.error);

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.info(`SIGTERM received: ${t.server('graceful_shutdown')}`);
    await DatabaseConfig.closeConnections();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.info(`SIGINT received: ${t.server('graceful_shutdown')}`);
    await DatabaseConfig.closeConnections();
    process.exit(0);
  });
}

export default App;
