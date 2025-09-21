import { UserDto } from '@/dto/user/UserDto';
import { UpdateProfileDto } from '@/dto/user/UpdateProfileDto';
import { UserListDto } from '@/dto/user/UserListDto';

export interface IUserService {
  getProfile(userId: string): Promise<UserDto>;
  updateProfile(userId: string, updateDto: UpdateProfileDto): Promise<UserDto>;
  deleteAccount(userId: string): Promise<void>;
  getAllUsers(page: number, limit: number): Promise<UserListDto>;
  getUserById(userId: string): Promise<UserDto>;
}
