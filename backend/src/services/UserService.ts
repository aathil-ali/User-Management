import { IUserService } from '@/interfaces/IUserService';
import { IUserAuthRepository } from '@/interfaces/IUserAuthRepository';
import { IUserProfileRepository } from '@/interfaces/IUserProfileRepository';
import { UserProfile as UserProfileModel } from '@/models/UserProfile';
import { UpdateProfileDto } from '@/dto/user/UpdateProfileDto';
import { UserList } from '@/models/UserList';
import { UserProfile as UserProfileEntity } from '@/entities/UserProfile';
import { ErrorFactory } from '@/errors';
import { ErrorCode } from '@/types/error-codes';

export class UserService implements IUserService {
  constructor(
    private userAuthRepository: IUserAuthRepository,
    private userProfileRepository: IUserProfileRepository
  ) {}

  async getProfile(userId: string): Promise<UserProfileModel> {
    try {
      // 1. Fetch user auth data from PostgreSQL
      const user = await this.userAuthRepository.findById(userId);
      if (!user) {
        throw ErrorFactory.createError(
          ErrorCode.RESOURCE_NOT_FOUND,
          'User not found',
          { userId },
          { userMessage: 'User account not found', action: 'CONTACT_SUPPORT' }
        );
      }

      // 2. Check if user account is active
      if (user.status !== 'active') {
        throw ErrorFactory.createError(
          ErrorCode.USER_ACCOUNT_INACTIVE,
          'User account is not active',
          { userId, details: { status: user.status } },
          { userMessage: 'Account is not accessible', action: 'CONTACT_SUPPORT' }
        );
      }

      // 3. Fetch user profile from MongoDB
      const profile = await this.userProfileRepository.findByUserId(userId);
      if (!profile) {
        throw ErrorFactory.createError(
          ErrorCode.USER_PROFILE_NOT_FOUND,
          'User profile not found',
          { userId },
          { userMessage: 'Profile data not found', action: 'CONTACT_SUPPORT' }
        );
      }

      // 4. Combine data into UserProfileModel format
      const userDto: UserProfileModel = {
        id: user.id,
        email: user.email,
        name: profile.profile.displayName,
        role: user.role,
        avatar: profile.profile.avatar?.url || undefined,
        preferences: {
          theme: profile.preferences.theme,
          notifications: profile.preferences.notifications.email,
          language: profile.preferences.language,
          timezone: 'UTC' // Default timezone, can be expanded later
        },
        createdAt: user.createdAt,
        updatedAt: new Date(Math.max(
          user.updatedAt.getTime(),
          profile.metadata.updatedAt.getTime()
        ))
      };

      return userDto;
    } catch (error) {
      // Re-throw ApplicationErrors as-is
      if (error instanceof Error && 'code' in error) {
        throw error;
      }
      
      // Wrap unexpected errors
      throw ErrorFactory.createError(
        ErrorCode.SYSTEM_INTERNAL_ERROR,
        'Failed to retrieve user profile',
        { userId, details: { error: error instanceof Error ? error.message : 'Unknown error' } },
        { userMessage: 'Unable to load profile', action: 'RETRY' }
      );
    }
  }

