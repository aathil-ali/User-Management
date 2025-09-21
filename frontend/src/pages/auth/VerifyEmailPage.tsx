import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { VerifyEmailPageState } from '@/types';

export const VerifyEmailPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Verify Email</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600 dark:text-gray-400">
              This page is not yet implemented.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
