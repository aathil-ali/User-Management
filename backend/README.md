# User Management Backend

Enterprise-level Node.js backend with TypeScript, implementing Clean Architecture patterns.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- MongoDB 6+

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Database Setup**
   ```bash
   # Run PostgreSQL migrations
   npm run migrate
   ```

4. **Development Server**
   ```bash
   npm run dev
   ```

## 📦 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## 🏗️ Architecture

### Clean Architecture Layers
- **Controllers** - HTTP request/response handling
- **Services** - Business logic implementation
- **Repositories** - Data access layer
- **Entities** - Domain models
- **DTOs** - Data transfer objects

### Design Patterns
- Repository Pattern
- Service Layer Pattern
- DTO Pattern
- Dependency Injection
- Factory Pattern

## 🔧 Configuration

### Environment Variables
See `.env.example` for all available configuration options.

### Database Configuration
- **PostgreSQL**: User authentication and audit logs
- **MongoDB**: User profiles and preferences

## 📚 API Documentation

Once the server is running:
- Swagger UI: http://localhost:8000/api-docs
- Health Check: http://localhost:8000/health

## 🧪 Testing

The project includes comprehensive testing:
- Unit tests for services and utilities
- Integration tests for API endpoints
- Test coverage reporting

```bash
npm test
npm run test:coverage
```

## 📈 Monitoring & Logging

- Winston logger with configurable levels
- Request/response logging with Morgan
- Health check endpoint
- Error tracking and audit trails

## 🔒 Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting
- CORS configuration
- Helmet security headers
- Input validation and sanitization

---

**Note**: This is the backend service for the User Management System. The implementation skeleton is complete and ready for feature development.
