import { ErrorCode } from '@/types/error-codes';
import { 
  ValidationError, 
  AuthenticationError, 
  ConflictError,
  ErrorContext, 
  ErrorActionable 
} from '@/errors/ApplicationError';

/**
 * Error thrown when attempting to register with an email that already exists
 */
export class EmailAlreadyExistsError extends ConflictError {
  constructor(
    email?: string,
    context: Partial<ErrorContext> = {},
    actionable: Partial<ErrorActionable> = {}
  ) {
    super(
      ErrorCode.VALIDATION_EMAIL_ALREADY_EXISTS,
      undefined, // Let the error registry handle the default message
      {
        ...context,
        details: { email },
      },
      {
        action: 'CHECK_INPUT',
        ...actionable,
      }
    );
  }
}

/**
 * Error thrown when login credentials are invalid
 */
export class InvalidCredentialsError extends AuthenticationError {
  constructor(
    context: Partial<ErrorContext> = {},
    actionable: Partial<ErrorActionable> = {}
  ) {
    super(
      ErrorCode.AUTH_INVALID_CREDENTIALS,
      undefined, // Let the error registry handle the default message
      context,
      {
        action: 'CORRECT_INPUT',
        ...actionable,
      }
    );
  }
}

/**
 * Error thrown when a user account is not found
 */
export class UserNotFoundError extends AuthenticationError {
  constructor(
    identifier?: string,
    context: Partial<ErrorContext> = {},
    actionable: Partial<ErrorActionable> = {}
  ) {
    super(
      ErrorCode.AUTH_USER_NOT_FOUND,
      undefined, // Let the error registry handle the default message
      {
        ...context,
        details: { identifier },
      },
      {
        action: 'CHECK_INPUT',
        ...actionable,
      }
    );
  }
}

/**
 * Error thrown when a refresh token is invalid or expired
 */
export class InvalidRefreshTokenError extends AuthenticationError {
  constructor(
    context: Partial<ErrorContext> = {},
    actionable: Partial<ErrorActionable> = {}
  ) {
    super(
      ErrorCode.AUTH_TOKEN_INVALID,
      undefined, // Let the error registry handle the default message
      context,
      {
        action: 'LOGIN_REQUIRED',
        ...actionable,
      }
    );
  }
}

/**
 * Error thrown when an access token is invalid or expired
 */
export class InvalidAccessTokenError extends AuthenticationError {
  constructor(
    context: Partial<ErrorContext> = {},
    actionable: Partial<ErrorActionable> = {}
  ) {
    super(
      ErrorCode.AUTH_TOKEN_EXPIRED,
      undefined, // Let the error registry handle the default message
      context,
      {
        action: 'REFRESH_TOKEN',
        ...actionable,
      }
    );
  }
}

/**
 * Error thrown when account is locked due to too many failed login attempts
 */
export class AccountLockedError extends AuthenticationError {
  constructor(
    lockoutDuration?: number,
    context: Partial<ErrorContext> = {},
    actionable: Partial<ErrorActionable> = {}
  ) {
    super(
      ErrorCode.AUTH_ACCOUNT_LOCKED,
      undefined, // Let the error registry handle the default message
      {
        ...context,
        details: { lockoutDuration },
      },
      {
        action: 'WAIT_AND_RETRY',
        retryAfter: lockoutDuration || 900, // 15 minutes default
        ...actionable,
      }
    );
  }
}

/**
 * Error thrown when account is not yet verified
 */
export class AccountNotVerifiedError extends AuthenticationError {
  constructor(
    context: Partial<ErrorContext> = {},
    actionable: Partial<ErrorActionable> = {}
  ) {
    super(
      ErrorCode.AUTH_ACCOUNT_NOT_VERIFIED,
      undefined, // Let the error registry handle the default message
      context,
      {
        action: 'CHECK_INPUT',
        ...actionable,
      }
    );
  }
}

/**
 * Error thrown when account is disabled/deactivated
 */
export class AccountDisabledError extends AuthenticationError {
  constructor(
    reason?: string,
    context: Partial<ErrorContext> = {},
    actionable: Partial<ErrorActionable> = {}
  ) {
    super(
      ErrorCode.AUTH_ACCOUNT_DISABLED,
      undefined, // Let the error registry handle the default message
      {
        ...context,
        details: { reason },
      },
      {
        action: 'CONTACT_SUPPORT',
        ...actionable,
      }
    );
  }
}

/**
 * Error thrown when password requirements are not met
 */
export class WeakPasswordError extends ValidationError {
  constructor(
    requirements: string[],
    context: Partial<ErrorContext> = {},
    actionable: Partial<ErrorActionable> = {}
  ) {
    super(
      ErrorCode.VALIDATION_PASSWORD_WEAK,
      undefined, // Let the error registry handle the default message
      {
        ...context,
        details: { requirements },
      },
      {
        action: 'CORRECT_INPUT',
        ...actionable,
      }
    );
  }
}

/**
 * Error thrown when rate limit is exceeded for authentication attempts
 */
export class AuthRateLimitError extends AuthenticationError {
  constructor(
    retryAfter: number = 60,
    context: Partial<ErrorContext> = {},
    actionable: Partial<ErrorActionable> = {}
  ) {
    super(
      ErrorCode.RATE_LIMIT_AUTH_EXCEEDED,
      undefined, // Let the error registry handle the default message
      context,
      {
        action: 'WAIT_AND_RETRY',
        retryAfter,
        ...actionable,
      }
    );
  }
}
