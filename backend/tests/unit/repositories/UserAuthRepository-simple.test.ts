import { UserAuthRepository } from '../../../src/repositories/UserAuthRepository';

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
      mockQuery.mockRejectedValue(duplicateError);

      // Act & Assert
      await expect(userAuthRepository.create(userData)).rejects.toThrow('Email already exists');
      expect(mockQuery).toHaveBeenCalledTimes(1);
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

      mockQuery.mockResolvedValue({
        rows: [mockDbRow],
        rowCount: 1,
      });

      // Act
      const result = await userAuthRepository.findById(userId);

      // Assert
      expect(mockQuery).toHaveBeenCalledWith(
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
      mockQuery.mockResolvedValue({
        rows: [],
        rowCount: 0,
      });

      // Act
      const result = await userAuthRepository.findById(userId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should soft delete user successfully', async () => {
      // Arrange
      const userId = 'user-123';
      mockQuery.mockResolvedValue({
        rowCount: 1,
      });

      // Act
      const result = await userAuthRepository.delete(userId);

      // Assert
      expect(result).toBe(true);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users'),
        [userId]
      );
    });

    it('should return false when user not found', async () => {
      // Arrange
      const userId = 'non-existent-user';
      mockQuery.mockResolvedValue({
        rowCount: 0,
      });

      // Act
      const result = await userAuthRepository.delete(userId);

      // Assert
      expect(result).toBe(false);
    });
  });
});