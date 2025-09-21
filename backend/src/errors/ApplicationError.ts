import { ErrorCode, ERROR_CODE_REGISTRY, ErrorCodeMetadata } from '@/types/error-codes';

/**
 * Context information for error instances
 */
export interface ErrorContext {
  userId?: string;
  correlationId?: string;
  requestId?: string;
  operation?: string;
  resource?: string;
  feature?: string;
  details?: Record<string, any>;
  timestamp?: Date;
  userAgent?: string;
  ip?: string;
  method?: string;
  url?: string;
  stack?: string;
}

/**
 * Actionable guidance for error resolution
 */
export interface ErrorActionable {
  userMessage?: string;
  developerMessage?: string;
  action?: 'RETRY' | 'REFRESH_TOKEN' | 'CONTACT_SUPPORT' | 'CHECK_INPUT' | 'CORRECT_INPUT' | 'WAIT_AND_RETRY' | 'LOGIN_REQUIRED' | 'UPGRADE_REQUIRED';
  retryAfter?: number; // seconds
  supportUrl?: string;
  documentationUrl?: string;
}

/**
 * Base Application Error class that all custom errors extend from
 */
export abstract class ApplicationError extends Error {
  public readonly code: ErrorCode;
  public readonly httpStatus: number;
  public readonly severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  public readonly category: string;
  public readonly retryable: boolean;
  public readonly userFacing: boolean;
  public readonly logLevel: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  public readonly requiresAlert: boolean;
  public readonly context: ErrorContext;
  public readonly actionable: ErrorActionable;
  public readonly timestamp: Date;
  public readonly isOperational: boolean;

  constructor(
    code: ErrorCode,
    message?: string,
    context: Partial<ErrorContext> = {},
    actionable: Partial<ErrorActionable> = {},
    cause?: Error
  ) {
    super(message || code);
    
    // Set the error name to the class name
    this.name = this.constructor.name;
    
    // Get metadata from registry
    const metadata: ErrorCodeMetadata = ERROR_CODE_REGISTRY[code];
    if (!metadata) {
      throw new Error(`Error code ${code} is not registered in ERROR_CODE_REGISTRY`);
    }
    
    // Set properties from metadata
    this.code = code;
    this.httpStatus = metadata.httpStatus;
    this.severity = metadata.severity;
    this.category = metadata.category;
    this.retryable = metadata.retryable;
    this.userFacing = metadata.userFacing;
    this.logLevel = metadata.logLevel;
    this.requiresAlert = metadata.requiresAlert;
    
    // Set context and actionable information
    this.context = {
      timestamp: new Date(),
      ...context,
    };
    this.actionable = actionable;
    this.timestamp = this.context.timestamp!;
    this.isOperational = true; // All ApplicationErrors are operational by design
    
    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
    
    // Handle error chaining
    if (cause) {
      this.stack += `\nCaused by: ${cause.stack}`;
    }
  }

  /**
   * Convert error to JSON for logging and API responses
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      httpStatus: this.httpStatus,
      severity: this.severity,
      category: this.category,
      retryable: this.retryable,
      userFacing: this.userFacing,
      context: this.context,
      actionable: this.actionable,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }

  /**
   * Get user-safe error information (excludes sensitive details)
   */
  toUserSafeJSON() {
    return {
      code: this.code,
      message: this.actionable.userMessage || this.message,
      retryable: this.retryable,
      actionable: {
        action: this.actionable.action,
        retryAfter: this.actionable.retryAfter,
        supportUrl: this.actionable.supportUrl,
        documentationUrl: this.actionable.documentationUrl,
      },
      timestamp: this.timestamp,
    };
  }

  /**
   * Create an error from another error or error-like object
   */
  static fromError(error: Error | any, code: ErrorCode = ErrorCode.UNKNOWN_ERROR, context: Partial<ErrorContext> = {}): ApplicationError {
    if (error instanceof ApplicationError) {
      return error;
    }
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return new UnknownError(code, errorMessage, {
      ...context,
      stack: errorStack,
    });
  }
}

/**
 * Authentication-related errors
 */
