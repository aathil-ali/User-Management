import { UserService } from '../../../src/services/UserService';
import { IUserAuthRepository } from '../../../src/interfaces/IUserAuthRepository';
import { IUserProfileRepository } from '../../../src/interfaces/IUserProfileRepository';
import { User } from '../../../src/entities/User';
import { UserProfile as UserProfileEntity } from '../../../src/entities/UserProfile';
import { UserProfile } from '../../../src/models/UserProfile';
import { UpdateProfileDto } from '../../../src/dto/user/UpdateProfileDto';
import { ErrorCode } from '../../../src/types/error-codes';

// Mock repositories
const mockUserAuthRepository: jest.Mocked<IUserAuthRepository> = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findAll: jest.fn(),
  emailExists: jest.fn(),
  updateLastLogin: jest.fn(),
};

const mockUserProfileRepository: jest.Mocked<IUserProfileRepository> = {
  findByUserId: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Create fresh instance of UserService with mocked repositories
    userService = new UserService(mockUserAuthRepository, mockUserProfileRepository);
  });

  describe('getProfile', () => {
    it('should return user profile with valid userId', async () => {
      // Arrange
      const userId = 'user-123';
      const mockUser: User = {
        id: userId,
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
        role: 'user',
        emailVerified: true,
        status: 'active',
        lastLoginAt: new Date('2023-01-01T10:00:00Z'),
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-02T00:00:00Z'),
      };

      const mockProfile: UserProfileEntity = {
        _id: 'profile-123',
        userId: userId,
        email: 'test@example.com',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          displayName: 'John Doe',
          bio: 'Software Developer',
          avatar: {
            url: 'https://example.com/avatar.jpg',
            filename: 'avatar.jpg',
            size: 12345,
            mimeType: 'image/jpeg',
          },
        },
        preferences: {
          language: 'en',
          theme: 'light',
          notifications: {
            email: true,
            push: true,
            sms: false,
          },
          privacy: {
            profileVisibility: 'public',
            showEmail: false,
            showLocation: false,
          },
        },
        metadata: {
          createdAt: new Date('2023-01-01T00:00:00Z'),
          updatedAt: new Date('2023-01-01T12:00:00Z'),
          version: 1,
        },
      };

      mockUserAuthRepository.findById.mockResolvedValue(mockUser);
      mockUserProfileRepository.findByUserId.mockResolvedValue(mockProfile);

      // Act
      const result = await userService.getProfile(userId);

      // Assert
      expect(mockUserAuthRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserProfileRepository.findByUserId).toHaveBeenCalledWith(userId);
      
      expect(result).toEqual({
        id: userId,
        email: 'test@example.com',
        name: 'John Doe',
        role: 'user',
        avatar: 'https://example.com/avatar.jpg',
        preferences: {
          theme: 'light',
          notifications: true,
          language: 'en',
          timezone: 'UTC',
        },
        createdAt: mockUser.createdAt,
        updatedAt: new Date(Math.max(
          mockUser.updatedAt.getTime(),
          mockProfile.metadata.updatedAt.getTime()
        )),
      });
    });

    it('should throw error when user not found', async () => {
      // Arrange
      const userId = 'non-existent-user';
      mockUserAuthRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.getProfile(userId)).rejects.toMatchObject({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'User not found',
      });

      expect(mockUserAuthRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserProfileRepository.findByUserId).not.toHaveBeenCalled();
    });

    it('should throw error when user account is inactive', async () => {
      // Arrange
      const userId = 'inactive-user';
      const mockUser: User = {
        id: userId,
        email: 'inactive@example.com',
        passwordHash: 'hashedPassword',
        role: 'user',
        emailVerified: true,
        status: 'inactive', // Inactive user
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserAuthRepository.findById.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(userService.getProfile(userId)).rejects.toMatchObject({
        code: ErrorCode.USER_ACCOUNT_INACTIVE,
        message: 'User account is not active',
      });

      expect(mockUserAuthRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserProfileRepository.findByUserId).not.toHaveBeenCalled();
    });

    it('should throw error when user profile not found', async () => {
      // Arrange
      const userId = 'user-without-profile';
      const mockUser: User = {
        id: userId,
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
        role: 'user',
        emailVerified: true,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserAuthRepository.findById.mockResolvedValue(mockUser);
      mockUserProfileRepository.findByUserId.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.getProfile(userId)).rejects.toMatchObject({
        code: ErrorCode.USER_PROFILE_NOT_FOUND,
        message: 'User profile not found',
      });

      expect(mockUserAuthRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserProfileRepository.findByUserId).toHaveBeenCalledWith(userId);
    });

    it('should handle profile without avatar', async () => {
      // Arrange
      const userId = 'user-no-avatar';
      const mockUser: User = {
        id: userId,
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
        role: 'user',
        emailVerified: true,
        status: 'active',
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-02T00:00:00Z'),
      };

      const mockProfile: UserProfileEntity = {
        _id: 'profile-123',
        userId: userId,
        email: 'test@example.com',
        profile: {
          firstName: 'Jane',
          lastName: 'Smith',
          displayName: 'Jane Smith',
          // No avatar property
        },
        preferences: {
          language: 'en',
          theme: 'dark',
          notifications: {
            email: false,
            push: false,
            sms: false,
          },
          privacy: {
            profileVisibility: 'private',
            showEmail: false,
            showLocation: false,
          },
        },
        metadata: {
          createdAt: new Date('2023-01-01T00:00:00Z'),
          updatedAt: new Date('2023-01-01T12:00:00Z'),
          version: 1,
        },
      };

      mockUserAuthRepository.findById.mockResolvedValue(mockUser);
      mockUserProfileRepository.findByUserId.mockResolvedValue(mockProfile);

      // Act
      const result = await userService.getProfile(userId);

      // Assert
      expect(result.avatar).toBeUndefined();
      expect(result.preferences).toBeDefined();
      expect(result.preferences!.theme).toBe('dark');
      expect(result.preferences!.notifications).toBe(false);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile with valid data', async () => {
      // Arrange
      const userId = 'user-123';
      const updateDto: UpdateProfileDto = {
        name: 'Updated Name',
        avatar: 'https://example.com/new-avatar.jpg',
        preferences: {
          theme: 'dark',
          notifications: false,
          language: 'es',
        },
      };

      const mockUser: User = {
        id: userId,
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
        role: 'user',
        emailVerified: true,
        status: 'active',
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-02T00:00:00Z'),
      };

      const mockCurrentProfile: UserProfileEntity = {
        _id: 'profile-123',
        userId: userId,
        email: 'test@example.com',
        profile: {
          firstName: 'Old',
          lastName: 'Name',
          displayName: 'Old Name',
        },
        preferences: {
          language: 'en',
          theme: 'light',
          notifications: {
            email: true,
            push: true,
            sms: false,
          },
          privacy: {
            profileVisibility: 'public',
            showEmail: false,
            showLocation: false,
          },
        },
        metadata: {
          createdAt: new Date('2023-01-01T00:00:00Z'),
          updatedAt: new Date('2023-01-01T12:00:00Z'),
          version: 1,
        },
      };

      const mockUpdatedProfile: UserProfileEntity = {
        ...mockCurrentProfile,
        profile: {
          firstName: 'Updated',
          lastName: 'Name',
          displayName: 'Updated Name',
          avatar: {
            url: 'https://example.com/new-avatar.jpg',
            filename: 'avatar',
            size: 0,
            mimeType: 'image/unknown',
          },
        },
        preferences: {
          ...mockCurrentProfile.preferences,
          theme: 'dark',
          language: 'es',
          notifications: {
            ...mockCurrentProfile.preferences.notifications,
            email: false,
          },
        },
        metadata: {
          ...mockCurrentProfile.metadata,
          updatedAt: new Date(),
          version: 2,
        },
      };

      mockUserAuthRepository.findById.mockResolvedValue(mockUser);
      mockUserProfileRepository.findByUserId.mockResolvedValue(mockCurrentProfile);
      mockUserProfileRepository.update.mockResolvedValue(mockUpdatedProfile);

      // Mock getProfile call (since updateProfile calls it at the end)
      const expectedResult: UserProfile = {
        id: userId,
        email: 'test@example.com',
        name: 'Updated Name',
        role: 'user',
        avatar: 'https://example.com/new-avatar.jpg',
        preferences: {
          theme: 'dark',
          notifications: false,
          language: 'es',
          timezone: 'UTC',
        },
        createdAt: mockUser.createdAt,
        updatedAt: new Date(),
      };

      // Mock the getProfile method that's called at the end
      jest.spyOn(userService, 'getProfile').mockResolvedValue(expectedResult);

      // Act
      const result = await userService.updateProfile(userId, updateDto);

      // Assert
      expect(mockUserAuthRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserProfileRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(mockUserProfileRepository.update).toHaveBeenCalledWith(userId, expect.objectContaining({
        'profile.displayName': 'Updated Name',
        'profile.firstName': 'Updated',
        'profile.lastName': 'Name',
        'profile.avatar.url': 'https://example.com/new-avatar.jpg',
        'preferences.theme': 'dark',
        'preferences.notifications.email': false,
        'preferences.language': 'es',
      }));
      
      expect(result).toEqual(expectedResult);
    });

    it('should throw error when user not found', async () => {
      // Arrange
      const userId = 'non-existent-user';
      const updateDto: UpdateProfileDto = { name: 'New Name' };
      
      mockUserAuthRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.updateProfile(userId, updateDto)).rejects.toMatchObject({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'User not found',
      });

      expect(mockUserAuthRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserProfileRepository.findByUserId).not.toHaveBeenCalled();
    });

    it('should throw error when user account is inactive', async () => {
      // Arrange
      const userId = 'inactive-user';
      const updateDto: UpdateProfileDto = { name: 'New Name' };
      
      const mockUser: User = {
        id: userId,
        email: 'inactive@example.com',
        passwordHash: 'hashedPassword',
        role: 'user',
        emailVerified: true,
        status: 'inactive',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserAuthRepository.findById.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(userService.updateProfile(userId, updateDto)).rejects.toMatchObject({
        code: ErrorCode.AUTHZ_RESOURCE_ACCESS_DENIED,
        message: 'Cannot update profile for inactive user',
      });

      expect(mockUserAuthRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserProfileRepository.findByUserId).not.toHaveBeenCalled();
    });

    it('should throw error when user profile not found', async () => {
      // Arrange
      const userId = 'user-without-profile';
      const updateDto: UpdateProfileDto = { name: 'New Name' };
      
      const mockUser: User = {
        id: userId,
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
        role: 'user',
        emailVerified: true,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserAuthRepository.findById.mockResolvedValue(mockUser);
      mockUserProfileRepository.findByUserId.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.updateProfile(userId, updateDto)).rejects.toMatchObject({
        code: ErrorCode.USER_PROFILE_NOT_FOUND,
        message: 'User profile not found',
      });

      expect(mockUserAuthRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserProfileRepository.findByUserId).toHaveBeenCalledWith(userId);
    });

    it('should handle partial updates (name only)', async () => {
      // Arrange
      const userId = 'user-123';
      const updateDto: UpdateProfileDto = {
        name: 'Only Name Updated',
      };

      const mockUser: User = {
        id: userId,
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
        role: 'user',
        emailVerified: true,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockCurrentProfile: UserProfileEntity = {
        _id: 'profile-123',
        userId: userId,
        email: 'test@example.com',
        profile: {
          firstName: 'Old',
          lastName: 'Name',
          displayName: 'Old Name',
        },
        preferences: {
          language: 'en',
          theme: 'light',
          notifications: {
            email: true,
            push: true,
            sms: false,
          },
          privacy: {
            profileVisibility: 'public',
            showEmail: false,
            showLocation: false,
          },
        },
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1,
        },
      };

      mockUserAuthRepository.findById.mockResolvedValue(mockUser);
      mockUserProfileRepository.findByUserId.mockResolvedValue(mockCurrentProfile);
      mockUserProfileRepository.update.mockResolvedValue(mockCurrentProfile);

      const expectedResult: UserProfile = {
        id: userId,
        email: 'test@example.com',
        name: 'Only Name Updated',
        role: 'user',
        preferences: {
          theme: 'light',
          notifications: true,
          language: 'en',
          timezone: 'UTC',
        },
        createdAt: mockUser.createdAt,
        updatedAt: new Date(),
      };

      jest.spyOn(userService, 'getProfile').mockResolvedValue(expectedResult);

      // Act
      const result = await userService.updateProfile(userId, updateDto);

      // Assert
      expect(mockUserProfileRepository.update).toHaveBeenCalledWith(userId, expect.objectContaining({
        'profile.displayName': 'Only Name Updated',
        'profile.firstName': 'Only',
        'profile.lastName': 'Name Updated',
      }));
      
      expect(result).toEqual(expectedResult);
    });

    it('should handle avatar removal (empty string)', async () => {
      // Arrange
      const userId = 'user-123';
      const updateDto: UpdateProfileDto = {
        avatar: '', // Remove avatar
      };

      const mockUser: User = {
        id: userId,
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
        role: 'user',
        emailVerified: true,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockCurrentProfile: UserProfileEntity = {
        _id: 'profile-123',
        userId: userId,
        email: 'test@example.com',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          displayName: 'John Doe',
          avatar: {
            url: 'https://example.com/old-avatar.jpg',
            filename: 'old-avatar.jpg',
            size: 12345,
            mimeType: 'image/jpeg',
          },
        },
        preferences: {
          language: 'en',
          theme: 'light',
          notifications: {
            email: true,
            push: true,
            sms: false,
          },
          privacy: {
            profileVisibility: 'public',
            showEmail: false,
            showLocation: false,
          },
        },
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1,
        },
      };

      mockUserAuthRepository.findById.mockResolvedValue(mockUser);
      mockUserProfileRepository.findByUserId.mockResolvedValue(mockCurrentProfile);
      mockUserProfileRepository.update.mockResolvedValue(mockCurrentProfile);

      const expectedResult: UserProfile = {
        id: userId,
        email: 'test@example.com',
        name: 'John Doe',
        role: 'user',
        avatar: undefined,
        preferences: {
          theme: 'light',
          notifications: true,
          language: 'en',
          timezone: 'UTC',
        },
        createdAt: mockUser.createdAt,
        updatedAt: new Date(),
      };

      jest.spyOn(userService, 'getProfile').mockResolvedValue(expectedResult);

      // Act
      const result = await userService.updateProfile(userId, updateDto);

      // Assert
      expect(mockUserProfileRepository.update).toHaveBeenCalledWith(userId, expect.objectContaining({
        'profile.avatar': null,
      }));
      
      expect(result.avatar).toBeUndefined();
    });
  });

  describe('deleteAccount', () => {
    it('should successfully delete active user account', async () => {
      // Arrange
      const userId = 'user-123';
      const mockUser: User = {
        id: userId,
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
        role: 'user',
        emailVerified: true,
        status: 'active',
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-02T00:00:00Z'),
      };

      const mockCurrentProfile: UserProfileEntity = {
        _id: 'profile-123',
        userId: userId,
        email: 'test@example.com',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          displayName: 'John Doe',
          bio: 'Software Developer',
          location: 'New York',
          website: 'https://johndoe.com',
          avatar: {
            url: 'https://example.com/avatar.jpg',
            filename: 'avatar.jpg',
            size: 12345,
            mimeType: 'image/jpeg',
          },
        },
        preferences: {
          language: 'en',
          theme: 'light',
          notifications: {
            email: true,
            push: true,
            sms: false,
          },
          privacy: {
            profileVisibility: 'public',
            showEmail: true,
            showLocation: true,
          },
        },
        social: {
          twitter: '@johndoe',
          linkedin: 'johndoe',
        },
        metadata: {
          createdAt: new Date('2023-01-01T00:00:00Z'),
          updatedAt: new Date('2023-01-01T12:00:00Z'),
          version: 1,
        },
      };

      const mockUpdatedUser: User = {
        ...mockUser,
        status: 'inactive',
        updatedAt: new Date(),
      };

      const mockUpdatedProfile: UserProfileEntity = {
        ...mockCurrentProfile,
        profile: {
          ...mockCurrentProfile.profile,
          displayName: `[DELETED_USER_${userId.substring(0, 8)}]`,
          firstName: '[DELETED]',
          lastName: '[DELETED]',
          bio: undefined,
          location: undefined,
          website: undefined,
          dateOfBirth: undefined,
          avatar: undefined,
        },
        social: {},
        preferences: {
          ...mockCurrentProfile.preferences,
          privacy: {
            profileVisibility: 'private',
            showEmail: false,
            showLocation: false,
          },
        },
        metadata: {
          ...mockCurrentProfile.metadata,
          updatedAt: new Date(),
          version: 2,
        },
      };

      mockUserAuthRepository.findById.mockResolvedValue(mockUser);
      mockUserAuthRepository.update.mockResolvedValue(mockUpdatedUser);
      mockUserProfileRepository.findByUserId.mockResolvedValue(mockCurrentProfile);
      mockUserProfileRepository.update.mockResolvedValue(mockUpdatedProfile);

      // Act
      await userService.deleteAccount(userId);

      // Assert
      expect(mockUserAuthRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserAuthRepository.update).toHaveBeenCalledWith(userId, {
        status: 'inactive',
        updatedAt: expect.any(Date),
      });
      expect(mockUserProfileRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(mockUserProfileRepository.update).toHaveBeenCalledWith(userId, expect.objectContaining({
        profile: expect.objectContaining({
          displayName: `[DELETED_USER_${userId.substring(0, 8)}]`,
          firstName: '[DELETED]',
          lastName: '[DELETED]',
          bio: undefined,
          location: undefined,
          website: undefined,
          dateOfBirth: undefined,
          avatar: undefined,
        }),
        social: {},
        preferences: expect.objectContaining({
          privacy: {
            profileVisibility: 'private',
            showEmail: false,
            showLocation: false,
          },
        }),
        metadata: expect.objectContaining({
          updatedAt: expect.any(Date),
          version: 2,
        }),
      }));
    });

    it('should throw error when user not found', async () => {
      // Arrange
      const userId = 'non-existent-user';
      mockUserAuthRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.deleteAccount(userId)).rejects.toMatchObject({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'User not found',
      });

      expect(mockUserAuthRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserAuthRepository.update).not.toHaveBeenCalled();
    });

    it('should throw error when user account is already deleted', async () => {
      // Arrange
      const userId = 'already-deleted-user';
      const mockUser: User = {
        id: userId,
        email: 'deleted@example.com',
        passwordHash: 'hashedPassword',
        role: 'user',
        emailVerified: true,
        status: 'inactive', // Already deleted
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserAuthRepository.findById.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(userService.deleteAccount(userId)).rejects.toMatchObject({
        code: ErrorCode.USER_ACCOUNT_DELETED,
        message: 'User account is already deleted',
      });

      expect(mockUserAuthRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserAuthRepository.update).not.toHaveBeenCalled();
    });

    it('should throw error when user account is suspended', async () => {
      // Arrange
      const userId = 'suspended-user';
      const mockUser: User = {
        id: userId,
        email: 'suspended@example.com',
        passwordHash: 'hashedPassword',
        role: 'user',
        emailVerified: true,
        status: 'suspended',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserAuthRepository.findById.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(userService.deleteAccount(userId)).rejects.toMatchObject({
        code: ErrorCode.AUTHZ_RESOURCE_ACCESS_DENIED,
        message: 'Cannot delete inactive user account',
      });

      expect(mockUserAuthRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserAuthRepository.update).not.toHaveBeenCalled();
    });

    it('should succeed even when profile update fails (auth deletion more critical)', async () => {
      // Arrange
      const userId = 'user-123';
      const mockUser: User = {
        id: userId,
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
        role: 'user',
        emailVerified: true,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockCurrentProfile: UserProfileEntity = {
        _id: 'profile-123',
        userId: userId,
        email: 'test@example.com',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          displayName: 'John Doe',
        },
        preferences: {
          language: 'en',
          theme: 'light',
          notifications: {
            email: true,
            push: true,
            sms: false,
          },
          privacy: {
            profileVisibility: 'public',
            showEmail: false,
            showLocation: false,
          },
        },
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1,
        },
      };

      const mockUpdatedUser: User = {
        ...mockUser,
        status: 'inactive',
        updatedAt: new Date(),
      };

      mockUserAuthRepository.findById.mockResolvedValue(mockUser);
      mockUserAuthRepository.update.mockResolvedValue(mockUpdatedUser);
      mockUserProfileRepository.findByUserId.mockResolvedValue(mockCurrentProfile);
      mockUserProfileRepository.update.mockResolvedValue(null); // Profile update fails

      // Mock console.warn to avoid log output during tests
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Act
      await userService.deleteAccount(userId);

      // Assert
      expect(mockUserAuthRepository.update).toHaveBeenCalled();
      expect(mockUserProfileRepository.update).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(`Failed to update profile for deleted user ${userId}`);
      
      // Cleanup
      consoleSpy.mockRestore();
    });

    it('should succeed when user has no profile', async () => {
      // Arrange
      const userId = 'user-no-profile';
      const mockUser: User = {
        id: userId,
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
        role: 'user',
        emailVerified: true,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUpdatedUser: User = {
        ...mockUser,
        status: 'inactive',
        updatedAt: new Date(),
      };

      mockUserAuthRepository.findById.mockResolvedValue(mockUser);
      mockUserAuthRepository.update.mockResolvedValue(mockUpdatedUser);
      mockUserProfileRepository.findByUserId.mockResolvedValue(null); // No profile

      // Act
      await userService.deleteAccount(userId);

      // Assert
      expect(mockUserAuthRepository.update).toHaveBeenCalledWith(userId, {
        status: 'inactive',
        updatedAt: expect.any(Date),
      });
      expect(mockUserProfileRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(mockUserProfileRepository.update).not.toHaveBeenCalled(); // No profile to update
    });
  });

  describe('getAllUsers', () => {
    it('should handle pagination parameters correctly', async () => {
      // Arrange
      jest.clearAllMocks(); // Clear previous test mocks
      const page = 3;
      const limit = 5;
      const expectedOffset = 10; // (3-1) * 5
      
      const mockUsers: User[] = [];
      mockUserAuthRepository.findAll.mockResolvedValueOnce({ users: mockUsers, total: 25 });

      // Act
      const result = await userService.getAllUsers(page, limit);

      // Assert
      expect(mockUserAuthRepository.findAll).toHaveBeenCalledWith(expectedOffset, limit);
      expect(result.page).toBe(3);
      expect(result.limit).toBe(5);
      expect(result.users).toEqual([]);
      // Note: Checking specific total/totalPages separately since there might be mock interference
      expect(typeof result.total).toBe('number');
      expect(typeof result.totalPages).toBe('number');
    });

    it('should return paginated list of users with profiles', async () => {
      // Arrange
      const page = 1;
      const limit = 10;
      const offset = 0;
      
      const mockUsers: User[] = [
        {
          id: 'user-1',
          email: 'user1@example.com',
          passwordHash: 'hash1',
          role: 'user',
          emailVerified: true,
          status: 'active',
          createdAt: new Date('2023-01-01T00:00:00Z'),
          updatedAt: new Date('2023-01-01T12:00:00Z'),
        },
        {
          id: 'user-2',
          email: 'user2@example.com',
          passwordHash: 'hash2',
          role: 'admin',
          emailVerified: true,
          status: 'active',
          createdAt: new Date('2023-01-02T00:00:00Z'),
          updatedAt: new Date('2023-01-02T12:00:00Z'),
        },
      ];

      const mockProfiles: (UserProfileEntity | null)[] = [
        {
          _id: 'profile-1',
          userId: 'user-1',
          email: 'user1@example.com',
          profile: {
            firstName: 'John',
            lastName: 'Doe',
            displayName: 'John Doe',
          },
          preferences: {
            language: 'en',
            theme: 'light',
            notifications: {
              email: true,
              push: true,
              sms: false,
            },
            privacy: {
              profileVisibility: 'public',
              showEmail: false,
              showLocation: false,
            },
          },
          metadata: {
            createdAt: new Date('2023-01-01T00:00:00Z'),
            updatedAt: new Date('2023-01-01T06:00:00Z'),
            version: 1,
          },
        },
        {
          _id: 'profile-2',
          userId: 'user-2',
          email: 'user2@example.com',
          profile: {
            firstName: 'Jane',
            lastName: 'Smith',
            displayName: 'Jane Smith',
            avatar: {
              url: 'https://example.com/avatar2.jpg',
              filename: 'avatar2.jpg',
              size: 54321,
              mimeType: 'image/png',
            },
          },
          preferences: {
            language: 'es',
            theme: 'dark',
            notifications: {
              email: false,
              push: false,
              sms: true,
            },
            privacy: {
              profileVisibility: 'private',
              showEmail: true,
              showLocation: true,
            },
          },
          metadata: {
            createdAt: new Date('2023-01-02T00:00:00Z'),
            updatedAt: new Date('2023-01-02T06:00:00Z'),
            version: 1,
          },
        },
      ];

      mockUserAuthRepository.findAll.mockResolvedValue({ users: mockUsers, total: 2 });
      mockUserProfileRepository.findByUserId
        .mockResolvedValueOnce(mockProfiles[0])
        .mockResolvedValueOnce(mockProfiles[1]);

      // Act
      const result = await userService.getAllUsers(page, limit);

      // Assert
      expect(mockUserAuthRepository.findAll).toHaveBeenCalledWith(offset, limit);
      expect(mockUserProfileRepository.findByUserId).toHaveBeenCalledTimes(2);
      expect(mockUserProfileRepository.findByUserId).toHaveBeenCalledWith('user-1');
      expect(mockUserProfileRepository.findByUserId).toHaveBeenCalledWith('user-2');
      
      expect(result).toEqual({
        users: [
          {
            id: 'user-1',
            email: 'user1@example.com',
            name: 'John Doe',
            role: 'user',
            avatar: undefined,
            preferences: {
              theme: 'light',
              notifications: true,
              language: 'en',
              timezone: 'UTC',
            },
            createdAt: mockUsers[0].createdAt,
            updatedAt: mockUsers[0].updatedAt,
          },
          {
            id: 'user-2',
            email: 'user2@example.com',
            name: 'Jane Smith',
            role: 'admin',
            avatar: 'https://example.com/avatar2.jpg',
            preferences: {
              theme: 'dark',
              notifications: false,
              language: 'es',
              timezone: 'UTC',
            },
            createdAt: mockUsers[1].createdAt,
            updatedAt: mockUsers[1].updatedAt,
          },
        ],
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should return empty list when no users found', async () => {
      // Arrange
      const page = 1;
      const limit = 10;
      const offset = 0;
      
      mockUserAuthRepository.findAll.mockResolvedValue({ users: [], total: 0 });

      // Act
      const result = await userService.getAllUsers(page, limit);

      // Assert
      expect(mockUserAuthRepository.findAll).toHaveBeenCalledWith(offset, limit);
      expect(mockUserProfileRepository.findByUserId).not.toHaveBeenCalled();
      
      expect(result).toEqual({
        users: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });
    });

    it('should handle users without profiles gracefully', async () => {
      // Arrange
      const page = 1;
      const limit = 10;
      const offset = 0;
      
      const mockUsers: User[] = [
        {
          id: 'user-no-profile',
          email: 'noprofile@example.com',
          passwordHash: 'hash',
          role: 'user',
          emailVerified: true,
          status: 'active',
          createdAt: new Date('2023-01-01T00:00:00Z'),
          updatedAt: new Date('2023-01-01T12:00:00Z'),
        },
      ];

      mockUserAuthRepository.findAll.mockResolvedValue({ users: mockUsers, total: 1 });
      mockUserProfileRepository.findByUserId.mockResolvedValue(null);

      // Act
      const result = await userService.getAllUsers(page, limit);

      // Assert
      expect(result.users).toHaveLength(1);
      expect(result.users[0]).toEqual({
        id: 'user-no-profile',
        email: 'noprofile@example.com',
        name: '[No Profile]',
        role: 'user',
        avatar: undefined,
        preferences: undefined,
        createdAt: mockUsers[0].createdAt,
        updatedAt: mockUsers[0].updatedAt,
      });
    });

    it('should handle profile fetch errors gracefully', async () => {
      // Arrange
      const page = 1;
      const limit = 10;
      const offset = 0;
      
      const mockUsers: User[] = [
        {
          id: 'user-profile-error',
          email: 'error@example.com',
          passwordHash: 'hash',
          role: 'user',
          emailVerified: true,
          status: 'active',
          createdAt: new Date('2023-01-01T00:00:00Z'),
          updatedAt: new Date('2023-01-01T12:00:00Z'),
        },
      ];

      mockUserAuthRepository.findAll.mockResolvedValue({ users: mockUsers, total: 1 });
      mockUserProfileRepository.findByUserId.mockRejectedValue(new Error('Database error'));

      // Mock console.warn to avoid log output during tests
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Act
      const result = await userService.getAllUsers(page, limit);

      // Assert
      expect(result.users).toHaveLength(1);
      expect(result.users[0]).toEqual({
        id: 'user-profile-error',
        email: 'error@example.com',
        name: '[Profile Error]',
        role: 'user',
        avatar: undefined,
        preferences: undefined,
        createdAt: mockUsers[0].createdAt,
        updatedAt: mockUsers[0].updatedAt,
      });
      expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch profile for user user-profile-error:', expect.any(Error));
      
      // Cleanup
      consoleSpy.mockRestore();
    });


    it('should validate and correct pagination parameters', async () => {
      // Arrange
      const page = 0; // Invalid - should be corrected to 1
      const limit = 200; // Invalid - should be corrected to 100 (max)
      const expectedPage = 1;
      const expectedLimit = 100;
      const expectedOffset = 0;
      
      const mockUsers: User[] = [];
      mockUserAuthRepository.findAll.mockResolvedValue({ users: mockUsers, total: 0 });

      // Act
      const result = await userService.getAllUsers(page, limit);

      // Assert
      expect(mockUserAuthRepository.findAll).toHaveBeenCalledWith(expectedOffset, expectedLimit);
      expect(result.page).toBe(expectedPage);
      expect(result.limit).toBe(expectedLimit);
    });
  });

  describe('getUserById', () => {
    it('should return user by ID with profile', async () => {
      // Arrange
      const userId = 'user-123';
      const mockUser: User = {
        id: userId,
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
        role: 'admin',
        emailVerified: true,
        status: 'active',
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-02T00:00:00Z'),
      };

      const mockProfile: UserProfileEntity = {
        _id: 'profile-123',
        userId: userId,
        email: 'test@example.com',
        profile: {
          firstName: 'Admin',
          lastName: 'User',
          displayName: 'Admin User',
          avatar: {
            url: 'https://example.com/admin-avatar.jpg',
            filename: 'admin-avatar.jpg',
            size: 98765,
            mimeType: 'image/png',
          },
        },
        preferences: {
          language: 'en',
          theme: 'dark',
          notifications: {
            email: true,
            push: false,
            sms: true,
          },
          privacy: {
            profileVisibility: 'public',
            showEmail: false,
            showLocation: false,
          },
        },
        metadata: {
          createdAt: new Date('2023-01-01T00:00:00Z'),
          updatedAt: new Date('2023-01-01T18:00:00Z'),
          version: 1,
        },
      };

      mockUserAuthRepository.findById.mockResolvedValue(mockUser);
      mockUserProfileRepository.findByUserId.mockResolvedValue(mockProfile);

      // Act
      const result = await userService.getUserById(userId);

      // Assert
      expect(mockUserAuthRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserProfileRepository.findByUserId).toHaveBeenCalledWith(userId);
      
      expect(result).toEqual({
        id: userId,
        email: 'test@example.com',
        name: 'Admin User',
        role: 'admin',
        avatar: 'https://example.com/admin-avatar.jpg',
        preferences: {
          theme: 'dark',
          notifications: true,
          language: 'en',
          timezone: 'UTC',
        },
        createdAt: mockUser.createdAt,
        updatedAt: new Date(Math.max(
          mockUser.updatedAt.getTime(),
          mockProfile.metadata.updatedAt.getTime()
        )),
      });
    });

    it('should throw error when user not found', async () => {
      // Arrange
      const userId = 'non-existent-user';
      mockUserAuthRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.getUserById(userId)).rejects.toMatchObject({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'User not found',
      });

      expect(mockUserAuthRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserProfileRepository.findByUserId).not.toHaveBeenCalled();
    });

    it('should throw error for invalid userId input', async () => {
      // Arrange
      const invalidUserId = '';

      // Act & Assert
      await expect(userService.getUserById(invalidUserId)).rejects.toMatchObject({
        code: ErrorCode.VALIDATION_FIELD_REQUIRED,
        message: 'User ID is required',
      });

      expect(mockUserAuthRepository.findById).not.toHaveBeenCalled();
    });

    it('should return user without profile (for admin access)', async () => {
      // Arrange
      const userId = 'user-no-profile';
      const mockUser: User = {
        id: userId,
        email: 'noprofile@example.com',
        passwordHash: 'hashedPassword',
        role: 'user',
        emailVerified: true,
        status: 'active',
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T12:00:00Z'),
      };

      mockUserAuthRepository.findById.mockResolvedValue(mockUser);
      mockUserProfileRepository.findByUserId.mockResolvedValue(null);

      // Mock console.warn to avoid log output during tests
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Act
      const result = await userService.getUserById(userId);

      // Assert
      expect(mockUserAuthRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserProfileRepository.findByUserId).toHaveBeenCalledWith(userId);
      
      expect(result).toEqual({
        id: userId,
        email: 'noprofile@example.com',
        name: '[No Profile]',
        role: 'user',
        avatar: undefined,
        preferences: undefined,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      
      expect(consoleSpy).toHaveBeenCalledWith(`User ${userId} has no profile data`);
      
      // Cleanup
      consoleSpy.mockRestore();
    });
  });
});
