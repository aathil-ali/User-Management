import { User, UserRole, UserStats } from '../user.types';

// Admin Dashboard Components
export interface AdminStatsProps {
  stats: UserStats;
  isLoading?: boolean;
}

// User Management Components
export interface UserManagementTableProps {
  users: User[];
  isLoading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange?: (page: number) => void;
  showActions?: boolean;
}

export interface UserListProps {
  users: User[];
  isLoading?: boolean;
  onUserClick?: (userId: string) => void;
  onEditUser?: (user: User) => void;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  onStatusChange?: (user: User, status: string) => void;
  showFilters?: boolean;
  showPagination?: boolean;
}

// Filter Components
export interface UserFilterState {
  role: string | undefined;
  status: string | undefined;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface UserFiltersProps {
  onFiltersChange: (filters: UserFilterState) => void;
  onSearch: (query: string) => void;
  totalUsers?: number;
  isLoading?: boolean;
}

// Pagination Components
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface PaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  isLoading?: boolean;
}