/**
 * Permission System for User Management
 * 
 * Simple permission model:
 * - Users: CREATE, READ (own data only)
 * - Admins: Full access (CREATE, READ, UPDATE, DELETE)
 */

/**
 * Available actions/permissions
 */
export enum Permission {
  // Basic CRUD operations
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  
  // Special permissions
  READ_ALL = 'read_all',    // Read all users (admin only)
  MANAGE = 'manage',        // Full management access
}

/**
 * Resources that permissions apply to
 */
export enum Resource {
  // User-related resources
  PROFILE = 'profile',           // User's own profile
  USER = 'user',                 // Any user (admin context)
  ACCOUNT = 'account',           // User account management
  
  // Admin-only resources
  USERS = 'users',               // All users management
  ROLES = 'roles',               // Role management
  SYSTEM = 'system',             // System administration
  AUDIT = 'audit',               // Audit logs
}

/**
 * User roles with their permissions
 */
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  // Regular user - can only create and view their own data
  user: [
    `${Permission.CREATE}:${Resource.PROFILE}`,
    `${Permission.READ}:${Resource.PROFILE}`,
    `${Permission.UPDATE}:${Resource.PROFILE}`,
    `${Permission.CREATE}:${Resource.ACCOUNT}`,
    `${Permission.READ}:${Resource.ACCOUNT}`,
    `${Permission.DELETE}:${Resource.ACCOUNT}`,
  ],
  
  // Moderator - can moderate content but limited user access
  moderator: [
    // User permissions
    `${Permission.CREATE}:${Resource.PROFILE}`,
    `${Permission.READ}:${Resource.PROFILE}`,
    `${Permission.UPDATE}:${Resource.PROFILE}`,
    `${Permission.CREATE}:${Resource.ACCOUNT}`,
    `${Permission.READ}:${Resource.ACCOUNT}`,
    `${Permission.DELETE}:${Resource.ACCOUNT}`,
    
    // Limited admin permissions
    `${Permission.READ}:${Resource.USERS}`,
    `${Permission.READ_ALL}:${Resource.USER}`,
  ],
  
  // Admin - can manage users but not system
  admin: [
    // All user permissions
    `${Permission.CREATE}:${Resource.PROFILE}`,
    `${Permission.READ}:${Resource.PROFILE}`,
    `${Permission.UPDATE}:${Resource.PROFILE}`,
    `${Permission.CREATE}:${Resource.ACCOUNT}`,
    `${Permission.READ}:${Resource.ACCOUNT}`,
    `${Permission.DELETE}:${Resource.ACCOUNT}`,
    
    // User management permissions
    `${Permission.CREATE}:${Resource.USER}`,
    `${Permission.READ}:${Resource.USER}`,
    `${Permission.UPDATE}:${Resource.USER}`,
    `${Permission.DELETE}:${Resource.USER}`,
    `${Permission.READ_ALL}:${Resource.USER}`,
    `${Permission.MANAGE}:${Resource.USERS}`,
    
    // Audit permissions
    `${Permission.READ}:${Resource.AUDIT}`,
  ],
  
  // Super Admin - full system access
  super_admin: [
    // All permissions (wildcard approach)
    `${Permission.CREATE}:*`,
    `${Permission.READ}:*`,
    `${Permission.UPDATE}:*`,
    `${Permission.DELETE}:*`,
    `${Permission.READ_ALL}:*`,
    `${Permission.MANAGE}:*`,
  ],
  
  // Guest - very limited access
  guest: [
    `${Permission.READ}:${Resource.PROFILE}`,
  ]
};

import { IUserContext } from '@/interfaces/permissions/IUserContext';
import { IPermissionCheck } from '@/interfaces/permissions/IPermissionCheck';
import { IPermissionResult } from '@/interfaces/permissions/IPermissionResult';

export { IUserContext as UserContext, IPermissionCheck as PermissionCheck, IPermissionResult as PermissionResult };
