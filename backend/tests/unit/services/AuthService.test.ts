import { AuthService } from '../../../src/services/AuthService';
import { IUserAuthRepository } from '../../../src/interfaces/IUserAuthRepository';
import { IUserProfileRepository } from '../../../src/interfaces/IUserProfileRepository';
import { User } from '../../../src/entities/User';
import { UserProfile } from '../../../src/entities/UserProfile';
import { RegisterDto } from '../../../src/dto/auth/RegisterDto';
import { LoginDto } from '../../../src/dto/auth/LoginDto';
import { EncryptionUtils } from '../../../src/utils/encryption';
import { v4 as uuidv4 } from 'uuid';
import {
  EmailAlreadyExistsError,
  InvalidCredentialsError,
  UserNotFoundError,
  InvalidRefreshTokenError
} from '../../../src/errors';

// Mock external dependencies
jest.mock('../../../src/utils/encryption');
jest.mock('uuid');

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

describe('AuthService', () => {
  let authService: AuthService;
  const mockEncryptionUtils = EncryptionUtils as jest.Mocked<typeof EncryptionUtils>;
  const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Create fresh instance of AuthService with mocked repositories
    authService = new AuthService(mockUserAuthRepository, mockUserProfileRepository);
    
    // Setup common mock implementations
    mockUuidv4.mockReturnValue('mock-uuid-123');
  });

  describe('Service Initialization', () => {
    it('should create AuthService instance', () => {
      expect(authService).toBeInstanceOf(AuthService);
    });

    it('should have access to both repositories', () => {
      expect(mockUserAuthRepository).toBeDefined();
      expect(mockUserProfileRepository).toBeDefined();
    });
  });

  describe('User Registration', () => {
    describe('register', () => {
      it('should register user with valid data', async () => {
        // Arrange
        const registerDto: RegisterDto = {
          email: 'newuser@example.com',
          password: 'SecurePassword123!',
          name: 'New User',
        };

        const hashedPassword = 'hashedSecurePassword123';
        const createdUser: User = {
          id: 'mock-uuid-123',
          email: registerDto.email.toLowerCase(),
          passwordHash: hashedPassword,
          role: 'user',
          emailVerified: false,
          status: 'active',
          lastLoginAt: undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as User;

        const createdProfile: UserProfile = {
          _id: 'profile-uuid-123',
          userId: createdUser.id,
          email: registerDto.email.toLowerCase(),
          profile: {
            firstName: '',
            lastName: '',
            displayName: registerDto.name,
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

        const accessToken = 'mock-access-token';
        const refreshToken = 'mock-refresh-token';

        mockUserAuthRepository.findByEmail.mockResolvedValue(null);
        mockEncryptionUtils.hashPassword.mockResolvedValue(hashedPassword);
        mockUserAuthRepository.create.mockResolvedValue(createdUser);
        mockUserProfileRepository.create.mockResolvedValue(createdProfile);
        mockEncryptionUtils.generateAccessToken.mockReturnValue(accessToken);
        mockEncryptionUtils.generateRefreshToken.mockReturnValue(refreshToken);

        // Act
        const result = await authService.register(registerDto);

        // Assert
        expect(mockUserAuthRepository.findByEmail).toHaveBeenCalledWith(registerDto.email.toLowerCase());
        expect(mockEncryptionUtils.hashPassword).toHaveBeenCalledWith(registerDto.password);
        expect(mockUserAuthRepository.create).toHaveBeenCalledWith({
          email: registerDto.email.toLowerCase(),
          passwordHash: hashedPassword,
          role: 'user',
          emailVerified: false,
          status: 'active',
          lastLoginAt: undefined,
        });
        expect(mockUserProfileRepository.create).toHaveBeenCalledWith({
          userId: createdUser.id,
          name: registerDto.name.trim(),
          email: registerDto.email.toLowerCase(),
        });
        expect(result).toEqual({
          accessToken,
          refreshToken,
          user: {
            id: createdUser.id,
            email: createdUser.email,
            name: registerDto.name,
            role: createdUser.role,
          },
        });
      });

      it('should throw EmailAlreadyExistsError for duplicate email', async () => {
        // Arrange
        const registerDto: RegisterDto = {
          email: 'existing@example.com',
          password: 'SecurePassword123!',
          name: 'Existing User',
        };

        const existingUser: User = {
          id: 'existing-user-123',
          email: registerDto.email,
          role: 'user',
        } as User;

        mockUserAuthRepository.findByEmail.mockResolvedValue(existingUser);

        // Act & Assert
        await expect(authService.register(registerDto)).rejects.toThrow(EmailAlreadyExistsError);
        expect(mockUserAuthRepository.findByEmail).toHaveBeenCalledWith(registerDto.email.toLowerCase());
        expect(mockEncryptionUtils.hashPassword).not.toHaveBeenCalled();
        expect(mockUserAuthRepository.create).not.toHaveBeenCalled();
      });
    });
  });

  describe('User Authentication', () => {
    describe('login', () => {
      it('should authenticate user with valid credentials', async () => {
        // Arrange
        const loginDto: LoginDto = {
          email: 'test@example.com',
          password: 'SecurePassword123!',
        };

        const user: User = {
          id: 'user-123',
          email: loginDto.email.toLowerCase(),
          passwordHash: 'hashedSecurePassword123',
          role: 'user',
          status: 'active',
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as User;

        const userProfile: UserProfile = {
          _id: 'profile-123',
          userId: user.id,
          email: user.email,
          profile: {
            firstName: 'Test',
            lastName: 'User',
            displayName: 'Test User',
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

        const accessToken = 'mock-access-token';
        const refreshToken = 'mock-refresh-token';

        mockUserAuthRepository.findByEmail.mockResolvedValue(user);
        mockEncryptionUtils.comparePassword.mockResolvedValue(true);
        mockUserProfileRepository.findByUserId.mockResolvedValue(userProfile);
        mockUserAuthRepository.updateLastLogin.mockResolvedValue();
        mockEncryptionUtils.generateAccessToken.mockReturnValue(accessToken);
        mockEncryptionUtils.generateRefreshToken.mockReturnValue(refreshToken);

        // Act
        const result = await authService.login(loginDto);

        // Assert
        expect(mockUserAuthRepository.findByEmail).toHaveBeenCalledWith(loginDto.email.toLowerCase());
        expect(mockEncryptionUtils.comparePassword).toHaveBeenCalledWith(loginDto.password, user.passwordHash);
        expect(mockUserProfileRepository.findByUserId).toHaveBeenCalledWith(user.id);
        expect(mockUserAuthRepository.updateLastLogin).toHaveBeenCalledWith(user.id);
        expect(result).toEqual({
          accessToken,
          refreshToken,
          user: {
            id: user.id,
            email: user.email,
            name: userProfile.profile.displayName,
            role: user.role,
          },
        });
      });

      it('should throw UserNotFoundError for non-existent user', async () => {
        // Arrange
        const loginDto: LoginDto = {
          email: 'nonexistent@example.com',
          password: 'SecurePassword123!',
        };

        mockUserAuthRepository.findByEmail.mockResolvedValue(null);

        // Act & Assert
        await expect(authService.login(loginDto)).rejects.toThrow(UserNotFoundError);
        expect(mockUserAuthRepository.findByEmail).toHaveBeenCalledWith(loginDto.email.toLowerCase());
        expect(mockEncryptionUtils.comparePassword).not.toHaveBeenCalled();
      });

      it('should throw InvalidCredentialsError for incorrect password', async () => {
        // Arrange
        const loginDto: LoginDto = {
          email: 'test@example.com',
          password: 'WrongPassword123!',
        };

        const user: User = {
          id: 'user-123',
          email: loginDto.email,
          passwordHash: 'hashedSecurePassword123',
          role: 'user',
          status: 'active',
        } as User;

        mockUserAuthRepository.findByEmail.mockResolvedValue(user);
        mockEncryptionUtils.comparePassword.mockResolvedValue(false);

        // Act & Assert
        await expect(authService.login(loginDto)).rejects.toThrow(InvalidCredentialsError);
        expect(mockUserAuthRepository.findByEmail).toHaveBeenCalledWith(loginDto.email.toLowerCase());
        expect(mockEncryptionUtils.comparePassword).toHaveBeenCalledWith(loginDto.password, user.passwordHash);
      });

      it('should throw InvalidCredentialsError for inactive user', async () => {
        // Arrange
        const loginDto: LoginDto = {
          email: 'inactive@example.com',
          password: 'SecurePassword123!',
        };

        const user: User = {
          id: 'user-123',
          email: loginDto.email,
          passwordHash: 'hashedSecurePassword123',
          role: 'user',
          status: 'inactive', // Inactive user
        } as User;

        mockUserAuthRepository.findByEmail.mockResolvedValue(user);
        mockEncryptionUtils.comparePassword.mockResolvedValue(true);

        // Act & Assert
        await expect(authService.login(loginDto)).rejects.toThrow(InvalidCredentialsError);
        expect(mockUserAuthRepository.findByEmail).toHaveBeenCalledWith(loginDto.email.toLowerCase());
        expect(mockEncryptionUtils.comparePassword).toHaveBeenCalledWith(loginDto.password, user.passwordHash);
      });
    });
  });

  describe('Token Refresh', () => {
    describe('refreshToken', () => {
      it('should refresh valid token', async () => {
        // Arrange
        const refreshToken = 'valid-refresh-token';
        const payload = {
          id: 'user-123',
        };

        const user: User = {
          id: 'user-123',
          email: 'test@example.com',
          role: 'user',
          status: 'active',
        } as User;

        const newAccessToken = 'new-access-token';

        mockEncryptionUtils.verifyRefreshToken.mockReturnValue(payload);
        mockUserAuthRepository.findById.mockResolvedValue(user);
        mockEncryptionUtils.generateAccessToken.mockReturnValue(newAccessToken);

        // Act
        const result = await authService.refreshToken(refreshToken);

        // Assert
        expect(mockEncryptionUtils.verifyRefreshToken).toHaveBeenCalledWith(refreshToken);
        expect(mockUserAuthRepository.findById).toHaveBeenCalledWith(payload.id);
        expect(mockEncryptionUtils.generateAccessToken).toHaveBeenCalledWith({
          id: user.id,
          email: user.email,
          role: user.role,
        });
        expect(result).toEqual({ accessToken: newAccessToken });
      });

      it('should throw InvalidRefreshTokenError for non-existent user', async () => {
        // Arrange
        const refreshToken = 'valid-refresh-token';
        const payload = {
          id: 'non-existent-user',
        };

        mockEncryptionUtils.verifyRefreshToken.mockReturnValue(payload);
        mockUserAuthRepository.findById.mockResolvedValue(null);

        // Act & Assert
        await expect(authService.refreshToken(refreshToken)).rejects.toThrow(InvalidRefreshTokenError);
        expect(mockEncryptionUtils.verifyRefreshToken).toHaveBeenCalledWith(refreshToken);
        expect(mockUserAuthRepository.findById).toHaveBeenCalledWith(payload.id);
      });

      it('should throw InvalidRefreshTokenError for inactive user', async () => {
        // Arrange
        const refreshToken = 'valid-refresh-token';
        const payload = {
          id: 'user-123',
        };

        const user: User = {
          id: 'user-123',
          email: 'test@example.com',
          role: 'user',
          status: 'inactive', // Inactive user
        } as User;

        mockEncryptionUtils.verifyRefreshToken.mockReturnValue(payload);
        mockUserAuthRepository.findById.mockResolvedValue(user);

        // Act & Assert
        await expect(authService.refreshToken(refreshToken)).rejects.toThrow(InvalidRefreshTokenError);
        expect(mockEncryptionUtils.verifyRefreshToken).toHaveBeenCalledWith(refreshToken);
        expect(mockUserAuthRepository.findById).toHaveBeenCalledWith(payload.id);
      });
    });
  });

  describe('User Logout', () => {
    describe('logout', () => {
      it('should logout active user successfully', async () => {
        // Arrange
        const userId = 'user-123';
        const user: User = {
          id: userId,
          email: 'test@example.com',
          role: 'user',
          status: 'active',
        } as User;

        mockUserAuthRepository.findById.mockResolvedValue(user);

        // Act
        await authService.logout(userId);

        // Assert
        expect(mockUserAuthRepository.findById).toHaveBeenCalledWith(userId);
      });

      it('should throw UserNotFoundError for non-existent user', async () => {
        // Arrange
        const userId = 'non-existent-user';
        mockUserAuthRepository.findById.mockResolvedValue(null);

        // Act & Assert
        await expect(authService.logout(userId)).rejects.toThrow(UserNotFoundError);
        expect(mockUserAuthRepository.findById).toHaveBeenCalledWith(userId);
      });

      it('should throw InvalidCredentialsError for inactive user', async () => {
        // Arrange
        const userId = 'user-123';
        const user: User = {
          id: userId,
          email: 'test@example.com',
          role: 'user',
          status: 'inactive',
        } as User;

        mockUserAuthRepository.findById.mockResolvedValue(user);

        // Act & Assert
        await expect(authService.logout(userId)).rejects.toThrow(InvalidCredentialsError);
        expect(mockUserAuthRepository.findById).toHaveBeenCalledWith(userId);
      });
    });
  });
});