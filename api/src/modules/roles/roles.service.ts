import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { RoleEntity } from './entities/role.entity';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { Prisma, AuditAction } from '@prisma/client';

@Injectable()
export class RolesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(createRoleDto: CreateRoleDto, actorId?: string): Promise<RoleEntity> {
    // Check if role name already exists
    const existingRole = await this.prisma.role.findFirst({
      where: { name: createRoleDto.name, deletedAt: null },
    });
    if (existingRole) {
      throw new ConflictException('Role with this name already exists');
    }

    // Validate parent role if provided
    if (createRoleDto.parentRoleId) {
      const parentRole = await this.prisma.role.findUnique({
        where: { id: createRoleDto.parentRoleId },
      });
      if (!parentRole || parentRole.deletedAt) {
        throw new BadRequestException('Parent role not found');
      }
      // Prevent circular hierarchy
      if (await this.wouldCreateCircularHierarchy(createRoleDto.parentRoleId, createRoleDto.parentRoleId)) {
        throw new BadRequestException('Circular role hierarchy not allowed');
      }
    }

    const role = await this.prisma.role.create({
      data: {
        name: createRoleDto.name,
        description: createRoleDto.description,
        isSystem: createRoleDto.isSystem || false,
        isDefault: createRoleDto.isDefault || false,
        priority: createRoleDto.priority || 0,
        parentRoleId: createRoleDto.parentRoleId,
        createdByUserId: actorId,
      },
      include: {
        permissions: {
          include: { permission: true },
        },
        parentRole: true,
        childRoles: true,
      },
    });

    // Assign permissions if provided
    if (createRoleDto.permissionIds?.length) {
      await this.assignPermissions(role.id, createRoleDto.permissionIds, actorId);
    }

    // Audit log
    if (actorId) {
      await this.auditService.log({
        actorUserId: actorId,
        action: AuditAction.ROLE_CREATED,
        entityType: 'Role',
        entityId: role.id,
        metadata: {
          name: role.name,
          permissions: createRoleDto.permissionIds,
          parentRoleId: createRoleDto.parentRoleId,
        },
      });
    }

