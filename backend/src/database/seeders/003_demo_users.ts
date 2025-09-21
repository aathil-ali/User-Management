import { PoolClient } from 'pg';
import { Seeder } from './SeederRunner';
import * as bcrypt from 'bcryptjs';

export const seeder: Seeder = {
  name: '003_demo_users',
  order: 3,
  
  async run(client: PoolClient): Promise<void> {
    // Create some demo users for testing
    const demoUsers = [
      {
        email: 'john.doe@example.com',
        name: 'John Doe',
        role: 'user'
      },
      {
        email: 'jane.smith@example.com', 
        name: 'Jane Smith',
        role: 'user'
      },
      {
        email: 'bob.johnson@example.com',
        name: 'Bob Johnson', 
        role: 'user'
      },
      {
        email: 'alice.wilson@example.com',
        name: 'Alice Wilson',
        role: 'user'
      },
      {
        email: 'mike.brown@example.com',
        name: 'Mike Brown',
        role: 'admin'
      }
    ];

    const defaultPassword = 'DemoUser123!';
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);

    for (const user of demoUsers) {
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
        user.email,
        hashedPassword,
        user.role,
        'active'
      ]);
    }

    console.log(`✅ Created ${demoUsers.length} demo users`);
    console.log(`   Password for all demo users: ${defaultPassword}`);
  },

  async rollback(client: PoolClient): Promise<void> {
    const demoEmails = [
      'john.doe@example.com',
      'jane.smith@example.com',
      'bob.johnson@example.com',
      'alice.wilson@example.com',
      'mike.brown@example.com'
    ];

    await client.query(`
      DELETE FROM users 
      WHERE email = ANY($1)
    `, [demoEmails]);

    console.log(`✅ Removed demo users`);
  }
};