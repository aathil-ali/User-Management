// MongoDB Database Initialization Script
// This script creates the necessary collections and indexes for user profiles

// Switch to the user_profiles database
db = db.getSiblingDB('user_profiles');

// Create user_profiles collection with validation schema
db.createCollection('user_profiles', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['userId', 'email', 'name'],
            properties: {
                userId: {
                    bsonType: 'string',
                    description: 'User ID from PostgreSQL users_auth table - required'
                },
                email: {
                    bsonType: 'string',
                    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
                    description: 'Valid email address - required'
                },
                name: {
                    bsonType: 'string',
                    minLength: 1,
                    maxLength: 100,
                    description: 'User full name - required'
                },
                avatar: {
                    bsonType: 'string',
                    description: 'Avatar URL or base64 image data'
                },
                preferences: {
                    bsonType: 'object',
                    properties: {
                        theme: {
                            bsonType: 'string',
                            enum: ['light', 'dark', 'auto'],
                            description: 'UI theme preference'
                        },
                        language: {
                            bsonType: 'string',
                            enum: ['en', 'es', 'fr'],
                            description: 'Language preference'
                        },
                        notifications: {
                            bsonType: 'object',
                            properties: {
                                email: { bsonType: 'bool' },
                                push: { bsonType: 'bool' },
                                sms: { bsonType: 'bool' }
                            }
                        },
                        timezone: {
                            bsonType: 'string',
                            description: 'User timezone'
                        }
                    }
                },
                profile: {
                    bsonType: 'object',
                    properties: {
                        bio: { bsonType: 'string', maxLength: 500 },
                        location: { bsonType: 'string', maxLength: 100 },
                        website: { bsonType: 'string' },
                        phone: { bsonType: 'string' },
                        dateOfBirth: { bsonType: 'date' },
                        gender: { 
                            bsonType: 'string',
                            enum: ['male', 'female', 'other', 'prefer_not_to_say']
                        }
                    }
                },
                createdAt: {
                    bsonType: 'date',
                    description: 'Profile creation timestamp'
                },
                updatedAt: {
                    bsonType: 'date',
                    description: 'Profile last update timestamp'
                }
            }
        }
    }
});

// Create indexes for better performance
db.user_profiles.createIndex({ 'userId': 1 }, { unique: true });
db.user_profiles.createIndex({ 'email': 1 }, { unique: true });
db.user_profiles.createIndex({ 'createdAt': 1 });
db.user_profiles.createIndex({ 'updatedAt': 1 });
db.user_profiles.createIndex({ 'preferences.language': 1 });

// Insert default user profiles for development
// These correspond to the users created in PostgreSQL init.sql

// Admin user profile
db.user_profiles.insertOne({
    userId: 'admin-user-id', // This will be updated when the actual user is created
    email: 'admin@example.com',
    name: 'System Administrator',
    avatar: null,
    preferences: {
        theme: 'dark',
        language: 'en',
        notifications: {
            email: true,
            push: true,
            sms: false
        },
        timezone: 'UTC'
    },
    profile: {
        bio: 'System administrator with full access to the user management system.',
        location: 'Server Room',
        website: null,
        phone: null,
        dateOfBirth: null,
        gender: 'prefer_not_to_say'
    },
    createdAt: new Date(),
    updatedAt: new Date()
});

// Regular user profile
db.user_profiles.insertOne({
    userId: 'regular-user-id', // This will be updated when the actual user is created
    email: 'user@example.com',
    name: 'Demo User',
    avatar: null,
    preferences: {
        theme: 'light',
        language: 'en',
        notifications: {
            email: true,
            push: false,
            sms: false
        },
        timezone: 'UTC'
    },
    profile: {
        bio: 'A demo user for testing the user management system.',
        location: 'Demo Land',
        website: null,
        phone: null,
        dateOfBirth: null,
        gender: 'prefer_not_to_say'
    },
    createdAt: new Date(),
    updatedAt: new Date()
});

// Create activity_logs collection for user activity tracking
db.createCollection('activity_logs', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['userId', 'action', 'timestamp'],
            properties: {
                userId: {
                    bsonType: 'string',
                    description: 'User ID - required'
                },
                action: {
                    bsonType: 'string',
                    description: 'Action performed - required'
                },
                details: {
                    bsonType: 'object',
                    description: 'Additional action details'
                },
                ipAddress: {
                    bsonType: 'string',
                    description: 'User IP address'
                },
                userAgent: {
                    bsonType: 'string',
                    description: 'User browser/client info'
                },
                timestamp: {
                    bsonType: 'date',
                    description: 'Action timestamp - required'
                }
            }
        }
    }
});

// Create indexes for activity logs
db.activity_logs.createIndex({ 'userId': 1 });
db.activity_logs.createIndex({ 'action': 1 });
db.activity_logs.createIndex({ 'timestamp': 1 });
db.activity_logs.createIndex({ 'userId': 1, 'timestamp': -1 });

// Insert initialization log
db.activity_logs.insertOne({
    userId: 'system',
    action: 'DATABASE_INIT',
    details: {
        message: 'MongoDB database initialized successfully',
        collections: ['user_profiles', 'activity_logs'],
        defaultUsers: ['admin@example.com', 'user@example.com']
    },
    ipAddress: 'localhost',
    userAgent: 'MongoDB Init Script',
    timestamp: new Date()
});

// Print success message
print('MongoDB database initialized successfully!');
print('Collections created: user_profiles, activity_logs');
print('Default profiles created for: admin@example.com, user@example.com');
print('Indexes created for optimal performance');