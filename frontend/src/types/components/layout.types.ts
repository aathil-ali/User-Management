import { ReactNode } from 'react';

// Layout Components
export interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

export interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

export interface NavbarProps {
  className?: string;
  showUserMenu?: boolean;
}

export interface AdminNavbarProps {
  className?: string;
  onMenuToggle?: () => void;
}

// Layout Wrapper Props
export interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export interface AdminLayoutProps extends LayoutProps {
  sidebarOpen?: boolean;
  onSidebarToggle?: () => void;
}

export interface AuthLayoutProps extends LayoutProps {
  title?: string;
  subtitle?: string;
}