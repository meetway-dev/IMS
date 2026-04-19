// Enhanced Permission Guard Factory
// Provides comprehensive RBAC decorators with all new features

import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { RbacGuard } from '../../modules/rbac/rbac.guard';
import { Permissions } from '../decorators/permissions.decorator';
import { Roles } from '../decorators/roles.decorator';
import {
  PermissionLogicDecorator,
  PermissionLogic,
} from '../decorators/permission-logic.decorator';
import { ResourceScope } from '../decorators/resource-scope.decorator';

/**
 * Require specific permissions for a route with enhanced logic
 */
export function RequirePermissions(
  permissions: string[],
  options?: {
    logic?: PermissionLogic;
    resourceScope?: {
      type: 'OWN' | 'TEAM' | 'ALL';
      paramName?: string;
      userIdField?: string;
    };
  },
) {
  const decorators = [
    UseGuards(JwtAuthGuard, RbacGuard),
    Permissions(...permissions),
  ];

  if (options?.logic) {
    decorators.push(PermissionLogicDecorator(options.logic));
  }

  if (options?.resourceScope) {
    decorators.push(ResourceScope(options.resourceScope));
  }

  return applyDecorators(...decorators);
}

/**
 * Require specific roles for a route
 */
export function RequireRoles(...roles: string[]) {
  return applyDecorators(UseGuards(JwtAuthGuard, RbacGuard), Roles(...roles));
}

/**
 * Require either specific permissions OR roles for a route
 */
export function RequirePermissionsOrRoles(
  permissions: string[],
  roles: string[],
  options?: {
    permissionLogic?: PermissionLogic;
  },
) {
  const decorators = [
    UseGuards(JwtAuthGuard, RbacGuard),
    Permissions(...permissions),
    Roles(...roles),
  ];

  if (options?.permissionLogic) {
    decorators.push(PermissionLogicDecorator(options.permissionLogic));
  }

  return applyDecorators(...decorators);
}

/**
 * Require all of the specified permissions (AND logic)
 */
export function RequireAllPermissions(...permissions: string[]) {
  return RequirePermissions(permissions, { logic: PermissionLogic.AND });
}

/**
 * Require any of the specified permissions (OR logic)
 */
export function RequireAnyPermission(...permissions: string[]) {
  return RequirePermissions(permissions, { logic: PermissionLogic.OR });
}

/**
 * Convenience decorators for common CRUD operations with resource scope
 */
export function RequireReadPermission(
  entity: string,
  scope?: 'own' | 'all' | 'team',
) {
  const permission = scope ? `${entity}.read.${scope}` : `${entity}.read`;
  return RequirePermissions([permission]);
}

export function RequireCreatePermission(entity: string) {
  return RequirePermissions([`${entity}.create`]);
}

export function RequireUpdatePermission(
  entity: string,
  scope?: 'own' | 'all' | 'team',
) {
  const permission = scope ? `${entity}.update.${scope}` : `${entity}.update`;
  const resourceScope =
    scope === 'own' ? { type: 'OWN' as const, paramName: 'id' } : undefined;
  return RequirePermissions([permission], { resourceScope });
}

export function RequireDeletePermission(
  entity: string,
  scope?: 'own' | 'all' | 'team',
) {
  const permission = scope ? `${entity}.delete.${scope}` : `${entity}.delete`;
  const resourceScope =
    scope === 'own' ? { type: 'OWN' as const, paramName: 'id' } : undefined;
  return RequirePermissions([permission], { resourceScope });
}

/**
 * Page-level access decorators
 */
export function RequirePageAccess(page: string) {
  return RequirePermissions([`${page}.page.access`]);
}

export function RequireDashboardAccess() {
  return RequirePageAccess('dashboard');
}

export function RequireAdminPanelAccess() {
  return RequirePermissions(['admin.panel.access']);
}

/**
 * System role decorators
 */
export function SuperAdminOnly() {
  return RequireRoles('SUPER_ADMIN');
}

export function AdminOnly() {
  return RequireRoles('ADMIN', 'SUPER_ADMIN');
}

export function ManagerOrAbove() {
  return RequireRoles('MANAGER', 'ADMIN', 'SUPER_ADMIN');
}

export function StaffOrAbove() {
  return RequireRoles('STAFF', 'MANAGER', 'ADMIN', 'SUPER_ADMIN');
}

/**
 * Public route decorator (no authentication required)
 */
import { Public } from '../decorators/public.decorator';
export { Public };

/**
 * Example usage in controllers:
 *
 * @Controller('users')
 * export class UsersController {
 *   // Only SUPER_ADMIN can view all users
 *   @SuperAdminOnly()
 *   @Get()
 *   findAll() { ... }
 *
 *   // Users can view their own profile with users.read.own permission
 *   @RequireReadPermission('users', 'own')
 *   @Get(':id')
 *   findOne(@Param('id') id: string) { ... }
 *
 *   // Managers can update any user with users.update.all permission
 *   @RequireUpdatePermission('users', 'all')
 *   @Patch(':id')
 *   update(@Param('id') id: string) { ... }
 *
 *   // Users can update their own profile with users.update.own permission
 *   @RequireUpdatePermission('users', 'own')
 *   @Patch('profile')
 *   updateProfile() { ... }
 *
 *   // Admin panel access
 *   @RequireAdminPanelAccess()
 *   @Get('admin/stats')
 *   getAdminStats() { ... }
 * }
 */
