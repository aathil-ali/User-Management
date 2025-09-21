import { apiClient } from './api-client';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  User,
} from '@/types';

/**
 * Authentication Service
 * 
 * Handles all authentication-related API calls including:
 * - User login
 * - User registration
 * - Token refresh
 * - Logout
 * - Auth status check
 */
export class AuthService {
  private readonly baseUrl = '/auth';

  /**
   * Login user with email and password
   */
  public async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      `${this.baseUrl}/login`,
      credentials
    );
    
    return response.data!;
  }

  /**
   * Register new user
   */
  public async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      `${this.baseUrl}/register`,
      userData
    );
    
    return response.data!;
  }

  /**
   * Refresh access token using refresh token
   */
  public async refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    const response = await apiClient.post<RefreshTokenResponse>(
      `${this.baseUrl}/refresh`,
      data
    );
    
    return response.data!;
  }

  /**
   * Logout user (invalidate tokens on server)
   */
  public async logout(userId: string): Promise<void> {
    try {
      await apiClient.post(`${this.baseUrl}/logout`, { userId });
    } catch (error) {
      // Even if logout fails on server, we should clear local tokens
      console.warn('Logout request failed, but continuing with local cleanup:', error);
    } finally {
      // Always clear local auth state
      apiClient.clearAuthToken();
    }
  }

  /**
   * Check if current session is valid (based on token presence)
   */
  public checkAuth(): boolean {
    return this.isAuthenticated();
  }

  // Password reset and email verification methods removed
  // These features are not yet implemented in the backend

  /**
   * Check if user is currently authenticated
   */
  public isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }

  /**
   * Clear all authentication data
   */
  public clearAuth(): void {
    apiClient.clearAuthToken();
  }
}

// Create and export singleton instance
export const authService = new AuthService();
export default authService;
