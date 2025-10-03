import { Request, Response, NextFunction } from 'express';
import { UserController } from '../../../src/controllers/UserController';
import { IUserService } from '../../../src/interfaces/IUserService';
import { UserProfile } from '../../../src/models/UserProfile';
import { UpdateProfileDto } from '../../../src/dto/user/UpdateProfileDto';

// Mock UserService
const mockUserService: jest.Mocked<IUserService> = {
  getProfile: jest.fn(),
  updateProfile: jest.fn(),
  deleteAccount: jest.fn(),
  getAllUsers: jest.fn(),
  getUserById: jest.fn(),
};

// Mock translation function
const mockT = {
  user: jest.fn((key: string) => `mocked_${key}`),
};

// Helper function to create mock Express objects with user context
const createMockExpressObjects = (userId?: string) => {
  const req = {
    body: {},
    user: userId ? { id: userId, role: 'user' } : undefined,
    language: 'en',
    context: {
      correlationId: 'test-correlation-id',
      requestId: 'test-request-id',
      startTime: Date.now(),
      userId: userId,
    },
    correlationId: 'test-correlation-id',
    requestId: 'test-request-id',
    startTime: Date.now(),
  } as any;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as any as Response;

  const next = jest.fn() as NextFunction;

  return { req, res, next };
};

