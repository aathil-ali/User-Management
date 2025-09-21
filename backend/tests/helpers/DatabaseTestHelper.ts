import { Pool } from 'pg';
import { MongoClient } from 'mongodb';

export class DatabaseTestHelper {
  private static postgresPool: Pool;
  private static mongoClient: MongoClient;
  private static testDataIds: Set<string> = new Set();

  /**
   * Initialize test databases for integration and e2e tests
   */
  static async initializeTestDatabases(): Promise<void> {
    // Only initialize if we're running integration or e2e tests
    const testType = process.env.TEST_TYPE;
    if (testType !== 'integration' && testType !== 'e2e') {
      return;
    }

    await this.createTestPostgresDatabase();
    await this.createTestMongoDatabase();
  }

  /**
   * Setup test database connections
   */
  static async setupTestDatabase(): Promise<void> {
    // Create PostgreSQL connection
    this.postgresPool = new Pool({
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      database: process.env.POSTGRES_DB || 'user_management_test',
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'password',
      max: 5, // Smaller pool for tests
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 2000,
    });

    // Create MongoDB connection
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/user_profiles_test';
    this.mongoClient = new MongoClient(mongoUri);
    await this.mongoClient.connect();

    // Run migrations and seed basic test data
    await this.runTestMigrations();
    await this.seedBasicTestData();
  }

  /**
   * Teardown test database connections
   */
  static async teardownTestDatabase(): Promise<void> {
    if (this.postgresPool) {
      await this.postgresPool.end();
    }
    if (this.mongoClient) {
      await this.mongoClient.close();
    }
  }

  /**
   * Clean up test data after each test
   */
  static async cleanupTestData(): Promise<void> {
    if (!this.postgresPool || !this.mongoClient) {
      return;
    }

    try {
      // Clean PostgreSQL test data
      await this.postgresPool.query('BEGIN');
      
      // Delete test data in reverse dependency order
      await this.postgresPool.query('DELETE FROM user_profiles WHERE user_id IN (SELECT id FROM users WHERE email LIKE \'%test%\')');
      await this.postgresPool.query('DELETE FROM users WHERE email LIKE \'%test%\' OR email LIKE \'%@example.com\'');
      
      await this.postgresPool.query('COMMIT');

      // Clean MongoDB test data
      const db = this.mongoClient.db();
      await db.collection('user_profiles').deleteMany({ 
        $or: [
          { 'user.email': { $regex: /test/ } },
          { 'user.email': { $regex: /@example\.com/ } }
        ]
      });

      // Clear tracked test data IDs
      this.testDataIds.clear();
    } catch (error) {
      if (this.postgresPool) {
        await this.postgresPool.query('ROLLBACK');
      }
      console.error('Error cleaning up test data:', error);
      throw error;
    }
  }

  /**
   * Get PostgreSQL connection for tests
   */
  static getPostgresPool(): Pool {
    if (!this.postgresPool) {
      throw new Error('Test database not initialized. Call setupTestDatabase() first.');
    }
    return this.postgresPool;
  }

  /**
   * Get MongoDB client for tests
   */
  static getMongoClient(): MongoClient {
    if (!this.mongoClient) {
      throw new Error('Test database not initialized. Call setupTestDatabase() first.');
    }
    return this.mongoClient;
  }

  /**
   * Track test data ID for cleanup
   */
  static trackTestData(id: string): void {
    this.testDataIds.add(id);
  }

  /**
   * Create test PostgreSQL database
   */
  private static async createTestPostgresDatabase(): Promise<void> {
    const adminPool = new Pool({
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      database: 'postgres', // Connect to default database
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'password',
    });

    try {
      const testDbName = process.env.POSTGRES_DB || 'user_management_test';
      
      // Drop test database if it exists
      await adminPool.query(`DROP DATABASE IF EXISTS "${testDbName}"`);
      
      // Create test database
      await adminPool.query(`CREATE DATABASE "${testDbName}"`);
      
      console.log(`✅ Test PostgreSQL database "${testDbName}" created`);
    } catch (error) {
      console.error('Error creating test PostgreSQL database:', error);
      throw error;
    } finally {
      await adminPool.end();
    }
  }

  /**
   * Create test MongoDB database
   */
  private static async createTestMongoDatabase(): Promise<void> {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/user_profiles_test';
    const client = new MongoClient(mongoUri);
    
    try {
      await client.connect();
      const db = client.db();
      
      // Drop test database if it exists
      await db.dropDatabase();
      
      // Create test collections
      await db.createCollection('user_profiles');
      
      console.log('✅ Test MongoDB database created');
    } catch (error) {
      console.error('Error creating test MongoDB database:', error);
      throw error;
    } finally {
      await client.close();
    }
  }

  /**
   * Run test database migrations
   */
  private static async runTestMigrations(): Promise<void> {
    if (!this.postgresPool) {
      return;
    }

    try {
      // Create users table
      await this.postgresPool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL DEFAULT 'user',
          is_active BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create user_profiles table
      await this.postgresPool.query(`
        CREATE TABLE IF NOT EXISTS user_profiles (
          id UUID PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          preferences JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create indexes
      await this.postgresPool.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
      await this.postgresPool.query('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)');
      await this.postgresPool.query('CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id)');

      console.log('✅ Test database migrations completed');
    } catch (error) {
      console.error('Error running test migrations:', error);
      throw error;
    }
  }

  /**
   * Seed basic test data
   */
  private static async seedBasicTestData(): Promise<void> {
    // This method can be used to seed any basic data needed for all tests
    // For now, we'll keep it empty and let individual tests create their own data
    console.log('✅ Basic test data seeded');
  }

  /**
   * Destroy test databases
   */
  static async destroyTestDatabases(): Promise<void> {
    // Close any existing connections first
    await this.teardownTestDatabase();

    // Drop PostgreSQL test database
    const adminPool = new Pool({
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      database: 'postgres',
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'password',
    });

    try {
      const testDbName = process.env.POSTGRES_DB || 'user_management_test';
      await adminPool.query(`DROP DATABASE IF EXISTS "${testDbName}"`);
      console.log(`✅ Test PostgreSQL database "${testDbName}" dropped`);
    } catch (error) {
      console.error('Error dropping test PostgreSQL database:', error);
    } finally {
      await adminPool.end();
    }

    // Drop MongoDB test database
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/user_profiles_test';
      const client = new MongoClient(mongoUri);
      await client.connect();
      await client.db().dropDatabase();
      await client.close();
      console.log('✅ Test MongoDB database dropped');
    } catch (error) {
      console.error('Error dropping test MongoDB database:', error);
    }
  }
}