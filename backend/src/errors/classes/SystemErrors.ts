import { ApplicationError, IErrorContext, IErrorActionable } from '../base';
import { ErrorCode } from '@/types/error-codes';

/**
 * Database-related errors
 */
export class DatabaseError extends ApplicationError {
  constructor(
    code: ErrorCode = ErrorCode.DB_QUERY_FAILED,
    message?: string,
    context: Partial<IErrorContext> = {},
    actionable: Partial<IErrorActionable> = {}
  ) {
    super(code, message, context, {
      action: 'RETRY',
      userMessage: 'A temporary database issue occurred. Please try again',
      ...actionable,
    });
  }
}

/**
 * External service errors
 */
export class ExternalServiceError extends ApplicationError {
  constructor(
    code: ErrorCode = ErrorCode.EXT_SERVICE_UNAVAILABLE,
    message?: string,
    context: Partial<IErrorContext> = {},
    actionable: Partial<IErrorActionable> = {}
  ) {
    super(code, message, context, {
      action: 'WAIT_AND_RETRY',
      userMessage: 'An external service is temporarily unavailable. Please try again later',
      retryAfter: 300,
      ...actionable,
    });
  }
}

/**
 * Internal server errors
 */
export class InternalServerError extends ApplicationError {
  constructor(
    code: ErrorCode = ErrorCode.SYSTEM_INTERNAL_ERROR,
    message?: string,
    context: Partial<IErrorContext> = {},
    actionable: Partial<IErrorActionable> = {}
  ) {
    super(code, message, context, {
      action: 'CONTACT_SUPPORT',
      userMessage: 'An unexpected error occurred. Please try again or contact support',
      ...actionable,
    });
  }
}

/**
 * Network-related errors
 */
export class NetworkError extends ApplicationError {
  constructor(
    code: ErrorCode = ErrorCode.NETWORK_TIMEOUT,
    message?: string,
    context: Partial<IErrorContext> = {},
    actionable: Partial<IErrorActionable> = {}
  ) {
    super(code, message, context, {
      action: 'RETRY',
      userMessage: 'Network issue detected. Please check your connection and try again',
      ...actionable,
    });
  }
}

/**
 * Unknown/Generic errors
 */
export class UnknownError extends ApplicationError {
  constructor(
    code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
    message?: string,
    context: Partial<IErrorContext> = {},
    actionable: Partial<IErrorActionable> = {}
  ) {
    super(code, message, context, {
      action: 'CONTACT_SUPPORT',
      userMessage: 'An unexpected error occurred. Please contact support if the issue persists',
      ...actionable,
    });
  }
}
