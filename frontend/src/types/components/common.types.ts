import { ReactNode } from 'react';

// Common Utility Components
export interface LanguageSelectorProps {
  className?: string;
  showIcon?: boolean;
  showLabel?: boolean;
  variant?: 'dropdown' | 'tabs' | 'radio';
}

// Error Boundary Components
export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

export interface AsyncErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error) => void;
  fallback?: ReactNode;
}

// Search Components
export interface SearchProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
  showClearButton?: boolean;
  isLoading?: boolean;
}

// Filter Components
export interface FilterOption {
  label: string;
  value: string;
  count?: number;
  disabled?: boolean;
}

export interface FilterSelectProps {
  options: FilterOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  multiple?: boolean;
}

// Data Display Components
export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export interface DataTableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  isLoading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange?: (page: number) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  className?: string;
}

export interface TableColumn<T = any> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  render?: (value: any, record: T, index: number) => ReactNode;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  className?: string;
}