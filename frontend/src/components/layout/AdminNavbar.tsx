import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { UserAvatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import LanguageSelector from '@/components/common/LanguageSelector';
import { ROUTES } from '@/lib/constants';

/**
 * Admin Navigation Bar
 */
export const AdminNavbar: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="h-16 bg-card border-b border-border px-4 flex items-center justify-between">
      <div className="flex items-center space-x-6">
        <Link to={ROUTES.ADMIN} className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        <LanguageSelector compact />
        <ThemeToggle />
        
        {user && (
          <div className="flex items-center space-x-3">
            <UserAvatar 
              name={user.name} 
              src={user.avatar}
              size="sm"
            />
            <div className="hidden md:block">
              <p className="text-sm font-medium text-foreground">{user.name}</p>
              <p className="text-xs text-red-600 dark:text-red-400">Administrator</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLogout}
            >
              {t('auth.logout')}
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AdminNavbar;
