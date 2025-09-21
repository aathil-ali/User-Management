export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  details: Record<string, any>;
  timestamp: Date;
}
