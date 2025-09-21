import { UserProfile } from '@/entities/UserProfile';

export interface IUserProfileRepository {
  create(profileData: { userId: string; name: string; email: string }): Promise<UserProfile>;
  findByUserId(userId: string): Promise<UserProfile | null>;
  update(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null>;
  delete(userId: string): Promise<boolean>;
}
