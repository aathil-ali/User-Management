import { ApplicationError, ErrorFactory } from '@/errors';
import { ErrorCode } from '@/types/error-codes';
import { ErrorResponse } from '@/types/responses/ErrorResponse';
import { RetryCalculator } from '@/services/RetryCalculator';
import { ErrorContextSanitizer } from '@/services/ErrorContextSanitizer';

/**
 * Error Response Builder
 * Single Responsibility: Build ErrorResponse instances
 * Follows Builder Pattern for complex object construction
 */
export class ErrorBuilder {
  /**
   * Build ErrorResponse from ApplicationError
   */
  static build(
    error: ApplicationError,
    options: {
      correlationId?: string;
      requestId?: string;
      path?: string;
      method?: string;
      includeDebugInfo?: boolean;
    } = {}
  ): ErrorResponse {
    const {
      correlationId,
      requestId,
      path,
      method,
      includeDebugInfo = false
    } = options;

    // Calculate retry information
    const retryInfo = RetryCalculator.calculate(
      error.retryable,
      error.severity,
      error.category,
      error.actionable.retryAfter
    );

    // Build basic error data
    const errorData = {
      code: error.code,
      message: error.message,
      timestamp: error.timestamp,
      correlationId: correlationId || error.context.correlationId,
      requestId: requestId || error.context.requestId,
      path: path || error.context.url,
      method: method || error.context.method,
      userMessage: error.actionable.userMessage,
      actionable: {
        action: error.actionable.action,
        supportUrl: error.actionable.supportUrl,
        documentationUrl: error.actionable.documentationUrl,
      },
      retry: retryInfo,
    };

    return new ErrorResponse(errorData);
  }

  /**
   * Build from generic Error
   */
  static fromGenericError(
    error: Error,
    code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
    options: {
      correlationId?: string;
      requestId?: string;
      path?: string;
      method?: string;
      includeDebugInfo?: boolean;
    } = {}
  ): ErrorResponse {
    const appError = ErrorFactory.fromError(error, code, {
      correlationId: options.correlationId,
      requestId: options.requestId,
      url: options.path,
      method: options.method,
    });

    return this.build(appError, options);
  }
}
