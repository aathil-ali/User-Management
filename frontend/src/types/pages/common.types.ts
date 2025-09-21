// Common Page State Types

// Loading and Error States
export interface PageLoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface PageEditingState extends PageLoadingState {
  isEditing: boolean;
}

// Search and Filter States
export interface SearchState {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export interface PaginationState {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages?: number;
  totalItems?: number;
}

export interface FilterState<T = string> {
  selectedFilter: T;
  setSelectedFilter: (filter: T) => void;
}

// Combined Common States
export interface AdminPageState extends PageLoadingState {
  searchTerm: string;
  selectedRole: string;
  currentPage: number;
}

export interface FormPageState extends PageLoadingState {
  isSubmitting?: boolean;
  validationErrors?: Record<string, string>;
}

// Page Constants
export const PAGE_CONSTANTS = {
  USERS_PER_PAGE: 10,
  DEFAULT_PAGE_SIZE: 10,
  MAX_SEARCH_LENGTH: 100,
  DEBOUNCE_DELAY: 300,
} as const;