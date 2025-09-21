import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthMiddleware } from '../../../src/middleware/AuthMiddleware';
import { LanguageMiddleware } from '../../../src/middleware/LanguageMiddleware';
import { ErrorFactory } from '../../../src/errors/ApplicationError';
import { ErrorCode } from '../../../src/types/error-codes';

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('../../../src/middleware/LanguageMiddleware');
jest.mock('../../../src/errors/ApplicationError');

const mockJwt = jwt as jest.Mocked<typeof jwt>;
const mockLanguageMiddleware = LanguageMiddleware as jest.Mocked<typeof LanguageMiddleware>;
const mockErrorFactory = ErrorFactory as jest.Mocked<typeof ErrorFactory>;

// Mock translation service with proper interface
const mockTranslationService = {
  setLanguage: jest.fn(),
  getCurrentLanguage: jest.fn(() => 'en'),
  getSupportedLanguages: jest.fn(() => ['en']),
  isLanguageSupported: jest.fn(() => true),
  getTranslationProvider: jest.fn(),
  t: jest.fn((key: string) => `mocked_${key}`),
  auth: jest.fn((key: string) => `mocked_${key}`),
  user: jest.fn((key: string) => `mocked_${key}`),
  validation: jest.fn((key: string) => `mocked_${key}`),
  authorization: jest.fn((key: string) => `mocked_${key}`),
  server: jest.fn((key: string) => `mocked_${key}`),
  database: jest.fn((key: string) => `mocked_${key}`),
  audit: jest.fn((key: string) => `mocked_${key}`),
  errors: jest.fn((key: string) => `mocked_${key}`),
} as any;

// Extended Request interface to include custom properties
interface ExtendedRequest extends Request {
  user?: any;
  context?: {
    correlationId?: string;
    requestId?: string;
  };
}

// Helper function to create mock Express objects
const createMockExpressObjects = () => {
  const req = {
    headers: {},
    method: 'GET',
    originalUrl: '/api/users/profile',
    context: {
      correlationId: 'test-correlation-id',
      requestId: 'test-request-id',
    },
    user: undefined,
  } as ExtendedRequest;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as any as Response;

  const next = jest.fn() as NextFunction;

  return { req, res, next };
};

