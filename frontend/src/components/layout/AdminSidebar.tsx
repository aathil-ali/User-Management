import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Shield
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { AdminSidebarProps } from '@/types';

/**
 * Admin Sidebar Navigation
 */
export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen = true, onClose }) => {
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    {
      label: t('admin.sidebar.dashboard', 'Admin Dashboard'),
      href: '/admin',
      icon: LayoutDashboard,
    },
    {
      label: t('admin.sidebar.userManagement', 'User Management'),
      href: '/admin/users',
      icon: Users,
    },
    {
      label: t('admin.sidebar.createUser', 'Create User'),
      href: '/admin/users/create',
      icon: UserPlus,
    },
  ];

  const isItemActive = (href: string) => {
    if (href === '/admin') {
      return location.pathname === '/admin';
    }
    if (href === '/admin/users') {
      return location.pathname === '/admin/users'; // Exact match for users page
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
      
      {/* Admin Sidebar */}
      <aside className={cn(
        "fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-64 bg-background border-r transition-transform duration-200 ease-in-out lg:static lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full bg-red-50 dark:bg-red-900/10 border-r border-red-200 dark:border-red-800/20">
          {/* Admin Header */}
          <div className="p-4 border-b border-red-200 dark:border-red-800/20">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-red-900 dark:text-red-300">
                  {t('admin.sidebar.title', 'Admin Panel')}
                </h2>
                <p className="text-xs text-red-600 dark:text-red-400">
                  {t('admin.sidebar.subtitle', 'System Administration')}
                </p>
              </div>
            </div>
          </div>
          
          {/* Navigation Items */}
          <nav className="flex-1 p-4">
            <h3 className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wider mb-3">
              {t('admin.sidebar.management', 'Management')}
            </h3>
            <ul className="space-y-1">
              {navItems.map((item) => {
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
                          ? 'bg-red-600 text-white shadow-sm'
                          : 'text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 hover:bg-red-100 dark:hover:bg-red-800/20'
                      )}
                    >
                      <Icon className={cn(
                        "h-5 w-5 flex-shrink-0",
                        active ? "text-white" : "text-red-500 dark:text-red-400"
                      )} />
                      <span>{item.label}</span>
                      {active && (
                        <div className="ml-auto h-1.5 w-1.5 bg-white rounded-full" />
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>
          
          {/* Admin Footer */}
          <div className="p-4 border-t border-red-200 dark:border-red-800/20">
            <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-red-800 dark:text-red-300">
                <Shield className="h-4 w-4" />
                <span className="text-xs font-medium">
                  {t('admin.sidebar.privilege', 'Administrative Access')}
                </span>
              </div>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                {t('admin.sidebar.warning', 'Use admin features responsibly')}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
