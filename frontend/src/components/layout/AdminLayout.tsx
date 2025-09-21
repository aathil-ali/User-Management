import React from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AdminNavbar } from './AdminNavbar';
import { AdminSidebar } from './AdminSidebar';
import { Footer } from './Footer';

/**
 * Admin Layout Component
 * 
 * Layout for admin pages with specialized navigation and features
 */
export const AdminLayout: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      {/* Admin navigation bar */}
      <AdminNavbar />
      
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Admin sidebar */}
        <AdminSidebar />
        
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-6 max-w-7xl">
            {/* Admin badge */}
            <div className="mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-red-600 dark:text-red-400">
                  {t('admin.dashboard.title', 'Admin Dashboard')}
                </span>
              </div>
            </div>
            
            {/* Page content */}
            <Outlet />
          </div>
          
          {/* Footer */}
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
