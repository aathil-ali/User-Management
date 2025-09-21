import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { LocalizedRequest, LanguageMiddleware } from './LanguageMiddleware';
import { BaseMiddleware } from './BaseMiddleware';
import { ErrorFactory } from '@/errors/ApplicationError';
import { ErrorCode } from '@/types/error-codes';

// Strengthen request contract - remove optional user for authenticated requests
export interface UnauthenticatedRequest extends LocalizedRequest {}

export interface AuthenticatedRequest extends LocalizedRequest {
  user: {  // Required, not optional - follows LSP properly
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Authentication Middleware
 * Implements JWT token verification
 */
export class AuthMiddleware extends BaseMiddleware {
  
  static authenticate(req: any, res: Response, next: NextFunction): void {
    const middleware = new AuthMiddleware();
    
    try {
      // Get token from Authorization header
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        const t = LanguageMiddleware.getTranslationService(req);
        const error = ErrorFactory.createError(
          ErrorCode.AUTH_TOKEN_MISSING,
          t.auth('authentication_required') || 'Authentication required',
          {
            correlationId: req.context?.correlationId,
            requestId: req.context?.requestId,
            method: req.method,
            url: req.originalUrl,
          },
          {
            userMessage: t.auth('authentication_required') || 'Please log in to continue',
            action: 'LOGIN_REQUIRED'
          }
        );
        return middleware.sendErrorWithStatus(res, error, req, 401);
      }
      
      // Extract token
      const token = authHeader.split(' ')[1];
      
      // Verify JWT token
      const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
      const decoded = jwt.verify(token, jwtSecret) as any;
      
      // Add user info to request
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      };
      
      next();
      
    } catch (error) {
      const t = LanguageMiddleware.getTranslationService(req);
      
      if (error instanceof jwt.TokenExpiredError) {
        const authError = ErrorFactory.createError(
          ErrorCode.AUTH_TOKEN_EXPIRED,
          t.auth('authentication_failed') || 'Token has expired',
          {
            correlationId: req.context?.correlationId,
            requestId: req.context?.requestId,
            method: req.method,
            url: req.originalUrl,
          },
          {
            userMessage: t.auth('authentication_failed') || 'Your session has expired',
            action: 'REFRESH_TOKEN'
          }
        );
        return middleware.sendErrorWithStatus(res, authError, req, 401);
      }
      
      if (error instanceof jwt.JsonWebTokenError) {
        const authError = ErrorFactory.createError(
          ErrorCode.AUTH_TOKEN_INVALID,
          t.auth('authentication_failed') || 'Invalid token',
          {
            correlationId: req.context?.correlationId,
            requestId: req.context?.requestId,
            method: req.method,
            url: req.originalUrl,
          },
          {
            userMessage: t.auth('authentication_failed') || 'Invalid authentication token',
            action: 'LOGIN_REQUIRED'
          }
        );
        return middleware.sendErrorWithStatus(res, authError, req, 401);
      }
      
      // Generic error
      const authError = ErrorFactory.createError(
        ErrorCode.AUTH_INVALID_CREDENTIALS,
        t.auth('authentication_failed') || 'Authentication failed',
        {
          correlationId: req.context?.correlationId,
          requestId: req.context?.requestId,
          method: req.method,
          url: req.originalUrl,
        },
        {
          userMessage: t.auth('authentication_failed') || 'Authentication failed',
          action: 'LOGIN_REQUIRED'
        }
      );
      return middleware.sendErrorWithStatus(res, authError, req, 401);
    }
  }
}
