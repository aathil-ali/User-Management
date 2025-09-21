import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { ErrorBoundary } from './components/ErrorBoundary';

import { ProtectedRoute, AdminRoute } from './router/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import { AuthLayout } from './components/layout/AuthLayout';
import { AdminLayout } from './components/layout/AdminLayout';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Main user pages
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/profile/ProfilePage';
import ChangePasswordPage from './pages/profile/ChangePasswordPage';
import SettingsPage from './pages/profile/SettingsPage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import CreateUserPage from './pages/admin/CreateUserPage';


// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <Router>
                <Routes>
                  {/* Auth Routes - No Layout */}
                  <Route path="/auth" element={<AuthLayout />}>
                    <Route path="login" element={<LoginPage />} />
                    <Route path="register" element={<RegisterPage />} />
                    <Route path="reset-password" element={<ResetPasswordPage />} />
                    <Route index element={<Navigate to="/auth/login" replace />} />
                  </Route>

                  {/* Protected Main User Routes */}
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <MainLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="profile/password" element={<ChangePasswordPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                  </Route>

                  {/* Protected Admin Routes */}
                  <Route
                    path="/admin"
                    element={
                      <AdminRoute>
                        <AdminLayout />
                      </AdminRoute>
                    }
                  >
                    <Route index element={<AdminDashboard />} />
                    <Route path="users" element={<AdminUsersPage />} />
                    <Route path="users/create" element={<CreateUserPage />} />
                    <Route path="users/:id" element={<div>User Edit Page (Coming Soon)</div>} />
                  </Route>

                  {/* Catch all redirect */}
                  <Route path="*" element={<Navigate to="/auth/login" replace />} />
                </Routes>
              </Router>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
