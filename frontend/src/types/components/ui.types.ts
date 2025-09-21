import { ReactNode } from 'react';
import { VariantProps } from 'class-variance-authority';

// Base Component Props
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

// Button Components
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

// Input Components
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'error' | 'success';
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  helperText?: string;
  error?: string;
}

// Badge Components
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
  size?: 'sm' | 'default' | 'lg';
}

export interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: 'active' | 'inactive' | 'pending' | 'suspended' | 'banned';
}

export interface RoleBadgeProps extends Omit<BadgeProps, 'variant'> {
  role: 'admin' | 'user' | 'moderator' | 'guest';
}

// Avatar Components
export interface AvatarProps extends React.ComponentPropsWithoutRef<'div'> {
  src?: string;
  alt?: string;
  size?: 'sm' | 'default' | 'lg' | 'xl';
  fallback?: string;
  showStatus?: boolean;
  status?: 'online' | 'offline' | 'away' | 'busy';
}

export interface AvatarGroupProps {
  avatars: Array<{
    src?: string;
    alt?: string;
    fallback?: string;
  }>;
  max?: number;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

// Alert Components
export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'warning' | 'success' | 'info';
  title?: string;
  description?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: ReactNode;
}

// Loading Components
export interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'dots' | 'pulse';
}

export interface LoadingPageProps {
  title?: string;
  message?: string;
  className?: string;
}

export interface LoadingInlineProps {
  message?: string;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  variant?: 'default' | 'rounded' | 'circle';
}

// Dialog Components
export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: 'default' | 'destructive';
  isLoading?: boolean;
}

// Separator Component
export interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  decorative?: boolean;
}