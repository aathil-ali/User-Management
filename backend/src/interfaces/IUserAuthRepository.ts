import { User } from '@/entities/User';

export interface IUserAuthRepository {
  create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(id: string, updates: Partial<User>): Promise<User | null>;
  delete(id: string): Promise<boolean>;
  findAll(offset?: number, limit?: number): Promise<{ users: User[], total: number }>;
  emailExists(email: string): Promise<boolean>;
  updateLastLogin(id: string): Promise<void>;
}