  async updateProfile(userId: string, updateDto: UpdateProfileDto): Promise<UserProfileModel> {
    try {
      // 1. Verify user exists and is active
      const user = await this.userAuthRepository.findById(userId);
      if (!user) {
        throw ErrorFactory.createError(
          ErrorCode.RESOURCE_NOT_FOUND,
          'User not found',
          { userId },
          { userMessage: 'User account not found', action: 'CONTACT_SUPPORT' }
        );
      }

      if (user.status !== 'active') {
        throw ErrorFactory.createError(
          ErrorCode.AUTHZ_RESOURCE_ACCESS_DENIED,
          'Cannot update profile for inactive user',
          { userId, details: { status: user.status } },
          { userMessage: 'Account is not accessible', action: 'CONTACT_SUPPORT' }
        );
      }

      // 2. Fetch current profile
      const currentProfile = await this.userProfileRepository.findByUserId(userId);
      if (!currentProfile) {
        throw ErrorFactory.createError(
          ErrorCode.USER_PROFILE_NOT_FOUND,
          'User profile not found',
          { userId },
          { userMessage: 'Profile data not found', action: 'CONTACT_SUPPORT' }
        );
      }

      // 3. Prepare profile updates (partial update)
      const profileUpdates: any = {};

      // Update profile fields
      if (updateDto.name !== undefined) {
        profileUpdates['profile.displayName'] = updateDto.name.trim();
        
        // Also update firstName and lastName if needed
        const nameParts = updateDto.name.trim().split(' ');
        profileUpdates['profile.firstName'] = nameParts[0] || '';
        profileUpdates['profile.lastName'] = nameParts.slice(1).join(' ') || '';
      }

      if (updateDto.avatar !== undefined) {
        if (updateDto.avatar) {
          // If avatar URL is provided, update it
          profileUpdates['profile.avatar.url'] = updateDto.avatar;
          profileUpdates['profile.avatar.filename'] = 'avatar';
          profileUpdates['profile.avatar.size'] = 0;
          profileUpdates['profile.avatar.mimeType'] = 'image/unknown';
        } else {
          // If avatar is set to empty string or null, remove it
          profileUpdates['profile.avatar'] = null;
        }
      }

      // Update preferences
      if (updateDto.preferences) {
        if (updateDto.preferences.theme !== undefined) {
          profileUpdates['preferences.theme'] = updateDto.preferences.theme;
        }
        if (updateDto.preferences.notifications !== undefined) {
          profileUpdates['preferences.notifications.email'] = updateDto.preferences.notifications;
        }
        if (updateDto.preferences.language !== undefined) {
          profileUpdates['preferences.language'] = updateDto.preferences.language;
        }
        if (updateDto.preferences.timezone !== undefined) {
          // For now, we'll store timezone in preferences but not use it in response
          // This can be expanded later when timezone support is added
        }
      }

      // Update metadata
      profileUpdates['metadata.updatedAt'] = new Date();
      profileUpdates['metadata.version'] = currentProfile.metadata.version + 1;

      // 4. Update profile in MongoDB
      const updatedProfile = await this.userProfileRepository.update(userId, profileUpdates);
      if (!updatedProfile) {
        throw ErrorFactory.createError(
          ErrorCode.DB_QUERY_FAILED,
          'Failed to update profile',
          { userId, details: { updates: profileUpdates } },
          { userMessage: 'Unable to update profile', action: 'RETRY' }
        );
      }

      // 5. Return updated profile using getProfile method
      return await this.getProfile(userId);
    } catch (error) {
      // Re-throw ApplicationErrors as-is
      if (error instanceof Error && 'code' in error) {
        throw error;
      }
      
      // Wrap unexpected errors
      throw ErrorFactory.createError(
        ErrorCode.SYSTEM_INTERNAL_ERROR,
        'Failed to update user profile',
        { userId, details: { updateDto, error: error instanceof Error ? error.message : 'Unknown error' } },
        { userMessage: 'Unable to update profile', action: 'RETRY' }
      );
    }
  }

