import { PoolClient } from 'pg';
import { Seeder } from './SeederRunner';

export const seeder: Seeder = {
  name: '001_default_roles',
  order: 1,
  
  async run(client: PoolClient): Promise<void> {
    const roles = [
      {
        name: 'super_admin',
        description: 'Super Administrator with full system access',
        permissions: JSON.stringify([
          'create:*',
          'read:*',
          'update:*',
          'delete:*',
          'read_all:*',
          'manage:*'
        ]),
        isSystem: true
      },
      {
        name: 'admin',
        description: 'Administrator with user management capabilities',
        permissions: JSON.stringify([
          'create:profile',
          'read:profile',
          'update:profile',
          'create:account',
          'read:account',
          'delete:account',
          'create:user',
          'read:user',
          'update:user',
          'delete:user',
          'read_all:user',
          'manage:users',
          'read:audit'
        ]),
        isSystem: true
      },
      {
        name: 'moderator',
        description: 'Moderator with limited administrative privileges',
        permissions: JSON.stringify([
          'create:profile',
          'read:profile',
          'update:profile',
          'create:account',
          'read:account',
          'delete:account',
          'read:users',
          'read_all:user'
        ]),
        isSystem: false
      },
      {
        name: 'user',
        description: 'Standard user with basic permissions - can create and view own data',
        permissions: JSON.stringify([
          'create:profile',
          'read:profile',
          'update:profile',
          'create:account',
          'read:account',
          'delete:account'
        ]),
        isSystem: true
      },
      {
        name: 'guest',
        description: 'Guest user with read-only access',
        permissions: JSON.stringify([
          'read:profile'
        ]),
        isSystem: true
      }
    ];

    for (const role of roles) {
      await client.query(`
        INSERT INTO roles (name, description, permissions, is_system, is_active)
        VALUES ($1, $2, $3, $4, true)
        ON CONFLICT (name) DO NOTHING
      `, [role.name, role.description, role.permissions, role.isSystem]);
    }

    console.log(`✅ Seeded ${roles.length} default roles`);
  },

  async rollback(client: PoolClient): Promise<void> {
    const systemRoles = ['super_admin', 'admin', 'moderator', 'user', 'guest'];
    
    await client.query(`
      DELETE FROM roles 
      WHERE name = ANY($1) AND is_system = true
    `, [systemRoles]);

    console.log(`✅ Removed ${systemRoles.length} default roles`);
  }
};
