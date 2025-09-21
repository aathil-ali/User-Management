import { ErrorCode, ERROR_CODE_REGISTRY } from '@/types/error-codes';
import { 
  EmailAlreadyExistsError,
  InvalidCredentialsError,
  UserNotFoundError,
  InvalidRefreshTokenError,
  InvalidAccessTokenError,
  AccountLockedError,
  AccountNotVerifiedError,
  AccountDisabledError,
  WeakPasswordError,
  AuthRateLimitError
} from '@/errors/auth';

describe('Error Code Registry and Auth Errors', () => {
  describe('Error Code Registry Completeness', () => {
    it('should have all authentication error codes registered', () => {
      const authErrorCodes = [
        ErrorCode.AUTH_INVALID_CREDENTIALS,
        ErrorCode.AUTH_TOKEN_EXPIRED,
        ErrorCode.AUTH_TOKEN_INVALID,
        ErrorCode.AUTH_TOKEN_MISSING,
        ErrorCode.AUTH_REFRESH_TOKEN_INVALID,
        ErrorCode.AUTH_SESSION_EXPIRED,
        ErrorCode.AUTH_ACCOUNT_LOCKED,
        ErrorCode.AUTH_ACCOUNT_SUSPENDED,
        ErrorCode.AUTH_EMAIL_NOT_VERIFIED,
        ErrorCode.AUTH_ACCOUNT_NOT_VERIFIED,
        ErrorCode.AUTH_ACCOUNT_DISABLED,
        ErrorCode.AUTH_USER_NOT_FOUND,
        ErrorCode.AUTH_PASSWORD_RESET_REQUIRED,
        ErrorCode.AUTH_TWO_FACTOR_REQUIRED,
      ];

      authErrorCodes.forEach(code => {
        expect(ERROR_CODE_REGISTRY[code]).toBeDefined();
        expect(ERROR_CODE_REGISTRY[code].category).toBe('Authentication');
      });
    });

    it('should have all validation error codes registered', () => {
      const validationErrorCodes = [
        ErrorCode.VALIDATION_FAILED,
        ErrorCode.VALIDATION_EMAIL_INVALID,
        ErrorCode.VALIDATION_EMAIL_REQUIRED,
        ErrorCode.VALIDATION_EMAIL_ALREADY_EXISTS,
        ErrorCode.VALIDATION_PASSWORD_REQUIRED,
        ErrorCode.VALIDATION_PASSWORD_TOO_WEAK,
        ErrorCode.VALIDATION_PASSWORD_WEAK,
        ErrorCode.VALIDATION_PASSWORD_TOO_SHORT,
      ];

      validationErrorCodes.forEach(code => {
        expect(ERROR_CODE_REGISTRY[code]).toBeDefined();
        expect(ERROR_CODE_REGISTRY[code].category).toBe('Validation');
      });
    });

    it('should have rate limit error codes registered', () => {
      const rateLimitCodes = [
        ErrorCode.RATE_LIMIT_EXCEEDED,
        ErrorCode.RATE_LIMIT_AUTH_EXCEEDED,
        ErrorCode.RATE_LIMIT_LOGIN_ATTEMPTS,
      ];

      rateLimitCodes.forEach(code => {
        expect(ERROR_CODE_REGISTRY[code]).toBeDefined();
        expect(ERROR_CODE_REGISTRY[code].category).toBe('RateLimit');
      });
    });
  });

  describe('Custom Auth Error Creation', () => {
    it('should create EmailAlreadyExistsError with proper registry metadata', () => {
      const email = 'test@example.com';
      const error = new EmailAlreadyExistsError(email);
      
      expect(error.code).toBe(ErrorCode.VALIDATION_EMAIL_ALREADY_EXISTS);
      expect(error.httpStatus).toBe(409);
      expect(error.category).toBe('Validation');
      expect(error.severity).toBe('LOW');
      expect(error.retryable).toBe(false);
      expect(error.userFacing).toBe(true);
      expect(error.context.details).toEqual({ email });
    });

    it('should create InvalidCredentialsError with proper registry metadata', () => {
      const error = new InvalidCredentialsError();
      
      expect(error.code).toBe(ErrorCode.AUTH_INVALID_CREDENTIALS);
      expect(error.httpStatus).toBe(401);
      expect(error.category).toBe('Authentication');
      expect(error.severity).toBe('MEDIUM');
      expect(error.retryable).toBe(false);
      expect(error.userFacing).toBe(true);
    });

    it('should create UserNotFoundError with proper registry metadata', () => {
      const identifier = 'user123';
      const error = new UserNotFoundError(identifier);
      
      expect(error.code).toBe(ErrorCode.AUTH_USER_NOT_FOUND);
      expect(error.httpStatus).toBe(401);
      expect(error.category).toBe('Authentication');
      expect(error.severity).toBe('MEDIUM');
      expect(error.context.details).toEqual({ identifier });
    });

    it('should create AccountLockedError with proper retry configuration', () => {
      const lockoutDuration = 600; // 10 minutes
      const error = new AccountLockedError(lockoutDuration);
      
      expect(error.code).toBe(ErrorCode.AUTH_ACCOUNT_LOCKED);
      expect(error.httpStatus).toBe(423);
      expect(error.category).toBe('Authentication');
      expect(error.severity).toBe('HIGH');
      expect(error.actionable.action).toBe('WAIT_AND_RETRY');
      expect(error.actionable.retryAfter).toBe(lockoutDuration);
      expect(error.context.details).toEqual({ lockoutDuration });
    });

    it('should create WeakPasswordError with password requirements', () => {
      const requirements = ['min 8 chars', 'uppercase', 'lowercase', 'number'];
      const error = new WeakPasswordError(requirements);
      
      expect(error.code).toBe(ErrorCode.VALIDATION_PASSWORD_WEAK);
      expect(error.httpStatus).toBe(400);
      expect(error.category).toBe('Validation');
      expect(error.actionable.action).toBe('CORRECT_INPUT');
      expect(error.context.details).toEqual({ requirements });
    });

    it('should create AuthRateLimitError with retry timing', () => {
      const retryAfter = 120;
      const error = new AuthRateLimitError(retryAfter);
      
      expect(error.code).toBe(ErrorCode.RATE_LIMIT_AUTH_EXCEEDED);
      expect(error.httpStatus).toBe(429);
      expect(error.category).toBe('RateLimit');
      expect(error.severity).toBe('HIGH');
      expect(error.actionable.action).toBe('WAIT_AND_RETRY');
      expect(error.actionable.retryAfter).toBe(retryAfter);
    });
  });

  describe('Error Properties and Metadata', () => {
    it('should have consistent properties across all auth errors', () => {
      const errors = [
        new EmailAlreadyExistsError('test@example.com'),
        new InvalidCredentialsError(),
        new UserNotFoundError('user123'),
        new InvalidRefreshTokenError(),
        new InvalidAccessTokenError(),
        new AccountLockedError(900),
        new AccountNotVerifiedError(),
        new AccountDisabledError('suspended for violation'),
        new WeakPasswordError(['min 8 chars']),
        new AuthRateLimitError(60),
      ];

      errors.forEach(error => {
        // All errors should have these basic properties
        expect(error.code).toBeDefined();
        expect(error.httpStatus).toBeGreaterThanOrEqual(400);
        expect(error.httpStatus).toBeLessThan(600);
        expect(error.category).toBeDefined();
        expect(error.severity).toMatch(/^(LOW|MEDIUM|HIGH|CRITICAL)$/);
        expect(typeof error.retryable).toBe('boolean');
        expect(typeof error.userFacing).toBe('boolean');
        expect(error.logLevel).toMatch(/^(debug|info|warn|error|fatal)$/);
        expect(typeof error.requiresAlert).toBe('boolean');
        expect(error.timestamp).toBeInstanceOf(Date);
        expect(error.isOperational).toBe(true);
        
        // Actionable guidance
        expect(error.actionable).toBeDefined();
        expect(error.actionable.action).toMatch(/^(RETRY|REFRESH_TOKEN|CONTACT_SUPPORT|CHECK_INPUT|CORRECT_INPUT|WAIT_AND_RETRY|LOGIN_REQUIRED|UPGRADE_REQUIRED)$/);
        
        // Context
        expect(error.context).toBeDefined();
        expect(error.context.timestamp).toBeInstanceOf(Date);
      });
    });

    it('should serialize to JSON correctly', () => {
      const error = new EmailAlreadyExistsError('test@example.com');
      const json = error.toJSON();

      expect(json.name).toBe('EmailAlreadyExistsError');
      expect(json.code).toBe(ErrorCode.VALIDATION_EMAIL_ALREADY_EXISTS);
      expect(json.httpStatus).toBe(409);
      expect(json.category).toBe('Validation');
      expect(json.severity).toBe('LOW');
      expect(json.context.details).toEqual({ email: 'test@example.com' });
      expect(json.actionable.action).toBe('CHECK_INPUT');
    });

    it('should create user-safe JSON without sensitive information', () => {
      const error = new EmailAlreadyExistsError('test@example.com');
      const userSafeJson = error.toUserSafeJSON();

      expect(userSafeJson.code).toBe(ErrorCode.VALIDATION_EMAIL_ALREADY_EXISTS);
      expect(userSafeJson.retryable).toBe(false);
      expect(userSafeJson.actionable.action).toBe('CHECK_INPUT');
      expect(userSafeJson.timestamp).toBeInstanceOf(Date);
      
      // Should not contain sensitive information
      expect(userSafeJson).not.toHaveProperty('httpStatus');
      expect(userSafeJson).not.toHaveProperty('category');
      expect(userSafeJson).not.toHaveProperty('severity');
      expect(userSafeJson).not.toHaveProperty('context');
      expect(userSafeJson).not.toHaveProperty('stack');
    });
  });

  describe('Error Registry Validation', () => {
    it('should have no missing error code registrations', () => {
      // Get all error codes from the enum
      const allErrorCodes = Object.values(ErrorCode);
      
      // Check that each error code has a registry entry
      allErrorCodes.forEach(code => {
        expect(ERROR_CODE_REGISTRY[code]).toBeDefined();
      });
    });

    it('should have no orphaned registry entries', () => {
      // Get all registry keys
      const registryKeys = Object.keys(ERROR_CODE_REGISTRY);
      const errorCodeValues = Object.values(ErrorCode);
      
      // Check that each registry entry corresponds to a valid error code
      registryKeys.forEach(key => {
        expect(errorCodeValues).toContain(key as ErrorCode);
      });
    });

    it('should have consistent HTTP status codes for similar error types', () => {
      // Authentication errors should be 401, 403, or 423
      const authCodes = Object.entries(ERROR_CODE_REGISTRY)
        .filter(([_, meta]) => meta.category === 'Authentication')
        .map(([_, meta]) => meta.httpStatus);
      
      authCodes.forEach(status => {
        expect([401, 403, 423].includes(status)).toBe(true);
      });

      // Validation errors should be 400 or 409
      const validationCodes = Object.entries(ERROR_CODE_REGISTRY)
        .filter(([_, meta]) => meta.category === 'Validation')
        .map(([_, meta]) => meta.httpStatus);
      
      validationCodes.forEach(status => {
        expect([400, 409].includes(status)).toBe(true);
      });

      // Rate limit errors should be 429
      const rateLimitCodes = Object.entries(ERROR_CODE_REGISTRY)
        .filter(([_, meta]) => meta.category === 'RateLimit')
        .map(([_, meta]) => meta.httpStatus);
      
      rateLimitCodes.forEach(status => {
        expect(status).toBe(429);
      });
    });
  });
});
