# Authentication Error Handling Improvements

This document outlines the improved error handling strategy implemented for the authentication system, replacing the previous hardcoded error checks with a clean, maintainable approach using custom error classes.

## Problems with Previous Implementation

The original `AuthController` had several issues:

1. **Hardcoded Error Checks**: Direct string comparisons like `if (error.message === 'Email already registered')`
2. **Repetitive Code**: Manual error handling in each controller method
3. **Tight Coupling**: Controller was tightly coupled to specific error messages
4. **Poor Maintainability**: Changes to error messages required updates in multiple places

## New Implementation Strategy

### 1. Custom Error Classes

Created specific error classes in `src/errors/auth/AuthErrors.ts`:

- `EmailAlreadyExistsError` - When registration email is already in use
- `InvalidCredentialsError` - When login credentials are invalid
- `UserNotFoundError` - When user account doesn't exist
- `InvalidRefreshTokenError` - When refresh token is invalid/expired
- `InvalidAccessTokenError` - When access token is invalid/expired
- `AccountLockedError` - When account is locked due to failed attempts
- `AccountNotVerifiedError` - When account email is not verified
- `AccountDisabledError` - When account is disabled/deactivated
- `WeakPasswordError` - When password doesn't meet requirements
- `AuthRateLimitError` - When authentication rate limit is exceeded

### 2. Service Layer Improvements

**Before:**
```typescript
if (existingUser) {
  throw new Error('Email already registered');
}
```

**After:**
```typescript
if (existingUser) {
  throw new EmailAlreadyExistsError(email);
}
```

### 3. Controller Simplification

**Before:**
```typescript
async register(req: any, res: Response, next: NextFunction): Promise<void> {
  await this.handleRequest(req, res, next, async (req, res, t) => {
    try {
      const result = await this.authService.register(req.body);
      this.sendSuccess(res, result, t.auth('registration_success'), req, 201);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Email already registered') {
          this.throwError(
            ErrorCode.VALIDATION_EMAIL_ALREADY_EXISTS, 
            t.validation('email_already_exists'), 
            req, 
            {
              userMessage: t.validation('email_already_exists'),
              action: 'CHECK_INPUT'
            }
          );
        }
      }
      throw error;
    }
  });
}
```

**After:**
```typescript
async register(req: any, res: Response, next: NextFunction): Promise<void> {
  await this.handleRequest(req, res, next, async (req, res, t) => {
    const result = await this.authService.register(req.body);
    this.sendSuccess(res, result, t.auth('registration_success'), req, 201);
  });
}
```

## Benefits

### 1. **Cleaner Code**
- Removed hardcoded error message checks
- Controllers are now focused on their primary responsibility
- Reduced boilerplate code significantly

### 2. **Better Error Context**
Each custom error includes:
- Specific error codes for easy identification
- Contextual information (e.g., email that already exists)
- User-friendly messages
- Actionable guidance (e.g., 'CHECK_INPUT', 'LOGIN_REQUIRED')

### 3. **Centralized Error Handling**
- All authentication errors inherit from base `ApplicationError` classes
- Consistent error structure across the application
- Error middleware handles all custom errors uniformly

### 4. **Improved Maintainability**
- Error logic is centralized in service layer
- Controllers remain clean and focused
- Easy to add new error types without touching controller code
- Changes to error messages only require updates in one place

### 5. **Better Developer Experience**
- Rich error information for debugging
- Type-safe error handling with TypeScript
- Clear error hierarchies and relationships

## Usage Examples

### Basic Error Creation
```typescript
// Service layer
if (existingUser) {
  throw new EmailAlreadyExistsError(email);
}
```

### Error with Additional Context
```typescript
throw new AccountLockedError(900, { userId: user.id }, { 
  userMessage: 'Account locked for 15 minutes' 
});
```

### Error Handling in Middleware
The error middleware automatically handles all custom errors:
```typescript
// Middleware automatically converts custom errors to proper HTTP responses
if (error instanceof EmailAlreadyExistsError) {
  return res.status(error.httpStatus).json({
    code: error.code,
    message: error.actionable.userMessage,
    action: error.actionable.action
  });
}
```

## Error Response Examples

### Registration with Existing Email
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_EMAIL_ALREADY_EXISTS",
    "message": "An account with this email already exists. Please use a different email or try logging in.",
    "action": "CHECK_INPUT",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Invalid Login Credentials
```json
{
  "success": false,
  "error": {
    "code": "AUTH_INVALID_CREDENTIALS", 
    "message": "Invalid email or password. Please check your credentials and try again.",
    "action": "CORRECT_INPUT",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## Testing

The improvements include comprehensive tests in `src/tests/auth/AuthErrorHandling.test.ts` covering:

- Custom error creation and properties
- Error serialization (JSON and user-safe formats)
- Error flow integration through the service layer
- Controller integration patterns

## Future Enhancements

1. **Error Tracking**: Add correlation IDs for better error tracking
2. **Rate Limiting**: Implement per-user rate limiting for auth attempts  
3. **Audit Logging**: Log authentication errors for security monitoring
4. **Localization**: Support for multilingual error messages
5. **Recovery Actions**: Automated recovery suggestions based on error type

## Migration Guide

When implementing similar improvements in other areas:

1. **Identify Error Scenarios**: List all possible error conditions
2. **Create Custom Error Classes**: Extend appropriate base error classes
3. **Update Service Layer**: Replace generic errors with custom ones
4. **Simplify Controllers**: Remove hardcoded error handling logic
5. **Test Error Flows**: Ensure all error paths work correctly
6. **Update Documentation**: Document new error codes and responses

This approach creates a more robust, maintainable, and developer-friendly error handling system that scales well as the application grows.
