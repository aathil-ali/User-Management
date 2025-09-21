// UI Hook Types

// Pagination Hook Types
export interface UsePaginationOptions {
  totalItems: number;
  itemsPerPage: number;
  initialPage?: number;
  maxPages?: number;
}

export interface UsePaginationReturn {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  startIndex: number;
  endIndex: number;
  isFirstPage: boolean;
  isLastPage: boolean;
  setCurrentPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  goToPage: (page: number) => void;
  reset: () => void;
}

// Toggle Hook Types
export interface UseToggleReturn {
  0: boolean;
  1: () => void;
  2: (value: boolean) => void;
}

// Debounce Hook Types
export interface UseDebounceOptions {
  delay?: number;
  immediate?: boolean;
  maxWait?: number;
}

export interface UseDebounceReturn<T> {
  debouncedValue: T;
  cancel: () => void;
  flush: () => void;
}

// Local Storage Hook Types
export interface UseLocalStorageReturn<T> {
  0: T;
  1: (value: T | ((prev: T) => T)) => void;
  2: () => void; // remove function
}

export interface UseLocalStorageOptions {
  serialize?: (value: any) => string;
  deserialize?: (value: string) => any;
  defaultValue?: any;
  syncAcrossTabs?: boolean;
}

// Toast Hook Types
export interface UseToastReturn {
  toast: (options: ToastOptions) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

export interface ToastOptions {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}