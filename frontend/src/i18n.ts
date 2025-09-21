import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslations from './locales/en/common.json';
import esTranslations from './locales/es/common.json';
import frTranslations from './locales/fr/common.json';

// Define supported languages
export const SUPPORTED_LANGUAGES = ['en', 'es', 'fr'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

// Language resources
const resources = {
  en: {
    common: enTranslations,
  },
  es: {
    common: esTranslations,
  },
  fr: {
    common: frTranslations,
  },
};

// Initialize i18n
i18n
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  
  // pass the i18n instance to react-i18next
  .use(initReactI18next)
  
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    debug: process.env.NODE_ENV === 'development',
    
    // Default language
    fallbackLng: 'en',
    
    // Allowed languages
    supportedLngs: SUPPORTED_LANGUAGES,
    
    // Don't load languages that we don't support
    nonExplicitSupportedLngs: false,
    
    // Language detection options
    detection: {
      // Detection order and caches user language
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
      // checkWhitelist: true,
    },
    
    // Resources
    resources,
    
    // Default namespace
    defaultNS: 'common',
    
    // Key separator (set to false to use keys like 'auth.login')
    keySeparator: '.',
    
    // Interpolation options
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    
    // React options
    react: {
      useSuspense: false, // We'll handle loading states manually
      bindI18n: 'languageChanged',
      bindI18nStore: 'added removed',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'em'],
    },
  });

// Helper function to get current language
export const getCurrentLanguage = (): SupportedLanguage => {
  return i18n.language as SupportedLanguage || 'en';
};

// Helper function to change language
export const changeLanguage = (lng: SupportedLanguage) => {
  return i18n.changeLanguage(lng);
};

// Helper function to get language display name
export const getLanguageDisplayName = (lng: SupportedLanguage): string => {
  const names = {
    en: 'English',
    es: 'Español',
    fr: 'Français',
  };
  return names[lng];
};

// Type-safe translation function
export const t = (key: string, options?: any) => i18n.t(key, options);

export default i18n;
