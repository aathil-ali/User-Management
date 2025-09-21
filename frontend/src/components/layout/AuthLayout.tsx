import React from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import LanguageSelector from '@/components/common/LanguageSelector';

/**
 * Authentication Layout Component
 * 
 * Layout for authentication pages (login, register, etc.)
 */
export const AuthLayout: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding/Hero */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10" />
        
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hero-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="2" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-pattern)" />
          </svg>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-12 py-12">
          {/* Logo and branding */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-foreground">UserHub</h1>
            </div>
            
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {t('auth.secureLogin')}
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Manage your users with confidence. Built with enterprise-grade security and modern design principles.
            </p>
          </div>
          
          {/* Features list */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span className="text-muted-foreground">Multi-language support</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span className="text-muted-foreground">Role-based access control</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span className="text-muted-foreground">Advanced user analytics</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span className="text-muted-foreground">Two-factor authentication</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Auth forms */}
      <div className="flex-1 flex flex-col">
        {/* Header with controls */}
        <div className="flex justify-between items-center p-6">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold text-foreground">UserHub</h1>
          </div>
          
          {/* Controls */}
          <div className="flex items-center space-x-2">
            <LanguageSelector compact />
            <ThemeToggle />
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md space-y-8">
            <Outlet />
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-border">
          <div className="flex justify-center items-center space-x-4 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy Policy
            </a>
            <span>•</span>
            <a href="#" className="hover:text-foreground transition-colors">
              Terms of Service
            </a>
            <span>•</span>
            <a href="#" className="hover:text-foreground transition-colors">
              Support
            </a>
          </div>
          <div className="text-center mt-2 text-xs text-muted-foreground">
            © 2024 UserHub. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
