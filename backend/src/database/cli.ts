#!/usr/bin/env node

import { Pool } from 'pg';
import { MongoClient } from 'mongodb';
import { MigrationRunner, Migration } from './migrations/MigrationRunner';
import { MongoMigrationRunner, MongoMigration } from './migrations/MongoMigrationRunner';
import { SeederRunner, Seeder } from './seeders/SeederRunner';
import { MongoSeederRunner, MongoSeeder } from './seeders/MongoSeederRunner';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import migrations
import { migration as createRolesTable } from './migrations/postgres/001_create_roles_table';
import { migration as createUsersTable } from './migrations/postgres/002_create_users_table';
import { migration as createRefreshTokensTable } from './migrations/postgres/003_create_refresh_tokens_table';

// Import MongoDB migrations
import { migration as createUserProfilesCollection } from './migrations/mongo/001_create_user_profiles_collection';

// Import seeders
import { seeder as defaultRoles } from './seeders/001_default_roles';
import { seeder as adminUser } from './seeders/002_admin_user';

// Import MongoDB seeders
import { seeder as userProfiles } from './seeders/mongo/001_user_profiles';

class DatabaseCLI {
  private pgPool: Pool;
  private mongoClient: MongoClient;
  private migrationRunner: MigrationRunner;
  private mongoMigrationRunner: MongoMigrationRunner;
  private seederRunner: SeederRunner;
  private mongoSeederRunner: MongoSeederRunner;

  constructor() {
    // Initialize PostgreSQL connection
    this.pgPool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'user_management',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
    });

    // Initialize MongoDB connection
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    this.mongoClient = new MongoClient(mongoUri);

    this.migrationRunner = new MigrationRunner(this.pgPool);
    this.mongoMigrationRunner = new MongoMigrationRunner(
      this.mongoClient, 
      process.env.MONGODB_DATABASE || 'user_management'
    );
    this.seederRunner = new SeederRunner(this.pgPool);
    this.mongoSeederRunner = new MongoSeederRunner(
      this.mongoClient,
      process.env.MONGODB_DATABASE || 'user_management'
    );
  }

  private get pgMigrations(): Migration[] {
    return [
      createRolesTable,
      createUsersTable,
      createRefreshTokensTable
    ];
  }

  private get mongoMigrations(): MongoMigration[] {
    return [
      createUserProfilesCollection
    ];
  }

  private get seeders(): Seeder[] {
    return [
      defaultRoles,
      adminUser
    ];
  }

  private get mongoSeeders(): MongoSeeder[] {
    return [
      userProfiles
    ];
  }

  async connect(): Promise<void> {
    try {
      // Test PostgreSQL connection
      await this.pgPool.query('SELECT 1');
      console.log('✅ PostgreSQL connected successfully');

      // Connect to MongoDB
      await this.mongoClient.connect();
      console.log('✅ MongoDB connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      process.exit(1);
    }
  }

  async disconnect(): Promise<void> {
    await this.pgPool.end();
    await this.mongoClient.close();
  }

  async runMigrations(): Promise<void> {
    console.log('🚀 Running database migrations...\n');
    
    // Run PostgreSQL migrations
    console.log('📝 PostgreSQL Migrations:');
    await this.migrationRunner.runPendingMigrations(this.pgMigrations);
    
    console.log('\n📝 MongoDB Migrations:');
    await this.mongoMigrationRunner.runPendingMigrations(this.mongoMigrations);
    
    console.log('\n🎉 All migrations completed successfully!');
  }

  async rollbackMigrations(steps: number = 1): Promise<void> {
    console.log(`🔄 Rolling back ${steps} migration(s)...\n`);
    
    // Rollback MongoDB migrations first (reverse dependency order)
    console.log('📝 Rolling back MongoDB Migrations:');
    await this.mongoMigrationRunner.rollback(this.mongoMigrations, steps);
    
    console.log('\n📝 Rolling back PostgreSQL Migrations:');
    await this.migrationRunner.rollback(this.pgMigrations, steps);
    
    console.log('\n🎉 Rollback completed successfully!');
  }

  async runSeeders(): Promise<void> {
    console.log('🌱 Running database seeders...\n');
    
    // Run PostgreSQL seeders first (auth data)
    console.log('📝 PostgreSQL Seeders:');
    await this.seederRunner.runPendingSeeders(this.seeders);
    
    // Then run MongoDB seeders (profile data)
    console.log('\n📝 MongoDB Seeders:');
    await this.mongoSeederRunner.runPendingSeeders(this.mongoSeeders);
    
    console.log('\n🎉 All seeders completed successfully!');
  }

  async rollbackSeeders(steps?: number): Promise<void> {
    console.log('🔄 Rolling back seeders...\n');
    
    // Rollback MongoDB seeders first (reverse order)
    console.log('📝 Rolling back MongoDB Seeders:');
    await this.mongoSeederRunner.rollbackSeeders(this.mongoSeeders, steps);
    
    // Then rollback PostgreSQL seeders
    console.log('\n📝 Rolling back PostgreSQL Seeders:');
    await this.seederRunner.rollbackSeeders(this.seeders, steps);
    
    console.log('\n🎉 Seeder rollback completed successfully!');
  }

  async freshDatabase(): Promise<void> {
    console.log('🔥 Setting up fresh database...\n');
    
    try {
      // Run all migrations
      await this.runMigrations();
      
      // Run all seeders
      await this.runSeeders();
      
      console.log('\n✨ Fresh database setup completed successfully!');
    } catch (error) {
      console.error('❌ Fresh database setup failed:', error);
      process.exit(1);
    }
  }

  async resetDatabase(): Promise<void> {
    console.log('⚠️  Resetting database (this will delete all data)...\n');
    
    try {
      // Drop and recreate MongoDB collections
      const db = this.mongoClient.db(process.env.MONGODB_DATABASE || 'user_management');
      const collections = await db.listCollections().toArray();
      
      for (const collection of collections) {
        await db.dropCollection(collection.name);
        console.log(`✅ Dropped MongoDB collection: ${collection.name}`);
      }

      // Drop and recreate PostgreSQL tables
      const client = await this.pgPool.connect();
      try {
        await client.query('DROP SCHEMA public CASCADE');
        await client.query('CREATE SCHEMA public');
        console.log('✅ Reset PostgreSQL schema');
      } finally {
        client.release();
      }

      // Run fresh setup
      await this.freshDatabase();
      
    } catch (error) {
      console.error('❌ Database reset failed:', error);
      process.exit(1);
    }
  }

  async showStatus(): Promise<void> {
    console.log('📊 Database Status:\n');
    
    // Show PostgreSQL migration status
    const executedPgMigrations = await this.migrationRunner.getExecutedMigrations();
    const pendingPgMigrations = this.pgMigrations.filter(m => !executedPgMigrations.includes(m.name));
    
    console.log('PostgreSQL Migrations:');
    console.log(`  ✅ Executed: ${executedPgMigrations.length}`);
    console.log(`  ⏳ Pending: ${pendingPgMigrations.length}`);
    
    // Show MongoDB migration status
    const executedMongoMigrations = await this.mongoMigrationRunner.getExecutedMigrations();
    const pendingMongoMigrations = this.mongoMigrations.filter(m => !executedMongoMigrations.includes(m.name));
    
    console.log('\nMongoDB Migrations:');
    console.log(`  ✅ Executed: ${executedMongoMigrations.length}`);
    console.log(`  ⏳ Pending: ${pendingMongoMigrations.length}`);
    
    // Show seeder status
    const executedSeeders = await this.seederRunner.getExecutedSeeders();
    const pendingSeeders = this.seeders.filter(s => !executedSeeders.includes(s.name));
    
    console.log('\nSeeders:');
    console.log(`  ✅ Executed: ${executedSeeders.length}`);
    console.log(`  ⏳ Pending: ${pendingSeeders.length}`);
  }
}

