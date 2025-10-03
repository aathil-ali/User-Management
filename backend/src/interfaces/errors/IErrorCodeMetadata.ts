export interface IErrorCodeMetadata {
  httpStatus: number;
  category: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  retryable: boolean;
  userFacing: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  requiresAlert: boolean;
}
