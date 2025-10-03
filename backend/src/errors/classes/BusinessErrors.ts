import { ApplicationError, IErrorContext, IErrorActionable } from '../base';
import { ErrorCode } from '@/types/error-codes';

/**
 * Business logic errors
 */
export class BusinessError extends ApplicationError {
  constructor(
    code: ErrorCode = ErrorCode.BUSINESS_RULE_VIOLATION,
    message?: string,
    context: Partial<IErrorContext> = {},
    actionable: Partial<IErrorActionable> = {}
  ) {
    super(code, message, context, {
      action: 'CHECK_INPUT',
      userMessage: 'This operation violates business rules',
      ...actionable,
    });
  }
}

/**
 * Security-related errors
 */
export class SecurityError extends ApplicationError {
  constructor(
    code: ErrorCode = ErrorCode.SECURITY_SUSPICIOUS_ACTIVITY,
    message?: string,
    context: Partial<IErrorContext> = {},
    actionable: Partial<IErrorActionable> = {}
  ) {
    super(code, message, context, {
      action: 'CONTACT_SUPPORT',
      userMessage: 'Security violation detected. Your account may be temporarily restricted',
      ...actionable,
    });
  }
}

/**
 * Rate limiting errors
 */
export class RateLimitError extends ApplicationError {
  constructor(
    code: ErrorCode = ErrorCode.RATE_LIMIT_EXCEEDED,
    message?: string,
    context: Partial<IErrorContext> = {},
    actionable: Partial<IErrorActionable> = {}
  ) {
    super(code, message, context, {
      action: 'WAIT_AND_RETRY',
      userMessage: 'Too many requests. Please wait and try again',
      retryAfter: 60,
      ...actionable,
    });
  }
}
