import { Pool } from 'pg';
import { UserAuthRepository } from '../../../src/repositories/UserAuthRepository';
import { User } from '../../../src/entities/User';

// Mock the entire pg module
jest.mock('pg', () => {
  const mPool = {
    query: jest.fn(),
    connect: jest.fn(),
    end: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

describe('UserAuthRepository', () => {
  let userAuthRepository: UserAuthRepository;
  let mockQuery: jest.MockedFunction<any>;
  let mockPool: any;

  beforeEach(() => {
    // Create a new mock pool instance
    mockPool = {
      query: jest.fn(),
      connect: jest.fn(),
      end: jest.fn(),
    };
    mockQuery = mockPool.query;
    
    // Create fresh instance of UserAuthRepository with mocked pool
    userAuthRepository = new UserAuthRepository(mockPool);
  });

  describe('create', () => {
    it('should create user successfully', async () => {
      // Arrange
      const userData = {
        email: 'newuser@example.com',
        passwordHash: 'hashedPassword123',
        role: 'user' as const,
        emailVerified: false,
        status: 'active' as const,
        lastLoginAt: undefined,
      };

      const mockDbRow = {
        id: 'user-123',
        email: 'newuser@example.com',
        password_hash: 'hashedPassword123',
        role: 'user',
        email_verified: false,
        status: 'active',
        last_login_at: null,
        created_at: new Date('2023-01-01T00:00:00Z'),
        updated_at: new Date('2023-01-01T00:00:00Z'),
      };

      mockQuery.mockResolvedValue({
        rows: [mockDbRow],
        rowCount: 1,
      });
      // Act
      const result = await userAuthRepository.create(userData);

      // Assert
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        [
          'newuser@example.com',
          'hashedPassword123',
          'user',
          false,
          'active',
          null,
        ]
      );

      expect(result).toEqual({
        id: 'user-123',
        email: 'newuser@example.com',
        passwordHash: 'hashedPassword123',
        role: 'user',
        emailVerified: false,
        status: 'active',
        lastLoginAt: null,
        createdAt: mockDbRow.created_at,
        updatedAt: mockDbRow.updated_at,
      });
    });

    it('should handle duplicate email error', async () => {
      // Arrange
      const userData = {
        email: 'existing@example.com',
        passwordHash: 'hashedPassword123',
        role: 'user' as const,
        emailVerified: false,
        status: 'active' as const,
        lastLoginAt: undefined,
      };

      const duplicateError = new Error('duplicate key value violates unique constraint');
      (duplicateError as any).code = '23505';
      mockPool.query.mockRejectedValue(duplicateError);

      // Act & Assert
      await expect(userAuthRepository.create(userData)).rejects.toThrow('Email already exists');
      expect(mockPool.query).toHaveBeenCalledTimes(1);
    });

    it('should handle other database errors', async () => {
      // Arrange
      const userData = {
        email: 'user@example.com',
        passwordHash: 'hashedPassword123',
        role: 'user' as const,
        emailVerified: false,
        status: 'active' as const,
        lastLoginAt: undefined,
      };

      const databaseError = new Error('Database connection failed');
      mockPool.query.mockRejectedValue(databaseError);

      // Act & Assert
      await expect(userAuthRepository.create(userData)).rejects.toThrow('Failed to create user: Database connection failed');
    });
  });

  describe('findById', () => {
    it('should find user by id successfully', async () => {
      // Arrange
      const userId = 'user-123';
      const mockDbRow = {
        id: 'user-123',
        email: 'user@example.com',
        password_hash: 'hashedPassword123',
        role: 'user',
        email_verified: true,
        status: 'active',
        last_login_at: new Date('2023-01-01T10:00:00Z'),
        created_at: new Date('2023-01-01T00:00:00Z'),
        updated_at: new Date('2023-01-01T10:00:00Z'),
      };

      mockPool.query.mockResolvedValue({
        rows: [mockDbRow],
        rowCount: 1,
      } as any);

      // Act
      const result = await userAuthRepository.findById(userId);

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, email, password_hash'),
        [userId]
      );
      
      expect(result).toEqual({
        id: 'user-123',
        email: 'user@example.com',
        passwordHash: 'hashedPassword123',
        role: 'user',
        emailVerified: true,
        status: 'active',
        lastLoginAt: mockDbRow.last_login_at,
        createdAt: mockDbRow.created_at,
        updatedAt: mockDbRow.updated_at,
      });
    });

    it('should return null when user not found', async () => {
      // Arrange
      const userId = 'non-existent-user';
      mockPool.query.mockResolvedValue({
        rows: [],
        rowCount: 0,
      } as any);

      // Act
      const result = await userAuthRepository.findById(userId);

      // Assert
      expect(result).toBeNull();
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE id = $1 AND status != \'suspended\''),
        [userId]
      );
    });

    it('should handle database errors', async () => {
      // Arrange
      const userId = 'user-123';
      const databaseError = new Error('Database connection failed');
      mockPool.query.mockRejectedValue(databaseError);

      // Act & Assert
      await expect(userAuthRepository.findById(userId)).rejects.toThrow('Failed to find user by id: Database connection failed');
    });
  });

  describe('findByEmail', () => {
    it('should find user by email successfully', async () => {
      // Arrange
      const email = 'User@Example.com'; // Test case sensitivity
      const mockDbRow = {
        id: 'user-123',
        email: 'user@example.com',
        password_hash: 'hashedPassword123',
        role: 'admin',
        email_verified: true,
        status: 'active',
        last_login_at: null,
        created_at: new Date('2023-01-01T00:00:00Z'),
        updated_at: new Date('2023-01-01T00:00:00Z'),
      };

      mockPool.query.mockResolvedValue({
        rows: [mockDbRow],
        rowCount: 1,
      } as any);

      // Act
      const result = await userAuthRepository.findByEmail(email);

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE email = $1'),
        ['user@example.com'] // Should be converted to lowercase
      );
      
      expect(result).toEqual({
        id: 'user-123',
        email: 'user@example.com',
        passwordHash: 'hashedPassword123',
        role: 'admin',
        emailVerified: true,
        status: 'active',
        lastLoginAt: null,
        createdAt: mockDbRow.created_at,
        updatedAt: mockDbRow.updated_at,
      });
    });

    it('should return null when email not found', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      mockPool.query.mockResolvedValue({
        rows: [],
        rowCount: 0,
      } as any);

      // Act
      const result = await userAuthRepository.findByEmail(email);

      // Assert
      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      // Arrange
      const email = 'user@example.com';
      const databaseError = new Error('Database connection failed');
      mockPool.query.mockRejectedValue(databaseError);

      // Act & Assert
      await expect(userAuthRepository.findByEmail(email)).rejects.toThrow('Failed to find user by email: Database connection failed');
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      // Arrange
      const userId = 'user-123';
      const updates = {
        email: 'newemail@example.com',
        status: 'inactive' as const,
        emailVerified: true,
      };

      const mockDbRow = {
        id: 'user-123',
        email: 'newemail@example.com',
        password_hash: 'hashedPassword123',
        role: 'user',
        email_verified: true,
        status: 'inactive',
        last_login_at: null,
        created_at: new Date('2023-01-01T00:00:00Z'),
        updated_at: new Date('2023-01-01T12:00:00Z'),
      };

      mockPool.query.mockResolvedValue({
        rows: [mockDbRow],
        rowCount: 1,
      } as any);

      // Act
      const result = await userAuthRepository.update(userId, updates);

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users'),
        ['newemail@example.com', 'inactive', true, userId]
      );
      
      expect(result).toEqual({
        id: 'user-123',
        email: 'newemail@example.com',
        passwordHash: 'hashedPassword123',
        role: 'user',
        emailVerified: true,
        status: 'inactive',
        lastLoginAt: null,
        createdAt: mockDbRow.created_at,
        updatedAt: mockDbRow.updated_at,
      });
    });

    it('should return unchanged user when no valid updates', async () => {
      // Arrange
      const userId = 'user-123';
      const updates = {
        id: 'should-be-ignored',
        createdAt: new Date(), // Should be ignored
        updatedAt: new Date(), // Should be ignored
      };

      const mockDbRow = {
        id: 'user-123',
        email: 'user@example.com',
        password_hash: 'hashedPassword123',
        role: 'user',
        email_verified: true,
        status: 'active',
        last_login_at: null,
        created_at: new Date('2023-01-01T00:00:00Z'),
        updated_at: new Date('2023-01-01T12:00:00Z'),
      };

      // Mock findById call for returning unchanged user
      mockPool.query.mockResolvedValue({
        rows: [mockDbRow],
        rowCount: 1,
      } as any);

      // Act
      const result = await userAuthRepository.update(userId, updates as any);

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE id = $1'),
        [userId]
      );
    });

    it('should return null when user not found', async () => {
      // Arrange
      const userId = 'non-existent-user';
      const updates = { email: 'new@example.com' };

      mockPool.query.mockResolvedValue({
        rows: [],
        rowCount: 0,
      } as any);

      // Act
      const result = await userAuthRepository.update(userId, updates);

      // Assert
      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      // Arrange
      const userId = 'user-123';
      const updates = { email: 'new@example.com' };
      const databaseError = new Error('Database connection failed');
      mockPool.query.mockRejectedValue(databaseError);

      // Act & Assert
      await expect(userAuthRepository.update(userId, updates)).rejects.toThrow('Failed to update user: Database connection failed');
    });
  });

  describe('delete', () => {
    it('should soft delete user successfully', async () => {
      // Arrange
      const userId = 'user-123';
      mockPool.query.mockResolvedValue({
        rowCount: 1,
      } as any);

      // Act
      const result = await userAuthRepository.delete(userId);

      // Assert
      expect(result).toBe(true);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users'),
        [userId]
      );
    });

    it('should return false when user not found', async () => {
      // Arrange
      const userId = 'non-existent-user';
      mockPool.query.mockResolvedValue({
        rowCount: 0,
      } as any);

      // Act
      const result = await userAuthRepository.delete(userId);

      // Assert
      expect(result).toBe(false);
    });

    it('should handle null rowCount', async () => {
      // Arrange
      const userId = 'user-123';
      mockPool.query.mockResolvedValue({
        rowCount: null,
      } as any);

      // Act
      const result = await userAuthRepository.delete(userId);

      // Assert
      expect(result).toBe(false);
    });

    it('should handle database errors', async () => {
      // Arrange
      const userId = 'user-123';
      const databaseError = new Error('Database connection failed');
      mockPool.query.mockRejectedValue(databaseError);

      // Act & Assert
      await expect(userAuthRepository.delete(userId)).rejects.toThrow('Failed to delete user: Database connection failed');
    });
  });

  describe('findAll', () => {
    it('should find all users with pagination', async () => {
      // Arrange
      const offset = 10;
      const limit = 5;

      const mockCountResult = { rows: [{ count: '25' }] };
      const mockDataRows = [
        {
          id: 'user-1',
          email: 'user1@example.com',
          password_hash: 'hash1',
          role: 'user',
          email_verified: true,
          status: 'active',
          last_login_at: null,
          created_at: new Date('2023-01-01T00:00:00Z'),
          updated_at: new Date('2023-01-01T00:00:00Z'),
        },
        {
          id: 'user-2',
          email: 'user2@example.com',
          password_hash: 'hash2',
          role: 'admin',
          email_verified: true,
          status: 'active',
          last_login_at: new Date('2023-01-01T10:00:00Z'),
          created_at: new Date('2023-01-02T00:00:00Z'),
          updated_at: new Date('2023-01-02T00:00:00Z'),
        },
      ];
      const mockDataResult = { rows: mockDataRows };

      mockPool.query
        .mockResolvedValueOnce(mockCountResult as any)
        .mockResolvedValueOnce(mockDataResult as any);

      // Act
      const result = await userAuthRepository.findAll(offset, limit);

      // Assert
      expect(mockPool.query).toHaveBeenCalledTimes(2);
      expect(mockPool.query).toHaveBeenNthCalledWith(1, 
        expect.stringContaining('SELECT COUNT(*)'),
        ['suspended']
      );
      expect(mockPool.query).toHaveBeenNthCalledWith(2,
        expect.stringContaining('LIMIT $2 OFFSET $3'),
        ['suspended', limit, offset]
      );

      expect(result).toEqual({
        users: [
          {
            id: 'user-1',
            email: 'user1@example.com',
            passwordHash: 'hash1',
            role: 'user',
            emailVerified: true,
            status: 'active',
            lastLoginAt: null,
            createdAt: mockDataRows[0].created_at,
            updatedAt: mockDataRows[0].updated_at,
          },
          {
            id: 'user-2',
            email: 'user2@example.com',
            passwordHash: 'hash2',
            role: 'admin',
            emailVerified: true,
            status: 'active',
            lastLoginAt: mockDataRows[1].last_login_at,
            createdAt: mockDataRows[1].created_at,
            updatedAt: mockDataRows[1].updated_at,
          },
        ],
        total: 25,
      });
    });

    it('should use default pagination values', async () => {
      // Arrange
      const mockCountResult = { rows: [{ count: '0' }] };
      const mockDataResult = { rows: [] };

      mockPool.query
        .mockResolvedValueOnce(mockCountResult as any)
        .mockResolvedValueOnce(mockDataResult as any);

      // Act
      const result = await userAuthRepository.findAll();

      // Assert
      expect(mockPool.query).toHaveBeenNthCalledWith(2,
        expect.stringContaining('LIMIT $2 OFFSET $3'),
        ['suspended', 10, 0] // Default limit=10, offset=0
      );

      expect(result).toEqual({
        users: [],
        total: 0,
      });
    });

    it('should handle database errors', async () => {
      // Arrange
      const databaseError = new Error('Database connection failed');
      mockPool.query.mockRejectedValue(databaseError);

      // Act & Assert
      await expect(userAuthRepository.findAll()).rejects.toThrow('Failed to find all users: Database connection failed');
    });
  });

  describe('emailExists', () => {
    it('should return true when email exists', async () => {
      // Arrange
      const email = 'existing@example.com';
      mockPool.query.mockResolvedValue({
        rows: [{ '?column?': 1 }],
        rowCount: 1,
      } as any);

      // Act
      const result = await userAuthRepository.emailExists(email);

      // Assert
      expect(result).toBe(true);
      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT 1 FROM users WHERE email = $1 LIMIT 1',
        ['existing@example.com']
      );
    });

    it('should return false when email does not exist', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      mockPool.query.mockResolvedValue({
        rows: [],
        rowCount: 0,
      } as any);

      // Act
      const result = await userAuthRepository.emailExists(email);

      // Assert
      expect(result).toBe(false);
    });

    it('should handle database errors', async () => {
      // Arrange
      const email = 'test@example.com';
      const databaseError = new Error('Database connection failed');
      mockPool.query.mockRejectedValue(databaseError);

      // Act & Assert
      await expect(userAuthRepository.emailExists(email)).rejects.toThrow('Failed to check email existence: Database connection failed');
    });
  });

  describe('updateLastLogin', () => {
    it('should update last login successfully', async () => {
      // Arrange
      const userId = 'user-123';
      mockPool.query.mockResolvedValue({
        rowCount: 1,
      } as any);

      // Act
      await userAuthRepository.updateLastLogin(userId);

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SET last_login_at = CURRENT_TIMESTAMP'),
        [userId]
      );
    });

    it('should not throw error on database failure (just warns)', async () => {
      // Arrange
      const userId = 'user-123';
      const databaseError = new Error('Database connection failed');
      mockPool.query.mockRejectedValue(databaseError);

      // Mock console.warn to avoid log output during tests
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Act
      await userAuthRepository.updateLastLogin(userId);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        `Failed to update last login for user ${userId}:`,
        'Database connection failed'
      );

      // Cleanup
      consoleSpy.mockRestore();
    });
  });

  describe('Helper methods', () => {
    it('should map database row to User entity correctly', () => {
      // This tests the private mapRowToUser method indirectly through findById
      // Arrange
      const userId = 'user-123';
      const mockDbRow = {
        id: 'user-123',
        email: 'user@example.com',
        password_hash: 'hashedPassword123',
        role: 'user',
        email_verified: true,
        status: 'active',
        last_login_at: new Date('2023-01-01T10:00:00Z'),
        created_at: new Date('2023-01-01T00:00:00Z'),
        updated_at: new Date('2023-01-01T10:00:00Z'),
      };

      mockPool.query.mockResolvedValue({
        rows: [mockDbRow],
        rowCount: 1,
      } as any);

      // Act & Assert (tested through findById)
      expect(userAuthRepository.findById(userId)).resolves.toEqual({
        id: 'user-123',
        email: 'user@example.com',
        passwordHash: 'hashedPassword123', // snake_case converted to camelCase
        role: 'user',
        emailVerified: true, // snake_case converted to camelCase
        status: 'active',
        lastLoginAt: mockDbRow.last_login_at, // snake_case converted to camelCase
        createdAt: mockDbRow.created_at, // snake_case converted to camelCase
        updatedAt: mockDbRow.updated_at, // snake_case converted to camelCase
      });
    });
  });
});