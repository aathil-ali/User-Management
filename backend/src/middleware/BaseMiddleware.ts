import { Response } from 'express';
import { ErrorResponse } from '@/dto/responses/ErrorResponse';
import { ErrorFormatter } from '@/formatters/ErrorFormatter';
import { ApplicationError, ErrorFactory } from '@/errors/ApplicationError';
import { ErrorCode } from '@/types/error-codes';
import { TranslationService } from '@/services/TranslationService';
import { LocalizedRequest } from './LanguageMiddleware';

/**
 * Base Middleware class that eliminates DIP violations
 * Provides consistent error handling and response formatting
 * Follows SOLID principles - especially Dependency Inversion Principle
 */
export abstract class BaseMiddleware {
  
  /**
   * Create standardized error response following the new architecture
   */
  protected createErrorResponse(
    error: ApplicationError,
    req: LocalizedRequest,
    correlationId?: string,
    requestId?: string
  ): any {
    const errorResponse = ErrorResponse.fromError(
      error,
      correlationId || req.context?.correlationId,
      requestId || req.context?.requestId,
      req.originalUrl,
      req.method,
      process.env.NODE_ENV !== 'production' // Include debug info in development
    );
    
    return ErrorFormatter.autoFormat(errorResponse);
  }

  /**
   * Send standardized error response
   */
  protected sendError(
    res: Response,
    error: ApplicationError,
    req: LocalizedRequest
  ): void {
    const formattedResponse = this.createErrorResponse(error, req);
    res.status(error.httpStatus).json(formattedResponse);
  }

  /**
   * Send standardized error response with custom status
   */
  protected sendErrorWithStatus(
    res: Response,
    error: ApplicationError,
    req: LocalizedRequest,
    statusCode: number
  ): void {
    const formattedResponse = this.createErrorResponse(error, req);
    res.status(statusCode).json(formattedResponse);
  }

  /**
   * Create and send NOT_IMPLEMENTED error
   */
  protected sendNotImplemented(
    res: Response,
    req: LocalizedRequest,
    t: TranslationService,
    feature: string
  ): void {
    const error = ErrorFactory.createError(
      ErrorCode.NOT_IMPLEMENTED,
      t.auth('not_implemented'),
      {
        correlationId: req.context?.correlationId,
        requestId: req.context?.requestId,
        method: req.method,
        url: req.originalUrl,
        feature,
      },
      {
        userMessage: t.auth('not_implemented'),
        action: 'CONTACT_SUPPORT',
      }
    );

    this.sendErrorWithStatus(res, error, req, 501);
  }

  /**
   * Create and send AUTHENTICATION_FAILED error
   */
  protected sendAuthenticationFailed(
    res: Response,
    req: LocalizedRequest,
    t: TranslationService,
    details?: string
  ): void {
    const error = ErrorFactory.createError(
      ErrorCode.AUTH_INVALID_CREDENTIALS, // Use correct error code
      t.auth('authentication_failed'),
      {
        correlationId: req.context?.correlationId,
        requestId: req.context?.requestId,
        method: req.method,
        url: req.originalUrl,
        ...(details && { originalError: details }),
      },
      {
        userMessage: t.auth('authentication_failed'),
        action: 'LOGIN_REQUIRED',
      }
    );

    this.sendErrorWithStatus(res, error, req, 401);
  }

  /**
   * Create and send AUTHENTICATION_REQUIRED error
   */
  protected sendAuthenticationRequired(
    res: Response,
    req: LocalizedRequest,
    t: TranslationService
  ): void {
    const error = ErrorFactory.createError(
      ErrorCode.AUTH_TOKEN_MISSING, // Use correct error code
      t.auth('authentication_required'),
      {
        correlationId: req.context?.correlationId,
        requestId: req.context?.requestId,
        method: req.method,
        url: req.originalUrl,
      },
      {
        userMessage: t.auth('authentication_required'),
        action: 'LOGIN_REQUIRED',
      }
    );

    this.sendErrorWithStatus(res, error, req, 401);
  }

  /**
   * Create and send INSUFFICIENT_PERMISSIONS error
   */
  protected sendInsufficientPermissions(
    res: Response,
    req: LocalizedRequest,
    t: TranslationService,
    requiredRole?: string
  ): void {
    const error = ErrorFactory.createError(
      ErrorCode.AUTHZ_INSUFFICIENT_PERMISSIONS, // Use correct error code
      t.authorization('insufficient_permissions'),
      {
        correlationId: req.context?.correlationId,
        requestId: req.context?.requestId,
        method: req.method,
        url: req.originalUrl,
        ...(requiredRole && { requiredRole }),
      },
      {
        userMessage: t.authorization('insufficient_permissions'),
        action: 'CONTACT_SUPPORT',
      }
    );

    this.sendErrorWithStatus(res, error, req, 403);
  }

  /**
   * Create and send AUTHORIZATION_ERROR error
   */
  protected sendAuthorizationError(
    res: Response,
    req: LocalizedRequest,
    t: TranslationService,
    details?: string
  ): void {
    const error = ErrorFactory.createError(
      ErrorCode.SYSTEM_INTERNAL_ERROR, // Use correct error code
      t.authorization('authorization_error'),
      {
        correlationId: req.context?.correlationId,
        requestId: req.context?.requestId,
        method: req.method,
        url: req.originalUrl,
        ...(details && { originalError: details }),
      },
      {
        userMessage: t.authorization('authorization_error'),
        action: 'CONTACT_SUPPORT',
      }
    );

    this.sendErrorWithStatus(res, error, req, 500);
  }
}
