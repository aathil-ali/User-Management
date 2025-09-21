import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users, UserCheck, UserX, Shield } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { AdminStatsProps } from '@/types';

export const AdminStats: React.FC<AdminStatsProps> = ({ stats, isLoading = false }) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('admin.stats.totalUsers', 'Total Users')}
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers || 0}</div>
          <p className="text-xs text-muted-foreground">
            {t('admin.stats.allRegistered', 'All registered users')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('admin.stats.activeUsers', 'Active Users')}
          </CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.activeUsers || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            {t('admin.stats.currentlyActive', 'Currently active')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('admin.stats.suspendedUsers', 'Suspended')}
          </CardTitle>
          <UserX className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {stats.suspendedUsers || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            {t('admin.stats.temporarilyBlocked', 'Temporarily blocked')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('admin.stats.adminUsers', 'Administrators')}
          </CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {stats.adminUsers || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            {t('admin.stats.systemAdmins', 'System administrators')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStats;