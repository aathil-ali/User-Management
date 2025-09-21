import { PoolClient } from 'pg';
import { Seeder } from './SeederRunner';
import { MongoClient } from 'mongodb';
import * as bcrypt from 'bcryptjs';

export const seeder: Seeder = {
  name: '002_admin_user',
  order: 2,
  
  async run(client: PoolClient): Promise<void> {
    // Generate a secure password (in production, this should be configurable)
    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'AdminPassword123!';
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);

    // Create the super admin user
    const result = await client.query(`
      INSERT INTO users (
        email, 
        password_hash, 
        role, 
        status, 
        email_verified,
        email_verified_at
      )
      VALUES ($1, $2, $3, $4, true, CURRENT_TIMESTAMP)
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        role = EXCLUDED.role,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, email
    `, [
      process.env.ADMIN_EMAIL || 'admin@usermanagement.local',
      hashedPassword,
      'super_admin',
      'active'
    ]);

    const adminUser = result.rows[0];

    // Create a demo admin user as well
    const demoAdminPassword = await bcrypt.hash('DemoAdmin123!', 12);
    await client.query(`
      INSERT INTO users (
        email, 
        password_hash, 
        role, 
        status, 
        email_verified,
        email_verified_at
      )
      VALUES ($1, $2, $3, $4, true, CURRENT_TIMESTAMP)
      ON CONFLICT (email) DO NOTHING
    `, [
      'demo.admin@usermanagement.local',
      demoAdminPassword,
      'admin',
      'active'
    ]);

    console.log(`✅ Created admin users:`);
    console.log(`   Super Admin: ${adminUser.email}`);
    console.log(`   Demo Admin: demo.admin@usermanagement.local`);
    
    if (!process.env.ADMIN_DEFAULT_PASSWORD) {
      console.log(`⚠️  Using default password. Set ADMIN_DEFAULT_PASSWORD env var for production!`);
    }
  },

  async rollback(client: PoolClient): Promise<void> {
    const adminEmails = [
      process.env.ADMIN_EMAIL || 'admin@usermanagement.local',
      'demo.admin@usermanagement.local'
    ];

    await client.query(`
      DELETE FROM users 
      WHERE email = ANY($1) AND role IN ('super_admin', 'admin')
    `, [adminEmails]);

    console.log(`✅ Removed admin users`);
  }
};
