import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/Loading';
import { Alert, AlertDescription } from '@/components/ui/Alert';

import { ProfileView } from '@/components/profile/ProfileView';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { BackendProfileFormData } from '@/lib/validations';
import { ProfilePageState } from '@/types';
import { useTranslation } from 'react-i18next';

export const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const { user: authUser } = useAuth();
  const {
    profile,
    isLoading,
    error,
    updateProfileAsync,
    isUpdating,
    updateError
  } = useProfile();

  // Use auth context user as fallback if profile API fails
  const displayUser = profile || authUser;

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSubmit = (data: BackendProfileFormData) => {
    updateProfileAsync(data)
      .then(() => {
        setIsEditing(false);
      })
      .catch((error) => {
        // Error is handled by the mutation's onError callback
        console.error('Profile update failed:', error);
      });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner className="h-8 w-8 mx-auto" />
          <p className="text-muted-foreground">{t('profile.loadingProfile')}</p>
        </div>
      </div>
    );
  }

  if (error && !authUser) {
    // Only show error if we don't have auth user as fallback
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              {t('profile.failedToLoad')}: {error.message}
            </AlertDescription>
          </Alert>
          <Button
            onClick={() => window.location.reload()}
            className="w-full"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!displayUser) {
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isEditing ? t('profile.editProfile') : t('profile.myProfile')}
            </h1>
            <p className="text-muted-foreground">
              {isEditing
                ? t('profile.updateInfo')
                : t('profile.viewInfo')
              }
            </p>
          </div>
        </div>
      </div>

      {/* Warning banner when using fallback data */}
      {error && authUser && (
        <Alert className="max-w-4xl mx-auto mb-6">
          <AlertDescription>
            <strong>Notice:</strong> Profile data could not be loaded from the server.
            Showing basic account information. Some features may be limited.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        {isEditing ? (
          <ProfileForm
            user={displayUser}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isUpdating}
            error={updateError}
          />
        ) : (
          <ProfileView
            user={displayUser}
            onEdit={handleEdit}
          />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;