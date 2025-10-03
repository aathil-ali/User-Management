/**
 * Context information for error instances
 */
export interface IErrorContext {
  userId?: string;
  correlationId?: string;
  requestId?: string;
  operation?: string;
  resource?: string;
  feature?: string;
  details?: Record<string, any>;
  timestamp?: Date;
  userAgent?: string;
  ip?: string;
  method?: string;
  url?: string;
  stack?: string;
}
