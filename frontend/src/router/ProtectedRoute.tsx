import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '@/types';
import { ROUTES } from '../lib/constants';

// Protected route props
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: UserRole;
  redirectTo?: string;
}

/**
 * Protected Route Component
 * 
 * Handles authentication and authorization checks for routes
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requiredRole,
  redirectTo,
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while auth state is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Save the attempted location for redirect after login
    return (
      <Navigate 
        to={redirectTo || ROUTES.LOGIN} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // If user is authenticated but accessing login/register pages
  if (!requireAuth && isAuthenticated) {
    // Get the intended destination from location state, or default to dashboard
    const from = location.state?.from || ROUTES.DASHBOARD;
    return <Navigate to={from} replace />;
  }

  // If a specific role is required
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect based on user role
    if (user?.role === UserRole.ADMIN) {
      return <Navigate to={ROUTES.ADMIN} replace />;
    } else {
      return <Navigate to={ROUTES.DASHBOARD} replace />;
    }
  }

  // If all checks pass, render the protected content
  return <>{children}</>;
};

// Role-based route wrapper
interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallbackRoute?: string;
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  children,
  allowedRoles,
  fallbackRoute,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Verifying permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Check if user's role is in the allowed roles
  if (user && !allowedRoles.includes(user.role)) {
    const defaultRoute = user.role === UserRole.ADMIN 
      ? ROUTES.ADMIN 
      : ROUTES.DASHBOARD;
    
    return <Navigate to={fallbackRoute || defaultRoute} replace />;
  }

  return <>{children}</>;
};

// Admin only route
interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  return (
    <RoleBasedRoute allowedRoles={[UserRole.ADMIN]}>
      {children}
    </RoleBasedRoute>
  );
};

// User route (accessible by both admin and regular users)
interface UserRouteProps {
  children: React.ReactNode;
}

export const UserRoute: React.FC<UserRouteProps> = ({ children }) => {
  return (
    <RoleBasedRoute allowedRoles={[UserRole.USER, UserRole.ADMIN]}>
      {children}
    </RoleBasedRoute>
  );
};

// Public route (accessible without authentication)
interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  return (
    <ProtectedRoute requireAuth={false}>
      {children}
    </ProtectedRoute>
  );
};

export default ProtectedRoute;
