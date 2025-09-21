import { Db } from 'mongodb';
import { MongoMigration } from '../MongoMigrationRunner';

export const migration: MongoMigration = {
  id: '001',
  name: '001_create_user_profiles_collection',
  
  async up(db: Db): Promise<void> {
    // Create user_profiles collection
    await db.createCollection('user_profiles');
    
    // Create indexes for optimal performance
    await db.collection('user_profiles').createIndexes([
      // Index on userId for fast lookups
      {
        key: { userId: 1 },
        unique: true,
        name: 'idx_user_profiles_user_id'
      },
      // Index on profile.displayName for searching
      {
        key: { 'profile.displayName': 1 },
        name: 'idx_user_profiles_display_name'
      },
      // Index on profile.firstName and lastName for searching
      {
        key: { 
          'profile.firstName': 1, 
          'profile.lastName': 1 
        },
        name: 'idx_user_profiles_full_name'
      },
      // Index on metadata.createdAt for sorting/filtering
      {
        key: { 'metadata.createdAt': -1 },
        name: 'idx_user_profiles_created_at'
      },
      // Index on metadata.updatedAt for sorting/filtering
      {
        key: { 'metadata.updatedAt': -1 },
        name: 'idx_user_profiles_updated_at'
      },
      // Index on profile.status if you plan to add user status
      {
        key: { 'profile.status': 1 },
        name: 'idx_user_profiles_status',
        sparse: true
      }
    ]);

    // Create a validation schema for the collection
    await db.command({
      collMod: 'user_profiles',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['userId', 'profile', 'metadata'],
          properties: {
            userId: {
              bsonType: 'string',
              pattern: '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$',
              description: 'Must be a valid UUID string'
            },
            profile: {
              bsonType: 'object',
              required: ['firstName', 'lastName', 'displayName'],
              properties: {
                firstName: {
                  bsonType: 'string',
                  minLength: 1,
                  maxLength: 100,
                  description: 'First name must be 1-100 characters'
                },
                lastName: {
                  bsonType: 'string',
                  minLength: 1,
                  maxLength: 100,
                  description: 'Last name must be 1-100 characters'
                },
                displayName: {
                  bsonType: 'string',
                  minLength: 1,
                  maxLength: 200,
                  description: 'Display name must be 1-200 characters'
                },
                bio: {
                  bsonType: 'string',
                  maxLength: 1000,
                  description: 'Bio must be max 1000 characters'
                },
                avatar: {
                  bsonType: 'object',
                  properties: {
                    url: { bsonType: 'string' },
                    publicId: { bsonType: 'string' }
                  }
                },
                preferences: {
                  bsonType: 'object',
                  properties: {
                    language: { bsonType: 'string' },
                    timezone: { bsonType: 'string' },
                    notifications: { bsonType: 'object' }
                  }
                }
              }
            },
            metadata: {
              bsonType: 'object',
              required: ['createdAt', 'updatedAt'],
              properties: {
                createdAt: {
                  bsonType: 'date',
                  description: 'Creation timestamp'
                },
                updatedAt: {
                  bsonType: 'date',
                  description: 'Last update timestamp'
                },
                version: {
                  bsonType: 'int',
                  minimum: 1,
                  description: 'Document version for optimistic locking'
                }
              }
            }
          }
        }
      },
      validationLevel: 'moderate',
      validationAction: 'error'
    });

    console.log('✅ Created user_profiles collection with validation schema');
  },

  async down(db: Db): Promise<void> {
    await db.dropCollection('user_profiles');
    console.log('✅ Dropped user_profiles collection');
  }
};
