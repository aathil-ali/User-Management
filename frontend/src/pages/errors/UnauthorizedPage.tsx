import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useTranslation } from 'react-i18next';

export const UnauthorizedPage: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">401 - {t('pages.unauthorized.title')}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              {t('pages.unauthorized.description')}
            </p>
            <Button asChild>
              <Link to="/dashboard">{t('navigation.dashboard')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
