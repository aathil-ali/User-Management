/**
 * User-friendly error message mappings for API error codes using i18n
 */

import { TFunction } from 'i18next';

/**
 * Get a user-friendly error message for an error code using translations
 * @param error - The error code from the API
 * @param t - Translation function
 * @returns User-friendly error message
 */
export function getAuthErrorMessage(
  error: string | null | undefined, 
  t: TFunction
): string {
  if (!error) return t('errors.generic');
  
  return t(`errors.${error}`, t('errors.generic'));
}

/**
 * Get a specific error message for login attempts
 */
export function getLoginErrorMessage(error: string | null | undefined, t: TFunction): string {
  return getAuthErrorMessage(error, t);
}

/**
 * Get a specific error message for registration attempts
 */
export function getRegistrationErrorMessage(error: string | null | undefined, t: TFunction): string {
  return getAuthErrorMessage(error, t);
}

/**
 * Get a specific error message for password reset attempts
 */
export function getPasswordResetErrorMessage(error: string | null | undefined, t: TFunction): string {
  return getAuthErrorMessage(error, t);
}
