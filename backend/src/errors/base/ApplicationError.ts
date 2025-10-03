import { ErrorCode, ERROR_CODE_REGISTRY, ErrorCodeMetadata } from '@/types/error-codes';
import { IErrorContext, IErrorActionable } from '@/interfaces/errors';

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
  public readonly context: IErrorContext;
  public readonly actionable: IErrorActionable;
  public readonly timestamp: Date;
  public readonly isOperational: boolean;

  constructor(
    code: ErrorCode,
    message?: string,
    context: Partial<IErrorContext> = {},
    actionable: Partial<IErrorActionable> = {},
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
}
