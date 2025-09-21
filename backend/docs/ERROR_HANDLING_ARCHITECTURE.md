# Error Handling Architecture

## 🏗️ **Layered Error Handling Strategy**

This application uses a **layered error handling** approach where each layer has specific responsibilities:

```
HTTP Request → Controller → Service → Repository/External APIs
     ↓             ↓          ↓           ↓
Error Middleware ← No try/catch ← Custom Errors ← Database/Network Errors
```

## **🎯 Layer Responsibilities**

### **1. Controllers (No try/catch)**

**Controllers should NOT have try/catch blocks** because:

- ✅ `BaseController.handleRequest()` provides automatic error handling
- ✅ Errors bubble up to centralized error middleware  
- ✅ Focus on HTTP concerns (request/response)
- ✅ Clean, readable code

```typescript
// ✅ GOOD - Clean controller without try/catch
export class AuthController extends BaseController {
  async register(req: any, res: Response, next: NextFunction): Promise<void> {
    await this.handleRequest(req, res, next, async (req, res, t) => {
      const result = await this.authService.register(req.body);
      this.sendSuccess(res, result, t.auth('registration_success'), req, 201);
    });
  }
}

// ❌ BAD - Unnecessary try/catch in controller  
export class AuthController extends BaseController {
  async register(req: any, res: Response, next: NextFunction): Promise<void> {
    try { // ❌ Unnecessary - handleRequest already does this
      await this.handleRequest(req, res, next, async (req, res, t) => {
        const result = await this.authService.register(req.body);
        this.sendSuccess(res, result, t.auth('registration_success'), req, 201);
      });
    } catch (error) {
      next(error); // ❌ Redundant
    }
  }
}
```

### **2. Services (Minimal try/catch)**

**Services should NOT have try/catch unless**:
- 🔄 **Converting errors** from external libraries
- 🏷️ **Adding context** to generic errors
- 🔁 **Implementing retry logic**
- 📦 **Wrapping third-party APIs**

```typescript
// ✅ GOOD - Let errors bubble up naturally
async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
  const existingUser = await this.userAuthRepository.findByEmail(email);
  if (existingUser) {
    throw new EmailAlreadyExistsError(email); // ✅ Throws custom error
  }
  
  const passwordHash = await EncryptionUtils.hashPassword(password);
  const newUser = await this.userAuthRepository.create(userData);
  // ... rest of logic
}

// ✅ GOOD - Converting external library errors  
async sendEmail(email: string, template: string): Promise<void> {
  try {
    await externalEmailService.send(email, template);
  } catch (error) {
    // Convert external error to our custom error
    throw new ExternalServiceError(ErrorCode.EXT_EMAIL_SERVICE_FAILED, error.message);
  }
}

// ❌ BAD - Masking specific errors
async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
  try {
    const payload = EncryptionUtils.verifyRefreshToken(refreshToken);
    // ... logic
    return { accessToken };
  } catch (error) {
    // ❌ BAD: This masks the real error! 
    // What if it's a database error? Network error? Token format error?
    throw new InvalidRefreshTokenError();
  }
}
```

### **3. Error Middleware (Central handling)**

**Centralized error middleware** handles all errors:
- 🎯 **Catches all unhandled errors**
- 🔍 **Identifies error types** (Custom vs Generic)
- 🌍 **Applies translations** and formatting
- 📝 **Logs errors** with proper context
- 📤 **Sends standardized responses**

## **🔧 Fixed Issues**

### **Problem: AuthService refreshToken() method**

**Before (❌ Problematic)**:
```typescript
async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
  try {
    const payload = EncryptionUtils.verifyRefreshToken(refreshToken);
    const user = await this.userAuthRepository.findById(payload.id);
    // ... logic
    return { accessToken };
  } catch (error) {
    // ❌ BAD: This masks ALL errors as InvalidRefreshTokenError
    // Database errors, network errors, etc. all become "invalid token"
    throw new InvalidRefreshTokenError();
  }
}
```

**After (✅ Fixed)**:
```typescript
async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
  // 1. Verify and decode refresh token
  // If verification fails, EncryptionUtils will throw an appropriate error
  const payload = EncryptionUtils.verifyRefreshToken(refreshToken);
  
  // 2. Find user to ensure they still exist and are active
  const user = await this.userAuthRepository.findById(payload.id);
  if (!user || user.status !== 'active') {
    throw new InvalidRefreshTokenError(); // ✅ Only throw when specifically invalid
  }

  // 3. Generate new access token
  const accessToken = EncryptionUtils.generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role
  });

  return { accessToken };
}
```

