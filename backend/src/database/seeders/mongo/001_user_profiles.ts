import { Db } from 'mongodb';
import { MongoSeeder } from '../MongoSeederRunner';
import { Pool } from 'pg';

export const seeder: MongoSeeder = {
  name: '001_user_profiles',
  order: 1,
  
  async run(db: Db): Promise<void> {
    // First, get users from PostgreSQL to create corresponding profiles
    const pgPool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'user_management',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
    });

    try {
      const result = await pgPool.query('SELECT id, email, role FROM users');
      const users = result.rows;

      const userProfiles = [];
      
      for (const user of users) {
        // Create profile based on email
        const [firstName, lastName] = getUserNameFromEmail(user.email, user.role);
        
        const profile = {
          userId: user.id,
          profile: {
            firstName: firstName,
            lastName: lastName,
            displayName: `${firstName} ${lastName}`,
            bio: getDefaultBio(user.role),
            avatar: {
              url: `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName + ' ' + lastName)}&background=random&color=fff`,
              publicId: `avatar_${user.id}`
            },
            preferences: {
              language: 'en',
              timezone: 'UTC',
              notifications: {
                email: true,
                push: true,
                sms: false
              }
            }
          },
          metadata: {
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1
          }
        };

        userProfiles.push(profile);
      }

      if (userProfiles.length > 0) {
        await db.collection('user_profiles').insertMany(userProfiles);
        console.log(`✅ Created ${userProfiles.length} user profiles in MongoDB`);
      } else {
        console.log('⚠️  No users found in PostgreSQL to create profiles for');
      }

    } finally {
      await pgPool.end();
    }
  },

  async rollback(db: Db): Promise<void> {
    const result = await db.collection('user_profiles').deleteMany({});
    console.log(`✅ Removed ${result.deletedCount} user profiles from MongoDB`);
  }
};

function getUserNameFromEmail(email: string, role: string): [string, string] {
  // Extract name from email or create default names based on role
  if (email.includes('admin@usermanagement.local')) {
    return ['Super', 'Admin'];
  }
  
  if (email.includes('demo.admin@usermanagement.local')) {
    return ['Demo', 'Admin'];
  }
  
  if (email.includes('john.doe@')) {
    return ['John', 'Doe'];
  }
  
  if (email.includes('jane.smith@')) {
    return ['Jane', 'Smith'];
  }
  
  if (email.includes('bob.johnson@')) {
    return ['Bob', 'Johnson'];
  }
  
  if (email.includes('alice.wilson@')) {
    return ['Alice', 'Wilson'];
  }
  
  if (email.includes('mike.brown@')) {
    return ['Mike', 'Brown'];
  }
  
  // Default fallback - extract from email prefix
  const emailPrefix = email.split('@')[0];
  const nameParts = emailPrefix.split('.');
  
  if (nameParts.length >= 2 && nameParts[0].length > 0 && nameParts[1].length > 0) {
    return [
      nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1),
      nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1)
    ];
  }
  
  // Ensure we always return valid names (at least 1 character each)
  const safeName = emailPrefix.length > 0 ? emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1) : 'User';
  return [safeName, 'Profile'];
}

function getDefaultBio(role: string): string {
  switch (role) {
    case 'super_admin':
      return 'System Super Administrator with full access to all features and settings.';
    case 'admin':
      return 'Administrator with elevated privileges for user and system management.';
    case 'user':
      return 'Regular user with standard access to platform features.';
    default:
      return 'Platform user with access to available features.';
  }
}