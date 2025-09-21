import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, 
  User as UserIcon, 
  Mail, 
  Calendar, 
  Shield, 
  Activity,
  AlertCircle,
  RefreshCw,
  Eye,
  Settings
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { LoadingSpinner } from '@/components/ui/Loading';
import { Separator } from '@/components/ui/Separator';

import { useAdminUser } from '@/hooks/useAdminUsers';
import { formatDate, getInitials } from '@/lib/page-utils';
import { UserRole, isAdmin, AdminUserDetailState } from '@/types';

export const AdminUserDetailPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    user,
    isLoading,
    error,
    refetch
  } = useAdminUser(userId);

  const userIsAdmin = user ? isAdmin(user.role) : false;

  if (!userId) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Invalid user ID provided.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <LoadingSpinner className="h-8 w-8 mx-auto" />
              <p className="text-muted-foreground">Loading user details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/users')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('common.back', 'Back to Users')}
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {user ? `${user.name || 'Unknown User'}` : t('admin.userDetail.title', 'User Details')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {t('admin.userDetail.subtitle', 'View and manage user information')}
              </p>
            </div>
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
            {t('admin.userDetail.error', 'Failed to load user details')}: {error.message}
          </AlertDescription>
        </Alert>
      )}

      {/* No User Found */}
      {!user && !error && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <UserIcon className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <h3 className="mt-4 text-lg font-medium text-muted-foreground">
              {t('admin.userDetail.notFound', 'User not found')}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground text-center max-w-md">
              The requested user could not be found or you may not have permission to view this user.
            </p>
          </CardContent>
        </Card>
      )}

      {/* User Details - Only show when user data exists */}
      {user && (
        <div className="space-y-6">
          {/* User Profile Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user.avatar || undefined} alt={user.name} />
                    <AvatarFallback className="text-lg">
                      {getInitials(user.name || user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <CardTitle className="text-2xl">{user.name || 'Unknown User'}</CardTitle>
                    <CardDescription className="text-base">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <span>{user.email}</span>
                      </div>
                    </CardDescription>
                    <div className="flex items-center space-x-2 pt-1">
                      <Badge variant={user.isActive ? "default" : "secondary"} className="capitalize">
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge 
                        variant={userIsAdmin ? "destructive" : "outline"} 
                        className="capitalize"
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" disabled>
                    <Settings className="h-4 w-4 mr-2" />
                    {t('admin.userDetail.editUser', 'Edit User')}
                    <span className="text-xs ml-2 opacity-60">(Coming Soon)</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* User Information */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserIcon className="h-5 w-5" />
                  <span>{t('admin.userDetail.accountInfo', 'Account Information')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">User ID</label>
                    <p className="text-sm font-mono">{user.id}</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                    <p className="text-sm">{user.name || 'Not provided'}</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                    <p className="text-sm font-mono">{user.email}</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Role & Permissions</label>
                    <div className="flex items-center space-x-2">
                      <Badge variant={userIsAdmin ? "destructive" : "outline"} className="capitalize">
                        {user.role}
                      </Badge>
                      {userIsAdmin && (
                        <span className="text-xs text-muted-foreground">Full system access</span>
                      )}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Account Status</label>
                    <Badge variant={user.isActive ? "default" : "secondary"} className="capitalize">
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>{t('admin.userDetail.timeline', 'Account Timeline')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                    <p className="text-sm">{user.createdAt ? formatDate(user.createdAt) : 'Unknown'}</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                    <p className="text-sm">{user.updatedAt ? formatDate(user.updatedAt) : 'Unknown'}</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Last Login</label>
                    <p className="text-sm">
                      {user.lastLogin ? formatDate(user.lastLogin, { relative: true }) : t('common.never', 'Never')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Preferences */}
          {user.preferences && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>{t('admin.userDetail.preferences', 'User Preferences')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Theme</label>
                    <p className="text-sm capitalize">
                      {user.preferences.theme || 'Default'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Language</label>
                    <p className="text-sm">
                      {user.preferences.language === 'en' ? 'English' :
                       user.preferences.language === 'es' ? 'Español' :
                       user.preferences.language === 'fr' ? 'Français' : 'English'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Notifications</label>
                    <Badge variant={user.preferences.notifications ? "default" : "secondary"}>
                      {user.preferences.notifications ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  
                  {user.preferences.timezone && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Timezone</label>
                      <p className="text-sm">{user.preferences.timezone}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Admin Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>{t('admin.userDetail.actions', 'Admin Actions')}</span>
              </CardTitle>
              <CardDescription>
                {t('admin.userDetail.actionsDescription', 'Administrative actions for this user')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" disabled>
                  <Settings className="h-4 w-4 mr-2" />
                  {t('admin.userDetail.editProfile', 'Edit Profile')}
                  <span className="text-xs ml-2 opacity-60">(Coming Soon)</span>
                </Button>
                
                <Button variant="outline" size="sm" disabled>
                  <Shield className="h-4 w-4 mr-2" />
                  {t('admin.userDetail.changeRole', 'Change Role')}
                  <span className="text-xs ml-2 opacity-60">(Coming Soon)</span>
                </Button>
                
                <Button variant="outline" size="sm" disabled>
                  <Activity className="h-4 w-4 mr-2" />
                  {user.isActive ? t('admin.userDetail.deactivate', 'Deactivate') : t('admin.userDetail.activate', 'Activate')}
                  <span className="text-xs ml-2 opacity-60">(Coming Soon)</span>
                </Button>

                <Alert className="mt-4 w-full">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>Note:</strong> User management actions will be available once the corresponding backend APIs are implemented.
                    The interface is ready and will work automatically when the backend supports these operations.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminUserDetailPage;
