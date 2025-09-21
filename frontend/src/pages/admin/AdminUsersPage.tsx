import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Search, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { LoadingSpinner } from '@/components/ui/Loading';

import { useAdminUsers } from '@/hooks/useAdminUsers';
import { useDebounce } from '@/hooks/useUI';
import { UserManagementTable } from '@/components/admin/UserManagementTable';
import { UserRole, PAGE_CONSTANTS, AdminUsersPageState } from '@/types';





export const AdminUsersPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all');
  
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [currentPage, setCurrentPage] = useState(1);

  const {
    users,
    pagination: serverPagination,
    isLoading,
    error,
    refetch
  } = useAdminUsers({
    page: currentPage,
    limit: PAGE_CONSTANTS.USERS_PER_PAGE,
    role: selectedRole !== 'all' ? selectedRole : undefined,
  });





  // Filter users by search term (client-side filtering until backend search is implemented)
  const filteredUsers = debouncedSearch 
    ? users.filter(user => 
        user.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        user.email?.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : users;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <LoadingSpinner className="h-8 w-8 mx-auto" />
              <p className="text-muted-foreground">Loading users...</p>
            </div>
          </div>
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
              {t('admin.users.title', 'Users Management')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {t('admin.users.subtitle', 'View and manage all system users')}
            </p>
          </div>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            {t('common.refresh', 'Refresh')}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t('admin.users.error', 'Failed to load users')}: {error.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Users Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('admin.users.listTitle', 'All Users')}
            {serverPagination && (
              <Badge variant="outline">
                {serverPagination.total} total
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            {t('admin.users.listDescription', 'Browse and search through all registered users')}
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
            pagination={serverPagination}
            onPageChange={setCurrentPage}
            showActions={true}
          />
          
          {searchTerm && filteredUsers.length === 0 && (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                {t('admin.users.noSearchResults', 'Try adjusting your search criteria')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsersPage;