  async deleteAccount(userId: string): Promise<void> {
    try {
      // 1. Verify user exists and is active
      const user = await this.userAuthRepository.findById(userId);
      if (!user) {
        throw ErrorFactory.createError(
          ErrorCode.RESOURCE_NOT_FOUND,
          'User not found',
          { userId },
          { userMessage: 'User account not found', action: 'CONTACT_SUPPORT' }
        );
      }

      // Check if user is already deleted
      if (user.status === 'inactive') {
        throw ErrorFactory.createError(
          ErrorCode.USER_ACCOUNT_DELETED,
          'User account is already deleted',
          { userId, details: { status: user.status } },
          { userMessage: 'Account is already deleted', action: 'CHECK_INPUT' }
        );
      }

      if (user.status !== 'active') {
        throw ErrorFactory.createError(
          ErrorCode.AUTHZ_RESOURCE_ACCESS_DENIED,
          'Cannot delete inactive user account',
          { userId, details: { status: user.status } },
          { userMessage: 'Account is not accessible', action: 'CONTACT_SUPPORT' }
        );
      }

      // 2. Soft delete user in PostgreSQL (update status)
      const updatedUser = await this.userAuthRepository.update(userId, {
        status: 'inactive',
        updatedAt: new Date()
      });

      if (!updatedUser) {
        throw ErrorFactory.createError(
          ErrorCode.DB_QUERY_FAILED,
          'Failed to update user status in auth database',
          { userId },
          { userMessage: 'Unable to delete account', action: 'RETRY' }
        );
      }

      // 3. Soft delete profile in MongoDB (anonymize data but keep structure)
      const currentProfile = await this.userProfileRepository.findByUserId(userId);
      if (currentProfile) {
        // Create proper UserProfileEntity update structure
        const profileUpdates: Partial<UserProfileEntity> = {
          profile: {
            ...currentProfile.profile,
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
            ...currentProfile.preferences,
            privacy: {
              profileVisibility: 'private',
              showEmail: false,
              showLocation: false,
            },
          },
          metadata: {
            ...currentProfile.metadata,
            updatedAt: new Date(),
            version: currentProfile.metadata.version + 1,
          },
        };

        const updatedProfile = await this.userProfileRepository.update(userId, profileUpdates);
        if (!updatedProfile) {
          // Log warning but don't fail the deletion - auth deletion is more critical
          console.warn(`Failed to update profile for deleted user ${userId}`);
        }
      }

      // 4. Account deletion successful
      // Note: In a production system, you might also want to:
      // - Invalidate all active sessions/tokens for this user
      // - Queue cleanup tasks for related data
      // - Send confirmation email
      // - Log the deletion event for audit purposes
      
      return; // Success - no return value needed for void method
    } catch (error) {
      // Re-throw ApplicationErrors as-is
      if (error instanceof Error && 'code' in error) {
        throw error;
      }
      
      // Wrap unexpected errors
      throw ErrorFactory.createError(
        ErrorCode.SYSTEM_INTERNAL_ERROR,
        'Failed to delete user account',
        { userId, details: { error: error instanceof Error ? error.message : 'Unknown error' } },
        { userMessage: 'Unable to delete account', action: 'RETRY' }
      );
    }
  }

