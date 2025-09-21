// API related types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

// Query/Mutation options
export interface QueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Search and filtering
export interface SearchFilters {
  query?: string;
  role?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  [key: string]: any;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

// Loading state
export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

// Form errors
export interface FormErrors {
  [key: string]: string | string[] | undefined;
}