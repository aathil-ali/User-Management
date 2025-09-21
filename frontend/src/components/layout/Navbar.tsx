import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, User, LogOut, Settings, Shield } from 'lucide-react';

import { Button } from '../../components/ui/Button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
// import { Separator } from '../../components/ui/Separator';

import { useAuth } from '../../contexts/AuthContext';
import { UserRole, isAdmin } from '@/types';
import { useToast } from '../../contexts/ToastContext';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Main Navigation Bar
 * 
 * Top navigation for authenticated users
 */
export const Navbar: React.FC<{ toggleSidebar?: () => void }> = ({ toggleSidebar }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const { theme, setTheme } = useTheme();

  const currentUser = user;
  const userInitials = currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';
  const isUserAdmin = currentUser?.role && isAdmin(currentUser.role);
  
  const handleLogout = async () => {
    try {
      await logout();
      addToast({ type: 'success', message: t('auth.logoutSuccess', 'Successfully logged out') });
    } catch (error) {
      console.error('Logout failed:', error);
      addToast({ type: 'error', message: t('auth.logoutError', 'Failed to log out') });
    }
  };

  return (
    <nav className="h-16 bg-background border-b px-4 flex items-center justify-between sticky top-0 z-30">
      {/* Left Side - Logo and Menu Toggle */}
      <div className="flex items-center space-x-4">
        {toggleSidebar && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="md:hidden" 
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        
        <Link to="/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">UserManage</h1>
        </Link>
      </div>

      {/* Right Side - Actions and User Profile */}
      <div className="flex items-center space-x-4">
        {/* Theme Toggle */}
        <div className="hidden sm:flex">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 8.002-4.248Z" />
              </svg>
            )}
          </Button>
        </div>
        
        {/* Admin Panel Link (if admin) */}
        {isUserAdmin && (
          <Link to="/admin">
            <Button
              variant={location.pathname.startsWith('/admin') ? 'default' : 'ghost'}
              size="sm"
              className="hidden sm:flex"
            >
              <Shield className="h-4 w-4 mr-2" />
              {t('nav.adminPanel', 'Admin')}
            </Button>
          </Link>
        )}
        
        {/* User Profile Dropdown */}
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {currentUser?.name}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {isUserAdmin ? (
                <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/20">
                  {t('roles.admin', 'Admin')}
                </Badge>
              ) : (
                t('roles.user', 'User')
              )}
            </span>
          </div>
          
          {/* Avatar and Dropdown */}
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={currentUser?.avatar || undefined} alt={currentUser?.name} />
              <AvatarFallback>
                {userInitials}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Link to="/profile">
                <Button
                  variant={location.pathname.startsWith('/profile') ? 'default' : 'outline'}
                  size="sm"
                >
                  <User className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{t('nav.profile', 'Profile')}</span>
                </Button>
              </Link>
              
              <Link to="/settings">
                <Button
                  variant={location.pathname.startsWith('/settings') ? 'default' : 'outline'}
                  size="sm"
                  className="hidden sm:flex"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {t('nav.settings', 'Settings')}
                </Button>
              </Link>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={false}
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{t('auth.logout', 'Logout')}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
