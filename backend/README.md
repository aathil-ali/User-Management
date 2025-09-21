# 🔧 Backend - User Management System

A robust Node.js backend built with Express.js and TypeScript, featuring comprehensive authentication, dual-database architecture, and enterprise-grade security.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Start databases (Docker)
docker compose up -d

# Setup and seed databases
npm run db:fresh

# Start development server
npm run dev

# Run tests
npm test
```

## 🏗️ Architecture

### Project Structure

```
src/
├── 🏗️ builders/                # Response builders
│   └── ErrorBuilder.ts         # Error response builder
│
├── ⚙️ config/                   # Configuration files
│   ├── auth.ts                  # JWT and auth configuration
│   ├── database.ts              # Database connections
│   ├── database.mock.ts         # Mock database for testing
│   └── swagger.ts               # API documentation setup
│
├── 🎮 controllers/              # Route controllers
│   ├── BaseController.ts        # Base controller class
│   ├── AuthController.ts        # Authentication endpoints
│   ├── UserController.ts        # User management endpoints
│   └── AdminController.ts       # Admin-specific endpoints
│
├── 🗄️ database/                 # Database layer
│   ├── migrations/              # Database migrations
│   │   ├── MigrationRunner.ts   # PostgreSQL migration runner
│   │   ├── MongoMigrationRunner.ts # MongoDB migration runner
│   │   ├── postgres/            # PostgreSQL migrations
│   │   │   ├── 001_create_roles_table.ts
│   │   │   ├── 002_create_users_table.ts
│   │   │   └── 003_create_refresh_tokens_table.ts
│   │   └── mongo/               # MongoDB migrations
│   │       └── 001_create_user_profiles_collection.ts
│   ├── seeders/                 # Database seeders
│   │   ├── SeederRunner.ts      # PostgreSQL seeder runner
│   │   ├── MongoSeederRunner.ts # MongoDB seeder runner
│   │   ├── 001_default_roles.ts # Default roles seeder
│   │   ├── 002_admin_user.ts    # Admin user seeder
│   │   ├── 003_demo_users.ts    # Demo users seeder
│   │   └── mongo/               # MongoDB seeders
│   │       └── 001_user_profiles.ts
│   └── cli.ts                   # Database CLI tool
│
├── 📝 dto/                      # Data Transfer Objects
│   ├── auth/                    # Authentication DTOs
│   │   ├── LoginDto.ts          # Login request DTO
│   │   ├── RegisterDto.ts       # Registration request DTO
│   │   ├── LogoutDto.ts         # Logout request DTO
│   │   └── AuthResponseDto.ts   # Auth response DTO
│   ├── user/                    # User DTOs
│   │   ├── UserDto.ts           # User data DTO
│   │   ├── UserListDto.ts       # User list DTO
│   │   └── UpdateProfileDto.ts  # Profile update DTO
│   └── responses/               # Response DTOs
│       ├── SuccessResponse.ts   # Success response DTO
│       └── ErrorResponse.ts     # Error response DTO
│
├── 🏷️ entities/                 # Database entities
│   ├── User.ts                  # User entity
│   ├── UserProfile.ts           # User profile entity
│   └── AuditLog.ts              # Audit log entity
│
├── ❌ errors/                   # Custom error classes
│   ├── ApplicationError.ts      # Base application error
│   └── auth/                    # Authentication errors
│       ├── AuthErrors.ts        # Auth-specific errors
│       └── index.ts             # Error exports
│
├── 📊 formatters/               # Response formatters
│   ├── SuccessFormatter.ts      # Success response formatter
│   └── ErrorFormatter.ts        # Error response formatter
│
├── 🔌 interfaces/               # TypeScript interfaces
│   ├── IAuthService.ts          # Auth service interface
│   ├── IUserService.ts          # User service interface
│   ├── IUserAuthRepository.ts   # User auth repository interface
│   ├── IUserProfileRepository.ts # User profile repository interface
│   ├── ITranslationProvider.ts  # Translation provider interface
│   └── IRetry.ts                # Retry mechanism interface
│
├── 🛡️ middleware/               # Express middleware
│   ├── BaseMiddleware.ts        # Base middleware class
│   ├── AuthMiddleware.ts        # Authentication middleware
│   ├── RoleMiddleware.ts        # Role-based authorization
│   ├── PermissionMiddleware.ts  # Permission-based authorization
│   ├── ValidationMiddleware.ts  # Request validation
│   ├── ErrorMiddleware.ts       # Error handling
│   ├── LanguageMiddleware.ts    # Internationalization
│   └── RequestContextMiddleware.ts # Request context
│
├── 🗃️ repositories/             # Data access layer
│   ├── UserAuthRepository.ts    # User authentication data
│   └── UserProfileRepository.ts # User profile data
│
├── 🛣️ routes/                   # API routes
│   ├── auth.routes.ts           # Authentication routes
│   ├── user.routes.ts           # User management routes
│   └── admin.routes.ts          # Admin routes
│
├── 🔧 services/                 # Business logic layer
│   ├── AuthService.ts           # Authentication service
│   ├── UserService.ts           # User management service
│   ├── PermissionService.ts     # Permission management
│   ├── TranslationService.ts    # Internationalization service
│   ├── AuditService.ts          # Audit logging service
│   ├── RetryCalculator.ts       # Retry mechanism
│   └── ErrorContextSanitizer.ts # Error sanitization
│
├── 🧪 tests/                    # Test files
│   ├── auth/                    # Authentication tests
│   └── permissions/             # Permission system tests
│
├── 🌍 translations/             # Internationalization
│   ├── en.json                  # English translations
│   ├── es.json                  # Spanish translations
│   └── fr.json                  # French translations
│
├── 🏷️ types/                    # TypeScript type definitions
│   ├── error-codes.ts           # Error code definitions
│   ├── i18n.types.ts            # Internationalization types
│   └── permissions.ts           # Permission system types
│
├── 🛠️ utils/                    # Utility functions
│   ├── encryption.ts            # Encryption utilities
│   ├── logger.ts                # Logging configuration
│   └── validators.ts            # Validation utilities
│
└── app.ts                       # Application entry point
```

## 🔧 Technology Stack

### Core Technologies
- **Node.js 20+** - JavaScript runtime with latest features
- **Express.js 4.18** - Fast, unopinionated web framework
- **TypeScript 5.1** - Type safety and enhanced developer experience

### Database & ORM
- **PostgreSQL 15** - Primary relational database
  - Users, roles, authentication data
  - Refresh tokens and system data
- **MongoDB 7** - Document database
  - User profiles and preferences
  - Audit logs and dynamic content
- **pg** - PostgreSQL client for Node.js
- **mongoose** - MongoDB object modeling

### Authentication & Security
- **JWT (jsonwebtoken)** - Stateless authentication
- **bcryptjs** - Password hashing and verification
- **helmet** - Security headers middleware
- **cors** - Cross-origin resource sharing
- **express-rate-limit** - Rate limiting middleware

### Validation & Documentation
- **class-validator** - Decorator-based validation
- **class-transformer** - Object transformation
- **swagger-jsdoc** - OpenAPI/Swagger documentation
- **swagger-ui-express** - Interactive API documentation

### Logging & Monitoring
- **winston** - Structured logging
- **morgan** - HTTP request logging

### Testing
- **Jest 29.6** - Testing framework
- **supertest** - HTTP assertion library
- **cross-env** - Cross-platform environment variables

### Development Tools
- **nodemon** - Development server with hot reload
- **ts-node** - TypeScript execution for Node.js
- **eslint** - Code linting and formatting

## 🌟 Key Features

### 🔐 Authentication & Authorization
- **JWT Authentication** - Secure token-based authentication
- **Refresh Token Rotation** - Enhanced security with token rotation
- **Role-Based Access Control (RBAC)** - Hierarchical permission system
- **Permission-Based Authorization** - Granular access control
- **Account Security** - Login attempt limiting and account lockout
- **Password Security** - Strong hashing with bcrypt

### 👥 User Management
- **Complete User Lifecycle** - Registration, activation, management
- **Profile Management** - Comprehensive user profiles in MongoDB
- **Admin Operations** - User creation, modification, and deletion
- **Audit Logging** - Complete action tracking and logging
- **Bulk Operations** - Efficient batch user operations
- **Search & Filtering** - Advanced user discovery capabilities

### 🗄️ Database Architecture
- **Dual Database Strategy** - PostgreSQL for relational data, MongoDB for documents
- **Migration System** - Version-controlled database schema changes
- **Seeding System** - Automated test data generation
- **Connection Pooling** - Optimized database connections
- **Transaction Support** - ACID compliance where needed

### 🌍 Internationalization
- **Multi-language Support** - English, Spanish, French
- **Dynamic Language Detection** - Request-based language selection
- **Localized Error Messages** - User-friendly error responses
- **Translation Management** - Centralized translation system

### 📊 API Features
- **RESTful Design** - Standard HTTP methods and status codes
- **OpenAPI Documentation** - Interactive Swagger documentation
- **Request Validation** - Comprehensive input validation
- **Error Handling** - Structured error responses
- **Response Formatting** - Consistent API response structure

## 🚀 Development

### Environment Setup

```bash
# Clone the repository
git clone <repository-url>
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Start databases
docker compose up -d

