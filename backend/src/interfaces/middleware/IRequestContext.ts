/**
 * Request context interface for tracking requests
 */
export interface IRequestContext {
  correlationId?: string;
  requestId?: string;
  userId?: string;
  timestamp?: Date;
}
