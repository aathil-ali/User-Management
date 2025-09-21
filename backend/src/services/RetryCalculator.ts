import { RetryInfo } from '@/interfaces/IRetry';

/**
 * Retry Calculator Service
 * Single Responsibility: Calculate retry strategies based on error characteristics
 */
export class RetryCalculator {
  /**
   * Calculate retry information based on error characteristics
   */
  static calculate(
    isRetryable: boolean,
    severity: string,
    category: string,
    retryAfter?: number
  ): RetryInfo {
    return {
      retryable: isRetryable,
      retryAfter,
      maxRetries: this.calculateMaxRetries(severity),
      backoffStrategy: this.determineBackoffStrategy(category),
    };
  }

  /**
   * Calculate max retries based on error severity
   */
  private static calculateMaxRetries(severity: string): number {
    switch (severity) {
      case 'LOW': return 3;
      case 'MEDIUM': return 2;
      case 'HIGH': return 1;
      case 'CRITICAL': return 0;
      default: return 1;
    }
  }

  /**
   * Determine backoff strategy based on error category
   */
  private static determineBackoffStrategy(category: string): 'linear' | 'exponential' | 'fixed' {
    switch (category.toLowerCase()) {
      case 'database':
      case 'external':
      case 'network':
        return 'exponential';
      case 'ratelimit':
        return 'linear';
      default:
        return 'fixed';
    }
  }
}
