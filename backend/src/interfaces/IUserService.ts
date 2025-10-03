import { UserProfile } from '@/models/UserProfile';
import { UpdateProfileDto } from '@/dto/user/UpdateProfileDto';
import { UserList } from '@/models/UserList';

export interface IUserService {
  getProfile(userId: string): Promise<UserProfile>;
  updateProfile(userId: string, updateDto: UpdateProfileDto): Promise<UserProfile>;
  deleteAccount(userId: string): Promise<void>;
  getAllUsers(page: number, limit: number): Promise<UserList>;
  getUserById(userId: string): Promise<UserProfile>;
}