async function main() {
  const cli = new DatabaseCLI();
  const command = process.argv[2];
  const args = process.argv.slice(3);

  try {
    await cli.connect();

    switch (command) {
      case 'migrate':
        await cli.runMigrations();
        break;
      
      case 'migrate:rollback':
        const steps = parseInt(args[0]) || 1;
        await cli.rollbackMigrations(steps);
        break;
      
      case 'seed':
        await cli.runSeeders();
        break;
      
      case 'seed:rollback':
        const seedSteps = args[0] ? parseInt(args[0]) : undefined;
        await cli.rollbackSeeders(seedSteps);
        break;
      
      case 'db:fresh':
        await cli.freshDatabase();
        break;
      
      case 'db:reset':
        await cli.resetDatabase();
        break;
      
      case 'db:status':
        await cli.showStatus();
        break;
      
      default:
        console.log('📖 Available commands:');
        console.log('  migrate                - Run pending migrations');
        console.log('  migrate:rollback [n]   - Rollback n migrations (default: 1)');
        console.log('  seed                   - Run pending seeders');
        console.log('  seed:rollback [n]      - Rollback n seeders');
        console.log('  db:fresh               - Run migrations and seeders');
        console.log('  db:reset               - Reset database and run fresh setup');
        console.log('  db:status              - Show database status');
        break;
    }

  } catch (error) {
    console.error('❌ Command failed:', error);
    process.exit(1);
  } finally {
    await cli.disconnect();
  }
}

if (require.main === module) {
  main();
}
