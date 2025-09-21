import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  UserPlus,
  Search,
  AlertCircle
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { UserListSkeleton } from '@/components/ui/Loading';

import { AdminStats } from '@/components/admin/AdminStats';
import { UserManagementTable } from '@/components/admin/UserManagementTable';

import { useAdminUsers } from '@/hooks/useAdminUsers';
import { useDebounce } from '@/hooks/useUI';
import { UserRole, PAGE_CONSTANTS, AdminDashboardState } from '@/types';
import { isBackendNotImplemented, filterUsersBySearch } from '@/lib/page-utils';



export const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all');

  const debouncedSearch = useDebounce(searchTerm, 300);
  const [currentPage, setCurrentPage] = useState(1);

  // Use admin users hook for real admin API integration
  const adminQuery = useAdminUsers({ page: currentPage, limit: PAGE_CONSTANTS.USERS_PER_PAGE });

  const isLoading = adminQuery.isLoading;
  const error = adminQuery.error as any;
  const users = adminQuery.users || [];
  const pagination = adminQuery.pagination;

  // Handle backend not implemented errors
  const backendNotImplemented = isBackendNotImplemented(error);

  // Filter users by search and filters (client-side until backend supports it)
  let filteredUsers = filterUsersBySearch(users, debouncedSearch);

  if (selectedRole !== 'all') {
    filteredUsers = filteredUsers.filter(user => user.role === selectedRole);
  }



  // Calculate stats from user data
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.isActive).length,
    suspendedUsers: users.filter(u => u.status === 'suspended').length,
    inactiveUsers: users.filter(u => !u.isActive).length,
    adminUsers: users.filter(u => u.role === UserRole.ADMIN).length,
    userUsers: users.filter(u => u.role === UserRole.USER).length,
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-8">
          <UserListSkeleton count={10} />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('admin.dashboard.title', 'Admin Dashboard')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {t('admin.dashboard.subtitle', 'Manage users and monitor system activity')}
            </p>
          </div>
          <Button disabled title="Create user functionality will be available when backend API supports it">
            <UserPlus className="mr-2 h-4 w-4" />
            {t('admin.users.createUser', 'Create User')}
            <span className="text-xs ml-2 opacity-60">(Coming Soon)</span>
          </Button>
        </div>
      </div>

      {/* Backend Not Implemented Notice */}
      {isBackendNotImplemented && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Development Notice:</strong> The admin users API is not yet implemented on the backend.
            Mock data and limited functionality is shown until the backend
            <code className="mx-1 px-1 bg-muted rounded">GET /api/admin/users</code> endpoint is implemented.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Display (other than 'not implemented') */}
      {error && !isBackendNotImplemented && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>
            {t('admin.dashboard.error', 'Failed to load admin data. Please try refreshing the page.')}: {error.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <AdminStats stats={stats} isLoading={isLoading} />

      {/* Users Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('admin.users.title', 'User Management')}
          </CardTitle>
          <CardDescription>
            {t('admin.users.description', 'View and manage all system users')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t('admin.users.searchPlaceholder', 'Search users by name or email...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole | 'all')}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="all">{t('admin.users.filters.allRoles', 'All Roles')}</option>
              <option value={UserRole.USER}>{t('roles.user', 'User')}</option>
              <option value={UserRole.ADMIN}>{t('roles.admin', 'Admin')}</option>
            </select>

          </div>

          {/* Users Table */}
          <UserManagementTable
            users={filteredUsers}
            isLoading={isLoading}
            pagination={pagination}
            onPageChange={setCurrentPage}
            showActions={true}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
