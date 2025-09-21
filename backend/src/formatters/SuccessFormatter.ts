import { SuccessResponse } from '@/dto/responses/SuccessResponse';

/**
 * Success Response Formatter
 * Single Responsibility: Format success responses for different audiences
 * Mirrors ErrorFormatter pattern for consistency
 */
export class SuccessFormatter {
  /**
   * Format for user-safe consumption (production)
   * Clean, minimal response without internal tracking details
   */
  static toUserSafeResponse<T>(successDto: SuccessResponse<T>) {
    return {
      success: successDto.success,
      message: successDto.message,
      data: successDto.data,
      timestamp: successDto.timestamp,
      ...(successDto.meta && { meta: successDto.meta }),
    };
  }

  /**
   * Format for development/debugging with full details
   * Includes all tracking information and metadata
   */
  static toFullResponse<T>(successDto: SuccessResponse<T>) {
    return {
      success: successDto.success,
      message: successDto.message,
      data: successDto.data,
      timestamp: successDto.timestamp,
      correlationId: successDto.correlationId,
      requestId: successDto.requestId,
      path: successDto.path,
      method: successDto.method,
      ...(successDto.meta && { meta: successDto.meta }),
      debug: {
        hasCorrelationId: !!successDto.correlationId,
        hasRequestId: !!successDto.requestId,
        hasMetadata: !!successDto.meta,
        dataType: Array.isArray(successDto.data) ? 'array' : typeof successDto.data,
        dataSize: this.getDataSize(successDto.data),
      },
    };
  }

  /**
   * Format for logging systems
   * Structured format optimized for log aggregation
   */
  static toLogResponse<T>(successDto: SuccessResponse<T>) {
    return {
      level: 'info',
      event: 'api_success',
      message: successDto.message,
      correlationId: successDto.correlationId,
      requestId: successDto.requestId,
      path: successDto.path,
      method: successDto.method,
      timestamp: successDto.timestamp,
      responseType: 'success',
      dataType: Array.isArray(successDto.data) ? 'array' : typeof successDto.data,
      dataSize: this.getDataSize(successDto.data),
      hasPagination: !!(successDto.meta?.pagination),
      ...(successDto.meta?.pagination && {
        pagination: {
          page: successDto.meta.pagination.page,
          limit: successDto.meta.pagination.limit,
          total: successDto.meta.pagination.total,
          totalPages: successDto.meta.pagination.totalPages,
        }
      }),
    };
  }

  /**
   * Format for API documentation/OpenAPI
   * Clean schema-friendly format
   */
  static toApiDocumentationResponse<T>(successDto: SuccessResponse<T>) {
    const response: any = {
      success: successDto.success,
      message: successDto.message,
      data: successDto.data,
      timestamp: successDto.timestamp,
    };

    // Add correlation tracking for API documentation
    if (successDto.correlationId) {
      response.correlationId = successDto.correlationId;
    }

    // Add pagination meta if present
    if (successDto.meta?.pagination) {
      response.meta = {
        pagination: successDto.meta.pagination,
      };
    }

    return response;
  }

  /**
   * Format for external API consumption
   * Standardized format for third-party integrations
   */
  static toExternalApiResponse<T>(successDto: SuccessResponse<T>) {
    const response: any = {
      status: 'success',
      message: successDto.message,
      data: successDto.data,
      timestamp: successDto.timestamp.toISOString(),
    };

    // Add correlation ID for external API tracking
    if (successDto.correlationId) {
      response.correlationId = successDto.correlationId;
    }

    // Transform pagination meta for external consumption
    if (successDto.meta?.pagination) {
      response.pagination = {
        currentPage: successDto.meta.pagination.page,
        itemsPerPage: successDto.meta.pagination.limit,
        totalItems: successDto.meta.pagination.total,
        totalPages: successDto.meta.pagination.totalPages,
      };
    }

    return response;
  }

  /**
   * Format for metrics/analytics systems
   * Focused on performance and usage metrics
   */
  static toMetricsResponse<T>(successDto: SuccessResponse<T>) {
    return {
      event: 'api_success',
      timestamp: successDto.timestamp,
      correlationId: successDto.correlationId,
      requestId: successDto.requestId,
      path: successDto.path,
      method: successDto.method,
      responseSize: this.getDataSize(successDto.data),
      dataType: Array.isArray(successDto.data) ? 'array' : typeof successDto.data,
      itemCount: Array.isArray(successDto.data) ? successDto.data.length : 1,
      hasPagination: !!(successDto.meta?.pagination),
      ...(successDto.meta?.pagination && {
        paginationMetrics: {
          currentPage: successDto.meta.pagination.page,
          itemsPerPage: successDto.meta.pagination.limit,
          totalItems: successDto.meta.pagination.total,
        }
      }),
    };
  }

  /**
   * Get approximate data size for logging/metrics
   */
  private static getDataSize(data: any): number {
    if (data === null || data === undefined) return 0;
    if (typeof data === 'string') return data.length;
    if (Array.isArray(data)) return data.length;
    if (typeof data === 'object') return Object.keys(data).length;
    return 1;
  }

  /**
   * Auto-format based on environment
   * Chooses appropriate format based on NODE_ENV and other factors
   */
  static autoFormat<T>(
    successDto: SuccessResponse<T>,
    options?: {
      environment?: 'development' | 'production' | 'test';
      audience?: 'user' | 'developer' | 'external' | 'logs' | 'metrics';
    }
  ) {
    const env = options?.environment || process.env.NODE_ENV || 'development';
    const audience = options?.audience || 'user';

    // Route to appropriate formatter
    switch (audience) {
      case 'developer':
        return this.toFullResponse(successDto);
      case 'logs':
        return this.toLogResponse(successDto);
      case 'metrics':
        return this.toMetricsResponse(successDto);
      case 'external':
        return this.toExternalApiResponse(successDto);
      case 'user':
      default:
        return env === 'production' 
          ? this.toUserSafeResponse(successDto)
          : this.toFullResponse(successDto);
    }
  }
}
