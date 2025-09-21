import { 
  Permission, 
  Resource, 
  ROLE_PERMISSIONS, 
  PermissionCheck, 
  UserContext, 
  PermissionResult 
} from '@/types/permissions';

/**
 * Permission Service
 * Handles permission checking logic for the application
 */
export class PermissionService {
  
  /**
   * Check if a user has permission to perform an action on a resource
   */
  static hasPermission(
    userContext: UserContext, 
    check: PermissionCheck
  ): PermissionResult {
    const { permission, resource, resourceId } = check;
    const { id: userId, role } = userContext;

    // Get role-based permissions
    const rolePermissions = ROLE_PERMISSIONS[role] || [];
    
    // Check for exact permission match
    const exactPermission = `${permission}:${resource}`;
    if (rolePermissions.includes(exactPermission)) {
      // For resources that require ownership check
      if (resourceId && this.requiresOwnershipCheck(resource)) {
        return this.checkResourceOwnership(userId, resourceId, permission, resource);
      }
      return { allowed: true };
    }

    // Check for wildcard permissions (super_admin)
    const wildcardPermission = `${permission}:*`;
    if (rolePermissions.includes(wildcardPermission)) {
      return { allowed: true };
    }

    // Check for manage permission (covers all CRUD operations)
    const managePermission = `${Permission.MANAGE}:${resource}`;
    if (rolePermissions.includes(managePermission)) {
      return { allowed: true };
    }

    // Check for global manage permission
    const globalManage = `${Permission.MANAGE}:*`;
    if (rolePermissions.includes(globalManage)) {
      return { allowed: true };
    }

    // Permission denied
    return {
      allowed: false,
      reason: `User with role '${role}' does not have '${permission}' permission on '${resource}'`
    };
  }

  /**
   * Check if user can perform any of the given permissions
   */
  static hasAnyPermission(
    userContext: UserContext, 
    checks: PermissionCheck[]
  ): PermissionResult {
    for (const check of checks) {
      const result = this.hasPermission(userContext, check);
      if (result.allowed) {
        return result;
      }
    }

    return {
      allowed: false,
      reason: `User does not have any of the required permissions`
    };
  }

  /**
   * Check if user can perform all of the given permissions
   */
  static hasAllPermissions(
    userContext: UserContext, 
    checks: PermissionCheck[]
  ): PermissionResult {
    for (const check of checks) {
      const result = this.hasPermission(userContext, check);
      if (!result.allowed) {
        return result;
      }
    }

    return { allowed: true };
  }

  /**
   * Get all permissions for a user role
   */
  static getRolePermissions(role: string): string[] {
    return ROLE_PERMISSIONS[role] || [];
  }

  /**
   * Check if a resource requires ownership verification
   */
  private static requiresOwnershipCheck(resource: Resource): boolean {
    return [
      Resource.PROFILE,
      Resource.ACCOUNT
    ].includes(resource);
  }

  /**
   * Check if user owns the resource they're trying to access
   */
  private static checkResourceOwnership(
    userId: string, 
    resourceId: string, 
    permission: Permission, 
    resource: Resource
  ): PermissionResult {
    // For profile and account resources, user can only access their own
    if (resource === Resource.PROFILE || resource === Resource.ACCOUNT) {
      if (userId === resourceId) {
        return { allowed: true };
      } else {
        return {
          allowed: false,
          reason: `User can only ${permission} their own ${resource}`
        };
      }
    }

    // Default allow for other resources
    return { allowed: true };
  }

  /**
   * Helper methods for common permission checks
   */

  /**
   * Check if user can read their own profile
   */
  static canReadOwnProfile(userContext: UserContext): boolean {
    return this.hasPermission(userContext, {
      permission: Permission.READ,
      resource: Resource.PROFILE
    }).allowed;
  }

  /**
   * Check if user can update their own profile
   */
  static canUpdateOwnProfile(userContext: UserContext): boolean {
    return this.hasPermission(userContext, {
      permission: Permission.UPDATE,
      resource: Resource.PROFILE
    }).allowed;
  }

  /**
   * Check if user can delete their own account
   */
  static canDeleteOwnAccount(userContext: UserContext): boolean {
    return this.hasPermission(userContext, {
      permission: Permission.DELETE,
      resource: Resource.ACCOUNT
    }).allowed;
  }

  /**
   * Check if user can read all users (admin function)
   */
  static canReadAllUsers(userContext: UserContext): boolean {
    return this.hasPermission(userContext, {
      permission: Permission.READ_ALL,
      resource: Resource.USER
    }).allowed;
  }

  /**
   * Check if user can manage users (admin function)
   */
  static canManageUsers(userContext: UserContext): boolean {
    return this.hasPermission(userContext, {
      permission: Permission.MANAGE,
      resource: Resource.USERS
    }).allowed;
  }

  /**
   * Check if user is admin (has any admin permissions)
   */
  static isAdmin(userContext: UserContext): boolean {
    const rolePermissions = this.getRolePermissions(userContext.role);
    
    // Check if has any admin-level permissions
    return rolePermissions.some(permission => 
      permission.includes(Permission.MANAGE) ||
      permission.includes(Permission.READ_ALL) ||
      permission.includes('*')
    );
  }

  /**
   * Check if user is super admin
   */
  static isSuperAdmin(userContext: UserContext): boolean {
    return userContext.role === 'super_admin';
  }

  /**
   * Get human-readable permissions for a role
   */
  static getReadablePermissions(role: string): string[] {
    const permissions = this.getRolePermissions(role);
    return permissions.map(permission => {
      const [action, resource] = permission.split(':');
      return `${action.toUpperCase()} ${resource.toUpperCase()}`;
    });
  }
}
