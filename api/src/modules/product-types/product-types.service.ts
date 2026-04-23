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
  ProductTypeListQueryDto,
  CreateProductTypeDto,
  UpdateProductTypeDto,
} from './dto/product-type.dto';

@Injectable()
export class ProductTypesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async create(
    dto: CreateProductTypeDto,
    user: AuthUser,
    ip?: string,
    userAgent?: string,
  ) {
    const slug = (dto.slug?.trim() || slugify(dto.name)).toLowerCase();

    try {
      const row = await this.prisma.productType.create({
        data: {
          name: dto.name.trim(),
          slug,
          description: dto.description ? dto.description.trim() : null,
          isActive: dto.isActive ?? true,
        },
      });

      await this.audit.log({
        actorUserId: user.id,
        action: 'PRODUCT_TYPE_CREATED',
        entityType: 'ProductType',
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
          `Product type with this ${target} already exists`,
        );
      }
      throw e;
    }
  }

  async findAll(query: ProductTypeListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductTypeWhereInput = { deletedAt: null };

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.q) {
      where.OR = [
        { name: { contains: query.q, mode: 'insensitive' } },
        { slug: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.productType.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
        include: { _count: { select: { products: { where: { deletedAt: null } } } } },
      }),
      this.prisma.productType.count({ where }),
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
    try {
      return await this.prisma.productType.findMany({
        where: { deletedAt: null, isActive: true },
        orderBy: { name: 'asc' },
        select: { id: true, name: true, slug: true },
      });
    } catch (error) {
      console.error('Error in findAllActive:', error);
      throw error;
    }
  }

  async findOne(id: string) {
    const row = await this.prisma.productType.findFirst({
      where: { id, deletedAt: null },
      include: { _count: { select: { products: { where: { deletedAt: null } } } } },
    });
    if (!row) throw new NotFoundException('Product type not found');
    const { _count, ...rest } = row;
    return { ...rest, productCount: _count.products };
  }

  async update(
    id: string,
    dto: UpdateProductTypeDto,
    user: AuthUser,
    ip?: string,
    userAgent?: string,
  ) {
    await this.ensureExists(id);

    const slug =
      dto.slug !== undefined ? dto.slug.trim().toLowerCase() : undefined;

    try {
      const updated = await this.prisma.productType.update({
        where: { id },
        data: {
          name: dto.name?.trim(),
          slug,
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
        action: 'PRODUCT_TYPE_UPDATED',
        entityType: 'ProductType',
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
          `Product type with this ${target} already exists`,
        );
      }
      throw e;
    }
  }

  async remove(id: string, user: AuthUser, ip?: string, userAgent?: string) {
    await this.ensureExists(id);

    // Check if any active products reference this type
    const productCount = await this.prisma.product.count({
      where: { typeId: id, deletedAt: null },
    });
    if (productCount > 0) {
      throw new ConflictException(
        `Cannot delete: ${productCount} product(s) reference this type`,
      );
    }

    const updated = await this.prisma.productType.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.audit.log({
      actorUserId: user.id,
      action: 'PRODUCT_TYPE_DELETED',
      entityType: 'ProductType',
      entityId: id,
      ip,
      userAgent,
    });

    return updated;
  }

  private async ensureExists(id: string) {
    const row = await this.prisma.productType.findFirst({
      where: { id, deletedAt: null },
    });
    if (!row) throw new NotFoundException('Product type not found');
  }
}
