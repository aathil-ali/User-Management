import { MongoClient, Db } from 'mongodb';

export interface MongoSeeder {
  name: string;
  order: number;
  run: (db: Db) => Promise<void>;
  rollback?: (db: Db) => Promise<void>;
}

export class MongoSeederRunner {
  private client: MongoClient;
  private database: Db;

  constructor(mongoClient: MongoClient, databaseName: string) {
    this.client = mongoClient;
    this.database = mongoClient.db(databaseName);
  }

  async initialize(): Promise<void> {
    // Create seeders collection if it doesn't exist
    const collections = await this.database.listCollections({ name: 'seeders' }).toArray();
    if (collections.length === 0) {
      await this.database.createCollection('seeders');
      await this.database.collection('seeders').createIndex({ name: 1 }, { unique: true });
    }
  }

  async getExecutedSeeders(): Promise<string[]> {
    const result = await this.database.collection('seeders').find({}).sort({ executedAt: 1 }).toArray();
    return result.map(doc => doc.name);
  }

  async runSeeder(seeder: MongoSeeder): Promise<void> {
    try {
      // Run the seeder
      await seeder.run(this.database);
      
      // Record the seeder execution
      await this.database.collection('seeders').insertOne({
        name: seeder.name,
        executedAt: new Date()
      });
      
      console.log(`✅ MongoDB Seeder ${seeder.name} executed successfully`);
    } catch (error) {
      console.error(`❌ MongoDB Seeder ${seeder.name} failed:`, error);
      throw error;
    }
  }

  async rollbackSeeder(seeder: MongoSeeder): Promise<void> {
    if (!seeder.rollback) {
      console.log(`⚠️  MongoDB Seeder ${seeder.name} has no rollback function`);
      return;
    }

    try {
      // Run the rollback
      await seeder.rollback(this.database);
      
      // Remove the seeder record
      await this.database.collection('seeders').deleteOne({ name: seeder.name });
      
      console.log(`✅ MongoDB Seeder ${seeder.name} rolled back successfully`);
    } catch (error) {
      console.error(`❌ Rollback of MongoDB seeder ${seeder.name} failed:`, error);
      throw error;
    }
  }

  async runPendingSeeders(seeders: MongoSeeder[]): Promise<void> {
    await this.initialize();
    const executed = await this.getExecutedSeeders();
    
    // Sort seeders by order
    const sortedSeeders = seeders.sort((a, b) => a.order - b.order);
    const pending = sortedSeeders.filter(s => !executed.includes(s.name));
    
    if (pending.length === 0) {
      console.log('✅ No pending MongoDB seeders');
      return;
    }

    console.log(`📝 Running ${pending.length} pending MongoDB seeders...`);
    
    for (const seeder of pending) {
      await this.runSeeder(seeder);
    }
    
    console.log('🎉 All MongoDB seeders completed successfully');
  }

  async rollbackSeeders(seeders: MongoSeeder[], steps?: number): Promise<void> {
    const executed = await this.getExecutedSeeders();
    const sortedSeeders = seeders.sort((a, b) => b.order - a.order); // Reverse order for rollback
    
    let toRollback = sortedSeeders.filter(s => executed.includes(s.name));
    
    if (steps && steps > 0) {
      toRollback = toRollback.slice(0, steps);
    }
    
    if (toRollback.length === 0) {
      console.log('✅ No MongoDB seeders to rollback');
      return;
    }

    console.log(`📝 Rolling back ${toRollback.length} MongoDB seeders...`);
    
    for (const seeder of toRollback) {
      await this.rollbackSeeder(seeder);
    }
    
    console.log('🎉 MongoDB seeder rollback completed successfully');
  }
}