import { ApplicationError, IErrorContext, IErrorActionable } from '../base';
import { ErrorCode } from '@/types/error-codes';

/**
 * Resource not found errors
 */
export class NotFoundError extends ApplicationError {
  constructor(
    code: ErrorCode = ErrorCode.RESOURCE_NOT_FOUND,
    message?: string,
    context: Partial<IErrorContext> = {},
    actionable: Partial<IErrorActionable> = {}
  ) {
    super(code, message, context, {
      action: 'CHECK_INPUT',
      userMessage: 'The requested resource was not found',
      ...actionable,
    });
  }
}

/**
 * Resource conflict errors (duplicates, constraint violations)
 */
export class ConflictError extends ApplicationError {
  constructor(
    code: ErrorCode = ErrorCode.RESOURCE_ALREADY_EXISTS,
    message?: string,
    context: Partial<IErrorContext> = {},
    actionable: Partial<IErrorActionable> = {}
  ) {
    super(code, message, context, {
      action: 'CHECK_INPUT',
      userMessage: 'This resource already exists or conflicts with existing data',
      ...actionable,
    });
  }
}
