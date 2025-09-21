// Authentication related types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// Form data types
export type LoginFormData = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export type RegisterFormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
};

export type ForgotPasswordFormData = {
  email: string;
};

export type ResetPasswordFormData = {
  token: string;
  password: string;
  confirmPassword: string;
};

export type ChangePasswordFormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

// Context types
export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

// Import User type from user.types.ts
import type { User } from './user.types';