### **Benefits of the Fix**:

1. **🎯 Specific Error Handling**: Each error type is handled appropriately
   - JWT verification errors → JWT-related error codes
   - Database errors → Database error codes  
   - User not found → User-related error codes

2. **🔍 Better Debugging**: Developers can see the real cause of failures

3. **📊 Proper Monitoring**: Different error types can be tracked separately

4. **🚀 Better UX**: Users get more accurate error messages

## **⚡ Error Flow Examples**

### **Successful Flow**
```
1. Controller calls service method
2. Service performs business logic
3. Service returns result
4. Controller sends success response
```

### **Error Flow - Custom Error**
```
1. Controller calls service method
2. Service detects business rule violation
3. Service throws CustomError (EmailAlreadyExistsError)
4. BaseController.handleRequest() catches error
5. Error bubbles up to error middleware
6. Error middleware recognizes CustomError
7. Error middleware sends proper HTTP response with translations
```

### **Error Flow - Unexpected Error**
```
1. Controller calls service method  
2. Service calls repository method
3. Database connection fails (unexpected)
4. Database error bubbles up through service
5. BaseController.handleRequest() catches error
6. Error bubbles up to error middleware
7. Error middleware logs the error and sends generic 500 response
```

## **✅ Best Practices**

### **Controllers**
- ✅ Use `BaseController.handleRequest()` wrapper
- ✅ Focus on HTTP concerns only
- ❌ Never add try/catch blocks
- ❌ Never handle business logic errors

### **Services**  
- ✅ Throw specific custom errors for business rules
- ✅ Let database/network errors bubble up naturally
- ✅ Add context to errors when helpful
- ❌ Don't catch errors just to re-throw generic ones
- ❌ Don't mask the root cause of errors

### **Repositories**
- ✅ Let database errors bubble up
- ✅ Throw NotFoundError for missing records
- ❌ Don't catch database connection errors
- ❌ Don't convert all errors to generic ones

### **Error Middleware**
- ✅ Handle all error types (custom and generic)
- ✅ Apply proper HTTP status codes
- ✅ Use translation service for user messages
- ✅ Log errors with full context
- ✅ Send consistent response format

## **🧪 Testing Error Scenarios**

```typescript
describe('AuthService Error Handling', () => {
  it('should throw EmailAlreadyExistsError for duplicate email', async () => {
    // Setup: Mock repository to return existing user
    mockUserRepository.findByEmail.mockResolvedValue(existingUser);
    
    // Test: Should throw specific error
    await expect(
      authService.register({ email: 'test@example.com', password: 'pass123' })
    ).rejects.toThrow(EmailAlreadyExistsError);
  });

  it('should let database errors bubble up', async () => {
    // Setup: Mock repository to throw database error
    const dbError = new Error('Connection timeout');
    mockUserRepository.findByEmail.mockRejectedValue(dbError);
    
    // Test: Should NOT catch and re-throw as InvalidRefreshTokenError
    await expect(
      authService.register({ email: 'test@example.com', password: 'pass123' })
    ).rejects.toThrow('Connection timeout'); // ✅ Original error preserved
  });
});
```

## **🚨 Common Anti-Patterns to Avoid**

### **❌ Controller try/catch**
```typescript
// ❌ DON'T DO THIS
async register(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await this.authService.register(req.body);
    res.json(result);
  } catch (error) {
    next(error); // Redundant - handleRequest already does this
  }
}
```

### **❌ Service error masking**
```typescript
// ❌ DON'T DO THIS  
async someMethod() {
  try {
    await this.repository.save(data);
  } catch (error) {
    throw new GenericError(); // ❌ Lost the original error!
  }
}
```

### **❌ Generic error catching**
```typescript
// ❌ DON'T DO THIS
async processPayment() {
  try {
    await paymentGateway.charge(amount);
  } catch (error) {
    throw new Error('Payment failed'); // ❌ What kind of failure? Why?
  }
}
```

## **✅ Conclusion**

The current architecture provides:
- 🎯 **Clean separation of concerns**
- 🔍 **Specific error identification**  
- 🌍 **Centralized error handling**
- 📊 **Proper error monitoring**
- 🚀 **Better user experience**

**Remember**: Let errors bubble up naturally and only catch them when you need to **transform** or **add context**, never to **mask** the original error!
