// import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { type User, UserRole, UserStatus } from '@/types';

// Mock mutation hook
const useMockMutation = <T extends any[], R>(
  fn: (...args: T) => Promise<R>
) => {
  return {
    mutateAsync: fn,
    isPending: false,
    isLoading: false,
    error: null,
  };
};

// Mock query hook
const useMockQuery = <T>(data: T, loading = false) => {
  return {
    data,
    isLoading: loading,
    error: null,
    refetch: () => Promise.resolve(),
  };
};

export const useUser = () => {
  const { user } = useAuth();
  
  // Mock user profile operations
  const updateProfile = useMockMutation(async (data: any) => {
    console.log('Mock: Updating profile', data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true };
  });

  const changePassword = useMockMutation(async (data: any) => {
    console.log('Mock: Changing password', data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true };
  });

  const uploadAvatar = useMockMutation(async (file: File) => {
    console.log('Mock: Uploading avatar', file.name);
    await new Promise(resolve => setTimeout(resolve, 1500));
    return { success: true, url: URL.createObjectURL(file) };
  });

  const updatePreferences = useMockMutation(async (data: any) => {
    console.log('Mock: Updating preferences', data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true };
  });

  // Mock admin operations
  const createUser = useMockMutation(async (data: any) => {
    console.log('Mock: Creating user', data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newUser: User = {
      id: Math.random().toString(),
      email: data.email,
      name: data.firstName + ' ' + data.lastName,

      role: data.role,
      isEmailVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return newUser;
  });

  const deleteUser = useMockMutation(async (userId: string) => {
    console.log('Mock: Deleting user', userId);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true };
  });

  const suspendUser = useMockMutation(async (userId: string) => {
    console.log('Mock: Suspending user', userId);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true };
  });

  const unsuspendUser = useMockMutation(async (userId: string) => {
    console.log('Mock: Unsuspending user', userId);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true };
  });

  // Mock data queries
  const profile = useMockQuery(user);
  
  const preferences = useMockQuery({
    language: 'en',
    theme: 'system',
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    twoFactorEnabled: false,
  });

  // Mock users list with search function
  const searchUsers = (searchTerm: string, _options?: any) => {
    const mockUsers: User[] = [
      {
        id: '1',
        email: 'john.doe@example.com',
        name: 'John Doe',
        isActive: true,
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        lastLogin: '2024-02-01T08:30:00Z',
      },
      {
        id: '2',
        email: 'jane.smith@example.com',
        name: 'Jane Smith',
        isActive: true,
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
        createdAt: '2024-01-10T10:00:00Z',
        updatedAt: '2024-01-10T10:00:00Z',
        lastLogin: '2024-02-01T09:15:00Z',
      },
      {
        id: '3',
        email: 'bob.johnson@example.com',
        name: 'Bob Johnson',
        isActive: false,
        role: UserRole.USER,
        status: UserStatus.SUSPENDED,
        isEmailVerified: false,
        createdAt: '2024-01-20T10:00:00Z',
        updatedAt: '2024-01-20T10:00:00Z',
      },
      {
        id: '4',
        email: 'alice.wilson@example.com',
        name: 'Alice Wilson',
        isActive: true,
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
        createdAt: '2024-01-25T10:00:00Z',
        updatedAt: '2024-01-25T10:00:00Z',
        lastLogin: '2024-02-01T14:20:00Z',
      },
      {
        id: '5',
        email: 'mike.brown@example.com',
        name: 'Mike Brown',
        isActive: true,
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
        createdAt: '2024-01-05T10:00:00Z',
        updatedAt: '2024-01-05T10:00:00Z',
        lastLogin: '2024-02-01T16:45:00Z',
      },
      {
        id: '6',
        email: 'sarah.davis@example.com',
        name: 'Sarah Davis',
        isActive: true,
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
        createdAt: '2024-01-30T10:00:00Z',
        updatedAt: '2024-01-30T10:00:00Z',
        lastLogin: '2024-02-01T11:30:00Z',
      },
    ];

    const filteredUsers = searchTerm 
      ? mockUsers.filter(user => 
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : mockUsers;

    return useMockQuery({
      data: filteredUsers,
      pagination: {
        page: 1,
        limit: 10,
        total: filteredUsers.length,
        totalPages: 1,
      }
    });
  };

  const users = (options?: any) => {
    return searchUsers('', options);
  };

  const userStats = useMockQuery({
    data: {
      totalUsers: 150,
      activeUsers: 142,
      suspendedUsers: 8,
      inactiveUsers: 0,
      adminUsers: 5,
      userUsers: 145,
    }
  });

  return {
    // Profile operations
    profile,
    updateProfile,
    changePassword,
    uploadAvatar,
    updatePreferences,
    preferences,
    
    // Admin operations  
    users,
    searchUsers,
    createUser,
    deleteUser,
    suspendUser,
    unsuspendUser,
    userStats,
    
    // State
    isLoading: false,
    error: null,
  };
};

export default useUser;
