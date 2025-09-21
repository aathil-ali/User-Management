import { Request, Response, NextFunction } from 'express';
import { AuthController } from '../../../src/controllers/AuthController';
import { IAuthService } from '../../../src/interfaces/IAuthService';
import { RegisterDto } from '../../../src/dto/auth/RegisterDto';
import { LoginDto } from '../../../src/dto/auth/LoginDto';
import { LogoutDto } from '../../../src/dto/auth/LogoutDto';
import { AuthResponseDto } from '../../../src/dto/auth/AuthResponseDto';

// Mock AuthService
const mockAuthService: jest.Mocked<IAuthService> = {
  register: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  refreshToken: jest.fn(),
};

// Mock translation function
const mockT = {
  auth: jest.fn((key: string) => `mocked_${key}`),
};

// Helper function to create mock Express objects
const createMockExpressObjects = () => {
  const req = {
    body: {},
    language: 'en',
  } as any as Request;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as any as Response;

  const next = jest.fn() as NextFunction;

  return { req, res, next };
};

describe('AuthController', () => {
  let authController: AuthController;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Create fresh instance of AuthController with mocked service
    authController = new AuthController(mockAuthService);
  });

  describe('register', () => {
    it('should register user successfully', async () => {
      // Arrange
      const registerData: RegisterDto = {
        email: 'newuser@example.com',
        password: 'SecurePassword123!',
        name: 'New User',
      };

      const mockAuthResponse: AuthResponseDto = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: {
          id: 'user-123',
          email: 'newuser@example.com',
          name: 'New User',
          role: 'user',
        },
      };

      const { req, res, next } = createMockExpressObjects();
      req.body = registerData;

      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      // Mock the translation and response methods from BaseController
      const sendSuccessSpy = jest.spyOn(authController as any, 'sendSuccess').mockImplementation();
      const handleRequestSpy = jest.spyOn(authController as any, 'handleRequest').mockImplementation(async (req: any, res: any, next: any, handler: any) => {
        await handler(req, res, mockT);
      });

      // Act
      await authController.register(req, res, next);

      // Assert
      expect(mockAuthService.register).toHaveBeenCalledWith(registerData);
      expect(sendSuccessSpy).toHaveBeenCalledWith(res, mockAuthResponse, 'mocked_registration_success', req, 201);
    });

    it('should handle registration errors', async () => {
      // Arrange
      const registerData: RegisterDto = {
        email: 'existing@example.com',
        password: 'SecurePassword123!',
        name: 'Existing User',
      };

      const { req, res, next } = createMockExpressObjects();
      req.body = registerData;

      const mockError = new Error('Email already exists');
      mockAuthService.register.mockRejectedValue(mockError);

      const handleRequestSpy = jest.spyOn(authController as any, 'handleRequest').mockImplementation(async (req: any, res: any, next: any, handler: any) => {
        try {
          await handler(req, res, mockT);
        } catch (error) {
          throw error;
        }
      });

      // Act & Assert
      await expect(authController.register(req, res, next)).rejects.toThrow('Email already exists');
      expect(mockAuthService.register).toHaveBeenCalledWith(registerData);
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      // Arrange
      const loginData: LoginDto = {
        email: 'user@example.com',
        password: 'SecurePassword123!',
      };

      const mockAuthResponse: AuthResponseDto = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: {
          id: 'user-123',
          email: 'user@example.com',
          name: 'Test User',
          role: 'user',
        },
      };

      const { req, res, next } = createMockExpressObjects();
      req.body = loginData;

      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      // Mock the translation and response methods from BaseController
      const sendSuccessSpy = jest.spyOn(authController as any, 'sendSuccess').mockImplementation();
      const handleRequestSpy = jest.spyOn(authController as any, 'handleRequest').mockImplementation(async (req: any, res: any, next: any, handler: any) => {
        await handler(req, res, mockT);
      });

      // Act
      await authController.login(req, res, next);

      // Assert
      expect(mockAuthService.login).toHaveBeenCalledWith(loginData);
      expect(sendSuccessSpy).toHaveBeenCalledWith(res, mockAuthResponse, 'mocked_login_success', req);
    });

    it('should handle login errors', async () => {
      // Arrange
      const loginData: LoginDto = {
        email: 'user@example.com',
        password: 'WrongPassword123!',
      };

      const { req, res, next } = createMockExpressObjects();
      req.body = loginData;

      const mockError = new Error('Invalid credentials');
      mockAuthService.login.mockRejectedValue(mockError);

      const handleRequestSpy = jest.spyOn(authController as any, 'handleRequest').mockImplementation(async (req: any, res: any, next: any, handler: any) => {
        try {
          await handler(req, res, mockT);
        } catch (error) {
          throw error;
        }
      });

      // Act & Assert
      await expect(authController.login(req, res, next)).rejects.toThrow('Invalid credentials');
      expect(mockAuthService.login).toHaveBeenCalledWith(loginData);
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      // Arrange
      const refreshTokenData = { refreshToken: 'valid-refresh-token' };
      const mockTokenResponse = { accessToken: 'new-access-token' };

      const { req, res, next } = createMockExpressObjects();
      req.body = refreshTokenData;

      mockAuthService.refreshToken.mockResolvedValue(mockTokenResponse);

      // Mock the translation and response methods from BaseController
      const sendSuccessSpy = jest.spyOn(authController as any, 'sendSuccess').mockImplementation();
      const handleRequestSpy = jest.spyOn(authController as any, 'handleRequest').mockImplementation(async (req: any, res: any, next: any, handler: any) => {
        await handler(req, res, mockT);
      });

      // Act
      await authController.refreshToken(req, res, next);

      // Assert
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith('valid-refresh-token');
      expect(sendSuccessSpy).toHaveBeenCalledWith(res, mockTokenResponse, 'mocked_token_refresh_success', req);
    });

    it('should handle refresh token errors', async () => {
      // Arrange
      const refreshTokenData = { refreshToken: 'invalid-refresh-token' };

      const { req, res, next } = createMockExpressObjects();
      req.body = refreshTokenData;

      const mockError = new Error('Invalid refresh token');
      mockAuthService.refreshToken.mockRejectedValue(mockError);

      const handleRequestSpy = jest.spyOn(authController as any, 'handleRequest').mockImplementation(async (req: any, res: any, next: any, handler: any) => {
        try {
          await handler(req, res, mockT);
        } catch (error) {
          throw error;
        }
      });

      // Act & Assert
      await expect(authController.refreshToken(req, res, next)).rejects.toThrow('Invalid refresh token');
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith('invalid-refresh-token');
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      // Arrange
      const logoutData: LogoutDto = {
        userId: 'user-123',
      };

      const { req, res, next } = createMockExpressObjects();
      req.body = logoutData;

      mockAuthService.logout.mockResolvedValue();

      // Mock the translation and response methods from BaseController
      const sendSuccessSpy = jest.spyOn(authController as any, 'sendSuccess').mockImplementation();
      const handleRequestSpy = jest.spyOn(authController as any, 'handleRequest').mockImplementation(async (req: any, res: any, next: any, handler: any) => {
        await handler(req, res, mockT);
      });

      // Act
      await authController.logout(req, res, next);

      // Assert
      expect(mockAuthService.logout).toHaveBeenCalledWith('user-123');
      expect(sendSuccessSpy).toHaveBeenCalledWith(res, null, 'mocked_logout_success', req);
    });

    it('should handle logout errors', async () => {
      // Arrange
      const logoutData: LogoutDto = {
        userId: 'non-existent-user',
      };

      const { req, res, next } = createMockExpressObjects();
      req.body = logoutData;

      const mockError = new Error('User not found');
      mockAuthService.logout.mockRejectedValue(mockError);

      const handleRequestSpy = jest.spyOn(authController as any, 'handleRequest').mockImplementation(async (req: any, res: any, next: any, handler: any) => {
        try {
          await handler(req, res, mockT);
        } catch (error) {
          throw error;
        }
      });

      // Act & Assert
      await expect(authController.logout(req, res, next)).rejects.toThrow('User not found');
      expect(mockAuthService.logout).toHaveBeenCalledWith('non-existent-user');
    });
  });

  describe('Controller instantiation', () => {
    it('should create AuthController instance', () => {
      expect(authController).toBeInstanceOf(AuthController);
    });

    it('should have access to authService', () => {
      expect(mockAuthService).toBeDefined();
    });
  });
});