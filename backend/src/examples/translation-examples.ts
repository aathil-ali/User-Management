import { t, TranslationService } from '@/services/TranslationService';

/**
 * Translation System Usage Examples
 * 
 * This file demonstrates how to use the translation system throughout the application.
 * All hardcoded strings have been replaced with translation keys for internationalization.
 */

// Example 1: Basic usage with the global translation service
export function basicTranslationExample() {
  // Using category methods
  console.log(t.auth('login_success'));
  console.log(t.user('profile_updated'));
  console.log(t.validation('email_required'));
  console.log(t.errors('unknown_error'));
  
  // Using the general t() method
  console.log(t.t('auth.login_failed'));
  console.log(t.t('server.route_not_found', { route: '/api/test' }));
}

// Example 2: Variable interpolation
export function variableInterpolationExample() {
  // Password minimum length with variable
  const minLength = t.validation('password_min_length', { min: 8 });
  console.log(minLength); // "Password must be at least 8 characters long"
  
  // Server starting message with port
  const serverMessage = t.server('server_starting', { port: 3000 });
  console.log(serverMessage); // "Server starting on port 3000"
  
  // Route not found with dynamic route
  const notFoundMessage = t.server('route_not_found', { route: '/api/users/123' });
  console.log(notFoundMessage); // "Route /api/users/123 not found"
}

// Example 3: Language switching
export function languageSwitchingExample() {
  const translationService = TranslationService.getInstance();
  
  // English (default)
  console.log(translationService.auth('login_success')); // "Login successful"
  
  // Switch to Spanish
  translationService.setLanguage('es');
  console.log(translationService.auth('login_success')); // "Inicio de sesión exitoso"
  
  // Switch to French
  translationService.setLanguage('fr');
  console.log(translationService.auth('login_success')); // "Connexion réussie"
  
  // Back to English
  translationService.setLanguage('en');
  console.log(translationService.auth('login_success')); // "Login successful"
}

// Example 4: Using translations in middleware/controllers
export function middlewareExample() {
  // In a controller or middleware, you get the localized translation service from the request
  // This is automatically set by the LanguageMiddleware based on:
  // 1. ?lang=es query parameter
  // 2. Accept-Language header
  // 3. Default to English
  
  /*
  // Example usage in a controller:
  async login(req: LocalizedRequest, res: Response): Promise<void> {
    try {
      const t = LanguageMiddleware.getTranslationService(req);
      const result = await this.authService.login(req.body);
      res.json(ResponseDto.success(t.auth('login_success'), result));
    } catch (error) {
      const t = LanguageMiddleware.getTranslationService(req);
      res.status(400).json(ResponseDto.error(t.auth('login_failed'), error.message));
    }
  }
  */
}

// Example 5: All available translation categories
export function allCategoriesExample() {
  // Authentication messages
  console.log('=== Auth Messages ===');
  console.log(t.auth('registration_success'));
  console.log(t.auth('invalid_credentials'));
  console.log(t.auth('authentication_required'));
  
  // User management messages
  console.log('=== User Messages ===');
  console.log(t.user('profile_retrieved'));
  console.log(t.user('account_deleted'));
  console.log(t.user('user_not_found'));
  
  // Validation messages
  console.log('=== Validation Messages ===');
  console.log(t.validation('email_invalid'));
  console.log(t.validation('password_required'));
  console.log(t.validation('validation_failed'));
  
  // Authorization messages
  console.log('=== Authorization Messages ===');
  console.log(t.authorization('insufficient_permissions'));
  console.log(t.authorization('admin_access_required'));
  
  // Server messages
  console.log('=== Server Messages ===');
  console.log(t.server('routes_initialized'));
  console.log(t.server('internal_server_error'));
  
  // Database messages
  console.log('=== Database Messages ===');
  console.log(t.database('connection_failed'));
  console.log(t.database('query_failed'));
  
  // Audit messages
  console.log('=== Audit Messages ===');
  console.log(t.audit('user_registered'));
  console.log(t.audit('profile_updated'));
  
  // Error messages
  console.log('=== Error Messages ===');
  console.log(t.errors('method_not_implemented'));
  console.log(t.errors('operation_failed'));
}

// Example 6: Supported languages
export function supportedLanguagesExample() {
  const translationService = TranslationService.getInstance();
  const supportedLanguages = translationService.getSupportedLanguages();
  
  console.log('Supported languages:', supportedLanguages); // ['en', 'es', 'fr']
  console.log('Current language:', translationService.getCurrentLanguage()); // 'en'
}

/**
 * API Request Examples:
 * 
 * 1. Using query parameter:
 *    GET /api/users/profile?lang=es
 *    Response will be in Spanish
 * 
 * 2. Using Accept-Language header:
 *    GET /api/users/profile
 *    Accept-Language: fr,en;q=0.9
 *    Response will be in French
 * 
 * 3. Multiple languages with quality scores:
 *    Accept-Language: fr-CA,fr;q=0.9,en;q=0.8,es;q=0.7
 *    Will prefer French, then English, then Spanish
 * 
 * 4. Unsupported language falls back to English:
 *    Accept-Language: de,it;q=0.8
 *    Response will be in English (default)
 */
