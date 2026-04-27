import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, AuditAction } from '@prisma/client';
import { buildPaginatedResult } from '../../common/dto/pagination.dto';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { AuthUser } from '../../types/express';
import type {
  WarehouseListQueryDto,
  CreateWarehouseDto,
  UpdateWarehouseDto,
} from './dto/warehouse.dto';

@Injectable()
export class WarehousesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async create(
    dto: CreateWarehouseDto,
    user: AuthUser,
    ip?: string,
    userAgent?: string,
  ) {
    try {
      const row = await this.prisma.warehouse.create({
        data: {
          name: dto.name.trim(),
          code: dto.code?.trim() || null,
          type: dto.type || 'MAIN',
          address: dto.address?.trim() || null,
          city: dto.city?.trim() || null,
          state: dto.state?.trim() || null,
          country: dto.country?.trim() || null,
          postalCode: dto.postalCode?.trim() || null,
          phone: dto.phone?.trim() || null,
          email: dto.email?.trim() || null,
          managerId: dto.managerId || null,
          isActive: dto.isActive ?? true,
          capacity: dto.capacity || null,
          notes: dto.notes?.trim() || null,
        },
      });

      await this.audit.log({
        actorUserId: user.id,
        action: AuditAction.COMPANY_CREATED, // TODO: Add warehouse-specific audit action
        entityType: 'Warehouse',
        entityId: row.id,
        metadata: { name: row.name, code: row.code },
        ip,
        userAgent,
      });

      return row;
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException('Name or code already exists');
      }
      throw e;
    }
  }

  async findAll(query: WarehouseListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.WarehouseWhereInput = { deletedAt: null };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
        { address: { contains: query.search, mode: 'insensitive' } },
        { city: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.type) {
      where.type = query.type;
    }

    if (typeof query.isActive === 'boolean') {
      where.isActive = query.isActive;
    }

    // Build orderBy based on sort parameters
    let orderBy: Prisma.WarehouseOrderByWithRelationInput = { name: 'asc' }; // Default
    if (query.sortBy) {
      // Validate sortBy field to prevent SQL injection
      const validSortFields = [
        'name',
        'code',
        'type',
        'city',
        'createdAt',
        'updatedAt',
        'isActive',
      ];
      if (validSortFields.includes(query.sortBy)) {
        // Create orderBy object dynamically
        orderBy = {
          [query.sortBy]: query.sortOrder || 'asc',
        } as Prisma.WarehouseOrderByWithRelationInput;
      }
    }

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.warehouse.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          manager: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              locations: true,
              stockLevels: true,
            },
          },
        },
      }),
      this.prisma.warehouse.count({ where }),
    ]);

    return buildPaginatedResult(rows, total, page, limit);
  }

  async findOne(id: string) {
    const row = await this.prisma.warehouse.findFirst({
      where: { id, deletedAt: null },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        locations: {
          where: { deletedAt: null },
          take: 50,
          orderBy: { name: 'asc' },
        },
        _count: {
          select: {
            locations: true,
            stockLevels: true,
          },
        },
      },
    });

    if (!row) {
      throw new NotFoundException('Warehouse not found');
    }

    return row;
  }

  async update(
    id: string,
    dto: UpdateWarehouseDto,
    user: AuthUser,
    ip?: string,
    userAgent?: string,
  ) {
    const existing = await this.prisma.warehouse.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('Warehouse not found');
    }

    try {
      const updated = await this.prisma.warehouse.update({
        where: { id },
        data: {
          name: dto.name !== undefined ? dto.name.trim() : undefined,
          code: dto.code !== undefined ? dto.code?.trim() || null : undefined,
          type: dto.type,
          address:
            dto.address !== undefined ? dto.address?.trim() || null : undefined,
          city: dto.city !== undefined ? dto.city?.trim() || null : undefined,
          state:
            dto.state !== undefined ? dto.state?.trim() || null : undefined,
          country:
            dto.country !== undefined ? dto.country?.trim() || null : undefined,
          postalCode:
            dto.postalCode !== undefined
              ? dto.postalCode?.trim() || null
              : undefined,
          phone:
            dto.phone !== undefined ? dto.phone?.trim() || null : undefined,
          email:
            dto.email !== undefined ? dto.email?.trim() || null : undefined,
          managerId: dto.managerId !== undefined ? dto.managerId : undefined,
          isActive: dto.isActive,
          capacity: dto.capacity,
          notes:
            dto.notes !== undefined ? dto.notes?.trim() || null : undefined,
        },
      });

      await this.audit.log({
        actorUserId: user.id,
        action: AuditAction.COMPANY_UPDATED, // TODO: Add warehouse-specific audit action
        entityType: 'Warehouse',
        entityId: id,
        metadata: { name: updated.name },
        ip,
        userAgent,
      });

      return updated;
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException('Name or code already exists');
      }
      throw e;
    }
  }

  async remove(id: string, user: AuthUser, ip?: string, userAgent?: string) {
    const existing = await this.prisma.warehouse.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('Warehouse not found');
    }

    // Check if warehouse has locations or stock levels
    const [locationCount, stockLevelCount] = await Promise.all([
      this.prisma.location.count({
        where: { warehouseId: id, deletedAt: null },
      }),
      this.prisma.stockLevel.count({ where: { warehouseId: id } }),
    ]);

    if (locationCount > 0 || stockLevelCount > 0) {
      throw new ConflictException(
        'Cannot delete warehouse with associated locations or stock levels. Archive it instead.',
      );
    }

    const deleted = await this.prisma.warehouse.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.audit.log({
      actorUserId: user.id,
      action: AuditAction.COMPANY_DELETED, // TODO: Add warehouse-specific audit action
      entityType: 'Warehouse',
      entityId: id,
      metadata: { name: deleted.name },
      ip,
      userAgent,
    });

    return deleted;
  }

  async archive(id: string, user: AuthUser, ip?: string, userAgent?: string) {
    const existing = await this.prisma.warehouse.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('Warehouse not found');
    }

    const archived = await this.prisma.warehouse.update({
      where: { id },
      data: { isActive: false },
    });

    await this.audit.log({
      actorUserId: user.id,
      action: AuditAction.COMPANY_UPDATED, // TODO: Add warehouse-specific audit action
      entityType: 'Warehouse',
      entityId: id,
      metadata: { name: archived.name, isActive: false },
      ip,
      userAgent,
    });

    return archived;
  }

  async getStatistics(id: string) {
    const warehouse = await this.prisma.warehouse.findFirst({
      where: { id, deletedAt: null },
      include: {
        _count: {
          select: {
            locations: true,
            stockLevels: true,
          },
        },
      },
    });

    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }

    const stockStats = await this.prisma.stockLevel.aggregate({
      where: { warehouseId: id },
      _sum: {
        quantity: true,
        reserved: true,
      },
      _avg: {
        quantity: true,
      },
    });

    const locationTypes = await this.prisma.location.groupBy({
      by: ['type'],
      where: { warehouseId: id, deletedAt: null },
      _count: {
        _all: true,
      },
    });

    return {
      warehouse,
      statistics: {
        totalLocations: warehouse._count.locations,
        totalStockItems: warehouse._count.stockLevels,
        totalQuantity: stockStats._sum.quantity || 0,
        totalReserved: stockStats._sum.reserved || 0,
        availableQuantity:
          (stockStats._sum.quantity || 0) - (stockStats._sum.reserved || 0),
        averageStockPerItem: stockStats._avg.quantity || 0,
        locationTypes,
      },
    };
  }
}
