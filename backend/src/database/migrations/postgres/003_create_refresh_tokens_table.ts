import { PoolClient } from 'pg';
import { Migration } from '../MigrationRunner';

export const migration: Migration = {
  id: '003',
  name: '003_create_refresh_tokens_table',
  
  async up(client: PoolClient): Promise<void> {
    await client.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        token_hash VARCHAR(255) NOT NULL UNIQUE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at TIMESTAMP NOT NULL,
        is_revoked BOOLEAN DEFAULT false,
        revoked_at TIMESTAMP,
        device_info JSONB,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes for performance
    await client.query(`
      CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens (user_id);
    `);

    await client.query(`
      CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens (token_hash);
    `);

    await client.query(`
      CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens (expires_at);
    `);

    await client.query(`
      CREATE INDEX idx_refresh_tokens_is_revoked ON refresh_tokens (is_revoked);
    `);

    // Create trigger for refresh_tokens table
    await client.query(`
      CREATE TRIGGER update_refresh_tokens_updated_at
        BEFORE UPDATE ON refresh_tokens
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    // Create function to clean expired tokens
    await client.query(`
      CREATE OR REPLACE FUNCTION cleanup_expired_refresh_tokens()
      RETURNS INTEGER AS $$
      DECLARE
        deleted_count INTEGER;
      BEGIN
        DELETE FROM refresh_tokens 
        WHERE expires_at < CURRENT_TIMESTAMP OR is_revoked = true;
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RETURN deleted_count;
      END;
      $$ language 'plpgsql';
    `);
  },

  async down(client: PoolClient): Promise<void> {
    await client.query('DROP FUNCTION IF EXISTS cleanup_expired_refresh_tokens();');
    await client.query('DROP TRIGGER IF EXISTS update_refresh_tokens_updated_at ON refresh_tokens;');
    await client.query('DROP TABLE IF EXISTS refresh_tokens CASCADE;');
  }
};
