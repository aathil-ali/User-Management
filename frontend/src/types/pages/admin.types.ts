import { User, UserRole } from '../user.types';
import { AdminPageState, PaginationState, SearchState } from './common.types';

// Admin Page Types
export interface AdminDashboardState extends AdminPageState {
  stats?: {
    totalUsers: number;
    activeUsers: number;
    suspendedUsers: number;
    adminUsers: number;
  };
}

export interface AdminUsersPageState extends AdminPageState {
  users: User[];
  selectedUsers: string[];
  bulkAction?: 'delete' | 'suspend' | 'activate';
}

export interface AdminUserDetailState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isEditing: boolean;
  hasUnsavedChanges: boolean;
}

export interface CreateUserPageState {
  isLoading: boolean;
  error: string | null;
  isSubmitting: boolean;
  validationErrors: Record<string, string>;
}

// Admin Page Props
export interface AdminPageProps {
  title?: string;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
}