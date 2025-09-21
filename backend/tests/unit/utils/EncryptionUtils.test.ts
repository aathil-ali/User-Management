import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { EncryptionUtils } from '../../../src/utils/encryption';
import { AuthConfig } from '../../../src/config/auth';

// Mock dependencies
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../../../src/config/auth');

const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockJwt = jwt as jest.Mocked<typeof jwt>;
const mockAuthConfig = AuthConfig as jest.Mocked<typeof AuthConfig>;

describe('EncryptionUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks for AuthConfig
    mockAuthConfig.getBcryptRounds.mockReturnValue(12);
    mockAuthConfig.getJwtSecret.mockReturnValue('test-jwt-secret');
    mockAuthConfig.getJwtRefreshSecret.mockReturnValue('test-refresh-secret');
    mockAuthConfig.getJwtExpiry.mockReturnValue('1h');
    mockAuthConfig.getJwtRefreshExpiry.mockReturnValue('7d');
  });

  describe('hashPassword', () => {
    it('should hash password with correct salt rounds', async () => {
      // Arrange
      const password = 'testPassword123';
      const hashedPassword = '$2a$12$hashedPasswordExample';
      
      mockBcrypt.hash.mockResolvedValue(hashedPassword as never);

      // Act
      const result = await EncryptionUtils.hashPassword(password);

      // Assert
      expect(mockAuthConfig.getBcryptRounds).toHaveBeenCalled();
      expect(mockBcrypt.hash).toHaveBeenCalledWith(password, 12);
      expect(result).toBe(hashedPassword);
    });

    it('should handle bcrypt hash errors', async () => {
      // Arrange
      const password = 'testPassword123';
      const error = new Error('Hashing failed');
      
      mockBcrypt.hash.mockRejectedValue(error as never);

      // Act & Assert
      await expect(EncryptionUtils.hashPassword(password)).rejects.toThrow('Hashing failed');
      expect(mockBcrypt.hash).toHaveBeenCalledWith(password, 12);
    });

    it('should use different salt rounds when configured', async () => {
      // Arrange
      const password = 'testPassword123';
      const customRounds = 10;
      const hashedPassword = '$2a$10$hashedPasswordExample';
      
      mockAuthConfig.getBcryptRounds.mockReturnValue(customRounds);
      mockBcrypt.hash.mockResolvedValue(hashedPassword as never);

      // Act
      const result = await EncryptionUtils.hashPassword(password);

      // Assert
      expect(mockBcrypt.hash).toHaveBeenCalledWith(password, customRounds);
      expect(result).toBe(hashedPassword);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching passwords', async () => {
      // Arrange
      const password = 'testPassword123';
      const hashedPassword = '$2a$12$hashedPasswordExample';
      
      mockBcrypt.compare.mockResolvedValue(true as never);

      // Act
      const result = await EncryptionUtils.comparePassword(password, hashedPassword);

      // Assert
      expect(mockBcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(true);
    });

    it('should return false for non-matching passwords', async () => {
      // Arrange
      const password = 'wrongPassword';
      const hashedPassword = '$2a$12$hashedPasswordExample';
      
      mockBcrypt.compare.mockResolvedValue(false as never);

      // Act
      const result = await EncryptionUtils.comparePassword(password, hashedPassword);

      // Assert
      expect(mockBcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(false);
    });

    it('should handle bcrypt compare errors', async () => {
      // Arrange
      const password = 'testPassword123';
      const hashedPassword = '$2a$12$hashedPasswordExample';
      const error = new Error('Comparison failed');
      
      mockBcrypt.compare.mockRejectedValue(error as never);

      // Act & Assert
      await expect(EncryptionUtils.comparePassword(password, hashedPassword)).rejects.toThrow('Comparison failed');
      expect(mockBcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    });
  });

  describe('generateAccessToken', () => {
    it('should generate access token with correct payload and options', () => {
      // Arrange
      const payload = {
        id: 'user-123',
        email: 'user@example.com',
        role: 'user'
      };
      const expectedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mocktoken';
      
      mockJwt.sign.mockReturnValue(expectedToken as never);

      // Act
      const result = EncryptionUtils.generateAccessToken(payload);

      // Assert
      expect(mockAuthConfig.getJwtSecret).toHaveBeenCalled();
      expect(mockAuthConfig.getJwtExpiry).toHaveBeenCalled();
      expect(mockJwt.sign).toHaveBeenCalledWith(
        payload,
        'test-jwt-secret',
        { expiresIn: '1h' }
      );
      expect(result).toBe(expectedToken);
    });

    it('should handle different expiry configurations', () => {
      // Arrange
      const payload = {
        id: 'user-456',
        email: 'admin@example.com',
        role: 'admin'
      };
      const customExpiry = '2h';
      const expectedToken = 'custom.jwt.token';
      
      mockAuthConfig.getJwtExpiry.mockReturnValue(customExpiry);
      mockJwt.sign.mockReturnValue(expectedToken as never);

      // Act
      const result = EncryptionUtils.generateAccessToken(payload);

      // Assert
      expect(mockJwt.sign).toHaveBeenCalledWith(
        payload,
        'test-jwt-secret',
        { expiresIn: customExpiry }
      );
      expect(result).toBe(expectedToken);
    });

    it('should handle JWT signing errors', () => {
      // Arrange
      const payload = {
        id: 'user-123',
        email: 'user@example.com',
        role: 'user'
      };
      const error = new Error('Token generation failed');
      
      mockJwt.sign.mockImplementation(() => {
        throw error;
      });

      // Act & Assert
      expect(() => EncryptionUtils.generateAccessToken(payload)).toThrow('Token generation failed');
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate refresh token with correct payload and options', () => {
      // Arrange
      const payload = { id: 'user-123' };
      const expectedToken = 'refresh.jwt.token';
      
      mockJwt.sign.mockReturnValue(expectedToken as never);

      // Act
      const result = EncryptionUtils.generateRefreshToken(payload);

      // Assert
      expect(mockAuthConfig.getJwtRefreshSecret).toHaveBeenCalled();
      expect(mockAuthConfig.getJwtRefreshExpiry).toHaveBeenCalled();
      expect(mockJwt.sign).toHaveBeenCalledWith(
        payload,
        'test-refresh-secret',
        { expiresIn: '7d' }
      );
      expect(result).toBe(expectedToken);
    });

    it('should handle different refresh expiry configurations', () => {
      // Arrange
      const payload = { id: 'user-789' };
      const customRefreshExpiry = '14d';
      const expectedToken = 'custom.refresh.token';
      
      mockAuthConfig.getJwtRefreshExpiry.mockReturnValue(customRefreshExpiry);
      mockJwt.sign.mockReturnValue(expectedToken as never);

      // Act
      const result = EncryptionUtils.generateRefreshToken(payload);

      // Assert
      expect(mockJwt.sign).toHaveBeenCalledWith(
        payload,
        'test-refresh-secret',
        { expiresIn: customRefreshExpiry }
      );
      expect(result).toBe(expectedToken);
    });

    it('should handle refresh token generation errors', () => {
      // Arrange
      const payload = { id: 'user-123' };
      const error = new Error('Refresh token generation failed');
      
      mockJwt.sign.mockImplementation(() => {
        throw error;
      });

      // Act & Assert
      expect(() => EncryptionUtils.generateRefreshToken(payload)).toThrow('Refresh token generation failed');
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify and return decoded access token', () => {
      // Arrange
      const token = 'valid.jwt.token';
      const decodedPayload = {
        id: 'user-123',
        email: 'user@example.com',
        role: 'user',
        iat: 1234567890,
        exp: 1234571490
      };
      
      mockJwt.verify.mockReturnValue(decodedPayload as never);

      // Act
      const result = EncryptionUtils.verifyAccessToken(token);

      // Assert
      expect(mockAuthConfig.getJwtSecret).toHaveBeenCalled();
      expect(mockJwt.verify).toHaveBeenCalledWith(token, 'test-jwt-secret');
      expect(result).toEqual(decodedPayload);
    });

    it('should handle token verification errors', () => {
      // Arrange
      const token = 'invalid.jwt.token';
      const error = new Error('invalid token');
      
      mockJwt.verify.mockImplementation(() => {
        throw error;
      });

      // Act & Assert
      expect(() => EncryptionUtils.verifyAccessToken(token)).toThrow('invalid token');
      expect(mockJwt.verify).toHaveBeenCalledWith(token, 'test-jwt-secret');
    });

    it('should handle expired token errors', () => {
      // Arrange
      const token = 'expired.jwt.token';
      const error = new Error('jwt expired');
      
      mockJwt.verify.mockImplementation(() => {
        throw error;
      });

      // Act & Assert
      expect(() => EncryptionUtils.verifyAccessToken(token)).toThrow('jwt expired');
      expect(mockJwt.verify).toHaveBeenCalledWith(token, 'test-jwt-secret');
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify and return decoded refresh token', () => {
      // Arrange
      const token = 'valid.refresh.token';
      const decodedPayload = {
        id: 'user-123',
        iat: 1234567890,
        exp: 1235172690
      };
      
      mockJwt.verify.mockReturnValue(decodedPayload as never);

      // Act
      const result = EncryptionUtils.verifyRefreshToken(token);

      // Assert
      expect(mockAuthConfig.getJwtRefreshSecret).toHaveBeenCalled();
      expect(mockJwt.verify).toHaveBeenCalledWith(token, 'test-refresh-secret');
      expect(result).toEqual(decodedPayload);
    });

    it('should handle refresh token verification errors', () => {
      // Arrange
      const token = 'invalid.refresh.token';
      const error = new Error('invalid refresh token');
      
      mockJwt.verify.mockImplementation(() => {
        throw error;
      });

      // Act & Assert
      expect(() => EncryptionUtils.verifyRefreshToken(token)).toThrow('invalid refresh token');
      expect(mockJwt.verify).toHaveBeenCalledWith(token, 'test-refresh-secret');
    });

    it('should handle expired refresh token errors', () => {
      // Arrange
      const token = 'expired.refresh.token';
      const error = new Error('jwt expired');
      
      mockJwt.verify.mockImplementation(() => {
        throw error;
      });

      // Act & Assert
      expect(() => EncryptionUtils.verifyRefreshToken(token)).toThrow('jwt expired');
      expect(mockJwt.verify).toHaveBeenCalledWith(token, 'test-refresh-secret');
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete password flow (hash + compare)', async () => {
      // Arrange
      const password = 'testPassword123';
      const hashedPassword = '$2a$12$hashedPasswordExample';
      
      // Mock hash operation
      mockBcrypt.hash.mockResolvedValueOnce(hashedPassword as never);
      // Mock compare operation
      mockBcrypt.compare.mockResolvedValueOnce(true as never);

      // Act
      const hashed = await EncryptionUtils.hashPassword(password);
      const isMatch = await EncryptionUtils.comparePassword(password, hashed);

      // Assert
      expect(hashed).toBe(hashedPassword);
      expect(isMatch).toBe(true);
      expect(mockBcrypt.hash).toHaveBeenCalledWith(password, 12);
      expect(mockBcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    });

    it('should handle complete token flow (generate + verify)', () => {
      // Arrange
      const payload = {
        id: 'user-123',
        email: 'user@example.com',
        role: 'user'
      };
      const generatedToken = 'generated.jwt.token';
      const decodedPayload = { ...payload, iat: 1234567890, exp: 1234571490 };
      
      // Mock token generation
      mockJwt.sign.mockReturnValueOnce(generatedToken as never);
      // Mock token verification
      mockJwt.verify.mockReturnValueOnce(decodedPayload as never);

      // Act
      const token = EncryptionUtils.generateAccessToken(payload);
      const decoded = EncryptionUtils.verifyAccessToken(token);

      // Assert
      expect(token).toBe(generatedToken);
      expect(decoded).toEqual(decodedPayload);
      expect(mockJwt.sign).toHaveBeenCalledWith(payload, 'test-jwt-secret', { expiresIn: '1h' });
      expect(mockJwt.verify).toHaveBeenCalledWith(generatedToken, 'test-jwt-secret');
    });
  });
});