import { apiClient } from './api-client';
import {
  User,
  UpdateProfileRequest,
} from '@/types';

/**
 * User Service
 * 
 * Handles user profile management operations for implemented backend APIs:
 * - Get user profile
 * - Update user profile
 * - Delete user account
 */
export class UserService {
  private readonly baseUrl = '/users';

  /**
   * Get current user profile
   */
  public async getProfile(): Promise<User> {
    const response = await apiClient.get<User>(`${this.baseUrl}/profile`);
    return response.data!;
  }

  /**
   * Update user profile
   */
  public async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const response = await apiClient.put<User>(`${this.baseUrl}/profile`, data);
    return response.data!;
  }

  /**
   * Delete user account (soft delete)
   * 
   * Matches backend DELETE /api/users/account
   */
  public async deleteAccount(): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/account`);
  }
}

// Create and export singleton instance
export const userService = new UserService();
export default userService;
