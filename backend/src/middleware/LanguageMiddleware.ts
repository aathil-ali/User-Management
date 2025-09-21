import { Request, Response, NextFunction } from 'express';
import { TranslationService } from '@/services/TranslationService';

// Request context interface for tracking requests
export interface RequestContext {
  correlationId?: string;
  requestId?: string;
  userId?: string;
  timestamp?: Date;
}

export interface LocalizedRequest extends Request {
  language?: string;
  t?: TranslationService;
  context?: RequestContext;
}

export class LanguageMiddleware {
  private static translationService = TranslationService.getInstance();

  /**
   * Middleware to detect and set the user's preferred language
   * Language is determined from:
   * 1. 'lang' query parameter
   * 2. 'Accept-Language' header
   * 3. Default to English
   */
  static detectLanguage(req: LocalizedRequest, res: Response, next: NextFunction): void {
    const supportedLanguages = LanguageMiddleware.translationService.getSupportedLanguages();
    let detectedLanguage = 'en'; // Default language

    // 1. Check query parameter first (highest priority)
    if (req.query.lang && typeof req.query.lang === 'string') {
      const queryLang = req.query.lang.toLowerCase();
      if (supportedLanguages.includes(queryLang as any)) {
        detectedLanguage = queryLang;
      }
    }
    // 2. Check Accept-Language header
    else if (req.headers['accept-language']) {
      const acceptLanguage = req.headers['accept-language'];
      const preferredLanguage = LanguageMiddleware.parseAcceptLanguage(acceptLanguage);
      
      if (preferredLanguage && supportedLanguages.includes(preferredLanguage as any)) {
        detectedLanguage = preferredLanguage;
      }
    }

    // Set the language for this request
    req.language = detectedLanguage;
    
    // Create a localized translation service for this request
    const localizedTranslation = TranslationService.getInstance();
    localizedTranslation.setLanguage(detectedLanguage as any);
    req.t = localizedTranslation;

    next();
  }

  /**
   * Parse Accept-Language header and return the most preferred supported language
   */
  private static parseAcceptLanguage(acceptLanguage: string): string | null {
    const supportedLanguages = LanguageMiddleware.translationService.getSupportedLanguages();
    
    // Parse Accept-Language header (e.g., "en-US,en;q=0.9,es;q=0.8")
    const languages = acceptLanguage
      .split(',')
      .map(lang => {
        const [code, quality] = lang.trim().split(';q=');
        return {
          code: code.split('-')[0].toLowerCase(), // Extract main language code
          quality: quality ? parseFloat(quality) : 1.0
        };
      })
      .sort((a, b) => b.quality - a.quality); // Sort by quality score

    // Find the first supported language
    for (const lang of languages) {
      if (supportedLanguages.includes(lang.code as any)) {
        return lang.code;
      }
    }

    return null;
  }

  /**
   * Get translation service with current request language
   */
  static getTranslationService(req: LocalizedRequest): TranslationService {
    return req.t || TranslationService.getInstance();
  }
}
