import React from 'react';
import { Settings, Shield, Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Separator } from '@/components/ui/Separator';
import { LoadingSpinner } from '@/components/ui/Loading';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';

import { AccountDangerZone } from '@/components/profile/AccountDangerZone';
import { useProfile, useAccountDeletion } from '@/hooks/useProfile';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/hooks/useUserMock';
import { SettingsPageState } from '@/types';

export const SettingsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { profile, isLoading, error } = useProfile();
  const { deleteAccount, isDeleting, error: deleteError } = useAccountDeletion();
  const { theme, setTheme } = useTheme();
  const { updatePreferences } = useUser();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner className="h-8 w-8 mx-auto" />
          <p className="text-muted-foreground">{t('profile.loadingSettings')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              {t('profile.failedToLoadSettings')}: {error.message}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Alert>
          <AlertDescription>
            No profile data available. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and security settings
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Account Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Account Overview</span>
            </CardTitle>
            <CardDescription>
              Basic information about your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="text-sm">{profile.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-sm">{profile.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Role</label>
                <p className="text-sm capitalize">{profile.role}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <p className="text-sm">{profile.isActive ? t('common.active') : t('common.inactive')}</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Profile Information</p>
                <p className="text-sm text-muted-foreground">
                  Update your name, avatar, and preferences
                </p>
              </div>
              <a 
                href="/profile" 
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              >
                Edit Profile
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Security</span>
            </CardTitle>
            <CardDescription>
              Manage your account security and authentication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Password</p>
                  <p className="text-sm text-muted-foreground">
                    Change your account password
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = '/profile/change-password'}
                >
                  Change Password
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  Coming Soon
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Active Sessions</p>
                  <p className="text-sm text-muted-foreground">
                    Manage your active login sessions
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  Coming Soon
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notifications</span>
            </CardTitle>
            <CardDescription>
              Configure how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  checked={profile.preferences?.notifications?.email ?? true}
                  onChange={async (e) => {
                    try {
                      await updatePreferences.mutateAsync({
                        ...profile.preferences,
                        notifications: {
                          email: e.target.checked,
                          push: profile.preferences?.notifications?.push ?? true,
                          marketing: profile.preferences?.notifications?.marketing ?? false,
                        }
                      });
                    } catch (error) {
                      console.error('Failed to update notification preferences:', error);
                    }
                  }}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Theme Preference</p>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred color theme
                  </p>
                </div>
                <select 
                  className="text-sm border border-gray-300 rounded px-2 py-1 bg-background"
                  value={theme}
                  onChange={(e) => {
                    const newTheme = e.target.value as 'light' | 'dark' | 'system';
                    setTheme(newTheme);
                  }}
                >
                  <option value="light">{t('themes.light')}</option>
                  <option value="dark">{t('themes.dark')}</option>
                  <option value="system">{t('themes.auto')}</option>
                </select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Language</p>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred language
                  </p>
                </div>
                <select 
                  className="text-sm border border-gray-300 rounded px-2 py-1 bg-background"
                  value={i18n.language}
                  onChange={async (e) => {
                    await i18n.changeLanguage(e.target.value);
                  }}
                >
                  <option value="en">{t('languages.en')}</option>
                  <option value="es">{t('languages.es')}</option>
                  <option value="fr">{t('languages.fr')}</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <AccountDangerZone
          onDeleteAccount={deleteAccount}
          isDeleting={isDeleting}
          error={deleteError}
        />
      </div>
    </div>
  );
};

export default SettingsPage;