/**
 * Retry guidance for API clients
 * Single Responsibility: Defines retry behavior information
 */
export interface RetryInfo {
  retryable: boolean;
  retryAfter?: number; // seconds to wait before retrying
  maxRetries?: number;
  backoffStrategy?: 'linear' | 'exponential' | 'fixed';
}
