import React from 'react';
import { Outlet } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

/**
 * Main Layout Component
 * 
 * Layout for authenticated users with sidebar navigation
 */
export const MainLayout: React.FC = () => {
  // const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation bar */}
      <Navbar />
      
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-6 max-w-7xl">
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

export default MainLayout;
