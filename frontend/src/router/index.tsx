import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';
import { AdminRoute, UserRoute, PublicRoute } from './ProtectedRoute';

// Layouts
import { MainLayout } from '@/components/layout/MainLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';

// Pages - Auth
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from '@/pages/auth/VerifyEmailPage';

// Pages - User
import { DashboardPage } from '@/pages/DashboardPage';
import { ProfilePage } from '@/pages/profile/ProfilePage';
import { SettingsPage } from '@/pages/profile/SettingsPage';

// Pages - Admin
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
import { AdminUserDetailPage } from '@/pages/admin/AdminUserDetailPage';


// Error Pages
import { NotFoundPage } from '@/pages/errors/NotFoundPage';
import { UnauthorizedPage } from '@/pages/errors/UnauthorizedPage';
import { ServerErrorPage } from '@/pages/errors/ServerErrorPage';

/**
 * Application Router Configuration
 * 
 * Defines all routes with appropriate protection levels:
 * - Public routes (login, register, etc.)
 * - Protected user routes (dashboard, profile, etc.)
 * - Admin-only routes (user management, system settings, etc.)
 */
export const router = createBrowserRouter([
  // Root redirect
  {
    path: '/',
    element: <Navigate to={ROUTES.DASHBOARD} replace />,
  },

  // Public auth routes
  {
    path: '/auth',
    element: (
      <PublicRoute>
        <AuthLayout />
      </PublicRoute>
    ),
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register', 
        element: <RegisterPage />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />,
      },
      {
        path: 'reset-password',
        element: <ResetPasswordPage />,
      },
      {
        path: 'verify-email',
        element: <VerifyEmailPage />,
      },
    ],
  },

  // Legacy auth routes (for backwards compatibility)
  {
    path: '/login',
    element: <Navigate to={ROUTES.LOGIN} replace />,
  },
  {
    path: '/register',
    element: <Navigate to={ROUTES.REGISTER} replace />,
  },

  // Protected user routes
  {
    path: '/',
    element: (
      <UserRoute>
        <MainLayout />
      </UserRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },

  // Admin routes
  {
    path: '/admin',
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      {
        path: 'users',
        element: <AdminUsersPage />,
      },
      {
        path: 'users/:userId',
        element: <AdminUserDetailPage />,
      },

    ],
  },

  // Error pages
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
  {
    path: '/server-error',
    element: <ServerErrorPage />,
  },

  // Catch-all 404 route
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

// Route configuration for programmatic navigation
export const routeConfig = {
  // Public routes
  public: {
    login: ROUTES.LOGIN,
    register: ROUTES.REGISTER,
    // forgotPassword: ROUTES.FORGOT_PASSWORD,
    // resetPassword: ROUTES.RESET_PASSWORD,
    // verifyEmail: ROUTES.VERIFY_EMAIL,
  },
  
  // User routes
  user: {
    dashboard: ROUTES.DASHBOARD,
    profile: ROUTES.PROFILE,
    settings: ROUTES.SETTINGS,
  },
  
  // Admin routes
  admin: {
    dashboard: ROUTES.ADMIN_DASHBOARD,
    users: ROUTES.ADMIN_USERS,
    userDetail: (userId: string) => `/admin/users/${userId}`,
    settings: ROUTES.ADMIN_SETTINGS,
    auditLogs: ROUTES.ADMIN_AUDIT_LOGS,
  },
  
  // Error routes
  errors: {
    notFound: '/404',
    unauthorized: '/unauthorized',
    serverError: '/server-error',
  },
};

// Helper functions for navigation
export const getDefaultRoute = (userRole: string): string => {
  switch (userRole) {
    case 'admin':
      return ROUTES.ADMIN_DASHBOARD;
    case 'user':
    default:
      return ROUTES.DASHBOARD;
  }
};

export const getLoginRedirect = (from?: string): string => {
  // Don't redirect to auth pages or error pages
  const publicPaths = ['/auth', '/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/unauthorized', '/server-error', '/404'];
  const isPublicPath = publicPaths.some(path => from?.startsWith(path));
  
  return isPublicPath ? ROUTES.DASHBOARD : (from || ROUTES.DASHBOARD);
};

export default router;
