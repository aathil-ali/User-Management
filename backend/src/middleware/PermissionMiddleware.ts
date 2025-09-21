import { Request, Response, NextFunction } from 'express';
import { BaseMiddleware } from './BaseMiddleware';
import { PermissionService } from '@/services/PermissionService';
import { Permission, Resource, PermissionCheck, UserContext } from '@/types/permissions';
import { ErrorFactory } from '@/errors/ApplicationError';
import { ErrorCode } from '@/types/error-codes';
import { LanguageMiddleware, LocalizedRequest } from './LanguageMiddleware';

// Extend the LocalizedRequest interface to include user information
interface AuthenticatedRequest extends LocalizedRequest {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Permission Middleware
 * Checks if the authenticated user has the required permissions
 */
export class PermissionMiddleware extends BaseMiddleware {

  /**
   * Check if user has a specific permission
   */
  static requirePermission(permission: Permission, resource: Resource) {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const middleware = new PermissionMiddleware();

      try {
        // Ensure user is authenticated (should be done by AuthMiddleware first)
        if (!req.user) {
          const t = LanguageMiddleware.getTranslationService(req);
          const error = ErrorFactory.createError(
            ErrorCode.AUTH_TOKEN_MISSING,
            t.auth('authentication_required'),
            {
              correlationId: req.context?.correlationId,
              requestId: req.context?.requestId,
            },
            {
              userMessage: t.auth('authentication_required'),
              action: 'LOGIN_REQUIRED'
            }
          );
          
          return middleware.sendErrorWithStatus(res, error, req, 401);
        }

        // Create user context
        const userContext: UserContext = {
          id: req.user.id,
          role: req.user.role
        };

        // Create permission check
        const check: PermissionCheck = {
          permission,
          resource,
          resourceId: req.params.id || req.user.id // Use URL param or user's own ID
        };

        // Check permission
        const result = PermissionService.hasPermission(userContext, check);

        if (!result.allowed) {
          const t = LanguageMiddleware.getTranslationService(req);
          const error = ErrorFactory.createError(
            ErrorCode.AUTHZ_INSUFFICIENT_PERMISSIONS,
            result.reason || t.authorization('insufficient_permissions'),
            {
              correlationId: req.context?.correlationId,
              requestId: req.context?.requestId,
              userId: req.user.id,
              details: {
                requiredPermission: `${permission}:${resource}`,
                userRole: req.user.role
              }
            },
            {
              userMessage: t.authorization('insufficient_permissions'),
              action: 'CONTACT_SUPPORT'
            }
          );
          
          return middleware.sendErrorWithStatus(res, error, req, 403);
        }

        // Permission granted, continue
        next();

      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Check if user has any of the specified permissions
   */
  static requireAnyPermission(checks: Array<{permission: Permission, resource: Resource}>) {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const middleware = new PermissionMiddleware();

      try {
        if (!req.user) {
          const t = LanguageMiddleware.getTranslationService(req);
          const error = ErrorFactory.createError(
            ErrorCode.AUTH_TOKEN_MISSING,
            t.auth('authentication_required'),
            {},
            { userMessage: t.auth('authentication_required'), action: 'LOGIN_REQUIRED' }
          );
          return middleware.sendErrorWithStatus(res, error, req, 401);
        }

        const userContext: UserContext = {
          id: req.user.id,
          role: req.user.role
        };

        const permissionChecks: PermissionCheck[] = checks.map(check => ({
          ...check,
          resourceId: req.params.id || req.user!.id
        }));

        const result = PermissionService.hasAnyPermission(userContext, permissionChecks);

        if (!result.allowed) {
          const t = LanguageMiddleware.getTranslationService(req);
          const error = ErrorFactory.createError(
            ErrorCode.AUTHZ_INSUFFICIENT_PERMISSIONS,
            result.reason || t.authorization('insufficient_permissions'),
            {
              correlationId: req.context?.correlationId,
              requestId: req.context?.requestId,
              userId: req.user.id
            },
            {
              userMessage: t.authorization('insufficient_permissions'),
              action: 'CONTACT_SUPPORT'
            }
          );
          return middleware.sendErrorWithStatus(res, error, req, 403);
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Require admin permissions (any admin-level access)
   */
  static requireAdmin() {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const middleware = new PermissionMiddleware();

      try {
        if (!req.user) {
          const t = LanguageMiddleware.getTranslationService(req);
          const error = ErrorFactory.createError(
            ErrorCode.AUTH_TOKEN_MISSING,
            t.auth('authentication_required'),
            {},
            { userMessage: t.auth('authentication_required'), action: 'LOGIN_REQUIRED' }
          );
          return middleware.sendErrorWithStatus(res, error, req, 401);
        }

        const userContext: UserContext = {
          id: req.user.id,
          role: req.user.role
        };

        if (!PermissionService.isAdmin(userContext)) {
          const t = LanguageMiddleware.getTranslationService(req);
          const error = ErrorFactory.createError(
            ErrorCode.AUTHZ_ADMIN_REQUIRED,
            t.authorization('admin_access_required'),
            {
              correlationId: req.context?.correlationId,
              requestId: req.context?.requestId,
              userId: req.user.id,
              details: { userRole: req.user.role }
            },
            {
              userMessage: t.authorization('admin_access_required'),
              action: 'CONTACT_SUPPORT'
            }
          );
          return middleware.sendErrorWithStatus(res, error, req, 403);
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Require super admin permissions
   */
  static requireSuperAdmin() {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const middleware = new PermissionMiddleware();

      try {
        if (!req.user) {
          const t = LanguageMiddleware.getTranslationService(req);
          const error = ErrorFactory.createError(
            ErrorCode.AUTH_TOKEN_MISSING,
            t.auth('authentication_required'),
            {},
            { userMessage: t.auth('authentication_required'), action: 'LOGIN_REQUIRED' }
          );
          return middleware.sendErrorWithStatus(res, error, req, 401);
        }

        const userContext: UserContext = {
          id: req.user.id,
          role: req.user.role
        };

        if (!PermissionService.isSuperAdmin(userContext)) {
          const t = LanguageMiddleware.getTranslationService(req);
          const error = ErrorFactory.createError(
            ErrorCode.AUTHZ_ADMIN_REQUIRED,
            t.authorization('admin_access_required'),
            {
              correlationId: req.context?.correlationId,
              requestId: req.context?.requestId,
              userId: req.user.id
            },
            {
              userMessage: t.authorization('admin_access_required'),
              action: 'CONTACT_SUPPORT'
            }
          );
          return middleware.sendErrorWithStatus(res, error, req, 403);
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Allow access to own resources only (for regular users)
   */
  static requireOwnership() {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const middleware = new PermissionMiddleware();

      try {
        if (!req.user) {
          const t = LanguageMiddleware.getTranslationService(req);
          const error = ErrorFactory.createError(
            ErrorCode.AUTH_TOKEN_MISSING,
            t.auth('authentication_required'),
            {},
            { userMessage: t.auth('authentication_required'), action: 'LOGIN_REQUIRED' }
          );
          return middleware.sendErrorWithStatus(res, error, req, 401);
        }

        // Check if user is admin (admins can access any resource)
        const userContext: UserContext = {
          id: req.user.id,
          role: req.user.role
        };

        if (PermissionService.isAdmin(userContext)) {
          return next(); // Admins bypass ownership checks
        }

        // For regular users, check ownership
        const resourceId = req.params.id || req.params.userId;
        if (!resourceId) {
          // If no resource ID in URL, assume they're accessing their own resource
          return next();
        }

        if (req.user.id !== resourceId) {
          const t = LanguageMiddleware.getTranslationService(req);
          const error = ErrorFactory.createError(
            ErrorCode.AUTHZ_RESOURCE_ACCESS_DENIED,
            t.authorization('insufficient_permissions'),
            {
              correlationId: req.context?.correlationId,
              requestId: req.context?.requestId,
              userId: req.user.id
            },
            {
              userMessage: t.authorization('insufficient_permissions'),
              action: 'CHECK_INPUT'
            }
          );
          return middleware.sendErrorWithStatus(res, error, req, 403);
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Helper method: Get user context from request
   */
  static getUserContext(req: AuthenticatedRequest): UserContext | null {
    if (!req.user) return null;
    
    return {
      id: req.user.id,
      role: req.user.role
    };
  }
}
