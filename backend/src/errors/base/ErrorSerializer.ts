import { ApplicationError } from './ApplicationError';

/**
 * Error Serializer
 * Single Responsibility: Convert ApplicationError instances to JSON formats
 */
export class ErrorSerializer {
  /**
   * Convert error to full JSON (for logging and debugging)
   */
  static toJSON(error: ApplicationError): Record<string, any> {
    return {
      name: error.name,
      code: error.code,
      message: error.message,
      httpStatus: error.httpStatus,
      severity: error.severity,
      category: error.category,
      retryable: error.retryable,
      userFacing: error.userFacing,
      context: error.context,
      actionable: error.actionable,
      timestamp: error.timestamp,
      stack: error.stack,
    };
  }

  /**
   * Convert error to user-safe JSON (excludes sensitive details)
   */
  static toUserSafeJSON(error: ApplicationError): Record<string, any> {
    return {
      code: error.code,
      message: error.actionable.userMessage || error.message,
      retryable: error.retryable,
      actionable: {
        action: error.actionable.action,
        retryAfter: error.actionable.retryAfter,
        supportUrl: error.actionable.supportUrl,
        documentationUrl: error.actionable.documentationUrl,
      },
      timestamp: error.timestamp,
    };
  }

  /**
   * Convert error to developer-friendly JSON (includes debug info)
   */
  static toDeveloperJSON(error: ApplicationError): Record<string, any> {
    return {
      name: error.name,
      code: error.code,
      message: error.message,
      httpStatus: error.httpStatus,
      severity: error.severity,
      category: error.category,
      retryable: error.retryable,
      context: {
        correlationId: error.context.correlationId,
        requestId: error.context.requestId,
        operation: error.context.operation,
        resource: error.context.resource,
        timestamp: error.context.timestamp,
      },
      actionable: {
        developerMessage: error.actionable.developerMessage,
        userMessage: error.actionable.userMessage,
        action: error.actionable.action,
      },
      stack: error.stack,
    };
  }

  /**
   * Convert error to log format
   */
  static toLogFormat(error: ApplicationError): Record<string, any> {
    return {
      level: error.logLevel,
      code: error.code,
      message: error.message,
      severity: error.severity,
      category: error.category,
      httpStatus: error.httpStatus,
      correlationId: error.context.correlationId,
      requestId: error.context.requestId,
      userId: error.context.userId,
      operation: error.context.operation,
      timestamp: error.timestamp,
      requiresAlert: error.requiresAlert,
      stack: error.stack,
    };
  }
}
