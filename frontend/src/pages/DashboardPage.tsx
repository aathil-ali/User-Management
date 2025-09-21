import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Users, Activity } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar';
import { Separator } from '@/components/ui/Separator';

import { useAuth } from '@/contexts/AuthContext';
import { UserRole, isAdmin } from '@/types';
import { getInitials, formatDate } from '@/lib/page-utils';



export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const userInitials = getInitials(currentUser?.name || '');

  const isUserAdmin = currentUser?.role && isAdmin(currentUser.role);

  return (
    <div className="space-y-6 p-6">
      {/* Welcome Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome back, {currentUser?.name}!
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening in your account today.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentUser?.avatar || undefined} alt={currentUser?.name} />
                <AvatarFallback className="text-xs">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {currentUser?.name}
                </span>
                <span className="text-xs text-muted-foreground capitalize">
                  {currentUser?.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Status Alerts */}
      {isUserAdmin && (
        <Alert>
          <Users className="h-4 w-4" />
          <AlertTitle>Admin Access</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>
              You have administrator privileges. Access the admin panel to manage users.
            </span>
            <Button variant="outline" size="sm" asChild>
              <a href="/admin">
                Admin Panel
              </a>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Last Login
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentUser?.lastLogin ? formatDate(currentUser.lastLogin, { relative: true }) : 'Never'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Account Status
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge variant={currentUser?.isActive ? "default" : "secondary"} className="capitalize">
                {currentUser?.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Member Since
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentUser?.createdAt ? formatDate(currentUser.createdAt) : 'N/A'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Account Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Account Overview</CardTitle>
            <CardDescription>
              Manage your account settings and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Profile</p>
                <p className="text-sm text-muted-foreground">
                  Update your personal information
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href="/profile">
                  Edit Profile
                </a>
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Settings</p>
                <p className="text-sm text-muted-foreground">
                  Configure your account preferences
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href="/settings">
                  Settings
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Getting Started */}
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Welcome to the user management system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground space-y-2">
              <p>✅ Account created successfully</p>
              <p>✅ Logged in to the system</p>
              <p>• Update your profile information</p>
              <p>• Explore available features</p>
              {isUserAdmin && <p>• Access the admin panel to manage users</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;