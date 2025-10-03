import { ErrorCode } from '@/types/error-codes';
import { ApplicationError } from '@/errors';
import { RetryInfo } from '@/interfaces/IRetry';
import { ErrorBuilder } from '@/builders/ErrorBuilder';

/**
 * Clean Error Response DTO - focused only on error response structure
 * Follows Single Responsibility Principle
 */
export class ErrorResponse {
  public readonly success: false = false;
  public readonly code: ErrorCode;
  public readonly message: string;
  public readonly timestamp: Date;
  
  // Enhanced tracking information
  public readonly correlationId?: string;
  public readonly requestId?: string;
  public readonly path?: string;
  public readonly method?: string;
  
  // Error-specific information
  public readonly userMessage?: string;
  public readonly actionable: {
    action?: string;
    supportUrl?: string;
    documentationUrl?: string;
  };
  public readonly retry: RetryInfo;

  constructor(errorData: {
    code: ErrorCode;
    message: string;
    timestamp: Date;
    correlationId?: string;
    requestId?: string;
    path?: string;
    method?: string;
    userMessage?: string;
    actionable: {
      action?: string;
      supportUrl?: string;
      documentationUrl?: string;
    };
    retry: RetryInfo;
  }) {
    this.code = errorData.code;
    this.message = errorData.message;
    this.timestamp = errorData.timestamp;
    this.correlationId = errorData.correlationId;
    this.requestId = errorData.requestId;
    this.path = errorData.path;
    this.method = errorData.method;
    this.userMessage = errorData.userMessage;
    this.actionable = errorData.actionable;
    this.retry = errorData.retry;
  }

  /**
   * Create error response from ApplicationError using builder pattern
   */
  static fromError(
    error: ApplicationError,
    correlationId?: string,
    requestId?: string,
    path?: string,
    method?: string,
    includeDebugInfo: boolean = false
  ): ErrorResponse {
    return ErrorBuilder.build(error, {
      correlationId,
      requestId,
      path,
      method,
      includeDebugInfo
    });
  }

  /**
   * Convert to JSON for API response
   */
  toJSON() {
    const response: any = {
      success: this.success,
      code: this.code,
      message: this.userMessage || this.message,
      timestamp: this.timestamp,
    };
    
    // Add tracking information if available
    if (this.correlationId) response.correlationId = this.correlationId;
    if (this.requestId) response.requestId = this.requestId;
    if (this.path) response.path = this.path;
    if (this.method) response.method = this.method;
    
    // Add error-specific information
    response.actionable = this.actionable;
    response.retry = this.retry;
    
    return response;
  }
}

