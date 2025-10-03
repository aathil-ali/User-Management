/**
 * Actionable guidance for error resolution
 */
export interface IErrorActionable {
  userMessage?: string;
  developerMessage?: string;
  action?: 'RETRY' | 'REFRESH_TOKEN' | 'CONTACT_SUPPORT' | 'CHECK_INPUT' | 'CORRECT_INPUT' | 'WAIT_AND_RETRY' | 'LOGIN_REQUIRED' | 'UPGRADE_REQUIRED';
  retryAfter?: number; // seconds
  supportUrl?: string;
  documentationUrl?: string;
}
