import { User, UpdateProfileRequest } from '../user.types';
import { UseMutationResult } from '@tanstack/react-query';

// Auth Hook Types
export interface UseAuthReturn {
  // Additional computed properties
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: User | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: any) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

// Profile Hook Types
export interface UseProfileReturn {
  profile: User | null;
  updateProfile: UseMutationResult<User, Error, UpdateProfileRequest>;
  isLoading: boolean;
  error: Error | null;
}

export interface UseAccountDeletionReturn {
  deleteAccount: UseMutationResult<void, Error, void>;
  isDeleting: boolean;
  error: Error | null;
}