    return this.mapToEntity(role);
  }

  async findAll(pagination: PaginationQueryDto): Promise<{
    data: RoleEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10 } = pagination;
    const search = (pagination as any).search;
    const skip = (page - 1) * limit;

    const where: Prisma.RoleWhereInput = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [roles, total] = await Promise.all([
      this.prisma.role.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          permissions: {
            include: { permission: true },
          },
          parentRole: true,
          _count: {
            select: { users: true },
          },
        },
      }),
      this.prisma.role.count({ where }),
    ]);

    return {
      data: roles.map(role => this.mapToEntity(role)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<RoleEntity> {
    const role = await this.prisma.role.findFirst({
      where: { id, deletedAt: null },
      include: {
        permissions: {
          include: { permission: true },
        },
        parentRole: true,
        childRoles: true,
        _count: {
          select: { users: true },
        },
      },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return this.mapToEntity(role);
  }

  async update(id: string, updateRoleDto: UpdateRoleDto, actorId?: string): Promise<RoleEntity> {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!role || role.deletedAt) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    // Prevent updating system roles
    if (role.isSystem && actorId) {
      // Check if actor is SUPER_ADMIN
      const actorRbac = await this.prisma.user.findUnique({
        where: { id: actorId },
        include: {
          roles: {
            include: { role: true },
          },
        },
      });

      const isSuperAdmin = actorRbac?.roles.some(ur => ur.role.name === 'SUPER_ADMIN');
      if (!isSuperAdmin) {
        throw new ForbiddenException('Cannot modify system roles');
      }
    }

    // Validate parent role if provided
    if (updateRoleDto.parentRoleId) {
      const parentRole = await this.prisma.role.findUnique({
        where: { id: updateRoleDto.parentRoleId },
      });
      if (!parentRole || parentRole.deletedAt) {
        throw new BadRequestException('Parent role not found');
      }
      if (await this.wouldCreateCircularHierarchy(id, updateRoleDto.parentRoleId)) {
        throw new BadRequestException('Circular role hierarchy not allowed');
      }
    }

    const updatedRole = await this.prisma.role.update({
      where: { id },
      data: {
        name: updateRoleDto.name,
        description: updateRoleDto.description,
        priority: updateRoleDto.priority,
        parentRoleId: updateRoleDto.parentRoleId,
      },
      include: {
        permissions: {
          include: { permission: true },
        },
        parentRole: true,
        childRoles: true,
      },
    });

    // Audit log
    if (actorId) {
      await this.auditService.log({
        actorUserId: actorId,
        action: AuditAction.ROLE_UPDATED,
        entityType: 'Role',
        entityId: id,
        metadata: updateRoleDto,
      });
    }

    return this.mapToEntity(updatedRole);
  }

  async remove(id: string, actorId?: string): Promise<void> {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });

    if (!role || role.deletedAt) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    // Prevent deleting system roles
    if (role.isSystem) {
      throw new ForbiddenException('Cannot delete system roles');
    }

    // Check if role has users assigned
    if (role._count.users > 0) {
      throw new BadRequestException('Cannot delete role that has users assigned');
    }

    await this.prisma.role.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Audit log
    if (actorId) {
      await this.auditService.log({
        actorUserId: actorId,
        action: AuditAction.ROLE_DELETED,
        entityType: 'Role',
        entityId: id,
        metadata: { name: role.name },
      });
    }
  }

  async assignPermissions(roleId: string, permissionIds: string[], actorId?: string): Promise<void> {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role || role.deletedAt) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    // Validate permissions exist
    const permissions = await this.prisma.permission.findMany({
      where: { id: { in: permissionIds }, deletedAt: null },
    });

    if (permissions.length !== permissionIds.length) {
      throw new BadRequestException('Some permissions not found');
    }

    // Remove existing permissions
    await this.prisma.rolePermission.deleteMany({
      where: { roleId },
    });

    // Add new permissions
    const rolePermissions = permissionIds.map(permissionId => ({
      roleId,
      permissionId,
      assignedByUserId: actorId,
    }));

    await this.prisma.rolePermission.createMany({
      data: rolePermissions,
    });

    // Audit log
    if (actorId) {
      await this.auditService.log({
        actorUserId: actorId,
        action: AuditAction.ROLE_PERMISSION_ASSIGNED,
        entityType: 'RolePermission',
        entityId: roleId,
        metadata: { permissionIds },
      });
    }
  }

  async cloneRole(id: string, newName: string, actorId?: string): Promise<RoleEntity> {
    const originalRole = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });

    if (!originalRole || originalRole.deletedAt) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    // Check if new name already exists
    const existingRole = await this.prisma.role.findFirst({
      where: { name: newName, deletedAt: null },
    });
    if (existingRole) {
      throw new ConflictException('Role with this name already exists');
    }

    const clonedRole = await this.prisma.role.create({
      data: {
        name: newName,
        description: `Cloned from ${originalRole.name}`,
        isSystem: false,
        isDefault: false,
        priority: originalRole.priority,
        createdByUserId: actorId,
      },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });

    // Copy permissions
    if (originalRole.permissions.length > 0) {
      const permissionIds = originalRole.permissions.map(rp => rp.permissionId);
      await this.assignPermissions(clonedRole.id, permissionIds, actorId);
    }

    // Audit log
    if (actorId) {
      await this.auditService.log({
        actorUserId: actorId,
        action: AuditAction.ROLE_CLONED,
        entityType: 'Role',
        entityId: clonedRole.id,
        metadata: { originalRoleId: id, newName },
      });
    }

    return this.mapToEntity(clonedRole);
  }

  private async wouldCreateCircularHierarchy(roleId: string, potentialParentId: string): Promise<boolean> {
    let currentId = potentialParentId;
    const visited = new Set<string>();

    while (currentId) {
      if (visited.has(currentId)) {
        return true; // Circular reference detected
      }
      if (currentId === roleId) {
        return true; // Would create a cycle
      }

      visited.add(currentId);
      const parent = await this.prisma.role.findUnique({
        where: { id: currentId },
        select: { parentRoleId: true },
      });

      currentId = parent?.parentRoleId || '';
    }

    return false;
  }

  private mapToEntity(role: any): RoleEntity {
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      isDefault: role.isDefault,
      priority: role.priority,
      parentRoleId: role.parentRoleId,
      parentRole: role.parentRole,
      childRoles: role.childRoles || [],
      permissions: role.permissions?.map((rp: any) => rp.permission) || [],
      userCount: role._count?.users || 0,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }
}