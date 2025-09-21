import { User, UserRole, UserStatus, CreateUserData, UpdateUserData } from '../user.types';
import { PaginatedResponse } from '../api.types';
import { UseMutationResult } from '@tanstack/react-query';

// Admin Users Hook Types
export interface UseAdminUsersParams {
  page?: number;
  limit?: number;
  role?: UserRole;
  status?: UserStatus;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UseAdminUsersReturn {
  users: User[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

// Admin Mutations Hook Types
export interface UseAdminMutationsReturn {
  createUser: UseMutationResult<User, Error, CreateUserData>;
  updateUser: UseMutationResult<User, Error, { id: string; data: UpdateUserData }>;
  deleteUser: UseMutationResult<void, Error, string>;
  suspendUser: UseMutationResult<User, Error, string>;
  unsuspendUser: UseMutationResult<User, Error, string>;
}