# Setup databases
npm run db:fresh
```

### Environment Variables

```env
# Server Configuration
PORT=8000
NODE_ENV=development

# Database Configuration - PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=user_management
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password

# Database Configuration - MongoDB
MONGODB_URI=mongodb://admin:password@localhost:27017/user_profiles?authSource=admin

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-development
JWT_REFRESH_SECRET=your-super-secret-refresh-key-minimum-32-characters-long-development
JWT_EXPIRE=1h
JWT_REFRESH_EXPIRE=7d

# Encryption
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=info

# Internationalization
DEFAULT_LANGUAGE=en
SUPPORTED_LANGUAGES=en,es,fr

# Database Mode
USE_MOCK_DB=false
```

### Available Scripts

```bash
# Development
npm run dev              # Start development server with hot reload
npm start                # Start production server
npm run build            # Build TypeScript to JavaScript

# Database Operations
npm run db:fresh         # Fresh database setup (migrate + seed)
npm run db:reset         # Reset database (drop + fresh)
npm run db:status        # Check database status
npm run db:migrate       # Run pending migrations
npm run db:migrate:rollback # Rollback last migration
npm run db:seed          # Run seeders
npm run db:seed:rollback # Rollback seeders

# Testing
npm test                 # Run all tests
npm run test:unit        # Run unit tests only
npm run test:integration # Run integration tests only
npm run test:e2e         # Run end-to-end tests
npm run test:coverage    # Run tests with coverage
npm run test:watch       # Run tests in watch mode
npm run test:ci          # Run tests for CI/CD

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run type-check       # Run TypeScript checks
```

## 🗄️ Database Management

### Migration System

Our migration system supports both PostgreSQL and MongoDB:

```bash
# Check migration status
npm run db:status

