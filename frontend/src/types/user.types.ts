// User related types
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status?: UserStatus;
  isActive?: boolean;
  isEmailVerified?: boolean;
  phone?: string;
  bio?: string;
  avatar?: string | null;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  preferences?: UserPreferences;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

// Helper function to check if user is admin
export const isAdmin = (role: UserRole) => role === UserRole.ADMIN;

// Theme and preferences
export type Theme = 'light' | 'dark' | 'system';
export type Language = 'en' | 'es' | 'fr';

export interface UserPreferences {
  theme?: Theme;
  language?: Language;
  notifications?: {
    email: boolean;
    push: boolean;
    marketing: boolean;
  };
  timezone?: string;
}

// Profile related types
export interface UpdateProfileRequest {
  name?: string;
  avatar?: string;
  preferences?: UserPreferences;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Form data types
export type ProfileUpdateFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  bio?: string;
};

export type UserPreferencesFormData = {
  language: string;
  theme: 'light' | 'dark' | 'system';
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  twoFactorEnabled: boolean;
};

// Admin related types
export interface AdminUserListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  sortBy?: 'name' | 'email' | 'createdAt' | 'lastLogin';
  sortOrder?: 'asc' | 'desc';
}

export interface AdminUpdateUserRequest {
  name?: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
}

export type AdminCreateUserFormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
};

export type AdminUpdateUserFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  bio?: string;
  role: UserRole;
  status: UserStatus;
};

// User statistics
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  inactiveUsers: number;
  adminUsers: number;
  userUsers: number;
}

// Utility types
export type UserWithoutId = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateUserData = Pick<User, 'name' | 'email' | 'role'> & { password: string };
export type UpdateUserData = Partial<Pick<User, 'name' | 'email' | 'phone' | 'bio' | 'role' | 'status'>>;