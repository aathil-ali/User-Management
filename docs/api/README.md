# API Documentation

## Overview

The User Management System provides a RESTful API for managing users, authentication, and authorization.

**Base URL**: `http://localhost:8000/api` (development)

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### Get Authentication Token

**POST** `/auth/login`

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "user"
    },
    "accessToken": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  }
}
```

## Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Refresh access token
- `POST /auth/register` - User registration

### Users
- `GET /users` - List all users (Admin only)
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user (Admin only)
- `PUT /users/:id` - Update user (Admin or own profile)
- `DELETE /users/:id` - Delete user (Admin only)

### Profile
- `GET /profile` - Get current user profile
- `PUT /profile` - Update current user profile
- `POST /profile/avatar` - Upload profile avatar

### Admin
- `GET /admin/dashboard` - Admin dashboard data
- `GET /admin/users` - Advanced user management
- `POST /admin/users/bulk` - Bulk user operations

## Interactive Documentation

When running the application locally, visit:
**http://localhost:8000/api-docs**

This provides a full Swagger/OpenAPI interface for testing all endpoints.

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  }
}
```

Common error codes:
- `UNAUTHORIZED` - Invalid or missing authentication
- `FORBIDDEN` - Insufficient permissions
- `VALIDATION_ERROR` - Invalid input data
- `NOT_FOUND` - Resource not found
- `RATE_LIMITED` - Too many requests
