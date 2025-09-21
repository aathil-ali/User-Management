import winston from 'winston';

/**
 * Logger configuration interface
 */
interface LoggerConfig {
  level: string;
  format: winston.Logform.Format;
  transports: winston.transport[];
}

/**
 * Create Winston logger instance with structured logging
 */
const createLogger = (): winston.Logger => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const logLevel = process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info');

  // Custom format for development
  const developmentFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      let log = `${timestamp} [${level}]: ${message}`;
      
      // Add metadata if present
      if (Object.keys(meta).length > 0) {
        log += `\n${JSON.stringify(meta, null, 2)}`;
      }
      
      return log;
    })
  );

  // Structured format for production
  const productionFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  );

  // Configure transports
  const transports: winston.transport[] = [];

  // Console transport
  transports.push(
    new winston.transports.Console({
      format: isDevelopment ? developmentFormat : productionFormat,
    })
  );

  // File transports for production
  if (!isDevelopment) {
    // General application log
    transports.push(
      new winston.transports.File({
        filename: 'logs/app.log',
        format: productionFormat,
        maxsize: 10 * 1024 * 1024, // 10MB
        maxFiles: 10,
      })
    );

    // Error-only log
    transports.push(
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: productionFormat,
        maxsize: 10 * 1024 * 1024, // 10MB
        maxFiles: 10,
      })
    );
  }

  const config: LoggerConfig = {
    level: logLevel,
    format: isDevelopment ? developmentFormat : productionFormat,
    transports,
  };

  return winston.createLogger({
    ...config,
    levels: {
      fatal: 0,
      error: 1,
      warn: 2,
      info: 3,
      http: 4,
      verbose: 5,
      debug: 6,
      silly: 7
    },
    defaultMeta: { service: 'user-management' },
  });
};

/**
 * Main logger instance
 */
export const logger = createLogger();

/**
 * Logger utility functions
 */
export class Logger {
  /**
   * Create child logger with additional context
   */
  static child(defaultMeta: any): winston.Logger {
    return logger.child(defaultMeta);
  }

  /**
   * Log request start
   */
  static logRequestStart(correlationId: string, method: string, url: string, userId?: string): void {
    logger.info('Request started', {
      correlationId,
      method,
      url,
      userId,
      type: 'REQUEST_START',
    });
  }

  /**
   * Log request completion
   */
  static logRequestEnd(
    correlationId: string,
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    userId?: string
  ): void {
    logger.info('Request completed', {
      correlationId,
      method,
      url,
      statusCode,
      duration,
      userId,
      type: 'REQUEST_END',
    });
  }

  /**
   * Log database operations
   */
  static logDatabaseOperation(
    operation: string,
    table: string,
    duration: number,
    correlationId?: string,
    error?: Error
  ): void {
    const logLevel = error ? 'error' : 'debug';
    const message = error ? `Database ${operation} failed` : `Database ${operation} completed`;

    logger.log(logLevel, message, {
      correlationId,
      operation,
      table,
      duration,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
      type: 'DATABASE_OPERATION',
    });
  }

  /**
   * Log external service calls
   */
  static logExternalServiceCall(
    service: string,
    endpoint: string,
    method: string,
    statusCode: number,
    duration: number,
    correlationId?: string,
    error?: Error
  ): void {
    const logLevel = error || statusCode >= 400 ? 'error' : 'info';
    const message = error 
      ? `External service call failed: ${service}` 
      : `External service call completed: ${service}`;

    logger.log(logLevel, message, {
      correlationId,
      service,
      endpoint,
      method,
      statusCode,
      duration,
      error: error ? {
        name: error.name,
        message: error.message,
      } : undefined,
      type: 'EXTERNAL_SERVICE_CALL',
    });
  }

  /**
   * Log authentication events
   */
  static logAuthEvent(
    event: 'LOGIN_SUCCESS' | 'LOGIN_FAILURE' | 'LOGOUT' | 'TOKEN_REFRESH' | 'PASSWORD_CHANGE',
    userId?: string,
    ip?: string,
    userAgent?: string,
    correlationId?: string,
    details?: any
  ): void {
    const logLevel = event === 'LOGIN_FAILURE' ? 'warn' : 'info';

    logger.log(logLevel, `Authentication event: ${event}`, {
      correlationId,
      userId,
      ip,
      userAgent,
      event,
      details,
      type: 'AUTH_EVENT',
    });
  }

  /**
   * Log security events
   */
  static logSecurityEvent(
    event: string,
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    details: any,
    userId?: string,
    ip?: string,
    correlationId?: string
  ): void {
    const logLevel = severity === 'CRITICAL' || severity === 'HIGH' ? 'error' : 'warn';

    logger.log(logLevel, `Security event: ${event}`, {
      correlationId,
      userId,
      ip,
      event,
      severity,
      details,
      type: 'SECURITY_EVENT',
    });
  }

  /**
   * Log business events
   */
  static logBusinessEvent(
    event: string,
    details: any,
    userId?: string,
    correlationId?: string
  ): void {
    logger.info(`Business event: ${event}`, {
      correlationId,
      userId,
      event,
      details,
      type: 'BUSINESS_EVENT',
    });
  }
}

export default logger;
