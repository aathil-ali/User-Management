import { AuthService } from '@/services/AuthService';
import { 
  EmailAlreadyExistsError,
  InvalidCredentialsError,
  UserNotFoundError,
  InvalidRefreshTokenError
} from '@/errors';
import { NotFoundError } from '@/errors';
import { ErrorCode } from '@/types/error-codes';

describe('AuthService Error Handling Architecture', () => {
  let authService: AuthService;
  let mockUserAuthRepository: any;
  let mockUserProfileRepository: any;

  beforeEach(() => {
    // Mock repositories
    mockUserAuthRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      updateLastLogin: jest.fn(),
    };

    mockUserProfileRepository = {
      findByUserId: jest.fn(),
      create: jest.fn(),
    };

    authService = new AuthService(mockUserAuthRepository, mockUserProfileRepository);
  });

  describe('register() method', () => {
    it('should throw EmailAlreadyExistsError for duplicate email', async () => {
      // Setup: Mock existing user
      mockUserAuthRepository.findByEmail.mockResolvedValue({
        id: '123',
        email: 'test@example.com'
      });

      // Test: Should throw specific custom error
      await expect(
        authService.register({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        })
      ).rejects.toThrow(EmailAlreadyExistsError);
    });

    it('should let database errors bubble up naturally', async () => {
      // Setup: Mock database connection error
      const databaseError = new Error('Database connection timeout');
      mockUserAuthRepository.findByEmail.mockRejectedValue(databaseError);

      // Test: Should NOT catch and convert to EmailAlreadyExistsError
      await expect(
        authService.register({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        })
      ).rejects.toThrow('Database connection timeout');

      // Verify the original error type is preserved
      await expect(
        authService.register({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        })
      ).rejects.not.toThrow(EmailAlreadyExistsError);
    });
  });

  describe('login() method', () => {
    it('should throw UserNotFoundError for non-existent user', async () => {
      // Setup: Mock no user found
      mockUserAuthRepository.findByEmail.mockResolvedValue(null);

      // Test: Should throw specific custom error
      await expect(
        authService.login({
          email: 'notfound@example.com',
          password: 'password123'
        })
      ).rejects.toThrow(UserNotFoundError);
    });

    it('should throw InvalidCredentialsError for wrong password', async () => {
      // Setup: Mock user exists but wrong password
      mockUserAuthRepository.findByEmail.mockResolvedValue({
        id: '123',
        email: 'test@example.com',
        passwordHash: 'correct-hash',
        status: 'active'
      });

      // Mock password comparison to fail
      jest.doMock('@/utils/encryption', () => ({
        EncryptionUtils: {
          comparePassword: jest.fn().mockResolvedValue(false)
        }
      }));

      // Test: Should throw specific custom error  
      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'wrong-password'
        })
      ).rejects.toThrow(InvalidCredentialsError);
    });

    it('should throw NotFoundError for missing user profile', async () => {
      // Setup: Mock user exists and password is correct
      mockUserAuthRepository.findByEmail.mockResolvedValue({
        id: '123',
        email: 'test@example.com',
        passwordHash: 'correct-hash',
        status: 'active'
      });

      // Mock user profile not found
      mockUserProfileRepository.findByUserId.mockResolvedValue(null);

      // Mock successful password comparison
      jest.doMock('@/utils/encryption', () => ({
        EncryptionUtils: {
          comparePassword: jest.fn().mockResolvedValue(true)
        }
      }));

      // Test: Should throw NotFoundError with proper error code
      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'correct-password'
        })
      ).rejects.toThrow(NotFoundError);
    });

    it('should let repository errors bubble up', async () => {
      // Setup: Mock repository error
      const repositoryError = new Error('Repository connection failed');
      mockUserAuthRepository.findByEmail.mockRejectedValue(repositoryError);

      // Test: Should NOT catch and convert to different error
      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'password123'
        })
      ).rejects.toThrow('Repository connection failed');
    });
  });

  describe('refreshToken() method - Fixed Architecture', () => {
    it('should throw InvalidRefreshTokenError for inactive user', async () => {
      // Setup: Mock token verification success but inactive user
      jest.doMock('@/utils/encryption', () => ({
        EncryptionUtils: {
          verifyRefreshToken: jest.fn().mockReturnValue({ id: '123' })
        }
      }));

      mockUserAuthRepository.findById.mockResolvedValue({
        id: '123',
        status: 'inactive' // User exists but is inactive
      });

      // Test: Should throw InvalidRefreshTokenError for business logic violation
      await expect(
        authService.refreshToken('valid-token-format')
      ).rejects.toThrow(InvalidRefreshTokenError);
    });

    it('should throw InvalidRefreshTokenError for non-existent user', async () => {
      // Setup: Mock token verification success but user not found
      jest.doMock('@/utils/encryption', () => ({
        EncryptionUtils: {
          verifyRefreshToken: jest.fn().mockReturnValue({ id: '999' })
        }
      }));

      mockUserAuthRepository.findById.mockResolvedValue(null);

      // Test: Should throw InvalidRefreshTokenError for business logic violation
      await expect(
        authService.refreshToken('valid-token-format')
      ).rejects.toThrow(InvalidRefreshTokenError);
    });

    it('should let JWT verification errors bubble up naturally', async () => {
      // Setup: Mock JWT verification to throw specific error
      const jwtError = new Error('JWT signature invalid');
      jest.doMock('@/utils/encryption', () => ({
        EncryptionUtils: {
          verifyRefreshToken: jest.fn().mockImplementation(() => {
            throw jwtError;
          })
        }
      }));

      // Test: Should NOT catch JWT error and mask it as InvalidRefreshTokenError
      // The JWT error should bubble up naturally for proper error categorization
      await expect(
        authService.refreshToken('invalid-jwt-token')
      ).rejects.toThrow('JWT signature invalid');

      // Verify it's not masked as InvalidRefreshTokenError
      await expect(
        authService.refreshToken('invalid-jwt-token')
      ).rejects.not.toThrow(InvalidRefreshTokenError);
    });

    it('should let database errors bubble up naturally', async () => {
      // Setup: Mock JWT verification success but database error
      jest.doMock('@/utils/encryption', () => ({
        EncryptionUtils: {
          verifyRefreshToken: jest.fn().mockReturnValue({ id: '123' })
        }
      }));

      const dbError = new Error('Database connection lost');
      mockUserAuthRepository.findById.mockRejectedValue(dbError);

      // Test: Database errors should NOT be masked as InvalidRefreshTokenError
      await expect(
        authService.refreshToken('valid-jwt-token')
      ).rejects.toThrow('Database connection lost');

      // Verify it's not masked as InvalidRefreshTokenError
      await expect(
        authService.refreshToken('valid-jwt-token')
      ).rejects.not.toThrow(InvalidRefreshTokenError);
    });
  });

  describe('Error Handling Architecture Principles', () => {
    it('should demonstrate error bubbling vs error masking', async () => {
      // This test demonstrates the difference between proper error bubbling
      // and problematic error masking

      const infrastructureError = new Error('Network timeout');
      mockUserAuthRepository.findByEmail.mockRejectedValue(infrastructureError);

      // ✅ GOOD: Let infrastructure errors bubble up
      // This allows proper error categorization and monitoring
      await expect(
        authService.register({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        })
      ).rejects.toThrow('Network timeout');

      // The error should NOT be masked as a business logic error
      await expect(
        authService.register({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        })
      ).rejects.not.toThrow(EmailAlreadyExistsError);
    });

    it('should only throw business logic errors for actual business rule violations', async () => {
      // Setup: Legitimate business rule violation
      mockUserAuthRepository.findByEmail.mockResolvedValue({
        id: '123',
        email: 'test@example.com'
      });

      // Test: Business rule violation should throw business logic error
      await expect(
        authService.register({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        })
      ).rejects.toThrow(EmailAlreadyExistsError);

      // Verify the error has proper context
      try {
        await authService.register({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        });
      } catch (error) {
        expect(error).toBeInstanceOf(EmailAlreadyExistsError);
        expect((error as any).context.details).toEqual({ email: 'test@example.com' });
        expect((error as any).actionable.action).toBe('CHECK_INPUT');
      }
    });
  });
});
