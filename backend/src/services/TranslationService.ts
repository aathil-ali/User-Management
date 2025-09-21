import { TranslationKeys } from '@/types/i18n.types';
import { ITranslationProvider, JsonTranslationProvider } from '@/interfaces/ITranslationProvider';

/**
 * Translation Service - Now follows SOLID principles
 * - SRP: Only handles translation operations
 * - OCP: Open for extension via ITranslationProvider
 * - LSP: Proper interface contracts
 * - ISP: Focused interface
 * - DIP: Depends on ITranslationProvider abstraction
 */
export class TranslationService {
  private static instance: TranslationService;
  private currentLanguage: string = 'en';
  private translations: Record<string, TranslationKeys>;
  private translationProvider: ITranslationProvider;
  private supportedLanguages: string[];

  private constructor(translationProvider?: ITranslationProvider) {
    // Use dependency injection - follows DIP
    this.translationProvider = translationProvider || new JsonTranslationProvider();
    this.translations = this.translationProvider.loadLanguages();
    this.supportedLanguages = this.translationProvider.getSupportedLanguages();
  }

  /**
   * Get singleton instance with optional provider injection
   * Allows for testing and extensibility while maintaining singleton pattern
   */
  static getInstance(translationProvider?: ITranslationProvider): TranslationService {
    if (!TranslationService.instance || translationProvider) {
      TranslationService.instance = new TranslationService(translationProvider);
    }
    return TranslationService.instance;
  }

  /**
   * Reset singleton for testing purposes
   */
  static resetInstance(): void {
    TranslationService.instance = null!;
  }

  setLanguage(language: string): void {
    if (this.translationProvider.isLanguageSupported(language)) {
      this.currentLanguage = language;
    } else {
      console.warn(`Language '${language}' is not supported. Using fallback language.`);
      this.currentLanguage = this.translationProvider.getFallbackLanguage();
    }
  }

  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  getSupportedLanguages(): string[] {
    return this.translationProvider.getSupportedLanguages();
  }

  /**
   * Check if a language is supported
   */
  isLanguageSupported(language: string): boolean {
    return this.translationProvider.isLanguageSupported(language);
  }

  /**
   * Get the translation provider (for testing or inspection)
   */
  getTranslationProvider(): ITranslationProvider {
    return this.translationProvider;
  }

  /**
   * Get a nested translation key using dot notation
   * @param key - The translation key (e.g., 'auth.login_success')
   * @param variables - Variables to interpolate in the translation
   * @param language - Optional language override
   * @returns The translated string
   */
  t(key: string, variables?: Record<string, string | number>, language?: string): string {
    const lang = language || this.currentLanguage;
    
    // Ensure requested language is supported
    const targetLanguage = this.translationProvider.isLanguageSupported(lang) 
      ? lang 
      : this.translationProvider.getFallbackLanguage();
    
    const translation = this.getNestedValue(this.translations[targetLanguage], key);
    
    if (!translation) {
      // Fallback to default language if translation not found
      const fallbackLang = this.translationProvider.getFallbackLanguage();
      if (targetLanguage !== fallbackLang) {
        const fallback = this.getNestedValue(this.translations[fallbackLang], key);
        if (fallback) {
          return this.interpolateVariables(fallback, variables);
        }
      }
      return `[MISSING TRANSLATION: ${key}]`;
    }

    return this.interpolateVariables(translation, variables);
  }

  /**
   * Get translation for authentication messages
   */
  auth(key: keyof TranslationKeys['auth'], variables?: Record<string, string | number>): string {
    return this.t(`auth.${key}`, variables);
  }

  /**
   * Get translation for user messages
   */
  user(key: keyof TranslationKeys['user'], variables?: Record<string, string | number>): string {
    return this.t(`user.${key}`, variables);
  }

  /**
   * Get translation for validation messages
   */
  validation(key: keyof TranslationKeys['validation'], variables?: Record<string, string | number>): string {
    return this.t(`validation.${key}`, variables);
  }

  /**
   * Get translation for authorization messages
   */
  authorization(key: keyof TranslationKeys['authorization'], variables?: Record<string, string | number>): string {
    return this.t(`authorization.${key}`, variables);
  }

  /**
   * Get translation for server messages
   */
  server(key: keyof TranslationKeys['server'], variables?: Record<string, string | number>): string {
    return this.t(`server.${key}`, variables);
  }

  /**
   * Get translation for database messages
   */
  database(key: keyof TranslationKeys['database'], variables?: Record<string, string | number>): string {
    return this.t(`database.${key}`, variables);
  }

  /**
   * Get translation for audit messages
   */
  audit(key: keyof TranslationKeys['audit'], variables?: Record<string, string | number>): string {
    return this.t(`audit.${key}`, variables);
  }

  /**
   * Get translation for error messages
   */
  errors(key: keyof TranslationKeys['errors'], variables?: Record<string, string | number>): string {
    return this.t(`errors.${key}`, variables);
  }

  private getNestedValue(obj: any, key: string): string | undefined {
    const keys = key.split('.');
    let current = obj;
    
    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        return undefined;
      }
    }
    
    return typeof current === 'string' ? current : undefined;
  }

  private interpolateVariables(text: string, variables?: Record<string, string | number>): string {
    if (!variables) {
      return text;
    }

    return text.replace(/\{(\w+)\}/g, (match, key) => {
      return variables[key]?.toString() || match;
    });
  }
}

// Export a default instance for convenience
export const t = TranslationService.getInstance();
