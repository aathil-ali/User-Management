/**
 * Query Keys Factory
 * 
 * Centralized query key management to ensure consistency across the app
 * and prevent cache key conflicts. This follows the hierarchical approach
 * recommended by TanStack Query.
 * 
 * Structure: [domain, entity, ...identifiers, ...params]
 */

import type { AdminUserListParams, UserRole, UserStatus } from '@/types';

export const queryKeys = {
  // Root keys for invalidating entire domains
  all: ['queries'] as const,
  authRoot: () => [...queryKeys.all, 'auth'] as const,
  usersRoot: () => [...queryKeys.all, 'users'] as const,
  adminRoot: () => [...queryKeys.all, 'admin'] as const,
  dashboardRoot: () => [...queryKeys.all, 'dashboard'] as const,

  // Authentication queries
  auth: {
    // Current user session/profile
    me: () => [...queryKeys.authRoot(), 'me'] as const,
    
    // Auth status check
    status: () => [...queryKeys.authRoot(), 'status'] as const,
    
    // Refresh token validation
    refresh: () => [...queryKeys.authRoot(), 'refresh'] as const,
  },

  // User profile queries
  user: {
    // Current user profile
    profile: () => [...queryKeys.usersRoot(), 'profile'] as const,
    
    // User preferences
    preferences: () => [...queryKeys.usersRoot(), 'preferences'] as const,
    
    // User activity logs
    activity: (userId?: string) => 
      [...queryKeys.usersRoot(), 'activity', userId] as const,
    
    // User avatar/photo
    avatar: (userId: string) => 
      [...queryKeys.usersRoot(), 'avatar', userId] as const,
  },

  // Admin queries
  admin: {
    // All admin data
    all: () => [...queryKeys.adminRoot()] as const,
    
    // User management
    users: {
      // List users with filters and pagination
      list: (params?: AdminUserListParams) => 
        [...queryKeys.adminRoot(), 'users', 'list', params] as const,
      
      // Single user details
      detail: (userId: string) => 
        [...queryKeys.adminRoot(), 'users', 'detail', userId] as const,
      
      // User statistics/counts
      stats: () => 
        [...queryKeys.adminRoot(), 'users', 'stats'] as const,
      
      // Bulk operations
      bulk: () => 
        [...queryKeys.adminRoot(), 'users', 'bulk'] as const,
    },
    
    // Dashboard data
    dashboardAdmin: {
      // Overview statistics
      stats: () => 
        [...queryKeys.adminRoot(), 'dashboard', 'stats'] as const,
      
      // Recent activity
      activity: (limit?: number) => 
        [...queryKeys.adminRoot(), 'dashboard', 'activity', { limit }] as const,
      
      // User growth data
      growth: (period: 'week' | 'month' | 'year' = 'month') => 
        [...queryKeys.adminRoot(), 'dashboard', 'growth', period] as const,
    },
    
    // System settings
    settings: {
      all: () => 
        [...queryKeys.adminRoot(), 'settings'] as const,
      
      general: () => 
        [...queryKeys.adminRoot(), 'settings', 'general'] as const,
      
      security: () => 
        [...queryKeys.adminRoot(), 'settings', 'security'] as const,
      
      notifications: () => 
        [...queryKeys.adminRoot(), 'settings', 'notifications'] as const,
    },
  },

  // Dashboard queries (user dashboard)
  dashboard: {
    // User dashboard overview
    overview: () => 
      [...queryKeys.dashboardRoot(), 'overview'] as const,
    
    // Recent user activity
    activity: (userId: string, limit?: number) => 
      [...queryKeys.dashboardRoot(), 'activity', userId, { limit }] as const,
    
    // User statistics
    stats: (userId: string) => 
      [...queryKeys.dashboardRoot(), 'stats', userId] as const,
    
    // Notifications
    notifications: (userId: string, unreadOnly?: boolean) => 
      [...queryKeys.dashboardRoot(), 'notifications', userId, { unreadOnly }] as const,
  },

  // Search queries
  search: {
    // Global search
    global: (query: string) => 
      [...queryKeys.all, 'search', 'global', query] as const,
    
    // User search
    users: (query: string, filters?: { role?: UserRole; status?: UserStatus }) => 
      [...queryKeys.all, 'search', 'users', query, filters] as const,
  },

  // File/media queries
  media: {
    // File uploads
    uploads: (userId: string) => 
      [...queryKeys.all, 'media', 'uploads', userId] as const,
    
    // Avatar uploads
    avatars: (userId: string) => 
      [...queryKeys.all, 'media', 'avatars', userId] as const,
  },

  // System queries
  system: {
    // Health check
    health: () => 
      [...queryKeys.all, 'system', 'health'] as const,
    
    // Feature flags
    features: () => 
      [...queryKeys.all, 'system', 'features'] as const,
    
    // Configuration
    config: () => 
      [...queryKeys.all, 'system', 'config'] as const,
  },
} as const;

// Helper functions for common invalidation patterns

/**
 * Invalidate all queries for a specific user
 */
export const invalidateUserQueries = (userId: string) => {
  return [
    queryKeys.user.profile(),
    queryKeys.user.activity(userId),
    queryKeys.user.avatar(userId),
    queryKeys.dashboard.activity(userId),
    queryKeys.dashboard.stats(userId),
  ];
};

/**
 * Invalidate all admin queries
 */
export const invalidateAdminQueries = () => {
  return [
    queryKeys.admin.all(),
  ];
};

/**
 * Invalidate queries after user status change
 */
export const invalidateAfterUserUpdate = () => {
  return [
    queryKeys.admin.users.list(),
    queryKeys.admin.users.stats(),
    queryKeys.admin.dashboardAdmin.stats(),
  ];
};

/**
 * Invalidate queries after auth state change
 */
export const invalidateAfterAuthChange = () => {
  return [
    queryKeys.auth.me(),
    queryKeys.auth.status(),
    queryKeys.user.profile(),
  ];
};

/**
 * Get mutation keys for consistency
 */
export const mutationKeys = {
  // Auth mutations
  auth: {
    login: ['login'] as const,
    register: ['register'] as const,
    logout: ['logout'] as const,
    refresh: ['refresh'] as const,
  },
  
  // User mutations
  user: {
    updateProfile: ['updateProfile'] as const,
    changePassword: ['changePassword'] as const,
    uploadAvatar: ['uploadAvatar'] as const,
    deleteAccount: ['deleteAccount'] as const,
  },
  
  // Admin mutations
  admin: {
    createUser: ['admin', 'createUser'] as const,
    updateUser: ['admin', 'updateUser'] as const,
    deleteUser: ['admin', 'deleteUser'] as const,
    bulkUpdateUsers: ['admin', 'bulkUpdateUsers'] as const,
    bulkDeleteUsers: ['admin', 'bulkDeleteUsers'] as const,
  },
} as const;

export default queryKeys;
