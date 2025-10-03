import { ErrorCode, ERROR_CODE_REGISTRY } from '@/types/error-codes';
import { IErrorCodeMetadata } from '@/interfaces/errors/IErrorCodeMetadata';
import { ApplicationError, IErrorContext, IErrorActionable } from './base';
import {
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  ExternalServiceError,
  InternalServerError,
  NetworkError,
  UnknownError,
  BusinessError,
  SecurityError,
  RateLimitError
} from './classes';

/**
 * Error factory to create appropriate error instances based on error code
 */
export class ErrorFactory {
  static createError(
    code: ErrorCode,
    message?: string,
    context: Partial<IErrorContext> = {},
    actionable: Partial<IErrorActionable> = {}
  ): ApplicationError {
    const metadata: IErrorCodeMetadata = ERROR_CODE_REGISTRY[code];
    if (!metadata) {
      return new UnknownError(ErrorCode.UNKNOWN_ERROR, `Unknown error code: ${code}`, context, actionable);
    }

    // Determine error class based on category
    switch (metadata.category.toLowerCase()) {
      case 'authentication':
        return new AuthenticationError(code, message, context, actionable);
      case 'authorization':
        return new AuthorizationError(code, message, context, actionable);
      case 'validation':
        return new ValidationError(code, message, context, actionable);
      case 'user':
        // User errors can be NotFound or Conflict based on HTTP status
        if (metadata.httpStatus === 404) {
          return new NotFoundError(code, message, context, actionable);
        } else if (metadata.httpStatus === 409) {
          return new ConflictError(code, message, context, actionable);
        }
        return new BusinessError(code, message, context, actionable);
      case 'database':
        return new DatabaseError(code, message, context, actionable);
      case 'external':
        return new ExternalServiceError(code, message, context, actionable);
      case 'ratelimit':
        return new RateLimitError(code, message, context, actionable);
      case 'resource':
        if (metadata.httpStatus === 404) {
          return new NotFoundError(code, message, context, actionable);
        } else if (metadata.httpStatus === 409) {
          return new ConflictError(code, message, context, actionable);
        }
        return new BusinessError(code, message, context, actionable);
      case 'business':
        return new BusinessError(code, message, context, actionable);
      case 'security':
        return new SecurityError(code, message, context, actionable);
      case 'network':
        return new NetworkError(code, message, context, actionable);
      case 'system':
        return new InternalServerError(code, message, context, actionable);
      default:
        return new UnknownError(code, message, context, actionable);
    }
  }

  /**
   * Create error from existing error with additional context
   */
  static fromError(
    error: Error | any,
    code?: ErrorCode,
    context: Partial<IErrorContext> = {},
    actionable: Partial<IErrorActionable> = {}
  ): ApplicationError {
    if (error instanceof ApplicationError) {
      return error;
    }

    const errorCode = code || ErrorCode.UNKNOWN_ERROR;
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;

    return ErrorFactory.createError(errorCode, message, {
      ...context,
      stack,
    }, actionable);
  }
}
