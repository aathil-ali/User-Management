import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthConfig } from '@/config/auth';

export class EncryptionUtils {
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = AuthConfig.getBcryptRounds();
    return bcrypt.hash(password, saltRounds);
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static generateAccessToken(payload: { id: string; email: string; role: string }): string {
    return jwt.sign(payload, AuthConfig.getJwtSecret(), {
      expiresIn: AuthConfig.getJwtExpiry(),
    } as jwt.SignOptions);
  }

  static generateRefreshToken(payload: { id: string }): string {
    return jwt.sign(payload, AuthConfig.getJwtRefreshSecret(), {
      expiresIn: AuthConfig.getJwtRefreshExpiry(),
    } as jwt.SignOptions);
  }

  static verifyAccessToken(token: string): any {
    return jwt.verify(token, AuthConfig.getJwtSecret());
  }

  static verifyRefreshToken(token: string): any {
    return jwt.verify(token, AuthConfig.getJwtRefreshSecret());
  }
}
