/**
 * Enhanced success response DTO that maintains compatibility with original ResponseDto
 * while providing additional features like correlation tracking and metadata
 */
export class SuccessResponse<T = any> {
  public readonly success: true = true;
  public readonly message: string;
  public readonly data: T;
  public readonly timestamp: Date;
  
  // Enhanced tracking information
  public readonly correlationId?: string;
  public readonly requestId?: string;
  public readonly path?: string;
  public readonly method?: string;
  
  // Optional metadata for pagination, versioning, etc.
  public readonly meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    version?: string;
    [key: string]: any;
  };

  constructor(
    data: T,
    message: string,
    options?: {
      correlationId?: string;
      requestId?: string;
      path?: string;
      method?: string;
      meta?: any;
    }
  ) {
    this.data = data;
    this.message = message;
    this.timestamp = new Date();
    
    if (options) {
      this.correlationId = options.correlationId;
      this.requestId = options.requestId;
      this.path = options.path;
      this.method = options.method;
      this.meta = options.meta;
    }
  }

  /**
   * Create a success response (enhanced version)
   */
  static create<T>(
    data: T, 
    message: string,
    options?: {
      correlationId?: string;
      requestId?: string;
      path?: string;
      method?: string;
      meta?: any;
    }
  ): SuccessResponse<T> {
    return new SuccessResponse(data, message, options);
  }

  /**
   * Create a success response with pagination metadata
   */
  static createWithPagination<T>(
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
    },
    message: string,
    options?: {
      correlationId?: string;
      requestId?: string;
      path?: string;
      method?: string;
      meta?: any;
    }
  ): SuccessResponse<T[]> {
    const totalPages = Math.ceil(pagination.total / pagination.limit);
    
    const meta = {
      ...options?.meta,
      pagination: {
        ...pagination,
        totalPages,
      },
    };
    
    return new SuccessResponse(data, message, { ...options, meta });
  }

  /**
   * Create a simple success response (backward compatibility with ResponseDto.success)
   */
  static success<T>(message: string, data?: T): SuccessResponse<T | undefined> {
    return new SuccessResponse(data, message);
  }

  /**
   * Convert to response object (for Express.js res.json())
   */
  toResponse() {
    const response: any = {
      success: this.success,
      message: this.message,
      data: this.data,
      timestamp: this.timestamp,
    };
    
    // Add tracking information if available
    if (this.correlationId) response.correlationId = this.correlationId;
    if (this.requestId) response.requestId = this.requestId;
    if (this.path) response.path = this.path;
    if (this.method) response.method = this.method;
    if (this.meta) response.meta = this.meta;
    
    return response;
  }

  /**
   * Convert to JSON for API response (alias for toResponse)
   */
  toJSON() {
    return this.toResponse();
  }
}
