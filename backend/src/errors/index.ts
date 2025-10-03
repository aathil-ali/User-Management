// Base
export { ApplicationError, IErrorContext, IErrorActionable, ErrorSerializer } from './base';

// Error Classes
export {
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  ExternalServiceError,
  InternalServerError,
  NetworkError,
  UnknownError,
  BusinessError,
  SecurityError,
  RateLimitError
} from './classes';

// Domain-specific errors
export * from './domain/auth';

// Factory
export { ErrorFactory } from './ErrorFactory';
