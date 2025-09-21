import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDownIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { 
  changeLanguage, 
  getCurrentLanguage, 
  getLanguageDisplayName, 
  SUPPORTED_LANGUAGES,
  type SupportedLanguage 
} from '@/i18n';
import { cn } from '@/lib/utils';

interface LanguageSelectorProps {
  className?: string;
  showIcon?: boolean;
  compact?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  className,
  showIcon = true,
  compact = false 
}) => {
  const { t } = useTranslation();
  const currentLanguage = getCurrentLanguage();

  const handleLanguageChange = async (language: SupportedLanguage) => {
    try {
      await changeLanguage(language);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  return (
    <div className={cn('relative inline-block text-left', className)}>
      <div className="group">
        <button
          type="button"
          className={cn(
            'inline-flex items-center justify-center w-full px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700',
            compact && 'px-2 py-1'
          )}
          aria-expanded="true"
          aria-haspopup="true"
        >
          {showIcon && (
            <GlobeAltIcon className={cn('w-4 h-4 mr-2', compact && 'w-3 h-3 mr-1')} />
          )}
          <span className={cn('', compact && 'text-xs')}>
            {compact ? currentLanguage.toUpperCase() : getLanguageDisplayName(currentLanguage)}
          </span>
          <ChevronDownIcon className={cn('w-4 h-4 ml-2 -mr-1', compact && 'w-3 h-3 ml-1')} />
        </button>

        <div className="absolute right-0 z-10 mt-2 origin-top-right bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ring-1 ring-black ring-opacity-5 focus-within:opacity-100 focus-within:visible dark:bg-gray-800 dark:ring-gray-700">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {SUPPORTED_LANGUAGES.map((language) => (
              <button
                key={language}
                onClick={() => handleLanguageChange(language)}
                className={cn(
                  'block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white',
                  currentLanguage === language && 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white'
                )}
                role="menuitem"
              >
                <div className="flex items-center">
                  <span className="text-xs font-mono mr-3 opacity-60">
                    {language.toUpperCase()}
                  </span>
                  <span>{t(`languages.${language}`)}</span>
                  {currentLanguage === language && (
                    <span className="ml-auto">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelector;
