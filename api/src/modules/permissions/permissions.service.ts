import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionEntity } from './entities/permission.entity';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import {
  Prisma,
  AuditAction,
  PermissionType,
  PermissionEffect,
} from '@prisma/client';

@Injectable()
export class PermissionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(
    createPermissionDto: CreatePermissionDto,
    actorId?: string,
  ): Promise<PermissionEntity> {
    // Check if permission key already exists
    const existingPermission = await this.prisma.permission.findFirst({
      where: { key: createPermissionDto.key, deletedAt: null },
    });
    if (existingPermission) {
      throw new ConflictException('Permission with this key already exists');
    }

    const permission = await this.prisma.permission.create({
      data: {
        key: createPermissionDto.key,
        name: createPermissionDto.name,
        description: createPermissionDto.description,
        type: createPermissionDto.type || PermissionType.CRUD,
        effect: createPermissionDto.effect || PermissionEffect.ALLOW,
        module: createPermissionDto.module,
        resource: createPermissionDto.resource,
        action: createPermissionDto.action,
        scope: createPermissionDto.scope,
        isSystem: createPermissionDto.isSystem || false,
      },
    });

    // Audit log
    if (actorId) {
      await this.auditService.log({
        actorUserId: actorId,
        action: AuditAction.PERMISSION_CREATED,
        entityType: 'Permission',
        entityId: permission.id,
        metadata: createPermissionDto,
      });
    }

    return this.mapToEntity(permission);
  }

  async findAll(pagination: PaginationQueryDto): Promise<{
    data: PermissionEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10 } = pagination;
    const search = (pagination as any).search;
    const skip = (page - 1) * limit;

    const where: Prisma.PermissionWhereInput = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { key: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { module: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [permissions, total] = await Promise.all([
      this.prisma.permission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { roles: true, userPermissions: true },
          },
        },
      }),
      this.prisma.permission.count({ where }),
    ]);

    return {
      data: permissions.map((permission) => this.mapToEntity(permission)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<PermissionEntity> {
    const permission = await this.prisma.permission.findFirst({
      where: { id, deletedAt: null },
      include: {
        _count: {
          select: { roles: true, userPermissions: true },
        },
      },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }

    return this.mapToEntity(permission);
  }

  async findByModule(module: string): Promise<PermissionEntity[]> {
    const permissions = await this.prisma.permission.findMany({
      where: { module, deletedAt: null },
      include: {
        _count: {
          select: { roles: true, userPermissions: true },
        },
      },
      orderBy: { key: 'asc' },
    });

    return permissions.map((permission) => this.mapToEntity(permission));
  }

  async update(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
    actorId?: string,
  ): Promise<PermissionEntity> {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
    });

    if (!permission || permission.deletedAt) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }

    // Prevent updating system permissions
    if (permission.isSystem && actorId) {
      // Check if actor is SUPER_ADMIN
      const actorRbac = await this.prisma.user.findUnique({
        where: { id: actorId },
        include: {
          roles: {
            include: { role: true },
          },
        },
      });

      const isSuperAdmin = actorRbac?.roles.some(
        (ur) => ur.role.name === 'SUPER_ADMIN',
      );
      if (!isSuperAdmin) {
        throw new BadRequestException('Cannot modify system permissions');
      }
    }

    const updatedPermission = await this.prisma.permission.update({
      where: { id },
      data: {
        name: updatePermissionDto.name,
        description: updatePermissionDto.description,
        type: updatePermissionDto.type,
        effect: updatePermissionDto.effect,
        module: updatePermissionDto.module,
        resource: updatePermissionDto.resource,
        action: updatePermissionDto.action,
        scope: updatePermissionDto.scope,
      },
    });

    // Audit log
    if (actorId) {
      await this.auditService.log({
        actorUserId: actorId,
        action: AuditAction.PERMISSION_UPDATED,
        entityType: 'Permission',
        entityId: id,
        metadata: updatePermissionDto,
      });
    }

    return this.mapToEntity(updatedPermission);
  }

  async remove(id: string, actorId?: string): Promise<void> {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
      include: { _count: { select: { roles: true, userPermissions: true } } },
    });

    if (!permission || permission.deletedAt) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }

    // Prevent deleting system permissions
    if (permission.isSystem) {
      throw new BadRequestException('Cannot delete system permissions');
    }

    // Check if permission is assigned to roles or users
    if (permission._count.roles > 0 || permission._count.userPermissions > 0) {
      throw new BadRequestException(
        'Cannot delete permission that is assigned to roles or users',
      );
    }

    await this.prisma.permission.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Audit log
    if (actorId) {
      await this.auditService.log({
        actorUserId: actorId,
        action: AuditAction.PERMISSION_DELETED,
        entityType: 'Permission',
        entityId: id,
        metadata: { key: permission.key },
      });
    }
  }

  private mapToEntity(permission: any): PermissionEntity {
    return {
      id: permission.id,
      key: permission.key,
      name: permission.name,
      description: permission.description,
      type: permission.type,
      effect: permission.effect,
      module: permission.module,
      resource: permission.resource,
      action: permission.action,
      scope: permission.scope,
      isSystem: permission.isSystem,
      version: permission.version,
      roleCount: permission._count?.roles || 0,
      userCount: permission._count?.userPermissions || 0,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt,
    };
  }
}
