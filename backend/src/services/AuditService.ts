import { Pool } from 'pg';
import { AuditLog } from '@/entities/AuditLog';

export class AuditService {
  constructor(private pool: Pool) {}

  async logAction(userId: string | undefined, action: string, details: Record<string, any>): Promise<void> {
    // Implementation will be added later
    throw new Error('Method not implemented');
  }

  async getAuditLogs(userId?: string, limit: number = 100, offset: number = 0): Promise<AuditLog[]> {
    // Implementation will be added later
    throw new Error('Method not implemented');
  }
}
