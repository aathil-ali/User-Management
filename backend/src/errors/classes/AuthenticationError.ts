import { ApplicationError, IErrorContext, IErrorActionable } from '../base';
import { ErrorCode } from '@/types/error-codes';

/**
 * Authentication-related errors
 */
export class AuthenticationError extends ApplicationError {
  constructor(
    code: ErrorCode = ErrorCode.AUTH_INVALID_CREDENTIALS,
    message?: string,
    context: Partial<IErrorContext> = {},
    actionable: Partial<IErrorActionable> = {}
  ) {
    super(code, message, context, {
      action: 'LOGIN_REQUIRED',
      userMessage: 'Please log in to continue',
      ...actionable,
    });
  }
}
