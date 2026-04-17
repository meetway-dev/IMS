import type { PermissionLogic } from '../../common/decorators/permission-logic.decorator';
import type { ResourceScope } from '../../common/decorators/resource-scope.decorator';

export type RequestRbac = {
  roleNames: string[];
  permissionKeys: string[];
};

// Re-export from permission-logic.decorator for convenience
export { PermissionLogic } from '../../common/decorators/permission-logic.decorator';

// Re-export from resource-scope.decorator for convenience
export type { ResourceScope } from '../../common/decorators/resource-scope.decorator';

export interface PermissionCheckOptions {
  userId: string;
  permissions: string[];
  logic?: PermissionLogic;
  resourceScope?: ResourceScope;
  request?: any;
}

export interface RoleHierarchyNode {
  roleId: string;
  roleName: string;
  priority: number;
  parentRoleId?: string;
  permissions: string[];
}

export interface UserPermissionCache {
  userId: string;
  permissions: string[];
  roles: string[];
  expiresAt: Date;
  updatedAt: Date;
}

export interface BulkPermissionAssignment {
  userIds: string[];
  permissionIds: string[];
  expiresAt?: Date;
  reason?: string;
}

export interface PermissionValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
