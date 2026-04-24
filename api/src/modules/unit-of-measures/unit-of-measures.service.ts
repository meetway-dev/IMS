import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { slugify } from '../../common/utils/slug';
import { buildPaginatedResult } from '../../common/dto/pagination.dto';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { AuthUser } from '../../types/express';
import type {
  UnitOfMeasureListQueryDto,
  CreateUnitOfMeasureDto,
  UpdateUnitOfMeasureDto,
} from './dto/unit-of-measure.dto';

@Injectable()
export class UnitOfMeasuresService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async create(
    dto: CreateUnitOfMeasureDto,
    user: AuthUser,
    ip?: string,
    userAgent?: string,
  ) {
    const slug = (dto.slug?.trim() || slugify(dto.name)).toLowerCase();

    try {
      const row = await this.prisma.unitOfMeasure.create({
        data: {
          name: dto.name.trim(),
          slug,
          symbol: dto.symbol?.trim() || null,
          description: dto.description ? dto.description.trim() : null,
          isActive: dto.isActive ?? true,
        },
      });

      await this.audit.log({
        actorUserId: user.id,
        action: 'UNIT_OF_MEASURE_CREATED',
        entityType: 'UnitOfMeasure',
        entityId: row.id,
        metadata: { slug: row.slug },
        ip,
        userAgent,
      });

      return row;
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        const target = (e.meta?.target as string[])?.[0] ?? 'field';
        throw new ConflictException(
          `Unit of measure with this ${target} already exists`,
        );
      }
      throw e;
    }
  }

  async findAll(query: UnitOfMeasureListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.UnitOfMeasureWhereInput = { deletedAt: null };

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { slug: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.unitOfMeasure.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
        include: {
          _count: {
            select: { products: { where: { deletedAt: null } } },
          },
        },
      }),
      this.prisma.unitOfMeasure.count({ where }),
    ]);

    return buildPaginatedResult(
      rows.map((r) => ({
        ...r,
        productCount: r._count.products,
        _count: undefined,
      })),
      total,
      page,
      limit,
    );
  }

  async findAllActive() {
    return this.prisma.unitOfMeasure.findMany({
      where: { deletedAt: null, isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true, symbol: true },
    });
  }

  async findOne(id: string) {
    const row = await this.prisma.unitOfMeasure.findFirst({
      where: { id, deletedAt: null },
      include: {
        _count: {
          select: { products: { where: { deletedAt: null } } },
        },
      },
    });
    if (!row) throw new NotFoundException('Unit of measure not found');
    const { _count, ...rest } = row;
    return { ...rest, productCount: _count.products };
  }

  async update(
    id: string,
    dto: UpdateUnitOfMeasureDto,
    user: AuthUser,
    ip?: string,
    userAgent?: string,
  ) {
    await this.ensureExists(id);

    const slug =
      dto.slug !== undefined ? dto.slug.trim().toLowerCase() : undefined;

    try {
      const updated = await this.prisma.unitOfMeasure.update({
        where: { id },
        data: {
          name: dto.name?.trim(),
          slug,
          symbol:
            dto.symbol !== undefined
              ? dto.symbol
                ? dto.symbol.trim()
                : null
              : undefined,
          description:
            dto.description !== undefined
              ? dto.description
                ? dto.description.trim()
                : null
              : undefined,
          isActive: dto.isActive,
        },
      });

      await this.audit.log({
        actorUserId: user.id,
        action: 'UNIT_OF_MEASURE_UPDATED',
        entityType: 'UnitOfMeasure',
        entityId: id,
        metadata: { fields: Object.keys(dto) },
        ip,
        userAgent,
      });

      return updated;
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        const target = (e.meta?.target as string[])?.[0] ?? 'field';
        throw new ConflictException(
          `Unit of measure with this ${target} already exists`,
        );
      }
      throw e;
    }
  }

  async remove(id: string, user: AuthUser, ip?: string, userAgent?: string) {
    await this.ensureExists(id);

    // Check if any active products reference this unit
    const productCount = await this.prisma.product.count({
      where: { unitId: id, deletedAt: null },
    });
    if (productCount > 0) {
      throw new ConflictException(
        `Cannot delete: ${productCount} product(s) reference this unit`,
      );
    }

    const updated = await this.prisma.unitOfMeasure.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.audit.log({
      actorUserId: user.id,
      action: 'UNIT_OF_MEASURE_DELETED',
      entityType: 'UnitOfMeasure',
      entityId: id,
      ip,
      userAgent,
    });

    return updated;
  }

  private async ensureExists(id: string) {
    const row = await this.prisma.unitOfMeasure.findFirst({
      where: { id, deletedAt: null },
    });
    if (!row) throw new NotFoundException('Unit of measure not found');
  }
}
