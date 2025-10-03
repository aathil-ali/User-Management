import { Response, NextFunction } from 'express';
import { LanguageMiddleware } from './LanguageMiddleware';
import { BaseMiddleware } from './BaseMiddleware';

/**
 * Role-based Authorization Middleware
 * Now follows SOLID principles:
 */
export class RoleMiddleware extends BaseMiddleware {
  
  static requireRole(role: 'user' | 'admin') {
    return (req: any, res: Response, next: NextFunction): void => {
      const middleware = new RoleMiddleware();
      
      try {
        const t = LanguageMiddleware.getTranslationService(req);
        
        // Check if user exists (from authentication middleware)
        if (!req.user) {
          middleware.sendAuthenticationRequired(res, req, t);
          return;
        }

        // Check role permissions
        // Super admin has access to everything, admin has access to admin routes, users only to user routes
        const hasPermission = req.user.role === role || 
                             req.user.role === 'super_admin' || 
                             (role === 'admin' && req.user.role === 'admin');
        
        if (!hasPermission) {
          middleware.sendInsufficientPermissions(res, req, t, role);
          return;
        }

        // Authorization successful, continue to next middleware
        next();
        
      } catch (error) {
        const t = LanguageMiddleware.getTranslationService(req);
        const errorMessage = error instanceof Error ? error.message : t.errors('unknown_error');
        
        // Use standardized authorization error response
        middleware.sendAuthorizationError(res, req, t, errorMessage);
      }
    };
  }

  /**
   * Convenience method for requiring admin role
   */
  static requireAdmin(req: any, res: Response, next: NextFunction): void {
    RoleMiddleware.requireRole('admin')(req, res, next);
  }
  
  /**
   * Convenience method for requiring any authenticated user
   */
  static requireAuthenticated(req: any, res: Response, next: NextFunction): void {
    const middleware = new RoleMiddleware();
    
    try {
      const t = LanguageMiddleware.getTranslationService(req);
      
      if (!req.user) {
        middleware.sendAuthenticationRequired(res, req, t);
        return;
      }
      
      next();
      
    } catch (error) {
      const t = LanguageMiddleware.getTranslationService(req);
      const errorMessage = error instanceof Error ? error.message : t.errors('unknown_error');
      
      middleware.sendAuthorizationError(res, req, t, errorMessage);
    }
  }
}
