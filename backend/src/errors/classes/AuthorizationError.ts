import { ApplicationError, IErrorContext, IErrorActionable } from '../base';
import { ErrorCode } from '@/types/error-codes';

/**
 * Authorization-related errors
 */
export class AuthorizationError extends ApplicationError {
  constructor(
    code: ErrorCode = ErrorCode.AUTHZ_INSUFFICIENT_PERMISSIONS,
    message?: string,
    context: Partial<IErrorContext> = {},
    actionable: Partial<IErrorActionable> = {}
  ) {
    super(code, message, context, {
      action: 'CONTACT_SUPPORT',
      userMessage: 'You do not have permission to perform this action',
      ...actionable,
    });
  }
}