# Run pending migrations
npm run db:migrate

# Rollback last migration
npm run db:migrate:rollback

# Create new migration
npm run migration:create -- --name create_new_table
```

### Seeding System

```bash
# Run all seeders
npm run db:seed

# Rollback seeders
npm run db:seed:rollback

# Fresh database (migrate + seed)
npm run db:fresh

# Nuclear option (drop + fresh)
npm run db:reset
```

### Database CLI

The database CLI provides comprehensive database management:

```bash
# Using npm scripts
npm run db:fresh

# Direct CLI usage
npx ts-node src/database/cli.ts db:fresh
npx ts-node src/database/cli.ts db:status
npx ts-node src/database/cli.ts migrate
npx ts-node src/database/cli.ts seed
```

### Default Data After Seeding

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **Super Admin** | `admin@usermanagement.local` | `AdminPassword123!` | Full system access |
| **Admin** | `demo.admin@usermanagement.local` | `DemoAdmin123!` | User management |
| **User** | `john.doe@example.com` | `DemoUser123!` | Basic user features |
| **User** | `jane.smith@example.com` | `DemoUser123!` | Basic user features |
| **Guest** | `guest@example.com` | `GuestUser123!` | Read-only access |

## 🧪 Testing Strategy

### Test Structure

```
tests/
├── unit/                       # Unit tests
│   ├── controllers/            # Controller tests
│   ├── services/               # Service layer tests
│   ├── repositories/           # Repository tests
│   ├── middleware/             # Middleware tests
│   └── utils/                  # Utility tests
├── integration/                # Integration tests
│   ├── api/                    # API endpoint tests
│   ├── database/               # Database integration
│   └── auth/                   # Authentication flows
├── e2e/                        # End-to-end tests
│   ├── user-flows/             # Complete user journeys
│   └── admin-flows/            # Admin workflows
├── fixtures/                   # Test data
├── helpers/                    # Test utilities
└── mocks/                      # Mock implementations
```

### Testing Commands

```bash
# Run all tests
npm test

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:e2e

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- AuthController.test.ts