describe('UserController', () => {
  let userController: UserController;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Create fresh instance of UserController with mocked service
    userController = new UserController(mockUserService);
  });

  describe('getProfile', () => {
    it('should get user profile successfully', async () => {
      // Arrange
      const userId = 'user-123';
      const mockUserProfile: UserProfile = {
        id: userId,
        email: 'user@example.com',
        name: 'Test User',
        role: 'user',
        avatar: 'https://example.com/avatar.jpg',
        preferences: {
          theme: 'light',
          notifications: true,
          language: 'en',
          timezone: 'UTC',
        },
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-02T00:00:00Z'),
      };

      const { req, res, next } = createMockExpressObjects(userId);

      mockUserService.getProfile.mockResolvedValue(mockUserProfile);

      // Mock the translation and response methods from BaseController
      const sendSuccessSpy = jest.spyOn(userController as any, 'sendSuccess').mockImplementation();
      const handleRequestSpy = jest.spyOn(userController as any, 'handleRequest').mockImplementation(async (req: any, res: any, next: any, handler: any) => {
        await handler(req, res, mockT);
      });

      // Act
      await userController.getProfile(req, res, next);

      // Assert
      expect(mockUserService.getProfile).toHaveBeenCalledWith(userId);
      expect(sendSuccessSpy).toHaveBeenCalledWith(res, mockUserProfile, 'mocked_profile_retrieved', req);
    });

    it('should handle profile retrieval errors', async () => {
      // Arrange
      const userId = 'non-existent-user';
      const { req, res, next } = createMockExpressObjects(userId);

      const mockError = new Error('User not found');
      mockUserService.getProfile.mockRejectedValue(mockError);

      const handleRequestSpy = jest.spyOn(userController as any, 'handleRequest').mockImplementation(async (req: any, res: any, next: any, handler: any) => {
        try {
          await handler(req, res, mockT);
        } catch (error) {
          throw error;
        }
      });

      // Act & Assert
      await expect(userController.getProfile(req, res, next)).rejects.toThrow('User not found');
      expect(mockUserService.getProfile).toHaveBeenCalledWith(userId);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      // Arrange
      const userId = 'user-123';
      const updateData: UpdateProfileDto = {
        name: 'Updated User',
        avatar: 'https://example.com/new-avatar.jpg',
        preferences: {
          theme: 'dark',
          notifications: false,
          language: 'es',
        },
      };

      const mockUpdatedProfile: UserProfile = {
        id: userId,
        email: 'user@example.com',
        name: 'Updated User',
        role: 'user',
        avatar: 'https://example.com/new-avatar.jpg',
        preferences: {
          theme: 'dark',
          notifications: false,
          language: 'es',
          timezone: 'UTC',
        },
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date(),
      };

      const { req, res, next } = createMockExpressObjects(userId);
      req.body = updateData;

      mockUserService.updateProfile.mockResolvedValue(mockUpdatedProfile);

      // Mock the translation and response methods from BaseController
      const sendSuccessSpy = jest.spyOn(userController as any, 'sendSuccess').mockImplementation();
      const handleRequestSpy = jest.spyOn(userController as any, 'handleRequest').mockImplementation(async (req: any, res: any, next: any, handler: any) => {
        await handler(req, res, mockT);
      });

      // Act
      await userController.updateProfile(req, res, next);

      // Assert
      expect(mockUserService.updateProfile).toHaveBeenCalledWith(userId, updateData);
      expect(sendSuccessSpy).toHaveBeenCalledWith(res, mockUpdatedProfile, 'mocked_profile_updated', req);
    });

    it('should handle profile update errors', async () => {
      // Arrange
      const userId = 'user-123';
      const updateData: UpdateProfileDto = {
        name: 'Updated User',
      };

      const { req, res, next } = createMockExpressObjects(userId);
      req.body = updateData;

      const mockError = new Error('Profile update failed');
      mockUserService.updateProfile.mockRejectedValue(mockError);

      const handleRequestSpy = jest.spyOn(userController as any, 'handleRequest').mockImplementation(async (req: any, res: any, next: any, handler: any) => {
        try {
          await handler(req, res, mockT);
        } catch (error) {
          throw error;
        }
      });

      // Act & Assert
      await expect(userController.updateProfile(req, res, next)).rejects.toThrow('Profile update failed');
      expect(mockUserService.updateProfile).toHaveBeenCalledWith(userId, updateData);
    });
  });

  describe('deleteAccount', () => {
    it('should delete user account successfully', async () => {
      // Arrange
      const userId = 'user-123';
      const { req, res, next } = createMockExpressObjects(userId);

      mockUserService.deleteAccount.mockResolvedValue();

      // Mock the translation and response methods from BaseController
      const sendSuccessSpy = jest.spyOn(userController as any, 'sendSuccess').mockImplementation();
      const handleRequestSpy = jest.spyOn(userController as any, 'handleRequest').mockImplementation(async (req: any, res: any, next: any, handler: any) => {
        await handler(req, res, mockT);
      });

      // Act
      await userController.deleteAccount(req, res, next);

      // Assert
      expect(mockUserService.deleteAccount).toHaveBeenCalledWith(userId);
      expect(sendSuccessSpy).toHaveBeenCalledWith(res, null, 'mocked_account_deleted', req);
    });

    it('should handle account deletion errors', async () => {
      // Arrange
      const userId = 'user-123';
      const { req, res, next } = createMockExpressObjects(userId);

      const mockError = new Error('Account deletion failed');
      mockUserService.deleteAccount.mockRejectedValue(mockError);

      const handleRequestSpy = jest.spyOn(userController as any, 'handleRequest').mockImplementation(async (req: any, res: any, next: any, handler: any) => {
        try {
          await handler(req, res, mockT);
        } catch (error) {
          throw error;
        }
      });

      // Act & Assert
      await expect(userController.deleteAccount(req, res, next)).rejects.toThrow('Account deletion failed');
      expect(mockUserService.deleteAccount).toHaveBeenCalledWith(userId);
    });
  });

  describe('Controller instantiation', () => {
    it('should create UserController instance', () => {
      expect(userController).toBeInstanceOf(UserController);
    });

    it('should have access to userService', () => {
      expect(mockUserService).toBeDefined();
    });
  });

  describe('User context handling', () => {
    it('should handle requests with user context', async () => {
      // Arrange
      const userId = 'user-123';
      const { req, res, next } = createMockExpressObjects(userId);

      const mockUserProfile: UserProfile = {
        id: userId,
        email: 'user@example.com',
        name: 'Test User',
        role: 'user',
        preferences: {
          theme: 'light',
          notifications: true,
          language: 'en',
          timezone: 'UTC',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserService.getProfile.mockResolvedValue(mockUserProfile);

      const sendSuccessSpy = jest.spyOn(userController as any, 'sendSuccess').mockImplementation();
      const handleRequestSpy = jest.spyOn(userController as any, 'handleRequest').mockImplementation(async (req: any, res: any, next: any, handler: any) => {
        await handler(req, res, mockT);
      });

      // Act
      await userController.getProfile(req, res, next);

      // Assert
      expect((req as any).user).toBeDefined();
      expect((req as any).user.id).toBe(userId);
      expect(mockUserService.getProfile).toHaveBeenCalledWith(userId);
    });

    it('should handle empty request body for profile updates', async () => {
      // Arrange
      const userId = 'user-123';
      const { req, res, next } = createMockExpressObjects(userId);
      req.body = {}; // Empty update

      const mockUpdatedProfile: UserProfile = {
        id: userId,
        email: 'user@example.com',
        name: 'Test User',
        role: 'user',
        preferences: {
          theme: 'light',
          notifications: true,
          language: 'en',
          timezone: 'UTC',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserService.updateProfile.mockResolvedValue(mockUpdatedProfile);

      const sendSuccessSpy = jest.spyOn(userController as any, 'sendSuccess').mockImplementation();
      const handleRequestSpy = jest.spyOn(userController as any, 'handleRequest').mockImplementation(async (req: any, res: any, next: any, handler: any) => {
        await handler(req, res, mockT);
      });

      // Act
      await userController.updateProfile(req, res, next);

      // Assert
      expect(mockUserService.updateProfile).toHaveBeenCalledWith(userId, {});
      expect(sendSuccessSpy).toHaveBeenCalledWith(res, mockUpdatedProfile, 'mocked_profile_updated', req);
    });
  });
});