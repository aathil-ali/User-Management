import { IAuthService } from '@/interfaces/IAuthService';
import { IUserAuthRepository } from '@/interfaces/IUserAuthRepository';
import { IUserProfileRepository } from '@/interfaces/IUserProfileRepository';
import { RegisterDto } from '@/dto/auth/RegisterDto';
import { LoginDto } from '@/dto/auth/LoginDto';
import { AuthResponseDto } from '@/dto/auth/AuthResponseDto';
import { User, UserWithoutPassword } from '@/entities/User';
import { UserProfile } from '@/entities/UserProfile';
import { EncryptionUtils } from '@/utils/encryption';
import { v4 as uuidv4 } from 'uuid';
import { 
  EmailAlreadyExistsError,
  InvalidCredentialsError,
  UserNotFoundError,
  InvalidRefreshTokenError
} from '@/errors/auth';
import { NotFoundError, InternalServerError } from '@/errors/ApplicationError';
import { ErrorCode } from '@/types/error-codes';

export class AuthService implements IAuthService {
  constructor(
    private userAuthRepository: IUserAuthRepository,
    private userProfileRepository: IUserProfileRepository
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, name } = registerDto;

    // 1. Validate email uniqueness
    const existingUser = await this.userAuthRepository.findByEmail(email);
    if (existingUser) {
      throw new EmailAlreadyExistsError(email);
    }

    // 2. Hash password
    const passwordHash = await EncryptionUtils.hashPassword(password);

    // 3. Create user in auth database (PostgreSQL)
    const userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
      email: email.toLowerCase(),
      passwordHash,
      role: 'user',
      emailVerified: false,
      status: 'active',
      lastLoginAt: undefined
    };

    const newUser = await this.userAuthRepository.create(userData);

    // 4. Create user profile (MongoDB) - Repository handles data structure
    await this.userProfileRepository.create({
      userId: newUser.id,
      name: name.trim(),
      email: email.toLowerCase()
    });

    // 5. Generate JWT tokens
    const accessToken = EncryptionUtils.generateAccessToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role
    });

    const refreshToken = EncryptionUtils.generateRefreshToken({
      id: newUser.id
    });

    // 6. Store refresh token in database (optional - for token rotation)
    // We could implement refresh token storage here if needed

    // 7. Return authentication response
    return {
      accessToken,
      refreshToken,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: name,
        role: newUser.role
      }
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // 1. Find user by email
    const user = await this.userAuthRepository.findByEmail(email.toLowerCase());
    if (!user) {
      throw new UserNotFoundError(email);
    }

    // 2. Verify password
    const isValidPassword = await EncryptionUtils.comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      throw new InvalidCredentialsError();
    }

    // 3. Check account status
    if (user.status !== 'active') {
      throw new InvalidCredentialsError();
    }

    // 4. Get user profile
    const userProfile = await this.userProfileRepository.findByUserId(user.id);
    if (!userProfile) {
      throw new NotFoundError(ErrorCode.USER_PROFILE_NOT_FOUND);
    }

    // 5. Update last login timestamp
    await this.userAuthRepository.updateLastLogin(user.id);

    // 6. Generate JWT tokens
    const accessToken = EncryptionUtils.generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    const refreshToken = EncryptionUtils.generateRefreshToken({
      id: user.id
    });

    // 7. Return authentication response
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: userProfile.profile.displayName,
        role: user.role
      }
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    // 1. Verify and decode refresh token
    // If verification fails, EncryptionUtils will throw an appropriate error
    const payload = EncryptionUtils.verifyRefreshToken(refreshToken);
    
    // 2. Find user to ensure they still exist and are active
    const user = await this.userAuthRepository.findById(payload.id);
    if (!user || user.status !== 'active') {
      throw new InvalidRefreshTokenError();
    }

    // 3. Generate new access token
    const accessToken = EncryptionUtils.generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    return { accessToken };
  }

  async logout(userId: string): Promise<void> {
    try {
      // For a complete logout implementation, you would:
      // 1. Invalidate refresh tokens in the database
      // 2. Add the access token to a blacklist (if using token blacklisting)
      // 3. Clear any session data
      
      // For now, we'll just verify the user exists and is active
      const user = await this.userAuthRepository.findById(userId);
      if (!user) {
        throw new UserNotFoundError();
      }
      
      if (user.status !== 'active') {
        throw new InvalidCredentialsError();
      }
      
      // In a production environment, you might:
      // - Delete refresh tokens for this user
      // - Log the logout event
      // await this.userAuthRepository.deleteRefreshTokensForUser(userId);
      
      // For now, logout is successful if user exists and is active
      return;
    } catch (error) {
      if (error instanceof UserNotFoundError || error instanceof InvalidCredentialsError) {
        throw error;
      }
      throw new InternalServerError(ErrorCode.SYSTEM_INTERNAL_ERROR);
    }
  }
}
