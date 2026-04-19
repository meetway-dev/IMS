import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../../common/decorators/permissions.decorator';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';
import { PERMISSION_LOGIC_KEY, PermissionLogic } from '../../common/decorators/permission-logic.decorator';
import { RESOURCE_SCOPE_KEY, ResourceScope } from '../../common/decorators/resource-scope.decorator';
import type { AuthUser } from '../../types/express';

@Injectable()
export class RbacGuard implements CanActivate {
  private readonly logger = new Logger(RbacGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndMerge<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const requiredPermissions = this.reflector.getAllAndMerge<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    const permissionLogic = this.reflector.getAllAndOverride<PermissionLogic>(
      PERMISSION_LOGIC_KEY,
      [context.getHandler(), context.getClass()],
    ) || PermissionLogic.AND;
    const resourceScope = this.reflector.getAllAndOverride<ResourceScope>(
      RESOURCE_SCOPE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles.length && !requiredPermissions.length) {
      return true;
    }

    const req = context.switchToHttp().getRequest<{ user?: AuthUser }>();
    const user = req.user;
    if (!user) {
      throw new ForbiddenException('Missing user context');
    }

    // SUPER_ADMIN/ADMIN override: if user has SUPER_ADMIN or ADMIN role, grant all access
    if (user.roles.includes('SUPER_ADMIN') || user.roles.includes('ADMIN')) {
      this.logger.debug(`${user.roles.includes('SUPER_ADMIN') ? 'SUPER_ADMIN' : 'ADMIN'} access granted for user ${user.id}`);
      return true;
    }

    // Check roles if required
    if (requiredRoles.length) {
      const hasRole = requiredRoles.some((r) => user.roles.includes(r));
      if (!hasRole) {
        this.logger.debug(
          `User ${user.id} missing required roles: ${requiredRoles.join(', ')}`,
        );
        throw new ForbiddenException('Insufficient role');
      }
    }

    // Check permissions if required
    if (requiredPermissions.length) {
      const hasPermission = this.checkPermissions(
        user,
        requiredPermissions,
        permissionLogic,
        resourceScope,
        req,
      );
      if (!hasPermission) {
        this.logger.debug(
          `User ${user.id} missing required permissions: ${requiredPermissions.join(', ')}`,
        );
        throw new ForbiddenException('Insufficient permissions');
      }
    }

    return true;
  }

  private checkPermissions(
    user: AuthUser,
    requiredPermissions: string[],
    logic: PermissionLogic,
    resourceScope: ResourceScope | undefined,
    request: any,
  ): boolean {
    const userPermissions = user.permissions || [];

    // Handle wildcard permission
    if (userPermissions.includes('*')) {
      return true;
    }

    // Apply resource scope filtering if specified
    let effectivePermissions = userPermissions;
    if (resourceScope) {
      effectivePermissions = this.filterPermissionsByScope(
        userPermissions,
        resourceScope,
        request,
      );
    }

    // Apply permission logic
    switch (logic) {
      case PermissionLogic.AND:
        return requiredPermissions.every((p) =>
          effectivePermissions.includes(p),
        );
      case PermissionLogic.OR:
        return requiredPermissions.some((p) =>
          effectivePermissions.includes(p),
        );
      case PermissionLogic.AT_LEAST_ONE:
        return requiredPermissions.some((p) =>
          effectivePermissions.includes(p),
        );
      default:
        return requiredPermissions.every((p) =>
          effectivePermissions.includes(p),
        );
    }
  }

  private filterPermissionsByScope(
    permissions: string[],
    scope: ResourceScope,
    request: any,
  ): string[] {
    const { type, paramName, userIdField = 'userId' } = scope;
    
    switch (type) {
      case 'OWN':
        // Check if user owns the resource
        if (!paramName) return permissions;
        const resourceUserId = request.params[paramName] || request.body?.[userIdField];
        if (resourceUserId && request.user?.id === resourceUserId) {
          // Return permissions that end with .own or don't have scope
          return permissions.filter(p => {
            const parts = p.split('.');
            const lastPart = parts[parts.length - 1];
            return lastPart === 'own' || !['own', 'all', 'team'].includes(lastPart);
          });
        }
        // Return permissions that end with .all or don't specify scope
        return permissions.filter(p => {
          const parts = p.split('.');
          const lastPart = parts[parts.length - 1];
          return lastPart === 'all' || !['own', 'all', 'team'].includes(lastPart);
        });
        
      case 'TEAM':
        // In a real implementation, you would check if the resource belongs to user's team
        // For now, return permissions that end with .team or don't specify scope
        return permissions.filter(p => {
          const parts = p.split('.');
          const lastPart = parts[parts.length - 1];
          return lastPart === 'team' || !['own', 'all', 'team'].includes(lastPart);
        });
        
      case 'ALL':
      default:
        return permissions;
    }
  }
}