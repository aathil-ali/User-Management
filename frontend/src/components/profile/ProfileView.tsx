import React from 'react';
import { Edit, Calendar, Mail, User, Settings } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar';
import { Separator } from '@/components/ui/Separator';

import { ProfileViewProps, User as UserType, isAdmin } from '@/types';

// Helper function to get initials from name
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Helper function to format date
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onEdit }) => {
  const userInitials = getInitials(user.name);
  const isUserAdmin = isAdmin(user.role);

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.avatar || undefined} alt={user.name} />
                <AvatarFallback className="text-lg">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <CardTitle className="text-2xl">{user.name}</CardTitle>
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
                  <Badge variant="outline" className="capitalize">
                    {user.role}
                  </Badge>
                </div>
              </div>
            </div>
            <Button onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Account Information */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Account Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                <p className="text-sm">{user.name}</p>
              </div>
              
              <Separator />
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                <p className="text-sm">{user.email}</p>
              </div>
              
              <Separator />
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Role</label>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="capitalize">
                    {user.role}
                  </Badge>
                  {isUserAdmin && (
                    <span className="text-xs text-muted-foreground">Admin privileges</span>
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

        {/* Preferences & Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Preferences</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Theme</label>
                <p className="text-sm capitalize">
                  {user.preferences?.theme || 'Light'}
                </p>
              </div>
              
              <Separator />
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Language</label>
                <p className="text-sm">
                  {user.preferences?.language === 'en' ? 'English' :
                   user.preferences?.language === 'es' ? 'Español' :
                   user.preferences?.language === 'fr' ? 'Français' : 'English'}
                </p>
              </div>
              
              <Separator />
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Notifications</label>
                <Badge variant={user.preferences?.notifications ? "default" : "secondary"}>
                  {user.preferences?.notifications ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              
              {user.preferences?.timezone && (
                <>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Timezone</label>
                    <p className="text-sm">{user.preferences.timezone}</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Account Timeline</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Member Since</label>
              <p className="text-sm">{formatDate(user.createdAt)}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
              <p className="text-sm">{formatDate(user.updatedAt)}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Last Login</label>
              <p className="text-sm">
                {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileView;