import { Pool } from 'pg';
import { User, CreateUserData, UserWithoutPassword } from '@/entities/User';
import { IUserAuthRepository } from '@/interfaces/IUserAuthRepository';
import { v4 as uuidv4 } from 'uuid';

export class UserAuthRepository implements IUserAuthRepository {
  constructor(private pool: Pool) {}

  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const query = `
      INSERT INTO users (
        email, password_hash, role, email_verified, status, last_login_at
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, password_hash, role, email_verified, status, 
                last_login_at, created_at, updated_at
    `;
    
    const values = [
      userData.email,
      userData.passwordHash,
      userData.role || 'user',
      userData.emailVerified || false,
      userData.status || 'active',
      userData.lastLoginAt || null
    ];

    try {
      const result = await this.pool.query(query, values);
      return this.mapRowToUser(result.rows[0]);
    } catch (error: any) {
      if (error.code === '23505') { // Unique constraint violation
        throw new Error('Email already exists');
      }
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  async findById(id: string): Promise<User | null> {
    const query = `
      SELECT id, email, password_hash, role, email_verified, status,
             last_login_at, created_at, updated_at
      FROM users 
      WHERE id = $1 AND status != 'suspended'
    `;

    try {
      const result = await this.pool.query(query, [id]);
      return result.rows.length > 0 ? this.mapRowToUser(result.rows[0]) : null;
    } catch (error: any) {
      throw new Error(`Failed to find user by id: ${error.message}`);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT id, email, password_hash, role, email_verified, status,
             last_login_at, created_at, updated_at
      FROM users 
      WHERE email = $1
    `;

    try {
      const result = await this.pool.query(query, [email.toLowerCase()]);
      return result.rows.length > 0 ? this.mapRowToUser(result.rows[0]) : null;
    } catch (error: any) {
      throw new Error(`Failed to find user by email: ${error.message}`);
    }
  }

  async update(id: string, updates: Partial<User>): Promise<User | null> {
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    // Build dynamic UPDATE query
    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt') {
        const dbField = this.camelToSnake(key);
        updateFields.push(`${dbField} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (updateFields.length === 0) {
      return this.findById(id); // Return unchanged user
    }

    values.push(id); // Add id as last parameter

    const query = `
      UPDATE users 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING id, email, password_hash, role, email_verified, status,
                last_login_at, created_at, updated_at
    `;

    try {
      const result = await this.pool.query(query, values);
      return result.rows.length > 0 ? this.mapRowToUser(result.rows[0]) : null;
    } catch (error: any) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    // Soft delete by setting status to 'suspended'
    const query = `
      UPDATE users 
      SET status = 'suspended', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;

    try {
      const result = await this.pool.query(query, [id]);
      return (result.rowCount ?? 0) > 0;
    } catch (error: any) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  async findAll(offset: number = 0, limit: number = 10): Promise<{ users: User[], total: number }> {
    // Get total count
    const countQuery = 'SELECT COUNT(*) FROM users WHERE status != $1';
    const dataQuery = `
      SELECT id, email, password_hash, role, email_verified, status,
             last_login_at, created_at, updated_at
      FROM users 
      WHERE status != $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;

    try {
      const [countResult, dataResult] = await Promise.all([
        this.pool.query(countQuery, ['suspended']),
        this.pool.query(dataQuery, ['suspended', limit, offset])
      ]);

      return {
        users: dataResult.rows.map(row => this.mapRowToUser(row)),
        total: parseInt(countResult.rows[0].count)
      };
    } catch (error: any) {
      throw new Error(`Failed to find all users: ${error.message}`);
    }
  }

  /**
   * Helper method to map database row to User entity
   */
  private mapRowToUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      role: row.role,
      emailVerified: row.email_verified,
      status: row.status,
      lastLoginAt: row.last_login_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  /**
   * Helper method to convert camelCase to snake_case
   */
  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  /**
   * Check if user exists by email
   */
  async emailExists(email: string): Promise<boolean> {
    const query = 'SELECT 1 FROM users WHERE email = $1 LIMIT 1';
    try {
      const result = await this.pool.query(query, [email.toLowerCase()]);
      return result.rows.length > 0;
    } catch (error: any) {
      throw new Error(`Failed to check email existence: ${error.message}`);
    }
  }

  /**
   * Update user's last login timestamp
   */
  async updateLastLogin(id: string): Promise<void> {
    const query = `
      UPDATE users 
      SET last_login_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;

    try {
      await this.pool.query(query, [id]);
    } catch (error: any) {
      // Don't throw error for last login update failures
      console.warn(`Failed to update last login for user ${id}:`, error.message);
    }
  }
}
