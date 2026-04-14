import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { slugify } from '../../common/utils/slug';
import { buildPaginatedResult } from '../../common/dto/pagination.dto';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { AuthUser } from '../../types/express';
import type { CategoryListQueryDto, CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async create(dto: CreateCategoryDto, user: AuthUser, ip?: string, userAgent?: string) {
    const slug = (dto.slug?.trim() || slugify(dto.name)).toLowerCase();
    const parentId = dto.parentId ?? null;

    if (parentId) {
      const parent = await this.prisma.category.findFirst({
        where: { id: parentId, deletedAt: null },
      });
      if (!parent) throw new BadRequestException('Parent category not found');
    }

    try {
      const row = await this.prisma.category.create({
        data: { name: dto.name.trim(), slug, parentId },
      });

      await this.audit.log({
        actorUserId: user.id,
        action: 'category.create',
        entityType: 'Category',
        entityId: row.id,
        metadata: { slug: row.slug },
        ip,
        userAgent,
      });

      return row;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('Slug already exists for this parent');
      }
      throw e;
    }
  }

  async findAll(query: CategoryListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.CategoryWhereInput = { deletedAt: null };
    if (query.rootOnly) {
      where.parentId = null;
    } else if (query.parentId) {
      where.parentId = query.parentId;
    }

    if (query.q) {
      where.OR = [
        { name: { contains: query.q, mode: 'insensitive' } },
        { slug: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.category.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
        include: { parent: true },
      }),
      this.prisma.category.count({ where }),
    ]);

    return buildPaginatedResult(rows, total, page, limit);
  }

  async tree() {
    const all = await this.prisma.category.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });

    const byParent = new Map<string | null, typeof all>();
    for (const c of all) {
      const key = c.parentId;
      const list = byParent.get(key) ?? [];
      list.push(c);
      byParent.set(key, list);
    }

    const build = (parentId: string | null): unknown[] => {
      const children = byParent.get(parentId) ?? [];
      return children.map((c) => ({
        ...c,
        children: build(c.id),
      }));
    };

    return build(null);
  }

  async findOne(id: string) {
    const row = await this.prisma.category.findFirst({
      where: { id, deletedAt: null },
      include: { parent: true, children: { where: { deletedAt: null } } },
    });
    if (!row) throw new NotFoundException('Category not found');
    return row;
  }

  async update(id: string, dto: UpdateCategoryDto, user: AuthUser, ip?: string, userAgent?: string) {
    await this.ensureExists(id);

    if (dto.parentId) {
      if (dto.parentId === id) throw new BadRequestException('Category cannot be its own parent');
      const parent = await this.prisma.category.findFirst({
        where: { id: dto.parentId, deletedAt: null },
      });
      if (!parent) throw new BadRequestException('Parent category not found');
      const wouldCycle = await this.isDescendant(dto.parentId, id);
      if (wouldCycle) throw new BadRequestException('Invalid parent (cycle)');
    }

    const slug =
      dto.slug !== undefined ? dto.slug.trim().toLowerCase() : undefined;

    try {
      const updated = await this.prisma.category.update({
        where: { id },
        data: {
          name: dto.name?.trim(),
          slug,
          parentId: dto.parentId === undefined ? undefined : dto.parentId,
        },
      });

      await this.audit.log({
        actorUserId: user.id,
        action: 'category.update',
        entityType: 'Category',
        entityId: id,
        metadata: { fields: Object.keys(dto) },
        ip,
        userAgent,
      });

      return updated;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('Slug already exists for this parent');
      }
      throw e;
    }
  }

  async remove(id: string, user: AuthUser, ip?: string, userAgent?: string) {
    await this.ensureExists(id);
    const childCount = await this.prisma.category.count({
      where: { parentId: id, deletedAt: null },
    });
    if (childCount > 0) throw new BadRequestException('Category has child categories');

    const updated = await this.prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.audit.log({
      actorUserId: user.id,
      action: 'category.delete',
      entityType: 'Category',
      entityId: id,
      ip,
      userAgent,
    });

    return updated;
  }

  private async ensureExists(id: string) {
    const row = await this.prisma.category.findFirst({ where: { id, deletedAt: null } });
    if (!row) throw new NotFoundException('Category not found');
  }

  private async isDescendant(maybeDescendantId: string, ancestorId: string): Promise<boolean> {
    let current: string | null = maybeDescendantId;
    const seen = new Set<string>();
    while (current) {
      if (current === ancestorId) return true;
      if (seen.has(current)) break;
      seen.add(current);
      const parentRow: { parentId: string | null } | null = await this.prisma.category.findUnique({
        where: { id: current },
        select: { parentId: true },
      });
      current = parentRow?.parentId ?? null;
    }
    return false;
  }
}
