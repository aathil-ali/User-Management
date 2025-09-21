export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
  emailVerified: boolean;
  status: 'active' | 'inactive' | 'suspended';
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  email: string;
  password: string;
  role?: 'user' | 'admin';
}

export interface UserWithoutPassword extends Omit<User, 'passwordHash'> {}

export interface RefreshToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}
