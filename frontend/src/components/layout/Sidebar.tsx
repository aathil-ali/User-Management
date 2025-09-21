import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Home, 
  User, 
  Settings, 
  Shield, 
  Users, 
  Lock,
  // HelpCircle,
  FileText
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { UserRole, isAdmin, SidebarProps } from '@/types';

/**
 * Main Sidebar Navigation
 * 
 * Side navigation for authenticated users
 */
export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { user } = useAuth();
  
  const isUserAdmin = user?.role && isAdmin(user.role);

  const navItems = [
    {
      label: t('sidebar.dashboard', 'Dashboard'),
      href: '/dashboard',
      icon: Home,
      adminOnly: false,
    },
    {
      label: t('sidebar.profile', 'Profile'),
      href: '/profile',
      icon: User,
      adminOnly: false,
    },
    {
      label: t('sidebar.settings', 'Settings'),
      href: '/settings',
      icon: Settings,
      adminOnly: false,
    },
    {
      label: t('sidebar.changePassword', 'Security'),
      href: '/profile/password',
      icon: Lock,
      adminOnly: false,
    },
    // Admin only items
    {
      label: t('sidebar.adminPanel', 'Admin Panel'),
      href: '/admin',
      icon: Shield,
      adminOnly: true,
    },
    {
      label: t('sidebar.userManagement', 'User Management'),
      href: '/admin/users',
      icon: Users,
      adminOnly: true,
    },
  ];

  const filteredNavItems = navItems.filter(item => !item.adminOnly || isUserAdmin);

  const isItemActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-64 bg-background border-r transition-transform duration-200 ease-in-out lg:static lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Navigation Items */}
          <nav className="flex-1 p-4">
            <div className="mb-4">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {t('sidebar.navigation', 'Navigation')}
              </h2>
              <ul className="space-y-1">
                {filteredNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isItemActive(item.href);
                  
                  return (
                    <li key={item.href}>
                      <NavLink
                        to={item.href}
                        onClick={() => {
                          if (onClose && window.innerWidth < 1024) {
                            onClose();
                          }
                        }}
                        className={cn(
                          'flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                          active
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                        )}
                      >
                        <Icon className={cn(
                          "h-5 w-5 flex-shrink-0",
                          active ? "text-primary-foreground" : "text-gray-500 dark:text-gray-400"
                        )} />
                        <span>{item.label}</span>
                        {active && (
                          <div className="ml-auto h-1.5 w-1.5 bg-primary-foreground rounded-full" />
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
            
            {/* Admin Section */}
            {isUserAdmin && (
              <div className="mt-8">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  {t('sidebar.administration', 'Administration')}
                </h2>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/20 rounded-lg p-3">
                  <div className="flex items-center space-x-2 text-red-800 dark:text-red-400">
                    <Shield className="h-4 w-4" />
                    <span className="text-xs font-medium">
                      {t('sidebar.adminAccess', 'Admin Access')}
                    </span>
                  </div>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {t('sidebar.adminNote', 'You have administrator privileges')}
                  </p>
                </div>
              </div>
            )}
          </nav>
          
          {/* Footer */}
          <div className="p-4 border-t">
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>{t('sidebar.version', 'Version')} 1.0.0</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
