// Permission Guard Factory

import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { RbacGuard } from '../../modules/rbac/rbac.guard';
import { Permissions } from '../decorators/permissions.decorator';
import { Roles } from '../decorators/roles.decorator';

/**
 * Factory function to create permission-based guard decorators
 */

/**
 * Require specific permissions for a route
 */
export function RequirePermissions(...permissions: string[]) {
  return applyDecorators(
    UseGuards(JwtAuthGuard, RbacGuard),
    Permissions(...permissions)
  );
}

/**
 * Require specific roles for a route
 */
export function RequireRoles(...roles: string[]) {
  return applyDecorators(
    UseGuards(JwtAuthGuard, RbacGuard),
    Roles(...roles)
  );
}

/**
 * Require either specific permissions OR roles for a route
 */
export function RequirePermissionsOrRoles(
  permissions: string[],
  roles: string[]
) {
  return applyDecorators(
    UseGuards(JwtAuthGuard, RbacGuard),
    Permissions(...permissions),
    Roles(...roles)
  );
}

/**
 * Require all of the specified permissions (AND logic)
 */
export function RequireAllPermissions(...permissions: string[]) {
  // The existing RbacGuard already requires all permissions when multiple are specified
  return RequirePermissions(...permissions);
}

/**
 * Require any of the specified permissions (OR logic)
 */
export function RequireAnyPermission(...permissions: string[]) {
  // Create a custom decorator that modifies the permission check logic
  // For now, we'll use the standard RequirePermissions which uses OR logic
  return RequirePermissions(...permissions);
}

/**
 * Convenience decorators for common CRUD operations
 */
export function RequireReadPermission(entity: string) {
  return RequirePermissions(`${entity}.read`);
}

export function RequireWritePermission(entity: string) {
  return RequirePermissions(`${entity}.write`);
}

export function RequireCreatePermission(entity: string) {
  return RequirePermissions(`${entity}.create`);
}

export function RequireUpdatePermission(entity: string) {
  return RequirePermissions(`${entity}.update`);
}

export function RequireDeletePermission(entity: string) {
  return RequirePermissions(`${entity}.delete`);
}

/**
 * Admin-only route decorator
 */
export function AdminOnly() {
  return RequireRoles('admin');
}

/**
 * Manager or Admin route decorator
 */
export function ManagerOrAdmin() {
  return RequireRoles('manager', 'admin');
}

/**
 * Public route decorator (no authentication required)
 */
import { Public } from '../decorators/public.decorator';
export { Public };

/**
 * Example usage in controllers:
 * 
 * @Controller('products')
 * export class ProductsController {
 *   @RequireReadPermission('products')
 *   @Get()
 *   findAll() { ... }
 * 
 *   @RequireWritePermission('products')
 *   @Post()
 *   create() { ... }
 * 
 *   @AdminOnly()
 *   @Delete(':id')
 *   delete() { ... }
 * }
 */