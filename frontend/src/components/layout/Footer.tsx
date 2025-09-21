import React from 'react';
// import { useTranslation } from 'react-i18next';

/**
 * Footer Component
 */
export const Footer: React.FC = () => {
  // const { t } = useTranslation();

  return (
    <footer className="mt-auto py-6 px-4 border-t border-border bg-card/50">
      <div className="text-center text-sm text-muted-foreground">
        <div className="flex justify-center items-center space-x-4 mb-2">
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
          <span>•</span>
          <a href="#" className="hover:text-foreground transition-colors">
            Documentation
          </a>
        </div>
        <div className="text-xs">
          © 2024 UserHub. All rights reserved. | Built with React, TypeScript & Tailwind CSS
        </div>
      </div>
    </footer>
  );
};

export default Footer;
