import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_CONFIG, STORAGE_KEYS, HTTP_STATUS } from '@/lib/constants';
import { ApiResponse, ApiError } from '@/types';

// API Error class for consistent error handling
export class APIError extends Error {
  public status?: number;
  public errors?: Record<string, string[]>;
  public code?: string;

  constructor(message: string, status?: number, errors?: Record<string, string[]>, code?: string) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.errors = errors;
    this.code = code;
  }
}

// API Client class
class APIClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor() {
    // Create axios instance
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Setup interceptors
    this.setupRequestInterceptor();
    this.setupResponseInterceptor();
  }

  /**
   * Setup request interceptor to add auth token
   */
  private setupRequestInterceptor(): void {
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = this.getAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request ID for tracking
        config.headers['X-Request-ID'] = this.generateRequestId();

        // Log request in development
        if (import.meta.env.DEV) {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
            headers: config.headers,
            data: config.data,
            params: config.params,
          });
        }

        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Setup response interceptor for error handling and token refresh
   */
  private setupResponseInterceptor(): void {
    this.client.interceptors.response.use(
      (response) => {
        // Log response in development
        if (import.meta.env.DEV) {
          console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
            status: response.status,
            data: response.data,
          });
        }

        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Log error in development
        if (import.meta.env.DEV) {
          console.error(`❌ API Error: ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`, {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
          });
        }

        // Handle token refresh for 401 errors (but not for login/register/forgot-password requests)
        const isAuthRequest = originalRequest?.url?.includes('/auth/login') || 
                             originalRequest?.url?.includes('/auth/register') || 
                             originalRequest?.url?.includes('/auth/forgot-password');
        
        if (error.response?.status === HTTP_STATUS.UNAUTHORIZED && !originalRequest._retry && !isAuthRequest) {
          if (this.isRefreshing) {
            // If refresh is in progress, wait for it
            return this.createRefreshSubscriber(originalRequest);
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshAccessToken();
            this.onTokenRefreshed(newToken);
            
            // Retry original request with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed, redirect to login
            this.handleAuthFailure();
            return Promise.reject(this.transformError(error));
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(this.transformError(error));
      }
    );
  }

  /**
   * Transform axios error to our custom APIError
   */
  private transformError(error: AxiosError): APIError {
    const response = error.response;
    const data = response?.data as any;

    // Extract error information
    const message = data?.message || error.message || 'An unexpected error occurred';
    const status = response?.status;
    const errors = data?.errors;
    const code = data?.code;

    return new APIError(message, status, errors, code);
  }

  /**
   * Get access token from storage
   */
  private getAccessToken(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    } catch {
      return null;
    }
  }

  /**
   * Get refresh token from storage
   */
  private getRefreshToken(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch {
      return null;
    }
  }

  /**
   * Refresh access token
   */
  private async refreshAccessToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      throw new APIError('No refresh token available', HTTP_STATUS.UNAUTHORIZED);
    }

    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/refresh`, {
        refreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data.data;

      // Update tokens in storage
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      if (newRefreshToken) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
      }

      return accessToken;
    } catch (error) {
      // Clear invalid tokens
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      throw error;
    }
  }

  /**
   * Create a subscriber for token refresh
   */
  private createRefreshSubscriber(originalRequest: AxiosRequestConfig): Promise<AxiosResponse> {
    return new Promise((resolve, reject) => {
      this.refreshSubscribers.push((token: string) => {
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        resolve(this.client(originalRequest));
      });
    });
  }

  /**
   * Notify all subscribers when token is refreshed
   */
  private onTokenRefreshed(token: string): void {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  /**
   * Handle authentication failure
   */
  private handleAuthFailure(): void {
    // Clear all auth data
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);

    // Only redirect if not already on auth pages
    const isOnAuthPage = window.location.pathname.startsWith('/auth/') || 
                        window.location.pathname === '/login' || 
                        window.location.pathname === '/register';
    
    if (!isOnAuthPage) {
      // Use soft redirect through React Router if possible
      if (window.history && window.history.pushState) {
        window.history.pushState({}, '', '/auth/login');
        window.dispatchEvent(new PopStateEvent('popstate'));
      } else {
        // Fallback to hard redirect only if necessary
        window.location.href = '/auth/login';
      }
    }
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // HTTP Methods

  /**
   * GET request
   */
  public async get<T = any>(
    url: string, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  /**
   * POST request
   */
  public async post<T = any>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  /**
   * PUT request
   */
  public async put<T = any>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  /**
   * PATCH request
   */
  public async patch<T = any>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  /**
   * DELETE request
   */
  public async delete<T = any>(
    url: string, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  /**
   * Upload file
   */
  public async upload<T = any>(
    url: string, 
    file: File, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post<ApiResponse<T>>(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * Download file
   */
  public async download(
    url: string, 
    filename?: string,
    config?: AxiosRequestConfig
  ): Promise<void> {
    const response = await this.client.get(url, {
      ...config,
      responseType: 'blob',
    });

    // Create download link
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }

  /**
   * Set auth token manually
   */
  public setAuthToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  }

  /**
   * Clear auth token
   */
  public clearAuthToken(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

// Create and export single instance
export const apiClient = new APIClient();
export default apiClient;
