import React, { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { LoadingSpinner } from '@/components/ui/Loading';

interface AccountDangerZoneProps {
  onDeleteAccount: () => void;
  isDeleting?: boolean;
  error?: any;
}

export const AccountDangerZone: React.FC<AccountDangerZoneProps> = ({
  onDeleteAccount,
  isDeleting = false,
  error,
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleDeleteClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmDelete = () => {
    onDeleteAccount();
    setShowConfirmation(false);
  };

  const handleCancelDelete = () => {
    setShowConfirmation(false);
  };

  return (
    <Card className="border-red-200 dark:border-red-800">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-red-600 dark:text-red-400">
          <AlertTriangle className="h-5 w-5" />
          <span>Danger Zone</span>
        </CardTitle>
        <CardDescription>
          Irreversible and destructive actions
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>
              {error.message || 'An error occurred while deleting the account'}
            </AlertDescription>
          </Alert>
        )}

        {!showConfirmation ? (
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Delete Account</AlertTitle>
              <AlertDescription className="mt-2">
                Once you delete your account, there is no going back. This will permanently 
                delete your account and remove all associated data from our servers.
              </AlertDescription>
            </Alert>

            <div className="flex justify-start">
              <Button
                variant="destructive"
                onClick={handleDeleteClick}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Are you absolutely sure?</AlertTitle>
              <AlertDescription className="mt-2">
                This action cannot be undone. This will permanently delete your account 
                and remove all of your data from our servers.
              </AlertDescription>
            </Alert>

            <div className="flex items-center space-x-2">
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Yes, Delete My Account
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleCancelDelete}
                disabled={isDeleting}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AccountDangerZone;