# Run tests matching pattern
npm test -- --grep "authentication"
```

### Test Configuration

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/tests/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
};
```

## 📡 API Documentation

### Interactive Documentation

The API documentation is available at:
- **Development**: http://localhost:8000/api-docs
- **Production**: https://api.yourdomain.com/api-docs

### API Endpoints

#### Authentication
```
POST   /api/auth/register      # User registration
POST   /api/auth/login         # User login
POST   /api/auth/refresh       # Refresh access token
POST   /api/auth/logout        # User logout
POST   /api/auth/forgot-password # Password reset request
POST   /api/auth/reset-password   # Password reset confirmation
```

#### User Management
```
GET    /api/users              # Get user list (admin)
GET    /api/users/:id          # Get user by ID
PUT    /api/users/:id          # Update user
DELETE /api/users/:id          # Delete user (admin)
GET    /api/users/profile      # Get current user profile
PUT    /api/users/profile      # Update current user profile
```

#### Admin Operations
```
GET    /api/admin/stats        # Get system statistics
GET    /api/admin/users        # Get all users with filters
POST   /api/admin/users        # Create new user
PUT    /api/admin/users/:id    # Update user (admin)
DELETE /api/admin/users/:id    # Delete user (admin)
POST   /api/admin/users/bulk   # Bulk user operations
```

### Response Format

All API responses follow a consistent format:

```typescript
// Success Response
{
  success: true,
  data: any,
  message?: string,
  meta?: {
    pagination?: PaginationMeta,
    timestamp: string,
    requestId: string
  }
}

// Error Response
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: any
  },
  meta: {
    timestamp: string,
    requestId: string
  }
}
```

## 🔒 Security Features

### Authentication Security
- **JWT with RS256** - Asymmetric key signing
- **Refresh Token Rotation** - Enhanced security
- **Token Blacklisting** - Immediate token revocation
- **Account Lockout** - Brute force protection
- **Password Policies** - Strong password requirements

### Data Protection
- **Input Validation** - Comprehensive request validation
- **SQL Injection Prevention** - Parameterized queries
- **XSS Protection** - Content Security Policy headers
- **CSRF Protection** - SameSite cookie configuration
- **Rate Limiting** - Request throttling
- **Helmet.js** - Security headers

### Infrastructure Security
- **Environment Variables** - Secure configuration management
- **Secrets Management** - AWS Secrets Manager integration
- **Database Encryption** - Encryption at rest
- **TLS/SSL** - Encryption in transit
- **Audit Logging** - Complete action tracking

## 📦 Build & Deployment

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Docker Deployment

```bash
# Build development image
docker build -f Dockerfile.dev -t backend-dev .

# Build production image
docker build -f Dockerfile.prod -t backend-prod .

# Run container
docker run -p 8000:8000 backend-prod
```

### Environment-Specific Configurations

```bash
# Development
NODE_ENV=development npm run dev

# Staging
NODE_ENV=staging npm start

# Production
NODE_ENV=production npm start
```

## 🔧 Configuration

### Database Configuration

```typescript
// src/config/database.ts
export const databaseConfig = {
  postgres: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DB || 'user_management',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'password',
    ssl: process.env.NODE_ENV === 'production',
  },
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/user_profiles',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
};
```

### Authentication Configuration

```typescript
// src/config/auth.ts
export const authConfig = {
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    expiresIn: process.env.JWT_EXPIRE || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
  },
  bcrypt: {
    rounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },
};
```

## 🤝 Contributing

### Development Guidelines

1. **Code Style** - Follow ESLint and Prettier configurations
2. **Type Safety** - Ensure proper TypeScript typing
3. **Testing** - Write comprehensive tests for new features
4. **Documentation** - Update API documentation for changes
5. **Security** - Follow security best practices
6. **Performance** - Consider performance implications

### Pull Request Process

1. Create a feature branch from `main`
2. Make your changes with proper tests
3. Ensure all tests pass and linting is clean
4. Update documentation if needed
5. Submit a pull request with clear description

## 📚 Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [MongoDB Manual](https://docs.mongodb.com/)
- [JWT.io](https://jwt.io/)
- [Jest Documentation](https://jestjs.io/docs/)

---

**Built with ❤️ using modern Node.js ecosystem**