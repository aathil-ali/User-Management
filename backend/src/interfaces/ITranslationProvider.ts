import { TranslationKeys } from '@/types/i18n.types';

/**
 * Translation Provider Interface
 * Follows Open/Closed Principle - allows extension without modification
 * Makes TranslationService extensible for adding new languages
 */
export interface ITranslationProvider {
  /**
   * Load all available translations
   * @returns Record of language code to translations
   */
  loadLanguages(): Record<string, TranslationKeys>;
  
  /**
   * Get list of supported language codes
   * @returns Array of supported language codes
   */
  getSupportedLanguages(): string[];
  
  /**
   * Check if a language is supported
   * @param languageCode - Language code to check
   * @returns True if language is supported
   */
  isLanguageSupported(languageCode: string): boolean;
  
  /**
   * Get fallback language when requested language is not available
   * @returns Default fallback language code
   */
  getFallbackLanguage(): string;
}

/**
 * Default implementation that loads from JSON files
 * Follows current structure but allows for future extensibility
 */
export class JsonTranslationProvider implements ITranslationProvider {
  private translations: Record<string, TranslationKeys>;
  private supportedLanguages: string[];
  private fallbackLanguage: string = 'en';

  constructor() {
    // Dynamic imports would be better, but for now maintain current structure
    this.translations = this.loadStaticTranslations();
    this.supportedLanguages = Object.keys(this.translations);
  }

  private loadStaticTranslations(): Record<string, TranslationKeys> {
    // For now, we'll keep the static imports but structure it for extensibility
    try {
      const enTranslations = require('@/translations/en.json');
      const esTranslations = require('@/translations/es.json'); 
      const frTranslations = require('@/translations/fr.json');
      
      return {
        'en': enTranslations as TranslationKeys,
        'es': esTranslations as TranslationKeys,
        'fr': frTranslations as TranslationKeys,
      };
    } catch (error) {
      console.warn('Failed to load some translation files:', error);
      // Return empty object as fallback - let translation service handle missing keys
      return {
        'en': {} as TranslationKeys
      };
    }
  }

  loadLanguages(): Record<string, TranslationKeys> {
    return this.translations;
  }

  getSupportedLanguages(): string[] {
    return [...this.supportedLanguages]; // Return copy to prevent mutation
  }

  isLanguageSupported(languageCode: string): boolean {
    return this.supportedLanguages.includes(languageCode);
  }

  getFallbackLanguage(): string {
    return this.fallbackLanguage;
  }
}

/**
 * Database Translation Provider (Future Implementation)
 * Example of how to extend the system without modifying existing code
 */
export class DatabaseTranslationProvider implements ITranslationProvider {
  private dbConnection: any; // Database connection would go here
  
  constructor(dbConnection: any) {
    this.dbConnection = dbConnection;
  }
  
  loadLanguages(): Record<string, TranslationKeys> {
    // Future implementation: Load from database
    throw new Error('Database translation provider not yet implemented');
  }
  
  getSupportedLanguages(): string[] {
    // Future implementation: Query database for available languages
    throw new Error('Database translation provider not yet implemented');
  }
  
  isLanguageSupported(languageCode: string): boolean {
    return this.getSupportedLanguages().includes(languageCode);
  }
  
  getFallbackLanguage(): string {
    return 'en';
  }
}

/**
 * Remote Translation Provider (Future Implementation)
 * Another example of extensibility
 */
export class RemoteTranslationProvider implements ITranslationProvider {
  private apiUrl: string;
  private apiKey: string;
  
  constructor(apiUrl: string, apiKey: string) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
  }
  
  loadLanguages(): Record<string, TranslationKeys> {
    // Future implementation: Fetch from remote API
    throw new Error('Remote translation provider not yet implemented');
  }
  
  getSupportedLanguages(): string[] {
    // Future implementation: Get from remote API
    throw new Error('Remote translation provider not yet implemented');
  }
  
  isLanguageSupported(languageCode: string): boolean {
    return this.getSupportedLanguages().includes(languageCode);
  }
  
  getFallbackLanguage(): string {
    return 'en';
  }
}
