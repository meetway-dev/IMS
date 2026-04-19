import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import type { RequestRbac, PermissionCheckOptions, BulkPermissionAssignment, PermissionValidationResult } from './rbac.types';
import { PermissionEffect, PermissionType } from '@prisma/client';

@Injectable()
export class RbacService implements OnModuleInit {
  private readonly logger = new Logger(RbacService.name);
  private permissionCache = new Map<string, { permissions: string[]; roles: string[]; expiresAt: Date }>();

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    // Initialize cache with system roles and permissions
    await this.warmupCache();
  }

  /**
   * Get comprehensive RBAC information for a user
   * Includes role hierarchy resolution and permission caching
   */
  async getUserRbac(userId: string, useCache = true): Promise<RequestRbac> {
    // Check cache first
    if (useCache) {
      const cached = this.permissionCache.get(userId);
      if (cached && cached.expiresAt > new Date()) {
        return {
          roleNames: cached.roles,
          permissionKeys: cached.permissions,
        };
      }
    }

    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null, status: 'ACTIVE' },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true },
                  where: { permission: { deletedAt: null } },
                },
                parentRole: true,
              },
              where: { deletedAt: null },
            },
          },
        },
        directPermissions: {
          include: {
            permission: true,
          },
          where: {
            permission: { deletedAt: null },
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
          },
          orderBy: { priority: 'desc' },
        },
      },
    });

    if (!user) {
      return { roleNames: [], permissionKeys: [] };
    }

    const roleNames: string[] = [];
    const permissionSet = new Set<string>();

    // Process role hierarchy
    for (const userRole of user.roles) {
      if (!userRole.role) continue;
      
      const roleWithHierarchy = await this.getRoleWithHierarchy(userRole.role.id);
      roleNames.push(roleWithHierarchy.name);
      
      // Add all permissions from role hierarchy
      for (const permission of roleWithHierarchy.permissions) {
        if (permission.effect === PermissionEffect.ALLOW) {
          permissionSet.add(permission.key);
        } else if (permission.effect === PermissionEffect.DENY) {
          permissionSet.delete(permission.key);
        }
      }
    }

    // Process direct permissions (override role permissions)
    for (const userPermission of user.directPermissions) {
      if (userPermission.effect === PermissionEffect.ALLOW) {
        permissionSet.add(userPermission.permission.key);
      } else if (userPermission.effect === PermissionEffect.DENY) {
        permissionSet.delete(userPermission.permission.key);
      }
    }

    // SUPER_ADMIN/ADMIN override
    if (roleNames.includes('SUPER_ADMIN') || roleNames.includes('ADMIN')) {
      const result = { roleNames, permissionKeys: ['*'] };
      this.cacheUserPermissions(userId, result);
      return result;
    }

    const result = {
      roleNames,
      permissionKeys: Array.from(permissionSet),
    };

    // Cache the result
    this.cacheUserPermissions(userId, result);

    return result;
  }

  /**
   * Get role with all inherited permissions from hierarchy
   */
  private async getRoleWithHierarchy(roleId: string): Promise<{
    id: string;
    name: string;
    permissions: Array<{ key: string; effect: PermissionEffect }>;
  }> {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: {
          include: { permission: true },
          where: { permission: { deletedAt: null } },
        },
        parentRole: true,
      },
    });

    if (!role) {
      return { id: roleId, name: '', permissions: [] };
    }

    const permissions = role.permissions.map(rp => ({
      key: rp.permission.key,
      effect: rp.permission.effect,
    }));

    // Recursively add parent role permissions
    if (role.parentRole) {
      const parentPermissions = await this.getRoleWithHierarchy(role.parentRole.id);
      permissions.push(...parentPermissions.permissions);
    }

    return {
      id: role.id,
      name: role.name,
      permissions,
    };
  }

  /**
   * Check if user has specific permission with advanced options
   */
  async hasPermission(
    userId: string,
    permissionKey: string,
    options?: Omit<PermissionCheckOptions, 'userId' | 'permissions'>,
  ): Promise<boolean> {
    const rbac = await this.getUserRbac(userId);
    
    if (rbac.permissionKeys.includes('*')) {
      return true;
    }

    // Apply resource scope filtering if needed
    let effectivePermissions = rbac.permissionKeys;
    if (options?.resourceScope && options?.request) {
      effectivePermissions = this.filterPermissionsByScope(
        effectivePermissions,
        options.resourceScope,
        options.request,
      );
    }

    return effectivePermissions.includes(permissionKey);
  }

  /**
   * Check if user has any of the specified permissions
   */
  async hasAnyPermission(
    userId: string,
    permissionKeys: string[],
    options?: Omit<PermissionCheckOptions, 'userId' | 'permissions'>,
  ): Promise<boolean> {
    const rbac = await this.getUserRbac(userId);
    
    if (rbac.permissionKeys.includes('*')) {
      return true;
    }

    let effectivePermissions = rbac.permissionKeys;
    if (options?.resourceScope && options?.request) {
      effectivePermissions = this.filterPermissionsByScope(
        effectivePermissions,
        options.resourceScope,
        options.request,
      );
    }

    return permissionKeys.some(key => effectivePermissions.includes(key));
  }

  /**
   * Check if user has all of the specified permissions
   */
  async hasAllPermissions(
    userId: string,
    permissionKeys: string[],
    options?: Omit<PermissionCheckOptions, 'userId' | 'permissions'>,
  ): Promise<boolean> {
    const rbac = await this.getUserRbac(userId);
    
    if (rbac.permissionKeys.includes('*')) {
      return true;
    }

    let effectivePermissions = rbac.permissionKeys;
    if (options?.resourceScope && options?.request) {
      effectivePermissions = this.filterPermissionsByScope(
        effectivePermissions,
        options.resourceScope,
        options.request,
      );
    }

    return permissionKeys.every(key => effectivePermissions.includes(key));
  }

  /**
   * Get user roles with hierarchy
   */
  async getUserRoles(userId: string): Promise<string[]> {
    const rbac = await this.getUserRbac(userId);
    return rbac.roleNames;
  }

  /**
   * Check if user has specific role
   */
  async hasRole(userId: string, roleName: string): Promise<boolean> {
    const roles = await this.getUserRoles(userId);
    return roles.includes(roleName);
  }

  /**
   * Check if user has any of the specified roles
   */
  async hasAnyRole(userId: string, roleNames: string[]): Promise<boolean> {
    const roles = await this.getUserRoles(userId);
    return roleNames.some(role => roles.includes(role));
  }

  /**
   * Assign multiple permissions to multiple users in bulk
   */
  async bulkAssignPermissions(
    assignment: BulkPermissionAssignment,
    actorId?: string,
  ): Promise<{ success: number; failed: number }> {
    const { userIds, permissionIds, expiresAt, reason } = assignment;
    
    let success = 0;
    const failed: Array<{ userId: string; permissionId: string; error: string }> = [];

    for (const userId of userIds) {
      for (const permissionId of permissionIds) {
        try {
          await this.prisma.userPermission.create({
            data: {
              userId,
              permissionId,
              expiresAt,
              reason,
              assignedByUserId: actorId,
            },
          });
          success++;
        } catch (error: any) {
          failed.push({
            userId,
            permissionId,
            error: error.message,
          });
        }
      }
    }

    // Invalidate cache for affected users
    userIds.forEach(userId => this.permissionCache.delete(userId));

    return { success, failed: failed.length };
  }

  /**
   * Clone a role with all its permissions
   */
  async cloneRole(
    sourceRoleId: string,
    newRoleName: string,
    description?: string,
    actorId?: string,
  ): Promise<string> {
    const sourceRole = await this.prisma.role.findUnique({
      where: { id: sourceRoleId },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });

    if (!sourceRole) {
      throw new Error(`Role ${sourceRoleId} not found`);
    }

    // Create new role
    const newRole = await this.prisma.role.create({
      data: {
        name: newRoleName,
        description: description || `Cloned from ${sourceRole.name}`,
        isSystem: false,
        isDefault: false,
        priority: sourceRole.priority,
        parentRoleId: sourceRole.parentRoleId,
        createdByUserId: actorId,
      },
    });

    // Copy permissions
    const rolePermissionsData = sourceRole.permissions.map(rp => ({
      roleId: newRole.id,
      permissionId: rp.permissionId,
      assignedByUserId: actorId,
    }));

    if (rolePermissionsData.length > 0) {
      await this.prisma.rolePermission.createMany({
        data: rolePermissionsData,
      });
    }

    // Audit log
    if (actorId) {
      await this.prisma.auditLog.create({
        data: {
          actorType: 'USER',
          actorUserId: actorId,
          action: 'ROLE_CLONED',
          entityType: 'Role',
          entityId: newRole.id,
          metadata: {
            sourceRoleId,
            sourceRoleName: sourceRole.name,
            newRoleName,
            permissionsCopied: rolePermissionsData.length,
          },
        },
      });
    }

    return newRole.id;
  }

  /**
   * Validate permission format and existence
   */
  async validatePermission(
    permissionKey: string,
  ): Promise<PermissionValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check format: module.resource.action.scope
    const parts = permissionKey.split('.');
    
    if (parts.length < 2) {
      errors.push('Permission key must have at least module and action (e.g., "users.create")');
    }

    if (parts.length > 4) {
      warnings.push('Permission key has more than 4 parts, consider simplifying');
    }

    // Check if permission exists in database
    const existingPermission = await this.prisma.permission.findUnique({
      where: { key: permissionKey },
    });

    if (!existingPermission) {
      warnings.push(`Permission "${permissionKey}" does not exist in database`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Get all permissions grouped by module
   */
  async getPermissionsByModule(): Promise<Record<string, Array<{
    id: string;
    key: string;
    name: string;
    description: string | null;
    type: PermissionType;
    effect: PermissionEffect;
  }>>> {
    const permissions = await this.prisma.permission.findMany({
      where: { deletedAt: null },
      orderBy: [{ module: 'asc' }, { resource: 'asc' }, { action: 'asc' }],
    });

    const grouped: Record<string, any[]> = {};
    
    for (const permission of permissions) {
      if (!grouped[permission.module]) {
        grouped[permission.module] = [];
      }
      
      grouped[permission.module].push({
        id: permission.id,
        key: permission.key,
        name: permission.name,
        description: permission.description,
        type: permission.type,
        effect: permission.effect,
      });
    }

    return grouped;
  }

  /**
   * Invalidate permission cache for a user
   */
  invalidateUserCache(userId: string): void {
    this.permissionCache.delete(userId);
  }

  /**
   * Clear entire permission cache
   */
  clearCache(): void {
    this.permissionCache.clear();
  }

  /**
   * Warm up cache with system data
   */
  private async warmupCache(): Promise<void> {
    try {
      // Cache system roles and their permissions
      const systemRoles = await this.prisma.role.findMany({
        where: { isSystem: true, deletedAt: null },
        include: {
          permissions: {
            include: { permission: true },
            where: { permission: { deletedAt: null } },
          },
        },
      });

      for (const role of systemRoles) {
        const permissions = role.permissions.map(rp => rp.permission.key);
        this.logger.debug(`Cached system role: ${role.name} with ${permissions.length} permissions`);
      }
    } catch (error) {
      this.logger.error('Failed to warm up cache', error);
    }
  }

  /**
   * Cache user permissions
   */
  private cacheUserPermissions(userId: string, rbac: RequestRbac): void {
    // Cache for 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    this.permissionCache.set(userId, {
      permissions: rbac.permissionKeys,
      roles: rbac.roleNames,
      expiresAt,
    });
  }

  /**
   * Filter permissions by resource scope
   */
  private filterPermissionsByScope(
    permissions: string[],
    scope: { type: 'OWN' | 'TEAM' | 'ALL'; paramName?: string; userIdField?: string },
    request: any,
  ): string[] {
    const { type, paramName = 'id', userIdField = 'userId' } = scope;
    
    switch (type) {
      case 'OWN':
        const resourceUserId = request.params[paramName] || request.body[userIdField];
        if (resourceUserId && request.user?.id === resourceUserId) {
          return permissions.filter(p => {
            const parts = p.split('.');
            const lastPart = parts[parts.length - 1];
            return lastPart === 'own' || !['own', 'all', 'team'].includes(lastPart);
          });
        }
        return permissions.filter(p => {
          const parts = p.split('.');
          const lastPart = parts[parts.length - 1];
          return lastPart === 'all' || !['own', 'all', 'team'].includes(lastPart);
        });
        
      case 'TEAM':
        // In a real implementation, check if resource belongs to user's team
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