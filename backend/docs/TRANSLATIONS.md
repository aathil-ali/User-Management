# Translation System Documentation

## Overview

The User Management System implements a comprehensive internationalization (i18n) system that eliminates hardcoded strings and supports multiple languages. All user-facing messages, error messages, and system notifications are managed through translation files.

## Features

- ✅ **Type-safe translations** with TypeScript interfaces
- ✅ **Variable interpolation** for dynamic content
- ✅ **Automatic language detection** from HTTP headers and query parameters
- ✅ **Fallback mechanism** to English for missing translations
- ✅ **Categorized translations** for better organization
- ✅ **Request-scoped localization** for multi-user scenarios

## Supported Languages

- 🇺🇸 **English (en)** - Default language
- 🇪🇸 **Spanish (es)** - Full translation
- 🇫🇷 **French (fr)** - Full translation

## File Structure

```
backend/src/
├── translations/           # Translation files
│   ├── en.json            # English translations
│   ├── es.json            # Spanish translations
│   └── fr.json            # French translations
├── types/
│   └── i18n.types.ts      # Type definitions
├── services/
│   └── TranslationService.ts  # Translation logic
├── middleware/
│   └── LanguageMiddleware.ts  # Language detection
└── examples/
    └── translation-examples.ts  # Usage examples
```

## Translation Categories

### 1. Authentication (`auth`)
- `registration_success`, `login_success`, `logout_success`
- `invalid_credentials`, `authentication_required`
- `registration_failed`, `login_failed`, `logout_failed`
- `token_refresh_failed`, `token_refresh_success`
- `authentication_failed`, `not_implemented`

### 2. User Management (`user`)
- `profile_retrieved`, `profile_updated`, `profile_update_failed`
- `account_deleted`, `account_deletion_failed`
- `user_not_found`, `users_retrieved`, `users_retrieval_failed`

### 3. Validation (`validation`)
- `email_required`, `email_invalid`
- `password_required`, `password_min_length`
- `name_required`, `validation_failed`, `validation_error`

### 4. Authorization (`authorization`)
- `insufficient_permissions`, `admin_access_required`
- `authorization_error`

### 5. Server (`server`)
- `routes_initialized`, `routes_initialization_failed`
- `server_starting`, `graceful_shutdown`
- `internal_server_error`, `route_not_found`

### 6. Database (`database`)
- `connection_failed`, `transaction_failed`, `query_failed`

### 7. Audit (`audit`)
- `user_registered`, `user_logged_in`, `user_logged_out`
- `profile_updated`, `account_deleted`
- `admin_accessed_users`, `admin_accessed_user`

### 8. Errors (`errors`)
- `unknown_error`, `method_not_implemented`, `operation_failed`

## Usage Examples

### Basic Usage
```typescript
import { t } from '@/services/TranslationService';

// Category-specific methods (recommended)
console.log(t.auth('login_success')); // "Login successful"
console.log(t.user('profile_updated')); // "Profile updated successfully"
console.log(t.validation('email_required')); // "Email is required"

// General method with dot notation
console.log(t.t('auth.login_failed')); // "Login failed"
```

### Variable Interpolation
```typescript
// Password validation with minimum length
const message = t.validation('password_min_length', { min: 8 });
// Result: "Password must be at least 8 characters long"

// Server starting message
const serverMsg = t.server('server_starting', { port: 3000 });
// Result: "Server starting on port 3000"

// Dynamic route in error messages
const routeMsg = t.server('route_not_found', { route: '/api/users/123' });
// Result: "Route /api/users/123 not found"
```

### In Controllers and Middleware
```typescript
import { LocalizedRequest, LanguageMiddleware } from '@/middleware/LanguageMiddleware';

export class AuthController {
  async login(req: LocalizedRequest, res: Response): Promise<void> {
    try {
      const t = LanguageMiddleware.getTranslationService(req);
      const result = await this.authService.login(req.body);
      res.json(ResponseDto.success(t.auth('login_success'), result));
    } catch (error) {
      const t = LanguageMiddleware.getTranslationService(req);
      res.status(400).json(ResponseDto.error(
        t.auth('login_failed'), 
        error.message || t.errors('unknown_error')
      ));
    }
  }
}
```

### Language Detection

The system automatically detects the user's preferred language through:

1. **Query Parameter** (highest priority)
   ```
   GET /api/users/profile?lang=es
   ```

2. **Accept-Language Header**
   ```
   Accept-Language: fr-CA,fr;q=0.9,en;q=0.8,es;q=0.7
   ```

3. **Default to English** if no supported language is found

### Manual Language Switching
```typescript
import { TranslationService } from '@/services/TranslationService';

const translationService = TranslationService.getInstance();

// Switch to Spanish
translationService.setLanguage('es');
console.log(translationService.auth('login_success')); // "Inicio de sesión exitoso"

// Switch to French
translationService.setLanguage('fr');
console.log(translationService.auth('login_success')); // "Connexion réussie"
```

