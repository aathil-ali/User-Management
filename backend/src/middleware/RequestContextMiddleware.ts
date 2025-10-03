import { Request, Response, NextFunction, RequestHandler } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { IRequestWithContext } from '@/interfaces/middleware';

// Re-export for backward compatibility
export type RequestWithContext = IRequestWithContext;

/**
 * Request Context Middleware
 * 
 * Adds correlation IDs, request IDs, and performance tracking to all requests
 */
export class RequestContextMiddleware {
  /**
   * Create request context middleware
   */
  static create(): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
      RequestContextMiddleware.addContext(req as RequestWithContext, res, next);
    };
  }

  /**
   * Add request correlation and context information
   */
  static addContext(req: RequestWithContext, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    const timestamp = new Date();
    
    // Generate unique identifiers
    req.correlationId = req.headers['x-correlation-id'] as string || uuidv4();
    req.requestId = req.headers['x-request-id'] as string || uuidv4();
    req.startTime = startTime;
    
    // Extract request information
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const ip = RequestContextMiddleware.extractClientIp(req);
    
    // Build request context
    req.context = {
      correlationId: req.correlationId,
      requestId: req.requestId,
      ip,
      method: req.method,
      url: req.originalUrl || req.url,
      userAgent,
      timestamp,
      performance: {
        startTime,
        memoryUsage: process.memoryUsage(),
      },
    };
    
    // Add correlation ID to response headers for client tracking
    res.setHeader('X-Correlation-ID', req.correlationId);
    res.setHeader('X-Request-ID', req.requestId);
    
    // Add performance timing on response finish
    const originalSend = res.send;
    res.send = function(data) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Add performance headers
      res.setHeader('X-Response-Time', `${duration}ms`);
      res.setHeader('X-Timestamp', timestamp.toISOString());
      
      // Update context with final performance metrics
      req.context.performance = {
        ...req.context.performance,
        duration,
        memoryUsage: process.memoryUsage(),
      };
      
      return originalSend.call(this, data);
    };
    
    next();
  }

  /**
   * Extract user context from authenticated requests
   */
  static extractUserContext(req: RequestWithContext, res: Response, next: NextFunction): void {
    // This middleware should run after authentication middleware
    const user = (req as any).user;
    
    if (user) {
      req.context.userId = user.id;
      req.context.userRole = user.role;
    }
    
    next();
  }

  /**
   * Extract client IP address from request
   */
  private static extractClientIp(req: Request): string {
    // Check various headers for client IP (in order of preference)
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
      return Array.isArray(forwardedFor) 
        ? forwardedFor[0].split(',')[0].trim() 
        : forwardedFor.split(',')[0].trim();
    }
    
    const realIp = req.headers['x-real-ip'];
    if (realIp && typeof realIp === 'string') {
      return realIp;
    }
    
    const clientIp = req.headers['x-client-ip'];
    if (clientIp && typeof clientIp === 'string') {
      return clientIp;
    }
    
    // Fallback to connection info
    return req.connection?.remoteAddress || 
           req.socket?.remoteAddress || 
           (req.connection as any)?.socket?.remoteAddress || 
           'unknown';
  }

  /**
   * Generate a unique correlation ID
   */
  static generateCorrelationId(): string {
    return uuidv4();
  }

  /**
   * Generate a unique request ID
   */
  static generateRequestId(): string {
    return uuidv4();
  }

  /**
   * Get performance metrics from request
   */
  static getPerformanceMetrics(req: RequestWithContext) {
    const currentTime = Date.now();
    const duration = currentTime - req.startTime;
    const currentMemory = process.memoryUsage();
    
    return {
      duration,
      startTime: req.startTime,
      endTime: currentTime,
      memoryUsage: req.context.performance.memoryUsage,
      memoryUsageEnd: currentMemory,
      memoryDelta: {
        rss: currentMemory.rss - (req.context.performance.memoryUsage?.rss || 0),
        heapUsed: currentMemory.heapUsed - (req.context.performance.memoryUsage?.heapUsed || 0),
        heapTotal: currentMemory.heapTotal - (req.context.performance.memoryUsage?.heapTotal || 0),
        external: currentMemory.external - (req.context.performance.memoryUsage?.external || 0),
        arrayBuffers: currentMemory.arrayBuffers - (req.context.performance.memoryUsage?.arrayBuffers || 0),
      },
    };
  }
}

/**
 * Request logging middleware
 */
export class RequestLoggingMiddleware {
  /**
   * Create logging middleware
   */
  static logRequests(): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
      RequestLoggingMiddleware.logRequest(req as RequestWithContext, res, next);
    };
  }

  /**
   * Log incoming requests with correlation ID
   */
  static logRequest(req: RequestWithContext, res: Response, next: NextFunction): void {
    const { method, originalUrl, correlationId, requestId, context } = req;
    
    // Log request start
    console.log(`[${new Date().toISOString()}] ${method} ${originalUrl}`, {
      correlationId,
      requestId,
      ip: context.ip,
      userAgent: context.userAgent,
      userId: context.userId,
      userRole: context.userRole,
    });
    
    // Log response on finish
    res.on('finish', () => {
      const performance = RequestContextMiddleware.getPerformanceMetrics(req);
      
      console.log(`[${new Date().toISOString()}] ${method} ${originalUrl} - ${res.statusCode}`, {
        correlationId,
        requestId,
        statusCode: res.statusCode,
        duration: `${performance.duration}ms`,
        contentLength: res.get('content-length') || 0,
        userId: context.userId,
      });
    });
    
    next();
  }

  /**
   * Log errors with correlation context
   */
  static logError(error: Error, req: RequestWithContext, res: Response, next: NextFunction): void {
    const { correlationId, requestId, context } = req;
    
    console.error(`[${new Date().toISOString()}] ERROR ${req.method} ${req.originalUrl}`, {
      correlationId,
      requestId,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      context: {
        userId: context.userId,
        userRole: context.userRole,
        ip: context.ip,
        userAgent: context.userAgent,
      },
      performance: RequestContextMiddleware.getPerformanceMetrics(req),
    });
    
    next(error);
  }
}

/**
 * Helper function to get request context from any middleware/controller
 */
export function getRequestContext(req: Request): RequestWithContext['context'] | null {
  const contextReq = req as RequestWithContext;
  return contextReq.context || null;
}

/**
 * Helper function to get correlation ID from request
 */
export function getCorrelationId(req: Request): string | null {
  const contextReq = req as RequestWithContext;
  return contextReq.correlationId || null;
}

/**
 * Helper function to get request ID from request
 */
export function getRequestId(req: Request): string | null {
  const contextReq = req as RequestWithContext;
  return contextReq.requestId || null;
}
