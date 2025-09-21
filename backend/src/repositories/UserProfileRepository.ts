import { Collection, MongoClient } from 'mongodb';
import { UserProfile } from '@/entities/UserProfile';
import { IUserProfileRepository } from '@/interfaces/IUserProfileRepository';

export class UserProfileRepository implements IUserProfileRepository {
  private collection: Collection<UserProfile>;

  constructor(private client: MongoClient) {
    this.collection = client.db().collection<UserProfile>('user_profiles');
  }

  async create(profileData: { userId: string; name: string; email: string }): Promise<UserProfile> {
    // Repository handles data structure mapping for MongoDB
    const [firstName, ...lastNameParts] = profileData.name.trim().split(' ');
    const lastName = lastNameParts.join(' ');
    
    const mongoProfile: UserProfile = {
      userId: profileData.userId,
      email: profileData.email,
      profile: {
        firstName: firstName || profileData.name.trim(),
        lastName: lastName || '',
        displayName: profileData.name.trim(),
        bio: '',
        location: '',
        website: '',
        avatar: {
          url: `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name)}&background=random&color=fff`,
          filename: 'avatar.png',
          size: 1024,
          mimeType: 'image/png'
        }
      },
      preferences: {
        language: 'en',
        theme: 'light',
        notifications: {
          email: true,
          push: true,
          sms: false
        },
        privacy: {
          profileVisibility: 'public',
          showEmail: false,
          showLocation: false
        }
      },
      social: {
        twitter: '',
        linkedin: '',
        github: '',
        facebook: ''
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1
      }
    };

    try {
      const result = await this.collection.insertOne(mongoProfile);
      return {
        _id: result.insertedId.toString(),
        ...mongoProfile
      };
    } catch (error: any) {
      throw new Error(`Failed to create user profile: ${error.message}`);
    }
  }

  async findByUserId(userId: string): Promise<UserProfile | null> {
    try {
      const result = await this.collection.findOne({ userId });
      return result ? {
        ...result,
        _id: result._id.toString()
      } : null;
    } catch (error: any) {
      throw new Error(`Failed to find user profile: ${error.message}`);
    }
  }

  async update(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const updateData: any = {
        ...updates,
        'metadata.updatedAt': new Date()
      };
      delete updateData._id; // Remove _id from updates
      
      const result = await this.collection.findOneAndUpdate(
        { userId },
        { $set: updateData },
        { returnDocument: 'after' }
      );
      
      return result.value ? {
        ...result.value,
        _id: result.value._id.toString()
      } : null;
    } catch (error: any) {
      throw new Error(`Failed to update user profile: ${error.message}`);
    }
  }

  async delete(userId: string): Promise<boolean> {
    try {
      const result = await this.collection.deleteOne({ userId });
      return result.deletedCount > 0;
    } catch (error: any) {
      throw new Error(`Failed to delete user profile: ${error.message}`);
    }
  }
}