export class AuthenticationError extends ApplicationError {
  constructor(
    code: ErrorCode = ErrorCode.AUTH_INVALID_CREDENTIALS,
    message?: string,
    context: Partial<ErrorContext> = {},
    actionable: Partial<ErrorActionable> = {}
  ) {
    super(code, message, context, {
      action: 'LOGIN_REQUIRED',
      userMessage: 'Please log in to continue',
      ...actionable,
    });
  }
}

/**
 * Authorization-related errors
 */
export class AuthorizationError extends ApplicationError {
  constructor(
    code: ErrorCode = ErrorCode.AUTHZ_INSUFFICIENT_PERMISSIONS,
    message?: string,
    context: Partial<ErrorContext> = {},
    actionable: Partial<ErrorActionable> = {}
  ) {
    super(code, message, context, {
      action: 'CONTACT_SUPPORT',
      userMessage: 'You do not have permission to perform this action',
      ...actionable,
    });
  }
}

/**
 * Input validation errors
 */
export class ValidationError extends ApplicationError {
  constructor(
    code: ErrorCode = ErrorCode.VALIDATION_FAILED,
    message?: string,
    context: Partial<ErrorContext> = {},
    actionable: Partial<ErrorActionable> = {}
  ) {
    super(code, message, context, {
      action: 'CORRECT_INPUT',
      userMessage: 'Please check your input and try again',
      ...actionable,
    });
  }
}

/**
 * Resource not found errors
 */
export class NotFoundError extends ApplicationError {
  constructor(
    code: ErrorCode = ErrorCode.RESOURCE_NOT_FOUND,
    message?: string,
    context: Partial<ErrorContext> = {},
    actionable: Partial<ErrorActionable> = {}
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
    context: Partial<ErrorContext> = {},
    actionable: Partial<ErrorActionable> = {}
  ) {
    super(code, message, context, {
      action: 'CHECK_INPUT',
      userMessage: 'This resource already exists or conflicts with existing data',
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
    context: Partial<ErrorContext> = {},
    actionable: Partial<ErrorActionable> = {}
  ) {
    super(code, message, context, {
      action: 'WAIT_AND_RETRY',
      userMessage: 'Too many requests. Please wait and try again',
      retryAfter: 60,
      ...actionable,
    });
  }
}

/**
 * Database-related errors
 */
export class DatabaseError extends ApplicationError {
  constructor(
    code: ErrorCode = ErrorCode.DB_QUERY_FAILED,
    message?: string,
    context: Partial<ErrorContext> = {},
    actionable: Partial<ErrorActionable> = {}
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
    context: Partial<ErrorContext> = {},
    actionable: Partial<ErrorActionable> = {}
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
    context: Partial<ErrorContext> = {},
    actionable: Partial<ErrorActionable> = {}
  ) {
    super(code, message, context, {
      action: 'CONTACT_SUPPORT',
      userMessage: 'An unexpected error occurred. Please try again or contact support',
      ...actionable,
    });
  }
}

/**
 * Business logic errors
 */
export class BusinessError extends ApplicationError {
  constructor(
    code: ErrorCode = ErrorCode.BUSINESS_RULE_VIOLATION,
    message?: string,
    context: Partial<ErrorContext> = {},
    actionable: Partial<ErrorActionable> = {}
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
    context: Partial<ErrorContext> = {},
    actionable: Partial<ErrorActionable> = {}
  ) {
    super(code, message, context, {
      action: 'CONTACT_SUPPORT',
      userMessage: 'Security violation detected. Your account may be temporarily restricted',
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
    context: Partial<ErrorContext> = {},
    actionable: Partial<ErrorActionable> = {}
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
    context: Partial<ErrorContext> = {},
    actionable: Partial<ErrorActionable> = {}
  ) {
    super(code, message, context, {
      action: 'CONTACT_SUPPORT',
      userMessage: 'An unexpected error occurred. Please contact support if the issue persists',
      ...actionable,
    });
  }
}

/**
 * Error factory to create appropriate error instances based on error code
 */
export class ErrorFactory {
  static createError(
    code: ErrorCode,
    message?: string,
    context: Partial<ErrorContext> = {},
    actionable: Partial<ErrorActionable> = {}
  ): ApplicationError {
    const metadata = ERROR_CODE_REGISTRY[code];
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
    context: Partial<ErrorContext> = {},
    actionable: Partial<ErrorActionable> = {}
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
