import { Pool } from 'pg';
import { MongoClient } from 'mongodb';

/**
 * Mock Database Configuration for Development Testing
 * This allows testing API endpoints without requiring actual database connections
 */
export class MockDatabaseConfig {
  private static postgresPool: any;
  private static mongoClient: any;

  static getPostgresPool(): Pool {
    if (!this.postgresPool) {
      // Create a mock Pool object that mimics the pg Pool interface
      this.postgresPool = {
        query: async (text: string, params?: any[]) => {
          console.log(`[MOCK DB] PostgreSQL Query: ${text}`, params);
          
          // Mock responses for different queries
          if (text.includes('SELECT') && text.includes('email')) {
            // Mock user lookup - return null for new users, mock user for existing
            const email = params?.[0];
            if (email === 'existing@example.com') {
              return {
                rows: [{
                  id: 'mock-user-id-123',
                  email: email,
                  password_hash: '$2b$12$mockhashedpassword',
                  role: 'user',
                  status: 'active',
                  email_verified: false,
                  created_at: new Date(),
                  updated_at: new Date()
                }]
              };
            }
            return { rows: [] }; // No user found
          }
          
          if (text.includes('INSERT')) {
            // Mock user creation
            return {
              rows: [{
                id: `mock-user-${Date.now()}`,
                email: params?.[0] || 'mock@example.com',
                role: 'user',
                status: 'active',
                email_verified: false,
                created_at: new Date(),
                updated_at: new Date()
              }]
            };
          }
          
          return { rows: [] };
        },
        end: async () => {
          console.log('[MOCK DB] PostgreSQL connection closed');
        }
      };
    }
    return this.postgresPool;
  }

  static async getMongoClient(): Promise<MongoClient> {
    if (!this.mongoClient) {
      // Create a mock MongoClient that mimics the MongoDB interface
      this.mongoClient = {
        db: (dbName: string) => ({
          collection: (collectionName: string) => ({
            findOne: async (query: any) => {
              console.log(`[MOCK DB] MongoDB findOne on ${collectionName}:`, query);
              
              if (collectionName === 'user_profiles' && query.userId) {
                return {
                  _id: 'mock-profile-id',
                  userId: query.userId,
                  name: 'Mock User',
                  email: 'mock@example.com',
                  preferences: {
                    theme: 'light',
                    notifications: true,
                    language: 'en',
                    timezone: 'UTC'
                  },
                  createdAt: new Date(),
                  updatedAt: new Date()
                };
              }
              return null;
            },
            
            insertOne: async (doc: any) => {
              console.log(`[MOCK DB] MongoDB insertOne on ${collectionName}:`, doc);
              return {
                insertedId: `mock-${Date.now()}`,
                acknowledged: true
              };
            },
            
            updateOne: async (query: any, update: any) => {
              console.log(`[MOCK DB] MongoDB updateOne on ${collectionName}:`, query, update);
              return {
                matchedCount: 1,
                modifiedCount: 1,
                acknowledged: true
              };
            },
            
            deleteOne: async (query: any) => {
              console.log(`[MOCK DB] MongoDB deleteOne on ${collectionName}:`, query);
              return {
                deletedCount: 1,
                acknowledged: true
              };
            }
          })
        }),
        close: async () => {
          console.log('[MOCK DB] MongoDB connection closed');
        }
      };
    }
    return this.mongoClient;
  }

  static async closeConnections(): Promise<void> {
    if (this.postgresPool && this.postgresPool.end) {
      await this.postgresPool.end();
    }
    if (this.mongoClient && this.mongoClient.close) {
      await this.mongoClient.close();
    }
    console.log('[MOCK DB] All database connections closed');
  }
}
