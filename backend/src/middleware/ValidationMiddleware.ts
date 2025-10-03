import { Request, Response, NextFunction } from 'express';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { LocalizedRequest, LanguageMiddleware } from './LanguageMiddleware';
import { BaseMiddleware } from './BaseMiddleware';
import { ErrorFactory } from '@/errors';
import { ErrorCode } from '@/types/error-codes';

/**
 * Validation Middleware
 * Now follows SOLID principles:
 * - SRP: Only handles DTO validation
 * - OCP: Extensible through BaseMiddleware
 * - LSP: Proper request type contracts
 * - ISP: Focused interface
 * - DIP: Depends on abstractions (BaseMiddleware)
 */
export class ValidationMiddleware extends BaseMiddleware {
  
  static validateDto(dtoClass: any) {
    return async (req: LocalizedRequest, res: Response, next: NextFunction): Promise<void> => {
      const middleware = new ValidationMiddleware();
      
      try {
        const t = LanguageMiddleware.getTranslationService(req);
        const dto = plainToClass(dtoClass, req.body);
        const errors: ValidationError[] = await validate(dto);

        if (errors.length > 0) {
          const errorMessages = errors.map(error => 
            Object.values(error.constraints || {}).join(', ')
          );
          
          // Create standardized validation error
          const validationError = ErrorFactory.createError(
            ErrorCode.VALIDATION_FAILED,
            t.validation('validation_failed'),
            {
              correlationId: req.context?.correlationId,
              requestId: req.context?.requestId,
              method: req.method,
              url: req.originalUrl,
            },
            {
              userMessage: t.validation('validation_failed'),
              action: 'CHECK_INPUT',
            }
          );
          
          middleware.sendErrorWithStatus(res, validationError, req, 400);
          return;
        }

        // Validation passed, replace req.body with validated DTO
        req.body = dto;
        next();
        
      } catch (error) {
        const t = LanguageMiddleware.getTranslationService(req);
        const errorMessage = error instanceof Error ? error.message : t.errors('unknown_error');
        
        // Create standardized validation processing error
        const processingError = ErrorFactory.createError(
          ErrorCode.VALIDATION_FAILED,
          t.validation('validation_error'),
          {
            correlationId: req.context?.correlationId,
            requestId: req.context?.requestId,
            method: req.method,
            url: req.originalUrl,
          },
          {
            userMessage: t.validation('validation_error'),
            action: 'CHECK_INPUT',
          }
        );
        
        middleware.sendErrorWithStatus(res, processingError, req, 400);
      }
    };
  }
  
  /**
   * Validate query parameters
   */
  static validateQuery(dtoClass: any) {
    return async (req: LocalizedRequest, res: Response, next: NextFunction): Promise<void> => {
      const middleware = new ValidationMiddleware();
      
      try {
        const t = LanguageMiddleware.getTranslationService(req);
        const dto = plainToClass(dtoClass, req.query);
        const errors: ValidationError[] = await validate(dto as object);

        if (errors.length > 0) {
          const errorMessages = errors.map(error => 
            Object.values(error.constraints || {}).join(', ')
          );
          
          const validationError = ErrorFactory.createError(
            ErrorCode.VALIDATION_FAILED,
            t.validation('validation_failed'), // Use existing translation key
            {
              correlationId: req.context?.correlationId,
              requestId: req.context?.requestId,
              method: req.method,
              url: req.originalUrl,
            },
            {
              userMessage: t.validation('validation_failed'),
              action: 'CHECK_INPUT',
            }
          );
          
          middleware.sendErrorWithStatus(res, validationError, req, 400);
          return;
        }

        // req.query = dto; // Skip this as it causes type issues
        next();
        
      } catch (error) {
        const t = LanguageMiddleware.getTranslationService(req);
        const errorMessage = error instanceof Error ? error.message : t.errors('unknown_error');
        
        const processingError = ErrorFactory.createError(
          ErrorCode.VALIDATION_FAILED,
          t.validation('validation_error'),
          {
            correlationId: req.context?.correlationId,
            requestId: req.context?.requestId,
            method: req.method,
            url: req.originalUrl,
          },
          {
            userMessage: t.validation('validation_error'),
            action: 'CHECK_INPUT',
          }
        );
        
        middleware.sendErrorWithStatus(res, processingError, req, 400);
      }
    };
  }
}
