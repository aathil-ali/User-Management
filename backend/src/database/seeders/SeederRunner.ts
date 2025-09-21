import { Pool, PoolClient } from 'pg';

export interface Seeder {
  name: string;
  order: number;
  run: (client: PoolClient) => Promise<void>;
  rollback?: (client: PoolClient) => Promise<void>;
}

export class SeederRunner {
  constructor(private pool: Pool) {}

  async initialize(): Promise<void> {
    const client = await this.pool.connect();
    try {
      // Create seeders table if it doesn't exist
      await client.query(`
        CREATE TABLE IF NOT EXISTS seeders (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } finally {
      client.release();
    }
  }

  async getExecutedSeeders(): Promise<string[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query('SELECT name FROM seeders ORDER BY executed_at');
      return result.rows.map(row => row.name);
    } finally {
      client.release();
    }
  }

  async runSeeder(seeder: Seeder): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      
      // Run the seeder
      await seeder.run(client);
      
      // Record the seeder execution
      await client.query(
        'INSERT INTO seeders (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
        [seeder.name]
      );
      
      await client.query('COMMIT');
      console.log(`✅ Seeder ${seeder.name} executed successfully`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`❌ Seeder ${seeder.name} failed:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  async rollbackSeeder(seeder: Seeder): Promise<void> {
    if (!seeder.rollback) {
      console.log(`⚠️  Seeder ${seeder.name} has no rollback function`);
      return;
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      
      // Run the rollback
      await seeder.rollback(client);
      
      // Remove the seeder record
      await client.query(
        'DELETE FROM seeders WHERE name = $1',
        [seeder.name]
      );
      
      await client.query('COMMIT');
      console.log(`✅ Seeder ${seeder.name} rolled back successfully`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`❌ Rollback of seeder ${seeder.name} failed:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  async runPendingSeeders(seeders: Seeder[]): Promise<void> {
    await this.initialize();
    const executed = await this.getExecutedSeeders();
    
    // Sort seeders by order
    const sortedSeeders = seeders.sort((a, b) => a.order - b.order);
    const pending = sortedSeeders.filter(s => !executed.includes(s.name));
    
    if (pending.length === 0) {
      console.log('✅ No pending seeders');
      return;
    }

    console.log(`📝 Running ${pending.length} pending seeders...`);
    
    for (const seeder of pending) {
      await this.runSeeder(seeder);
    }
    
    console.log('🎉 All seeders completed successfully');
  }

  async rollbackSeeders(seeders: Seeder[], steps?: number): Promise<void> {
    const executed = await this.getExecutedSeeders();
    const sortedSeeders = seeders.sort((a, b) => b.order - a.order); // Reverse order for rollback
    
    let toRollback = sortedSeeders.filter(s => executed.includes(s.name));
    
    if (steps && steps > 0) {
      toRollback = toRollback.slice(0, steps);
    }
    
    if (toRollback.length === 0) {
      console.log('✅ No seeders to rollback');
      return;
    }

    console.log(`📝 Rolling back ${toRollback.length} seeders...`);
    
    for (const seeder of toRollback) {
      await this.rollbackSeeder(seeder);
    }
    
    console.log('🎉 Seeder rollback completed successfully');
  }

  async runSpecificSeeder(seeders: Seeder[], seederName: string): Promise<void> {
    const seeder = seeders.find(s => s.name === seederName);
    if (!seeder) {
      throw new Error(`Seeder ${seederName} not found`);
    }

    await this.initialize();
    await this.runSeeder(seeder);
  }
}
