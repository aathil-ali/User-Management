import React from 'react';

// UI related types
export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

// Context types
export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  systemTheme: 'light' | 'dark';
}

export interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

// Hook return types
export interface UseToggleReturn {
  0: boolean;
  1: () => void;
  2: (value: boolean) => void;
}

export interface UsePaginationOptions {
  totalItems: number;
  itemsPerPage: number;
  initialPage?: number;
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
}

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface IconProps extends BaseComponentProps {
  size?: number | string;
  color?: string;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

// Table and data display
export interface TableColumn<T = any> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
}

export interface TableAction<T = any> {
  key: string;
  title: string;
  icon?: string;
  onClick: (record: T) => void;
  disabled?: (record: T) => boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
}

export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
  description?: string;
}

// Modal and dialog types
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Alert types
export type AlertVariant = 'default' | 'destructive' | 'warning' | 'success' | 'info';

export interface AlertProps extends BaseComponentProps {
  variant: AlertVariant;
  title?: string;
  description?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

// Navigation
export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  disabled?: boolean;
  external?: boolean;
  badge?: string;
  children?: NavItem[];
}

// Form related types
export interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file';
  placeholder?: string;
  required?: boolean;
  options?: SelectOption[];
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | true;
  };
}

// Utility types
export type Nullable<T> = T | null;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
export type XOR<T, U> = T | U extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;

// Import Theme type
import type { Theme } from './user.types';