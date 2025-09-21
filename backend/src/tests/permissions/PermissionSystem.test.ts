import { PermissionService } from '@/services/PermissionService';
import { Permission, Resource, UserContext } from '@/types/permissions';

describe('Permission System', () => {
  describe('User Permissions', () => {
    const regularUser: UserContext = {
      id: 'user-123',
      role: 'user'
    };

    test('Regular user can read their own profile', () => {
      const result = PermissionService.hasPermission(regularUser, {
        permission: Permission.READ,
        resource: Resource.PROFILE,
        resourceId: 'user-123'
      });

      expect(result.allowed).toBe(true);
    });

    test('Regular user can update their own profile', () => {
      const result = PermissionService.hasPermission(regularUser, {
        permission: Permission.UPDATE,
        resource: Resource.PROFILE,
        resourceId: 'user-123'
      });

      expect(result.allowed).toBe(true);
    });

    test('Regular user cannot read another user\'s profile', () => {
      const result = PermissionService.hasPermission(regularUser, {
        permission: Permission.READ,
        resource: Resource.PROFILE,
        resourceId: 'other-user-456'
      });

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('can only read their own profile');
    });

    test('Regular user cannot read all users', () => {
      const result = PermissionService.hasPermission(regularUser, {
        permission: Permission.READ_ALL,
        resource: Resource.USER
      });

      expect(result.allowed).toBe(false);
    });

    test('Regular user cannot manage users', () => {
      const result = PermissionService.hasPermission(regularUser, {
        permission: Permission.MANAGE,
        resource: Resource.USERS
      });

      expect(result.allowed).toBe(false);
    });
  });

  describe('Admin Permissions', () => {
    const adminUser: UserContext = {
      id: 'admin-123',
      role: 'admin'
    };

    test('Admin can read their own profile', () => {
      const result = PermissionService.hasPermission(adminUser, {
        permission: Permission.READ,
        resource: Resource.PROFILE,
        resourceId: 'admin-123'
      });

      expect(result.allowed).toBe(true);
    });

    test('Admin can read all users', () => {
      const result = PermissionService.hasPermission(adminUser, {
        permission: Permission.READ_ALL,
        resource: Resource.USER
      });

      expect(result.allowed).toBe(true);
    });

    test('Admin can manage users', () => {
      const result = PermissionService.hasPermission(adminUser, {
        permission: Permission.MANAGE,
        resource: Resource.USERS
      });

      expect(result.allowed).toBe(true);
    });

    test('Admin can create users', () => {
      const result = PermissionService.hasPermission(adminUser, {
        permission: Permission.CREATE,
        resource: Resource.USER
      });

      expect(result.allowed).toBe(true);
    });

    test('Admin can delete users', () => {
      const result = PermissionService.hasPermission(adminUser, {
        permission: Permission.DELETE,
        resource: Resource.USER
      });

      expect(result.allowed).toBe(true);
    });

    test('Admin cannot access system resources', () => {
      const result = PermissionService.hasPermission(adminUser, {
        permission: Permission.MANAGE,
        resource: Resource.SYSTEM
      });

      expect(result.allowed).toBe(false);
    });
  });

  describe('Super Admin Permissions', () => {
    const superAdmin: UserContext = {
      id: 'super-admin-123',
      role: 'super_admin'
    };

    test('Super admin can do everything (wildcard permissions)', () => {
      const permissions = [
        { permission: Permission.READ, resource: Resource.PROFILE },
        { permission: Permission.CREATE, resource: Resource.USER },
        { permission: Permission.DELETE, resource: Resource.USER },
        { permission: Permission.MANAGE, resource: Resource.SYSTEM },
        { permission: Permission.READ_ALL, resource: Resource.USER },
      ];

      permissions.forEach(({ permission, resource }) => {
        const result = PermissionService.hasPermission(superAdmin, {
          permission,
          resource
        });
        expect(result.allowed).toBe(true);
      });
    });
  });

  describe('Moderator Permissions', () => {
    const moderator: UserContext = {
      id: 'mod-123',
      role: 'moderator'
    };

    test('Moderator can read their own profile', () => {
      const result = PermissionService.hasPermission(moderator, {
        permission: Permission.READ,
        resource: Resource.PROFILE
      });

      expect(result.allowed).toBe(true);
    });

    test('Moderator can read all users', () => {
      const result = PermissionService.hasPermission(moderator, {
        permission: Permission.READ_ALL,
        resource: Resource.USER
      });

      expect(result.allowed).toBe(true);
    });

    test('Moderator cannot delete users', () => {
      const result = PermissionService.hasPermission(moderator, {
        permission: Permission.DELETE,
        resource: Resource.USER
      });

      expect(result.allowed).toBe(false);
    });

    test('Moderator cannot manage users', () => {
      const result = PermissionService.hasPermission(moderator, {
        permission: Permission.MANAGE,
        resource: Resource.USERS
      });

      expect(result.allowed).toBe(false);
    });
  });

  describe('Helper Methods', () => {
    test('isAdmin correctly identifies admin users', () => {
      expect(PermissionService.isAdmin({ id: '1', role: 'user' })).toBe(false);
      expect(PermissionService.isAdmin({ id: '1', role: 'moderator' })).toBe(true);
      expect(PermissionService.isAdmin({ id: '1', role: 'admin' })).toBe(true);
      expect(PermissionService.isAdmin({ id: '1', role: 'super_admin' })).toBe(true);
    });

    test('isSuperAdmin correctly identifies super admin users', () => {
      expect(PermissionService.isSuperAdmin({ id: '1', role: 'user' })).toBe(false);
      expect(PermissionService.isSuperAdmin({ id: '1', role: 'admin' })).toBe(false);
      expect(PermissionService.isSuperAdmin({ id: '1', role: 'super_admin' })).toBe(true);
    });

    test('canReadOwnProfile works correctly', () => {
      expect(PermissionService.canReadOwnProfile({ id: '1', role: 'user' })).toBe(true);
      expect(PermissionService.canReadOwnProfile({ id: '1', role: 'guest' })).toBe(true);
    });

    test('canManageUsers works correctly', () => {
      expect(PermissionService.canManageUsers({ id: '1', role: 'user' })).toBe(false);
      expect(PermissionService.canManageUsers({ id: '1', role: 'admin' })).toBe(true);
      expect(PermissionService.canManageUsers({ id: '1', role: 'super_admin' })).toBe(true);
    });
  });

  describe('Permission Summary', () => {
    test('User role permissions summary', () => {
      const permissions = PermissionService.getRolePermissions('user');
      expect(permissions).toEqual([
        'create:profile',
        'read:profile',
        'update:profile',
        'create:account',
        'read:account',
        'delete:account'
      ]);
    });

    test('Admin role permissions summary', () => {
      const permissions = PermissionService.getRolePermissions('admin');
      expect(permissions).toContain('manage:users');
      expect(permissions).toContain('read_all:user');
      expect(permissions).toContain('create:user');
    });
  });
});