  async getAllUsers(page: number, limit: number): Promise<UserList> {
    try {
      // Validate pagination parameters
      const validatedPage = Math.max(1, parseInt(String(page)) || 1);
      const validatedLimit = Math.min(100, Math.max(1, parseInt(String(limit)) || 10));
      
      // Calculate offset for pagination
      const offset = (validatedPage - 1) * validatedLimit;
      
      // 1. Fetch paginated users from PostgreSQL
      const { users: authUsers, total } = await this.userAuthRepository.findAll(offset, validatedLimit);
      
      if (!authUsers || authUsers.length === 0) {
        return {
          users: [],
          total: 0,
          page: validatedPage,
          limit: validatedLimit,
          totalPages: 0
        };
      }
      
      // 2. Get user profiles from MongoDB for each user
      const userDtos: UserProfileModel[] = [];
      
      for (const user of authUsers) {
        try {
          const profile = await this.userProfileRepository.findByUserId(user.id);
          
          // Create UserProfileModel (include all users, even those without profiles)
          const userDto: UserProfileModel = {
            id: user.id,
            email: user.email,
            name: profile?.profile.displayName || '[No Profile]',
            role: user.role,
            avatar: profile?.profile.avatar?.url || undefined,
            preferences: profile ? {
              theme: profile.preferences.theme,
              notifications: profile.preferences.notifications.email,
              language: profile.preferences.language,
              timezone: 'UTC' // Default timezone
            } : undefined,
            createdAt: user.createdAt,
            updatedAt: new Date(Math.max(
              user.updatedAt.getTime(),
              profile?.metadata.updatedAt.getTime() || 0
            ))
          };
          
          userDtos.push(userDto);
        } catch (profileError) {
          // If profile fetch fails, still include user with basic info
          console.warn(`Failed to fetch profile for user ${user.id}:`, profileError);

          const userDto: UserProfileModel = {
            id: user.id,
            email: user.email,
            name: '[Profile Error]',
            role: user.role,
            avatar: undefined,
            preferences: undefined,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          };
          
          userDtos.push(userDto);
        }
      }
      
      // 3. Calculate pagination metadata
      const totalPages = Math.ceil(total / validatedLimit);
      
      return {
        users: userDtos,
        total,
        page: validatedPage,
        limit: validatedLimit,
        totalPages
      };
      
    } catch (error) {
      // Re-throw ApplicationErrors as-is
      if (error instanceof Error && 'code' in error) {
        throw error;
      }
      
      // Wrap unexpected errors
      throw ErrorFactory.createError(
        ErrorCode.SYSTEM_INTERNAL_ERROR,
        'Failed to retrieve users list',
        { details: { page, limit, error: error instanceof Error ? error.message : 'Unknown error' } },
        { userMessage: 'Unable to load users list', action: 'RETRY' }
      );
    }
  }

  async getUserById(userId: string): Promise<UserProfileModel> {
    try {
      // Validate input
      if (!userId || typeof userId !== 'string') {
        throw ErrorFactory.createError(
          ErrorCode.VALIDATION_FIELD_REQUIRED,
          'User ID is required',
          { details: { userId } },
          { userMessage: 'Invalid user ID provided', action: 'CHECK_INPUT' }
        );
      }
      
      // 1. Fetch user auth data from PostgreSQL
      const user = await this.userAuthRepository.findById(userId);
      if (!user) {
        throw ErrorFactory.createError(
          ErrorCode.RESOURCE_NOT_FOUND,
          'User not found',
          { userId },
          { userMessage: 'User account not found', action: 'CHECK_INPUT' }
        );
      }
      
      // 2. Fetch user profile from MongoDB
      const profile = await this.userProfileRepository.findByUserId(userId);
      if (!profile) {
        // For admin access, we can still return user info even without profile
        console.warn(`User ${userId} has no profile data`);
        
        return {
          id: user.id,
          email: user.email,
          name: '[No Profile]',
          role: user.role,
          avatar: undefined,
          preferences: undefined,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        };
      }
      
      // 3. Create comprehensive UserProfileModel with admin metadata
      const userDto: UserProfileModel = {
        id: user.id,
        email: user.email,
        name: profile.profile.displayName,
        role: user.role,
        avatar: profile.profile.avatar?.url || undefined,
        preferences: {
          theme: profile.preferences.theme,
          notifications: profile.preferences.notifications.email,
          language: profile.preferences.language,
          timezone: 'UTC' // Default timezone, can be expanded later
        },
        createdAt: user.createdAt,
        updatedAt: new Date(Math.max(
          user.updatedAt.getTime(),
          profile.metadata.updatedAt.getTime()
        ))
      };
      
      return userDto;
      
    } catch (error) {
      // Re-throw ApplicationErrors as-is
      if (error instanceof Error && 'code' in error) {
        throw error;
      }
      
      // Wrap unexpected errors
      throw ErrorFactory.createError(
        ErrorCode.SYSTEM_INTERNAL_ERROR,
        'Failed to retrieve user details',
        { userId, details: { error: error instanceof Error ? error.message : 'Unknown error' } },
        { userMessage: 'Unable to load user details', action: 'RETRY' }
      );
    }
  }
}
