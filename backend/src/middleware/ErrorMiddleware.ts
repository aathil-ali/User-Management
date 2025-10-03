import { Request, Response, NextFunction, ErrorRequestHandler, RequestHandler } from 'express';
import { ApplicationError, ErrorFactory } from '@/errors';
import { ErrorResponse } from '@/types/responses/ErrorResponse';
import { ErrorFormatter } from '@/formatters/ErrorFormatter';
import { ErrorCode } from '@/types/error-codes';
import { LocalizedRequest, LanguageMiddleware } from './LanguageMiddleware';
import { RequestWithContext, getCorrelationId, getRequestId, getRequestContext } from './RequestContextMiddleware';
import { logger } from '@/utils/logger';

/**
 * Enhanced Error Middleware with comprehensive error handling
 */
export class ErrorMiddleware {
  /**
   * Main error handler - processes all application errors
   */
  static handle: ErrorRequestHandler = (error: Error | ApplicationError, req: any, res: Response, next: NextFunction): void => {
    try {
      // Convert to ApplicationError if needed
      const appError = error instanceof ApplicationError 
        ? error 
        : ErrorFactory.fromError(error, ErrorCode.UNKNOWN_ERROR, {
            correlationId: getCorrelationId(req) || undefined,
            requestId: getRequestId(req) || undefined,
            userId: req.context?.userId,
            method: req.method,
            url: req.originalUrl || req.url,
            userAgent: req.headers['user-agent'],
            ip: req.context?.ip || req.ip,
          });

      // Get localization service
      const t = LanguageMiddleware.getTranslationService(req);
      
      // Create comprehensive error response
      const errorResponse = ErrorResponse.fromError(
        appError,
        getCorrelationId(req) || undefined,
        getRequestId(req) || undefined,
        req.originalUrl || req.url,
        req.method,
        ErrorMiddleware.shouldIncludeDebugInfo(req, appError)
      );

      // Log the error with full context
      ErrorMiddleware.logError(appError, req);

      // Send appropriate response based on environment and error type
      const isDevelopment = process.env.NODE_ENV === 'development';
      const responseData = isDevelopment || !appError.userFacing
        ? ErrorFormatter.toFullResponse(errorResponse, appError)
        : ErrorFormatter.toUserSafeResponse(errorResponse);

      // Add rate limiting headers if applicable
      if (appError.code.includes('RATE_LIMIT')) {
        const retryAfter = appError.actionable.retryAfter || 60;
        res.setHeader('Retry-After', retryAfter);
        res.setHeader('X-RateLimit-Remaining', '0');
      }

      res.status(appError.httpStatus).json(responseData);

    } catch (handlingError) {
      // Fallback error handling if our error handler fails
      const criticalError = handlingError instanceof Error ? handlingError : new Error(String(handlingError));
      ErrorMiddleware.handleCriticalError(criticalError, req, res);
    }
  };

  /**
   * Handle 404 Not Found errors
   */
  static notFound: RequestHandler = (req: any, res: Response, next: NextFunction): void => {
    const t = LanguageMiddleware.getTranslationService(req);
    
    const notFoundError = ErrorFactory.createError(
      ErrorCode.RESOURCE_NOT_FOUND,
      t.server('route_not_found', { route: req.originalUrl }),
      {
        correlationId: getCorrelationId(req) || undefined,
        requestId: getRequestId(req) || undefined,
        method: req.method,
        url: req.originalUrl || req.url,
        resource: req.originalUrl,
      },
      {
        userMessage: t.server('route_not_found', { route: req.originalUrl }),
        action: 'CHECK_INPUT',
      }
    );

    ErrorMiddleware.handle(notFoundError, req, res, next);
  };

  /**
   * Handle uncaught exceptions
   */
  static handleUncaughtException(error: Error): void {
    console.error('Uncaught Exception:', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      timestamp: new Date().toISOString(),
      pid: process.pid,
    });

    // Log to external monitoring service if configured
    logger.log('fatal', 'Uncaught Exception - Server shutting down', { error });

    // Graceful shutdown
    process.exit(1);
  }

  /**
   * Handle unhandled promise rejections
   */
  static handleUnhandledRejection(reason: any, promise: Promise<any>): void {
    console.error('Unhandled Promise Rejection:', {
      reason,
      promise,
      timestamp: new Date().toISOString(),
      pid: process.pid,
    });

    // Log to external monitoring service if configured
    logger.error('Unhandled Promise Rejection', { reason });

    // In production, you might want to gracefully shut down
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }

  /**
   * Determine if debug information should be included in response
   */
  private static shouldIncludeDebugInfo(req: Request, error: ApplicationError): boolean {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isInternalError = error.severity === 'HIGH' || error.severity === 'CRITICAL';
    const hasDebugHeader = req.headers['x-debug'] === 'true';
    
    return isDevelopment || isInternalError || hasDebugHeader;
  }

  /**
   * Log error with comprehensive context
   */
  private static logError(error: ApplicationError, req: RequestWithContext & LocalizedRequest): void {
    const context = getRequestContext(req);
    const logData = {
      error: {
        code: error.code,
        name: error.name,
        message: error.message,
        severity: error.severity,
        category: error.category,
        httpStatus: error.httpStatus,
        stack: error.stack,
      },
      request: {
        correlationId: getCorrelationId(req),
        requestId: getRequestId(req),
        method: req.method,
        url: req.originalUrl || req.url,
        userAgent: req.headers['user-agent'],
        ip: context?.ip || req.ip,
        userId: context?.userId,
        userRole: context?.userRole,
      },
      context: error.context,
      timestamp: new Date().toISOString(),
    };

    // Log at appropriate level based on error severity
    switch (error.logLevel) {
      case 'fatal':
        logger.log('fatal', 'Fatal Error', logData);
        break;
      case 'error':
        logger.error('Application Error', logData);
        break;
      case 'warn':
        logger.warn('Application Warning', logData);
        break;
      case 'info':
        logger.info('Application Info', logData);
        break;
      case 'debug':
        logger.debug('Application Debug', logData);
        break;
      default:
        logger.error('Unknown Error Level', logData);
    }

    // Send alerts for critical errors
    if (error.requiresAlert) {
      ErrorMiddleware.sendAlert(error, req);
    }
  }

  /**
   * Send alert for critical errors (placeholder for external alerting)
   */
  private static sendAlert(error: ApplicationError, req: RequestWithContext & LocalizedRequest): void {
    // This would integrate with your alerting system (PagerDuty, Slack, etc.)
    const alertData = {
      severity: error.severity,
      code: error.code,
      message: error.message,
      correlationId: getCorrelationId(req),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    };

    // Log alert for now (replace with actual alerting service)
    console.error('🚨 ALERT TRIGGERED:', alertData);

    // TODO: Integrate with external alerting services
    // - PagerDuty
    // - Slack webhooks
    // - Email notifications
    // - Monitoring dashboards (Datadog, New Relic, etc.)
  }

  /**
   * Critical error fallback handler
   */
  private static handleCriticalError(error: Error, req: Request, res: Response): void {
    console.error('Critical error in error handler:', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      request: {
        method: req.method,
        url: req.url,
        timestamp: new Date().toISOString(),
      },
    });

    // Send minimal error response
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: {
          code: 'SYSTEM_CRITICAL_ERROR',
          message: 'A critical system error occurred',
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  /**
   * Initialize global error handlers
   */
  static initializeGlobalHandlers(): void {
    process.on('uncaughtException', ErrorMiddleware.handleUncaughtException);
    process.on('unhandledRejection', ErrorMiddleware.handleUnhandledRejection);
  }
}
