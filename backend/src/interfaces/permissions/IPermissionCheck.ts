import { Permission, Resource } from '@/types/permissions';

export interface IPermissionCheck {
  permission: Permission;
  resource: Resource;
  resourceId?: string;
}
