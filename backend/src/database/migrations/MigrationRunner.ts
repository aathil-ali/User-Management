import { Pool, PoolClient } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

export interface Migration {
  id: string;
  name: string;
  up: (client: PoolClient) => Promise<void>;
  down: (client: PoolClient) => Promise<void>;
}

export class MigrationRunner {
  constructor(private pool: Pool) {}

  async initialize(): Promise<void> {
    const client = await this.pool.connect();
    try {
      // Create migrations table if it doesn't exist
      await client.query(`
        CREATE TABLE IF NOT EXISTS migrations (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } finally {
      client.release();
    }
  }

  async getExecutedMigrations(): Promise<string[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query('SELECT name FROM migrations ORDER BY executed_at');
      return result.rows.map(row => row.name);
    } finally {
      client.release();
    }
  }

  async runMigration(migration: Migration): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      
      // Run the migration
      await migration.up(client);
      
      // Record the migration
      await client.query(
        'INSERT INTO migrations (name) VALUES ($1)',
        [migration.name]
      );
      
      await client.query('COMMIT');
      console.log(`✅ Migration ${migration.name} executed successfully`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`❌ Migration ${migration.name} failed:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  async rollbackMigration(migration: Migration): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      
      // Run the rollback
      await migration.down(client);
      
      // Remove the migration record
      await client.query(
        'DELETE FROM migrations WHERE name = $1',
        [migration.name]
      );
      
      await client.query('COMMIT');
      console.log(`✅ Migration ${migration.name} rolled back successfully`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`❌ Rollback of ${migration.name} failed:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  async runPendingMigrations(migrations: Migration[]): Promise<void> {
    await this.initialize();
    const executed = await this.getExecutedMigrations();
    
    const pending = migrations.filter(m => !executed.includes(m.name));
    
    if (pending.length === 0) {
      console.log('✅ No pending migrations');
      return;
    }

    console.log(`📝 Running ${pending.length} pending migrations...`);
    
    for (const migration of pending) {
      await this.runMigration(migration);
    }
    
    console.log('🎉 All migrations completed successfully');
  }

  async rollback(migrations: Migration[], steps: number = 1): Promise<void> {
    const executed = await this.getExecutedMigrations();
    const toRollback = migrations
      .filter(m => executed.includes(m.name))
      .reverse()
      .slice(0, steps);
    
    if (toRollback.length === 0) {
      console.log('✅ No migrations to rollback');
      return;
    }

    console.log(`📝 Rolling back ${toRollback.length} migrations...`);
    
    for (const migration of toRollback) {
      await this.rollbackMigration(migration);
    }
    
    console.log('🎉 Rollback completed successfully');
  }
}
