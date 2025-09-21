import { PoolClient } from 'pg';
import { Migration } from '../MigrationRunner';

export const migration: Migration = {
  id: '001',
  name: '001_create_roles_table',
  
  async up(client: PoolClient): Promise<void> {
    await client.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(50) NOT NULL UNIQUE,
        description TEXT,
        permissions JSONB DEFAULT '[]'::jsonb,
        is_system BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE INDEX idx_roles_name ON roles (name);
    `);

    await client.query(`
      CREATE INDEX idx_roles_is_active ON roles (is_active);
    `);
  },

  async down(client: PoolClient): Promise<void> {
    await client.query('DROP TABLE IF EXISTS roles CASCADE;');
  }
};
