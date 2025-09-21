import { PoolClient } from 'pg';
import { Migration } from '../MigrationRunner';

export const migration: Migration = {
  id: '002',
  name: '002_create_users_table',
  
  async up(client: PoolClient): Promise<void> {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'deleted')),
        email_verified BOOLEAN DEFAULT false,
        email_verified_at TIMESTAMP,
        last_login_at TIMESTAMP,
        failed_login_attempts INTEGER DEFAULT 0,
        locked_until TIMESTAMP,
        password_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      );
    `);

    // Create indexes for performance
    await client.query(`
      CREATE INDEX idx_users_email ON users (email);
    `);

    await client.query(`
      CREATE INDEX idx_users_role ON users (role);
    `);

    await client.query(`
      CREATE INDEX idx_users_status ON users (status);
    `);

    await client.query(`
      CREATE INDEX idx_users_email_verified ON users (email_verified);
    `);

    await client.query(`
      CREATE INDEX idx_users_created_at ON users (created_at);
    `);

    await client.query(`
      CREATE INDEX idx_users_deleted_at ON users (deleted_at);
    `);

    // Create updated_at trigger function
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create trigger for users table
    await client.query(`
      CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);
  },

  async down(client: PoolClient): Promise<void> {
    await client.query('DROP TRIGGER IF EXISTS update_users_updated_at ON users;');
    await client.query('DROP FUNCTION IF EXISTS update_updated_at_column();');
    await client.query('DROP TABLE IF EXISTS users CASCADE;');
  }
};
