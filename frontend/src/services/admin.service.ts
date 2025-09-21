import { apiClient } from "./api-client";
import { User, PaginatedResponse } from "@/types";

/**
 * Admin Service
 *
 * Handles administrative operations for implemented backend APIs:
 * - Get paginated list of users
 * - Get specific user details
 *
 * Note: This service only implements methods for backend APIs that actually exist.
 * Other admin operations (create, update, delete, suspend users) are not implemented
 * in the backend yet, so those methods are not included here.
 */
export class AdminService {
  private readonly baseUrl = "/admin";

  // User Management - Only implemented backend endpoints

  /**
   * Get paginated list of users with filters
   * Matches backend GET /api/admin/users
   *
   * Note: Backend API is defined but not implemented yet.
   * Will return "not implemented" error until backend is ready.
   */
  public async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
  }): Promise<PaginatedResponse<User>> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/users`, { params });

      // Simple direct return - the backend response should match our expected format
      console.log("Raw API response:", response.data);

      return {
        data: response.data || [],
        pagination: {
          page: params?.page || 1,
          limit: params?.limit || 10,
          total: response.data?.length || 0,
          totalPages: Math.ceil(
            (response.data?.length || 0) / (params?.limit || 10)
          ),
        },
      };
    } catch (error: any) {
      // Handle "not implemented" errors gracefully
      if (
        error?.message?.includes("not implemented") ||
        error?.message?.includes("Not implemented")
      ) {
        // Return empty result when backend is not ready
        return {
          data: [],
          pagination: {
            page: params?.page || 1,
            limit: params?.limit || 10,
            total: 0,
            totalPages: 0,
          },
        };
      }
      throw error;
    }
  }

  /**
   * Get single user by ID
   * Matches backend GET /api/admin/users/:id
   *
   * Note: Backend API is defined but not implemented yet.
   * Will return "not implemented" error until backend is ready.
   */
  public async getUser(userId: string): Promise<User | null> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/users/${userId}`);

      // Transform backend response format to expected frontend format
      const backendResponse = response.data;
      return backendResponse.data || null;
    } catch (error: any) {
      // Handle "not implemented" errors gracefully
      if (
        error?.message?.includes("not implemented") ||
        error?.message?.includes("Not implemented")
      ) {
        // Return null when backend is not ready
        return null;
      }
      throw error;
    }
  }

  // The following methods are NOT implemented because the backend APIs don't exist:
  // - createUser() - No POST /api/admin/users endpoint
  // - updateUser() - No PUT /api/admin/users/:id endpoint
  // - deleteUser() - No DELETE /api/admin/users/:id endpoint
  // - suspendUser() - No PUT /api/admin/users/:id/status endpoint
  // - unsuspendUser() - No PUT /api/admin/users/:id/status endpoint
  // - getUserStats() - No GET /api/admin/stats endpoint
  //
  // These methods will be added when the corresponding backend APIs are implemented.
}

// Create and export singleton instance
export const adminService = new AdminService();
export default adminService;
