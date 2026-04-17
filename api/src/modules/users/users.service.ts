import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { RbacService } from '../rbac/rbac.service';
import { AuditService } from '../audit/audit.service';
import argon2 from 'argon2';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { Prisma, UserStatus, AuditAction } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rbacService: RbacService,
    private readonly auditService: AuditService,
  ) {}

  async create(
    createUserDto: CreateUserDto,
    actorId?: string,
  ): Promise<UserEntity> {
    // Check if email already exists
    const existingUser = await this.prisma.user.findFirst({
      where: { email: createUserDto.email.toLowerCase(), deletedAt: null },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await argon2.hash(createUserDto.password);

    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email.toLowerCase(),
        passwordHash,
        name: createUserDto.name,
        status: createUserDto.status || UserStatus.ACTIVE,
        isEmailVerified: createUserDto.skipEmailVerification || false,
      },
    });

    // Assign roles if provided
    if (createUserDto.roleIds?.length) {
      await this.assignRoles(user.id, createUserDto.roleIds);
    }

    // Audit log
    if (actorId) {
      await this.auditService.log({
        actorUserId: actorId,
        action: AuditAction.USER_CREATED,
        entityType: 'User',
        entityId: user.id,
        metadata: { email: user.email, roles: createUserDto.roleIds },
      });
    }

    return this.mapToEntity(user);
  }

  async findAll(pagination: PaginationQueryDto): Promise<{
    data: UserEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10 } = pagination;
    const search = (pagination as any).search;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          roles: {
            include: {
              role: {
                include: {
                  permissions: {
                    include: {
                      permission: true,
                    },
                    where: { permission: { deletedAt: null } },
                  },
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
      }),
      this.prisma.user.count({ where }),
    ]);

    const userEntities = users.map((user) => {
      const roleNames = user.roles.map(ur => ur.role.name);
      const permissionKeys = new Set<string>();

      // Add role-based permissions
      for (const ur of user.roles) {
        for (const rp of ur.role.permissions) {
          permissionKeys.add(rp.permission.key);
        }
      }

      // Add direct permissions
      for (const up of user.directPermissions) {
        permissionKeys.add(up.permission.key);
      }

      return this.mapToEntity(user, roleNames, [...permissionKeys]);
    });

    return {
      data: userEntities,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<UserEntity> {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                  where: { permission: { deletedAt: null } },
                },
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
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const roleNames = user.roles.map(ur => ur.role.name);
    const permissionKeys = new Set<string>();

    // Add role-based permissions
    for (const ur of user.roles) {
      for (const rp of ur.role.permissions) {
        permissionKeys.add(rp.permission.key);
      }
    }

    // Add direct permissions
    for (const up of user.directPermissions) {
      permissionKeys.add(up.permission.key);
    }

    return this.mapToEntity(user, roleNames, [...permissionKeys]);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findFirst({
      where: { email: email.toLowerCase(), deletedAt: null },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                  where: { permission: { deletedAt: null } },
                },
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

    if (!user) return null;

    const roleNames = user.roles.map(ur => ur.role.name);
    const permissionKeys = new Set<string>();

    // Add role-based permissions
    for (const ur of user.roles) {
      for (const rp of ur.role.permissions) {
        permissionKeys.add(rp.permission.key);
      }
    }

    // Add direct permissions
    for (const up of user.directPermissions) {
      permissionKeys.add(up.permission.key);
    }

    return this.mapToEntity(user, roleNames, [...permissionKeys]);
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    actorId?: string,
  ): Promise<UserEntity> {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check email uniqueness if updating email
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existing = await this.prisma.user.findFirst({
        where: {
          email: updateUserDto.email.toLowerCase(),
          deletedAt: null,
          NOT: { id },
        },
      });
      if (existing) {
        throw new ConflictException('Email already in use');
      }
    }

    const updateData: Prisma.UserUpdateInput = {};

    if (updateUserDto.email) {
      updateData.email = updateUserDto.email.toLowerCase();
    }
    if (updateUserDto.name !== undefined) {
      updateData.name = updateUserDto.name;
    }
    if (updateUserDto.status) {
      updateData.status = updateUserDto.status;
    }
    if (updateUserDto.password) {
      updateData.passwordHash = await argon2.hash(updateUserDto.password);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    // Update roles if provided
    if (updateUserDto.roleIds !== undefined) {
      await this.setRoles(id, updateUserDto.roleIds);
    }

    // Update direct permissions if provided
    if (updateUserDto.permissionIds !== undefined) {
      await this.setDirectPermissions(id, updateUserDto.permissionIds);
    }

    // Audit log
    if (actorId) {
      await this.prisma.auditLog.create({
        data: {
          actorType: 'USER',
          actorUserId: actorId,
          action: 'USER_UPDATED',
          entityType: 'User',
          entityId: id,
          metadata: { updatedFields: Object.keys(updateUserDto) },
        },
      });
    }

    const rbac = await this.rbacService.getUserRbac(id);
    return this.mapToEntity(updatedUser, rbac.roleNames, rbac.permissionKeys);
  }

  async remove(id: string, actorId?: string): Promise<UserEntity> {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Soft delete
    const deletedUser = await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Audit log
    if (actorId) {
      await this.prisma.auditLog.create({
        data: {
          actorType: 'USER',
          actorUserId: actorId,
          action: 'USER_DELETED',
          entityType: 'User',
          entityId: id,
          metadata: { email: user.email },
        },
      });
    }

    const rbac = await this.rbacService.getUserRbac(id);
    return this.mapToEntity(deletedUser, rbac.roleNames, rbac.permissionKeys);
  }

  async assignRoles(userId: string, roleIds: string[]): Promise<void> {
    // Validate roles exist and are not deleted
    const roles = await this.prisma.role.findMany({
      where: {
        id: { in: roleIds },
        deletedAt: null,
      },
    });

    if (roles.length !== roleIds.length) {
      throw new BadRequestException('One or more roles not found');
    }

    // Remove existing roles and add new ones
    await this.prisma.userRole.deleteMany({
      where: { userId },
    });

    if (roleIds.length > 0) {
      await this.prisma.userRole.createMany({
        data: roleIds.map((roleId) => ({
          userId,
          roleId,
        })),
      });
    }
  }

  async setRoles(userId: string, roleIds: string[]): Promise<void> {
    await this.assignRoles(userId, roleIds);
  }

  async assignDirectPermission(
    userId: string,
    permissionId: string,
    priority = 0,
    expiresAt?: Date,
  ): Promise<void> {
    await this.prisma.userPermission.upsert({
      where: {
        userId_permissionId: {
          userId,
          permissionId,
        },
      },
      create: {
        userId,
        permissionId,
        priority,
        expiresAt,
      },
      update: {
        priority,
        expiresAt,
      },
    });
  }

  async setDirectPermissions(
    userId: string,
    permissionIds: string[],
  ): Promise<void> {
    // Remove existing direct permissions
    await this.prisma.userPermission.deleteMany({
      where: { userId },
    });

    // Add new ones
    if (permissionIds.length > 0) {
      await this.prisma.userPermission.createMany({
        data: permissionIds.map((permissionId) => ({
          userId,
          permissionId,
          priority: 0,
        })),
      });
    }
  }

  private mapToEntity(
    user: any,
    roles?: string[],
    permissions?: string[],
  ): UserEntity {
    const roleNames = roles || user.roles?.map((ur: any) => ur.role.name) || [];
    const permissionKeys = permissions || [];

    return new UserEntity({
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      googleSubject: user.googleSubject,
      name: user.name,
      status: user.status,
      isEmailVerified: user.isEmailVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
      roles: roleNames,
      permissions: permissionKeys,
    });
  }
}
