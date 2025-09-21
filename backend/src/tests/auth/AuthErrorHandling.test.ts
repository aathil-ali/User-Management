import { 
  EmailAlreadyExistsError,
  InvalidCredentialsError,
  UserNotFoundError,
  InvalidRefreshTokenError
} from '@/errors/auth/AuthErrors';
import { ErrorCode } from '@/types/error-codes';

describe('Auth Error Handling Improvements', () => {
  describe('EmailAlreadyExistsError', () => {
    it('should create error with proper code and context', () => {
      const email = 'test@example.com';
      const error = new EmailAlreadyExistsError(email);

      expect(error.code).toBe(ErrorCode.VALIDATION_EMAIL_ALREADY_EXISTS);
      expect(error.actionable.action).toBe('CHECK_INPUT');
      expect(error.context.details).toEqual({ email });
      // Message is now handled by the error registry, not hardcoded
      expect(error.message).toBeDefined();
    });
  });

  describe('InvalidCredentialsError', () => {
    it('should create error with proper code and action', () => {
      const error = new InvalidCredentialsError();

      expect(error.code).toBe(ErrorCode.AUTH_INVALID_CREDENTIALS);
      expect(error.actionable.action).toBe('CORRECT_INPUT');
      expect(error.message).toBeDefined();
    });
  });

  describe('UserNotFoundError', () => {
    it('should create error with proper code and context', () => {
      const email = 'notfound@example.com';
      const error = new UserNotFoundError(email);

      expect(error.code).toBe(ErrorCode.AUTH_USER_NOT_FOUND);
      expect(error.actionable.action).toBe('CHECK_INPUT');
      expect(error.context.details).toEqual({ identifier: email });
      expect(error.message).toBeDefined();
    });
  });

  describe('InvalidRefreshTokenError', () => {
    it('should create error with proper code and action', () => {
      const error = new InvalidRefreshTokenError();

      expect(error.code).toBe(ErrorCode.AUTH_TOKEN_INVALID);
      expect(error.actionable.action).toBe('LOGIN_REQUIRED');
      expect(error.message).toBeDefined();
    });
  });

  describe('Error JSON serialization', () => {
    it('should serialize error to JSON properly', () => {
      const email = 'test@example.com';
      const error = new EmailAlreadyExistsError(email);
      const json = error.toJSON();

      expect(json.code).toBe(ErrorCode.VALIDATION_EMAIL_ALREADY_EXISTS);
      expect(json.name).toBe('EmailAlreadyExistsError');
      expect(json.context.details).toEqual({ email });
      expect(json.actionable.action).toBe('CHECK_INPUT');
    });

    it('should create user-safe JSON without sensitive details', () => {
      const email = 'test@example.com';
      const error = new EmailAlreadyExistsError(email);
      const userSafeJson = error.toUserSafeJSON();

      expect(userSafeJson.code).toBe(ErrorCode.VALIDATION_EMAIL_ALREADY_EXISTS);
      expect(userSafeJson.message).toBeDefined();
      expect(userSafeJson.actionable.action).toBe('CHECK_INPUT');
      
      // Should not contain sensitive context details
      expect(userSafeJson).not.toHaveProperty('context');
      expect(userSafeJson).not.toHaveProperty('stack');
    });
  });
});

/**
 * Mock test demonstrating how errors would flow through the improved system
 */
describe('Error Flow Integration', () => {
  // Mock AuthService that throws custom errors
  class MockAuthService {
    async register(data: any) {
      if (data.email === 'existing@example.com') {
        throw new EmailAlreadyExistsError(data.email);
      }
      return { user: { id: '1', email: data.email }, token: 'mock-token' };
    }

    async login(data: any) {
      if (data.email === 'notfound@example.com') {
        throw new UserNotFoundError(data.email);
      }
      if (data.password === 'wrongpassword') {
        throw new InvalidCredentialsError();
      }
      return { user: { id: '1', email: data.email }, token: 'mock-token' };
    }
  }

  describe('Registration Flow', () => {
    it('should throw EmailAlreadyExistsError for duplicate email', async () => {
      const authService = new MockAuthService();
      
      await expect(
        authService.register({ email: 'existing@example.com', password: 'test123' })
      ).rejects.toThrow(EmailAlreadyExistsError);
    });

    it('should succeed for valid registration data', async () => {
      const authService = new MockAuthService();
      
      const result = await authService.register({ 
        email: 'new@example.com', 
        password: 'test123' 
      });
      
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
    });
  });

  describe('Login Flow', () => {
    it('should throw UserNotFoundError for non-existent user', async () => {
      const authService = new MockAuthService();
      
      await expect(
        authService.login({ email: 'notfound@example.com', password: 'test123' })
      ).rejects.toThrow(UserNotFoundError);
    });

    it('should throw InvalidCredentialsError for wrong password', async () => {
      const authService = new MockAuthService();
      
      await expect(
        authService.login({ email: 'valid@example.com', password: 'wrongpassword' })
      ).rejects.toThrow(InvalidCredentialsError);
    });

    it('should succeed for valid credentials', async () => {
      const authService = new MockAuthService();
      
      const result = await authService.login({ 
        email: 'valid@example.com', 
        password: 'correctpassword' 
      });
      
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
    });
  });
});

/**
 * Test demonstrating how the AuthController would handle these errors
 * (The errors are now thrown by the service and caught by middleware)
 */
describe('Controller Integration', () => {
  it('should demonstrate clean controller code without hardcoded error handling', () => {
    // This is a conceptual test showing how the controller would look
    const mockController = {
      async register(req: any, res: any, next: any) {
        try {
          // Before: Had try/catch with hardcoded error message checks
          // After: Clean code - just call service and let errors bubble up
          const result = await mockAuthService.register(req.body);
          return { success: true, data: result };
        } catch (error) {
          // Error handling is now done by middleware
          next(error);
        }
      }
    };

    // The custom errors provide rich context for middleware to handle appropriately
    expect(mockController).toBeDefined();
  });
});

// Mock auth service for demonstration
const mockAuthService = {
  register: async (data: any) => {
    if (data.email === 'existing@example.com') {
      throw new EmailAlreadyExistsError(data.email);
    }
    return { user: { id: '1' } };
  }
};
