import { IErrorContext } from '@/errors';

/**
 * Error Context Sanitizer Service
 * Single Responsibility: Sanitize error context for safe public exposure
 */
export class ErrorContextSanitizer {
  /**
   * Sanitize context information (remove sensitive data)
   */
  static sanitize(context: IErrorContext): Partial<IErrorContext> {
    const sanitized: Partial<IErrorContext> = {
      timestamp: context.timestamp,
      operation: context.operation,
      resource: context.resource,
      correlationId: context.correlationId,
      requestId: context.requestId,
      method: context.method,
      url: context.url,
    };

    // Include user ID only if it doesn't expose sensitive information
    if (context.userId && !this.isSensitiveUserId(context.userId)) {
      sanitized.userId = context.userId;
    }

    // Include IP address in a sanitized form
    if (context.ip) {
      sanitized.ip = this.sanitizeIpAddress(context.ip);
    }

    // Include sanitized user agent
    if (context.userAgent) {
      sanitized.userAgent = this.sanitizeUserAgent(context.userAgent);
    }

    return sanitized;
  }

  /**
   * Check if user ID is sensitive (e.g., contains email or PII)
   */
  private static isSensitiveUserId(userId: string): boolean {
    // Basic check for email-like patterns
    return userId.includes('@') || userId.includes('.');
  }

  /**
   * Sanitize IP address (mask last octet for IPv4, last segment for IPv6)
   */
  private static sanitizeIpAddress(ip: string): string {
    if (ip.includes('.')) {
      // IPv4
      const parts = ip.split('.');
      return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
    } else if (ip.includes(':')) {
      // IPv6
      const parts = ip.split(':');
      return parts.slice(0, -1).join(':') + ':xxxx';
    }
    return 'xxx.xxx.xxx.xxx';
  }

  /**
   * Sanitize user agent (extract basic browser/OS info)
   */
  private static sanitizeUserAgent(userAgent: string): string {
    // Extract basic browser and OS information
    const browserMatch = userAgent.match(/(Chrome|Firefox|Safari|Edge)\/[\d.]+/);
    const osMatch = userAgent.match(/(Windows|Mac|Linux|iOS|Android)/);

    const browser = browserMatch ? browserMatch[1] : 'Unknown';
    const os = osMatch ? osMatch[1] : 'Unknown';

    return `${browser} on ${os}`;
  }
}
