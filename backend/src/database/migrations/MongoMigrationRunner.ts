import { MongoClient, Db } from 'mongodb';

export interface MongoMigration {
  id: string;
  name: string;
  up: (db: Db) => Promise<void>;
  down: (db: Db) => Promise<void>;
}

export class MongoMigrationRunner {
  constructor(private client: MongoClient, private dbName: string) {}

  async initialize(): Promise<void> {
    const db = this.client.db(this.dbName);
    
    // Create migrations collection if it doesn't exist
    const collections = await db.listCollections({ name: 'migrations' }).toArray();
    if (collections.length === 0) {
      await db.createCollection('migrations');
      console.log('📝 Created migrations collection');
    }

    // Create index on name field for uniqueness
    await db.collection('migrations').createIndex({ name: 1 }, { unique: true });
  }

  async getExecutedMigrations(): Promise<string[]> {
    const db = this.client.db(this.dbName);
    const migrations = await db
      .collection('migrations')
      .find({})
      .sort({ executedAt: 1 })
      .toArray();
    
    return migrations.map(m => m.name);
  }

  async runMigration(migration: MongoMigration): Promise<void> {
    const db = this.client.db(this.dbName);
    
    try {
      // Run the migration
      await migration.up(db);
      
      // Record the migration
      await db.collection('migrations').insertOne({
        name: migration.name,
        executedAt: new Date(),
        id: migration.id
      });
      
      console.log(`✅ MongoDB Migration ${migration.name} executed successfully`);
    } catch (error) {
      console.error(`❌ MongoDB Migration ${migration.name} failed:`, error);
      throw error;
    }
  }

  async rollbackMigration(migration: MongoMigration): Promise<void> {
    const db = this.client.db(this.dbName);
    
    try {
      // Run the rollback
      await migration.down(db);
      
      // Remove the migration record
      await db.collection('migrations').deleteOne({
        name: migration.name
      });
      
      console.log(`✅ MongoDB Migration ${migration.name} rolled back successfully`);
    } catch (error) {
      console.error(`❌ MongoDB Rollback of ${migration.name} failed:`, error);
      throw error;
    }
  }

  async runPendingMigrations(migrations: MongoMigration[]): Promise<void> {
    await this.initialize();
    const executed = await this.getExecutedMigrations();
    
    const pending = migrations.filter(m => !executed.includes(m.name));
    
    if (pending.length === 0) {
      console.log('✅ No pending MongoDB migrations');
      return;
    }

    console.log(`📝 Running ${pending.length} pending MongoDB migrations...`);
    
    for (const migration of pending) {
      await this.runMigration(migration);
    }
    
    console.log('🎉 All MongoDB migrations completed successfully');
  }

  async rollback(migrations: MongoMigration[], steps: number = 1): Promise<void> {
    const executed = await this.getExecutedMigrations();
    const toRollback = migrations
      .filter(m => executed.includes(m.name))
      .reverse()
      .slice(0, steps);
    
    if (toRollback.length === 0) {
      console.log('✅ No MongoDB migrations to rollback');
      return;
    }

    console.log(`📝 Rolling back ${toRollback.length} MongoDB migrations...`);
    
    for (const migration of toRollback) {
      await this.rollbackMigration(migration);
    }
    
    console.log('🎉 MongoDB rollback completed successfully');
  }

  async createCollectionWithIndexes(
    collectionName: string,
    indexes: Array<{ key: any; options?: any }> = []
  ): Promise<void> {
    const db = this.client.db(this.dbName);
    
    // Create collection if it doesn't exist
    const collections = await db.listCollections({ name: collectionName }).toArray();
    if (collections.length === 0) {
      await db.createCollection(collectionName);
      console.log(`📝 Created collection: ${collectionName}`);
    }
    
    // Create indexes
    for (const index of indexes) {
      await db.collection(collectionName).createIndex(index.key, index.options || {});
      console.log(`📝 Created index on ${collectionName}:`, index.key);
    }
  }
}
