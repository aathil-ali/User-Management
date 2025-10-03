export interface IErrorCodeRegistry {
  [key: string]: {
    message: string;
    httpStatus: number;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    logLevel: 'info' | 'warn' | 'error' | 'fatal';
    userFacing: boolean;
    requiresAlert: boolean;
  };
}
