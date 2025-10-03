import { Response, NextFunction } from 'express';
import { LanguageMiddleware } from '@/middleware/LanguageMiddleware';

import { ErrorFactory } from '@/errors';
import { ErrorCode } from '@/types/error-codes';
import { SuccessResponse } from '@/types/responses/SuccessResponse';
import { SuccessFormatter } from '@/formatters/SuccessFormatter';
import { TranslationService } from '@/services/TranslationService';
import { EnhancedRequest } from '@/interfaces/middleware/IEnhancedRequest';

/**
 * Base Controller class that eliminates common repetition
 * Provides common utilities for all controllers
 */
export abstract class BaseController {
  
  /**
   * Get translation service from request
   */
  protected getTranslationService(req: EnhancedRequest): TranslationService {
    return LanguageMiddleware.getTranslationService(req);
  }

  /**
   * Extract request context for error handling
   */
  protected getRequestContext(req: EnhancedRequest) {
    return {
      correlationId: req.context?.correlationId,
      requestId: req.context?.requestId,
      method: req.method,
      url: req.originalUrl,
      userId: req.context?.userId,
    };
  }

  /**
   * Create success response with proper context
   */
  protected createSuccessResponse<T>(
    data: T,
    message: string,
    req: EnhancedRequest
  ): SuccessResponse<T> {
    return SuccessResponse.create(data, message, {
      correlationId: req.context?.correlationId,
      requestId: req.context?.requestId,
      path: req.originalUrl,
      method: req.method,
    });
  }

  /**
   * Create paginated success response
   */
  protected createPaginatedResponse<T>(
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
    },
    message: string,
    req: EnhancedRequest
  ): SuccessResponse<T[]> {
    return SuccessResponse.createWithPagination(
      data,
      pagination,
      message,
      {
        correlationId: req.context?.correlationId,
        requestId: req.context?.requestId,
        path: req.originalUrl,
        method: req.method,
      }
    );
  }

  /**
   * Throw a standardized error with request context
   */
  protected throwError(
    code: ErrorCode,
    message: string,
    req: EnhancedRequest,
    options?: {
      userMessage?: string;
      action?: 'RETRY' | 'REFRESH_TOKEN' | 'CONTACT_SUPPORT' | 'CHECK_INPUT' | 'CORRECT_INPUT' | 'WAIT_AND_RETRY' | 'LOGIN_REQUIRED' | 'UPGRADE_REQUIRED';
      feature?: string;
      details?: Record<string, any>;
    }
  ): never {
    const context = this.getRequestContext(req);
    
    throw ErrorFactory.createError(
      code,
      message,
      {
        ...context,
        feature: options?.feature,
        details: options?.details,
      },
      {
        userMessage: options?.userMessage || message,
        action: options?.action || 'CONTACT_SUPPORT',
      }
    );
  }

  /**
   * Throw a not implemented error with proper context
   */
  protected throwNotImplemented(
    req: EnhancedRequest,
    feature: string,
    t: TranslationService
  ): never {
    this.throwError(
      ErrorCode.NOT_IMPLEMENTED,
      t.auth('not_implemented'),
      req,
      {
        userMessage: t.auth('not_implemented'),
        action: 'CONTACT_SUPPORT',
        feature,
      }
    );
  }

  /**
   * Execute with automatic error handling
   */
  protected async executeWithErrorHandling<T>(
    operation: () => Promise<T>,
    next: NextFunction
  ): Promise<T | void> {
    try {
      return await operation();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Standard controller method wrapper
   */
  protected async handleRequest(
    req: EnhancedRequest,
    res: Response,
    next: NextFunction,
    handler: (req: EnhancedRequest, res: Response, t: TranslationService) => Promise<void>
  ): Promise<void> {
    try {
      const t = this.getTranslationService(req);
      await handler(req, res, t);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Send success response
   */
  protected sendSuccess<T>(
    res: Response,
    data: T,
    message: string,
    req: EnhancedRequest,
    statusCode: number = 200
  ): void {
    const response = this.createSuccessResponse(data, message, req);
    const formattedResponse = SuccessFormatter.autoFormat(response);
    res.status(statusCode).json(formattedResponse);
  }

  /**
   * Send paginated response
   */
  protected sendPaginatedSuccess<T>(
    res: Response,
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
    },
    message: string,
    req: EnhancedRequest
  ): void {
    const response = this.createPaginatedResponse(data, pagination, message, req);
    const formattedResponse = SuccessFormatter.autoFormat(response);
    res.json(formattedResponse);
  }

  /**
   * Send success response for external API consumption
   */
  protected sendExternalSuccess<T>(
    res: Response,
    data: T,
    message: string,
    req: EnhancedRequest,
    statusCode: number = 200
  ): void {
    const response = this.createSuccessResponse(data, message, req);
    const formattedResponse = SuccessFormatter.toExternalApiResponse(response);
    res.status(statusCode).json(formattedResponse);
  }

  /**
   * Send success response with specific formatting
   */
  protected sendFormattedSuccess<T>(
    res: Response,
    data: T,
    message: string,
    req: EnhancedRequest,
    format: 'user' | 'developer' | 'external' | 'logs' | 'metrics',
    statusCode: number = 200
  ): void {
    const response = this.createSuccessResponse(data, message, req);
    const formattedResponse = SuccessFormatter.autoFormat(response, { audience: format });
    res.status(statusCode).json(formattedResponse);
  }
}
