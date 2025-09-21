import { ErrorResponse } from '@/dto/responses/ErrorResponse';
import { ApplicationError } from '@/errors/ApplicationError';
import { ErrorContextSanitizer } from '@/services/ErrorContextSanitizer';

/**
 * Error Response Formatter
 * Single Responsibility: Format error responses for different audiences
 */
export class ErrorFormatter {
  /**
   * Format for user-safe consumption (production)
   */
  static toUserSafeResponse(errorDto: ErrorResponse) {
    return {
      success: errorDto.success,
      code: errorDto.code,
      message: errorDto.userMessage || errorDto.message,
      timestamp: errorDto.timestamp,
      correlationId: errorDto.correlationId,
      path: errorDto.path,
      actionable: errorDto.actionable,
      retry: errorDto.retry,
    };
  }

  /**
   * Format for development/debugging with full details
   */
  static toFullResponse(
    errorDto: ErrorResponse, 
    error: ApplicationError
  ) {
    return {
      success: errorDto.success,
      code: errorDto.code,
      message: errorDto.message,
      userMessage: errorDto.userMessage,
      timestamp: errorDto.timestamp,
      httpStatus: error.httpStatus,
      category: error.category,
      severity: error.severity,
      correlationId: errorDto.correlationId,
      requestId: errorDto.requestId,
      path: errorDto.path,
      method: errorDto.method,
      actionable: errorDto.actionable,
      retry: errorDto.retry,
      details: this.extractErrorDetails(error),
      context: ErrorContextSanitizer.sanitize(error.context),
      trace: error.stack,
      debug: {
        userFacing: error.userFacing,
        logLevel: error.logLevel,
        requiresAlert: error.requiresAlert,
        isOperational: error.isOperational,
      },
    };
  }

  /**
   * Format for logging systems
   */
  static toLogResponse(
    errorDto: ErrorResponse,
    error: ApplicationError
  ) {
    return {
      level: error.severity.toLowerCase(),
      code: errorDto.code,
      message: errorDto.message,
      httpStatus: error.httpStatus,
      category: error.category,
      severity: error.severity,
      correlationId: errorDto.correlationId,
      requestId: errorDto.requestId,
      path: errorDto.path,
      method: errorDto.method,
      timestamp: errorDto.timestamp,
      context: ErrorContextSanitizer.sanitize(error.context),
      trace: error.stack,
      retryable: errorDto.retry.retryable,
    };
  }

  /**
   * Auto-format based on environment
   * Chooses appropriate format based on NODE_ENV and other factors
   */
  static autoFormat(
    errorDto: ErrorResponse,
    options?: {
      environment?: 'development' | 'production' | 'test';
      audience?: 'user' | 'developer' | 'logs';
    }
  ): any {
    const env = options?.environment || process.env.NODE_ENV || 'development';
    const audience = options?.audience || 'user';

    // For backwards compatibility, we need the original error
    // In practice, this would come from the ErrorResponse.fromError call
    // For now, return user-safe format in production, full in development
    if (env === 'production' && audience === 'user') {
      return this.toUserSafeResponse(errorDto);
    }
    
    // For development or non-user audiences, we'd need the original error
    // Since we don't have it here, return the user-safe format
    // This will be improved when we refactor the error handling flow
    return this.toUserSafeResponse(errorDto);
  }

  /**
   * Extract structured error details
   */
  private static extractErrorDetails(error: ApplicationError) {
    const details: any = {};

    // Extract validation details if available
    if (error.context.details) {
      Object.assign(details, error.context.details);
    }

    // Add resource information
    if (error.context.resource) {
      details.metadata = { resource: error.context.resource };
    }

    // Add operation context
    if (error.context.operation) {
      details.metadata = { ...details.metadata, operation: error.context.operation };
    }

    return Object.keys(details).length > 0 ? details : undefined;
  }
}
