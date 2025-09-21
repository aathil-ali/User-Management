import { Pool } from 'pg';
import { MongoClient } from 'mongodb';

export class DatabaseConfig {
  private static postgresPool: Pool;
  private static mongoClient: MongoClient;

  static getPostgresPool(): Pool {
    if (!this.postgresPool) {
      this.postgresPool = new Pool({
        host: process.env.POSTGRES_HOST || 'localhost',
        port: parseInt(process.env.POSTGRES_PORT || '5432'),
        database: process.env.POSTGRES_DB || 'user_management',
        user: process.env.POSTGRES_USER || 'postgres',
        password: process.env.POSTGRES_PASSWORD || 'password',
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });
    }
    return this.postgresPool;
  }

  static async getMongoClient(): Promise<MongoClient> {
    if (!this.mongoClient) {
      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/user_profiles';
      this.mongoClient = new MongoClient(uri);
      await this.mongoClient.connect();
    }
    return this.mongoClient;
  }

  static async closeConnections(): Promise<void> {
    if (this.postgresPool) {
      await this.postgresPool.end();
    }
    if (this.mongoClient) {
      await this.mongoClient.close();
    }
  }
}