describe('AuthMiddleware', () => {
  let originalEnv: string | undefined;

  beforeAll(() => {
    originalEnv = process.env.JWT_SECRET;
    process.env.JWT_SECRET = 'test-jwt-secret';
  });

  afterAll(() => {
    if (originalEnv) {
      process.env.JWT_SECRET = originalEnv;
    } else {
      delete process.env.JWT_SECRET;
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockLanguageMiddleware.getTranslationService.mockReturnValue(mockTranslationService);
    
    // Mock the error factory to return a mock error
    const mockError = {
      httpStatus: 401,
      code: ErrorCode.AUTH_TOKEN_MISSING,
      message: 'Authentication required',
    };
    mockErrorFactory.createError.mockReturnValue(mockError as any);
  });

  describe('authenticate', () => {
    it('should authenticate user with valid JWT token', () => {
      // Arrange
      const { req, res, next } = createMockExpressObjects();
      req.headers.authorization = 'Bearer valid-jwt-token';

      const mockDecodedToken = {
        id: 'user-123',
        email: 'user@example.com',
        role: 'user',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      mockJwt.verify.mockReturnValue(mockDecodedToken as any);

      // Act
      AuthMiddleware.authenticate(req, res, next);

      // Assert
      expect(mockJwt.verify).toHaveBeenCalledWith('valid-jwt-token', 'test-jwt-secret');
      expect(req.user).toEqual({
        id: 'user-123',
        email: 'user@example.com',
        role: 'user',
      });
      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should reject request with missing authorization header', () => {
      // Arrange
      const { req, res, next } = createMockExpressObjects();
      // No authorization header

      // Mock sendErrorWithStatus method
      const sendErrorWithStatusSpy = jest.spyOn(AuthMiddleware.prototype as any, 'sendErrorWithStatus').mockImplementation();

      // Act
      AuthMiddleware.authenticate(req, res, next);

      // Assert
      expect(mockLanguageMiddleware.getTranslationService).toHaveBeenCalledWith(req);
      expect(mockErrorFactory.createError).toHaveBeenCalledWith(
        ErrorCode.AUTH_TOKEN_MISSING,
        'mocked_authentication_required',
        expect.objectContaining({
          correlationId: 'test-correlation-id',
          requestId: 'test-request-id',
          method: 'GET',
          url: '/api/users/profile',
        }),
        expect.objectContaining({
          userMessage: 'mocked_authentication_required',
          action: 'LOGIN_REQUIRED',
        })
      );
      expect(sendErrorWithStatusSpy).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject request with malformed authorization header', () => {
      // Arrange
      const { req, res, next } = createMockExpressObjects();
      req.headers.authorization = 'InvalidFormat token-here';

      // Mock sendErrorWithStatus method
      const sendErrorWithStatusSpy = jest.spyOn(AuthMiddleware.prototype as any, 'sendErrorWithStatus').mockImplementation();

      // Act
      AuthMiddleware.authenticate(req, res, next);

      // Assert
      expect(mockErrorFactory.createError).toHaveBeenCalledWith(
        ErrorCode.AUTH_TOKEN_MISSING,
        'mocked_authentication_required',
        expect.any(Object),
        expect.any(Object)
      );
      expect(sendErrorWithStatusSpy).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject request with Bearer but no token', () => {
      // Arrange
      const { req, res, next } = createMockExpressObjects();
      req.headers.authorization = 'Bearer '; // This will result in undefined token

      // JWT.verify will throw an error when token is undefined
      const invalidTokenError = new jwt.JsonWebTokenError('jwt must be provided');
      mockJwt.verify.mockImplementation(() => {
        throw invalidTokenError;
      });

      // Mock sendErrorWithStatus method
      const sendErrorWithStatusSpy = jest.spyOn(AuthMiddleware.prototype as any, 'sendErrorWithStatus').mockImplementation();

      // Act
      AuthMiddleware.authenticate(req, res, next);

      // Assert
      expect(mockJwt.verify).toHaveBeenCalledWith('', 'test-jwt-secret');
      expect(mockErrorFactory.createError).toHaveBeenCalledWith(
        ErrorCode.AUTH_TOKEN_INVALID,
        'mocked_authentication_failed',
        expect.any(Object),
        expect.objectContaining({
          userMessage: 'mocked_authentication_failed',
          action: 'LOGIN_REQUIRED',
        })
      );
      expect(sendErrorWithStatusSpy).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle expired JWT token', () => {
      // Arrange
      const { req, res, next } = createMockExpressObjects();
      req.headers.authorization = 'Bearer expired-jwt-token';

      const expiredTokenError = new jwt.TokenExpiredError('jwt expired', new Date());
      mockJwt.verify.mockImplementation(() => {
        throw expiredTokenError;
      });

      // Mock sendErrorWithStatus method
      const sendErrorWithStatusSpy = jest.spyOn(AuthMiddleware.prototype as any, 'sendErrorWithStatus').mockImplementation();

      // Act
      AuthMiddleware.authenticate(req, res, next);

      // Assert
      expect(mockJwt.verify).toHaveBeenCalledWith('expired-jwt-token', 'test-jwt-secret');
      expect(mockErrorFactory.createError).toHaveBeenCalledWith(
        ErrorCode.AUTH_TOKEN_EXPIRED,
        'mocked_authentication_failed',
        expect.objectContaining({
          correlationId: 'test-correlation-id',
          requestId: 'test-request-id',
        }),
        expect.objectContaining({
          userMessage: 'mocked_authentication_failed',
          action: 'REFRESH_TOKEN',
        })
      );
      expect(sendErrorWithStatusSpy).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle invalid JWT token', () => {
      // Arrange
      const { req, res, next } = createMockExpressObjects();
      req.headers.authorization = 'Bearer invalid-jwt-token';

      const invalidTokenError = new jwt.JsonWebTokenError('invalid token');
      mockJwt.verify.mockImplementation(() => {
        throw invalidTokenError;
      });

      // Mock sendErrorWithStatus method
      const sendErrorWithStatusSpy = jest.spyOn(AuthMiddleware.prototype as any, 'sendErrorWithStatus').mockImplementation();

      // Act
      AuthMiddleware.authenticate(req, res, next);

      // Assert
      expect(mockJwt.verify).toHaveBeenCalledWith('invalid-jwt-token', 'test-jwt-secret');
      expect(mockErrorFactory.createError).toHaveBeenCalledWith(
        ErrorCode.AUTH_TOKEN_INVALID,
        'mocked_authentication_failed',
        expect.any(Object),
        expect.objectContaining({
          userMessage: 'mocked_authentication_failed',
          action: 'LOGIN_REQUIRED',
        })
      );
      expect(sendErrorWithStatusSpy).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle malformed JWT token', () => {
      // Arrange
      const { req, res, next } = createMockExpressObjects();
      req.headers.authorization = 'Bearer malformed.jwt.token';

      const malformedTokenError = new jwt.JsonWebTokenError('jwt malformed');
      mockJwt.verify.mockImplementation(() => {
        throw malformedTokenError;
      });

      // Mock sendErrorWithStatus method
      const sendErrorWithStatusSpy = jest.spyOn(AuthMiddleware.prototype as any, 'sendErrorWithStatus').mockImplementation();

      // Act
      AuthMiddleware.authenticate(req, res, next);

      // Assert
      expect(mockErrorFactory.createError).toHaveBeenCalledWith(
        ErrorCode.AUTH_TOKEN_INVALID,
        'mocked_authentication_failed',
        expect.any(Object),
        expect.any(Object)
      );
      expect(sendErrorWithStatusSpy).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle generic JWT verification errors', () => {
      // Arrange
      const { req, res, next } = createMockExpressObjects();
      req.headers.authorization = 'Bearer problematic-jwt-token';

      const genericError = new Error('Something went wrong');
      mockJwt.verify.mockImplementation(() => {
        throw genericError;
      });

      // Mock sendErrorWithStatus method
      const sendErrorWithStatusSpy = jest.spyOn(AuthMiddleware.prototype as any, 'sendErrorWithStatus').mockImplementation();

      // Act
      AuthMiddleware.authenticate(req, res, next);

      // Assert
      expect(mockJwt.verify).toHaveBeenCalledWith('problematic-jwt-token', 'test-jwt-secret');
      expect(mockErrorFactory.createError).toHaveBeenCalledWith(
        ErrorCode.AUTH_INVALID_CREDENTIALS,
        'mocked_authentication_failed',
        expect.any(Object),
        expect.objectContaining({
          userMessage: 'mocked_authentication_failed',
          action: 'LOGIN_REQUIRED',
        })
      );
      expect(sendErrorWithStatusSpy).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should use fallback JWT secret when environment variable is not set', () => {
      // Arrange
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      const { req, res, next } = createMockExpressObjects();
      req.headers.authorization = 'Bearer valid-jwt-token';

      const mockDecodedToken = {
        id: 'user-123',
        email: 'user@example.com',
        role: 'user',
      };

      mockJwt.verify.mockReturnValue(mockDecodedToken as any);

      // Act
      AuthMiddleware.authenticate(req, res, next);

      // Assert
      expect(mockJwt.verify).toHaveBeenCalledWith('valid-jwt-token', 'your-secret-key');
      expect(next).toHaveBeenCalledWith();

      // Restore
      if (originalSecret) {
        process.env.JWT_SECRET = originalSecret;
      }
    });

    it('should handle case-sensitive Bearer token', () => {
      // Arrange
      const { req, res, next } = createMockExpressObjects();
      req.headers.authorization = 'bearer valid-jwt-token'; // lowercase 'bearer'

      // Mock sendErrorWithStatus method
      const sendErrorWithStatusSpy = jest.spyOn(AuthMiddleware.prototype as any, 'sendErrorWithStatus').mockImplementation();

      // Act
      AuthMiddleware.authenticate(req, res, next);

      // Assert
      expect(mockErrorFactory.createError).toHaveBeenCalledWith(
        ErrorCode.AUTH_TOKEN_MISSING,
        'mocked_authentication_required',
        expect.any(Object),
        expect.any(Object)
      );
      expect(sendErrorWithStatusSpy).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should extract token correctly from Authorization header', () => {
      // Arrange
      const { req, res, next } = createMockExpressObjects();
      req.headers.authorization = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-payload.signature';

      const mockDecodedToken = {
        id: 'user-456',
        email: 'admin@example.com',
        role: 'admin',
      };

      mockJwt.verify.mockReturnValue(mockDecodedToken as any);

      // Act
      AuthMiddleware.authenticate(req, res, next);

      // Assert
      expect(mockJwt.verify).toHaveBeenCalledWith(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-payload.signature',
        'test-jwt-secret'
      );
      expect(req.user).toEqual({
        id: 'user-456',
        email: 'admin@example.com',
        role: 'admin',
      });
      expect(next).toHaveBeenCalledWith();
    });

    it('should handle missing context in request gracefully', () => {
      // Arrange
      const { req, res, next } = createMockExpressObjects();
      req.context = undefined; // No context
      req.headers.authorization = 'Bearer invalid-token';

      const invalidTokenError = new jwt.JsonWebTokenError('invalid token');
      mockJwt.verify.mockImplementation(() => {
        throw invalidTokenError;
      });

      // Mock sendErrorWithStatus method
      const sendErrorWithStatusSpy = jest.spyOn(AuthMiddleware.prototype as any, 'sendErrorWithStatus').mockImplementation();

      // Act
      AuthMiddleware.authenticate(req, res, next);

      // Assert
      expect(mockErrorFactory.createError).toHaveBeenCalledWith(
        ErrorCode.AUTH_TOKEN_INVALID,
        'mocked_authentication_failed',
        expect.objectContaining({
          correlationId: undefined,
          requestId: undefined,
        }),
        expect.any(Object)
      );
      expect(sendErrorWithStatusSpy).toHaveBeenCalled();
    });
  });

  describe('Static method behavior', () => {
    it('should be a static method', () => {
      // Assert
      expect(typeof AuthMiddleware.authenticate).toBe('function');
      expect(AuthMiddleware.authenticate.length).toBe(3); // req, res, next parameters
    });

    it('should not require instantiation', () => {
      // Arrange
      const { req, res, next } = createMockExpressObjects();
      req.headers.authorization = 'Bearer valid-token';

      const mockDecodedToken = { id: 'user', email: 'test@example.com', role: 'user' };
      mockJwt.verify.mockReturnValue(mockDecodedToken as any);

      // Act & Assert (should not throw)
      expect(() => AuthMiddleware.authenticate(req, res, next)).not.toThrow();
      expect(next).toHaveBeenCalled();
    });
  });
});