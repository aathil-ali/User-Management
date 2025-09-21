import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useTranslation } from 'react-i18next';

export const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white">404</h1>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            {t('pages.notFound.title')}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t('pages.notFound.description')}
          </p>
          <div className="mt-6">
            <Button asChild>
              <Link to="/">{t('pages.notFound.goHome')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
