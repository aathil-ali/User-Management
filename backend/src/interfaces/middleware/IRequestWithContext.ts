import { Request } from 'express';

/**
 * Extended request interface with correlation and context information
 */
export interface IRequestWithContext extends Request {
  correlationId: string;
  requestId: string;
  startTime: number;
  context: {
    correlationId: string;
    requestId: string;
    userId?: string;
    userRole?: string;
    userAgent?: string;
    ip: string;
    method: string;
    url: string;
    timestamp: Date;
    performance: {
      startTime: number;
      duration?: number;
      memoryUsage?: NodeJS.MemoryUsage;
    };
  };
}