## API Examples

### 1. Spanish Response via Query Parameter
**Request:**
```http
POST /api/auth/login?lang=es
Content-Type: application/json

{
  "email": "invalid-email",
  "password": "short"
}
```

**Response:**
```json
{
  "success": false,
  "message": "Falló la validación",
  "error": "Por favor proporcione un email válido; La contraseña debe tener al menos 8 caracteres",
  "timestamp": "2023-09-16T17:52:03.000Z"
}
```

### 2. French Response via Accept-Language Header
**Request:**
```http
GET /api/users/nonexistent
Accept-Language: fr,en;q=0.9
```

**Response:**
```json
{
  "success": false,
  "message": "Route /api/users/nonexistent non trouvée",
  "timestamp": "2023-09-16T17:52:03.000Z"
}
```

## Adding New Languages

### 1. Create Translation File
Create a new JSON file in `src/translations/` (e.g., `de.json` for German):

```json
{
  "auth": {
    "login_success": "Anmeldung erfolgreich",
    "invalid_credentials": "Ungültige E-Mail oder Passwort",
    // ... all other keys
  },
  // ... all other categories
}
```

### 2. Update TranslationService
Add the new language to the `SupportedLanguage` type and translations object:

```typescript
type SupportedLanguage = 'en' | 'es' | 'fr' | 'de';

private constructor() {
  this.translations = {
    en: enTranslations as TranslationKeys,
    es: esTranslations as TranslationKeys,
    fr: frTranslations as TranslationKeys,
    de: deTranslations as TranslationKeys, // Add new import
  };
}

getSupportedLanguages(): SupportedLanguage[] {
  return ['en', 'es', 'fr', 'de']; // Add 'de'
}
```

### 3. Import New Translation
```typescript
import deTranslations from '@/translations/de.json';
```

## Best Practices

### 1. Always Use Translation Keys
❌ **Don't do this:**
```typescript
res.status(400).json({ error: "Email is required" });
```

✅ **Do this:**
```typescript
const t = LanguageMiddleware.getTranslationService(req);
res.status(400).json({ error: t.validation('email_required') });
```

### 2. Use Category-Specific Methods
❌ **Don't do this:**
```typescript
t.t('validation.email_required');
```

✅ **Do this:**
```typescript
t.validation('email_required');
```

### 3. Handle Variable Interpolation
❌ **Don't do this:**
```typescript
`Password must be at least ${minLength} characters long`
```

✅ **Do this:**
```typescript
t.validation('password_min_length', { min: minLength })
```

### 4. Provide Fallback for Errors
✅ **Good pattern:**
```typescript
catch (error) {
  const t = LanguageMiddleware.getTranslationService(req);
  const errorMessage = error instanceof Error ? error.message : t.errors('unknown_error');
  res.status(500).json(ResponseDto.error(t.errors('operation_failed'), errorMessage));
}
```

## Testing Translations

### Unit Tests for TranslationService
```typescript
import { TranslationService } from '@/services/TranslationService';

describe('TranslationService', () => {
  const translationService = TranslationService.getInstance();

  it('should return English translations by default', () => {
    expect(translationService.auth('login_success')).toBe('Login successful');
  });

  it('should switch to Spanish translations', () => {
    translationService.setLanguage('es');
    expect(translationService.auth('login_success')).toBe('Inicio de sesión exitoso');
  });

  it('should interpolate variables correctly', () => {
    const message = translationService.validation('password_min_length', { min: 8 });
    expect(message).toContain('8');
  });
});
```

### Integration Tests with Language Headers
```typescript
import request from 'supertest';
import app from '@/app';

describe('Language Detection', () => {
  it('should respond in Spanish when lang=es query param is used', async () => {
    const response = await request(app)
      .get('/api/nonexistent?lang=es')
      .expect(404);
      
    expect(response.body.message).toContain('no encontrada');
  });

  it('should respond in French when Accept-Language header is set', async () => {
    const response = await request(app)
      .get('/api/nonexistent')
      .set('Accept-Language', 'fr,en;q=0.9')
      .expect(404);
      
    expect(response.body.message).toContain('non trouvée');
  });
});
```

## Migration Guide

If you have existing hardcoded strings, follow these steps:

### 1. Identify Hardcoded Strings
Search for patterns like:
- `res.json({ message: "..." })`
- `throw new Error("...")`
- `console.log("...")`

### 2. Add Translation Keys
Add new keys to all translation files (`en.json`, `es.json`, `fr.json`).

### 3. Replace with Translation Calls
Replace hardcoded strings with appropriate translation methods.

### 4. Test All Languages
Verify that all new translations work correctly in all supported languages.

---

This translation system ensures that your User Management System is ready for international users and maintains consistency across all user-facing messages! 🌍
