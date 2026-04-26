/**
 * Generic CRUD service base class.
 *
 * Extend this class for simple domain modules that follow the
 * standard list / get / create / update / soft-delete pattern.
 * Override the abstract methods to supply model-specific behaviour.
 *
 * Services with non-trivial business logic (e.g. Orders, Inventory)
 * should implement their own service instead of extending this base.
 *
 * @module crud.service.base
 */

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { buildPaginatedResult } from '../dto/pagination.dto';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuditService } from '../../modules/audit/audit.service';
import type { AuthUser } from '../../types/express';
import { ErrorHandler } from '../errors/error-handler';
import type {
  PaginationQuery,
  PaginatedResult,
  SortOptions,
} from '@ims/shared';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

export interface CrudServiceOptions {
  /** Prisma model name (must match the PrismaService delegate key). */
  modelName: string;
  /** Fields to search across when `query.search` is provided. */
  searchFields: string[];
  /** Constraint-name -> human-readable label map for P2002 errors. */
  uniqueConstraints: Record<string, string>;
  /** Default sort when the caller does not specify one. */
  defaultSort?: SortOptions;
  /** Default page size. */
  defaultLimit?: number;
  /** Maximum allowed page size. */
  maxLimit?: number;
}

export interface QueryOptions {
  search?: { term?: string; fields: string[] };
  filters?: Record<string, unknown>;
  sort?: SortOptions;
  pagination?: { page: number; limit: number };
}

// ---------------------------------------------------------------------------
// Base class
// ---------------------------------------------------------------------------

@Injectable()
export abstract class CrudServiceBase<
  TModel,
  TCreateDto,
  TUpdateDto,
  TListQueryDto extends PaginationQuery,
> {
  protected readonly defaultLimit: number;
  protected readonly maxLimit: number;
  protected readonly defaultSort: SortOptions;

  constructor(
    protected readonly prisma: PrismaService,
    protected readonly audit: AuditService,
    protected readonly options: CrudServiceOptions,
  ) {
    this.defaultLimit = options.defaultLimit ?? 20;
    this.maxLimit = options.maxLimit ?? 100;
    this.defaultSort = options.defaultSort ?? {
      field: 'createdAt',
      order: 'desc',
    };
  }

  // ── Abstract hooks ──────────────────────────────────────────────────────

  /** Relations to include in every query. */
  abstract getInclude(): Record<string, unknown>;

  /** Map a create DTO to the Prisma `data` argument. */
  abstract transformCreateDto(
    dto: TCreateDto,
  ): Prisma.Args<TModel, 'create'>['data'];

  /** Map an update DTO to the Prisma `data` argument. */
  abstract transformUpdateDto(
    dto: TUpdateDto,
  ): Prisma.Args<TModel, 'update'>['data'];

  /** Return metadata to embed in the audit log entry. */
  abstract getAuditMetadata(entity: unknown): Record<string, unknown>;

  // ── Query builders ──────────────────────────────────────────────────────

  /** Build the Prisma `where` clause from a query DTO. */
  protected buildWhereClause(
    query: TListQueryDto,
    additionalFilters?: Record<string, unknown>,
  ): Prisma.Args<TModel, 'findMany'>['where'] {
    const where: Prisma.Args<TModel, 'findMany'>['where'] = {
      deletedAt: null,
    };

    if (query.search && this.options.searchFields.length > 0) {
      where.OR = this.options.searchFields.map((field) => ({
        [field]: { contains: query.search, mode: 'insensitive' as const },
      }));
    }

    if (additionalFilters) {
      Object.assign(where, additionalFilters);
    }

    return where;
  }

  /** Build the Prisma `orderBy` clause from a query DTO. */
  protected buildOrderByClause(
    query: TListQueryDto,
  ): Prisma.Args<TModel, 'findMany'>['orderBy'] {
    if (query.sortBy) {
      return { [query.sortBy]: query.sortOrder ?? 'asc' };
    }
    return { [this.defaultSort.field]: this.defaultSort.order };
  }

  // ── CRUD operations ─────────────────────────────────────────────────────

  /** Create a new record and log the action. */
  async create(
    dto: TCreateDto,
    user: AuthUser,
    ip?: string,
    userAgent?: string,
  ): Promise<TModel> {
    try {
      const data = this.transformCreateDto(dto);
      const model = this.getDelegate();

      const row = await model.create({
        data,
        include: this.getInclude(),
      });

      await this.audit.log({
        actorUserId: user.id,
        action: `${this.options.modelName.toLowerCase()}.create`,
        entityType: this.options.modelName,
        entityId: row.id,
        metadata: this.getAuditMetadata(row),
        ip,
        userAgent,
      });

      return row;
    } catch (e) {
      this.handleWriteError(e);
    }
  }

  /** List records with pagination, search, and sorting. */
  async findAll(
    query: TListQueryDto,
    additionalFilters?: Record<string, unknown>,
  ): Promise<PaginatedResult<TModel>> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? this.defaultLimit, this.maxLimit);
    const skip = (page - 1) * limit;

    const where = this.buildWhereClause(query, additionalFilters);
    const orderBy = this.buildOrderByClause(query);
    const model = this.getDelegate();

    const [data, total] = await Promise.all([
      model.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: this.getInclude(),
      }),
      model.count({ where }),
    ]);

    return buildPaginatedResult(data, total, page, limit);
  }

  /** Fetch all records (no pagination) -- useful for exports. */
  async findAllWithoutPagination(
    query: TListQueryDto,
    additionalFilters?: Record<string, unknown>,
  ): Promise<TModel[]> {
    const where = this.buildWhereClause(query, additionalFilters);
    const orderBy = this.buildOrderByClause(query);
    const model = this.getDelegate();

    return model.findMany({
      where,
      orderBy,
      include: this.getInclude(),
    });
  }

  /** Find a single record by ID. Throws 404 if missing or soft-deleted. */
  async findOne(id: string): Promise<TModel> {
    const model = this.getDelegate();

    const row = await model.findFirst({
      where: { id, deletedAt: null },
      include: this.getInclude(),
    });

    if (!row) {
      throw new NotFoundException(`${this.options.modelName} not found`);
    }

    return row;
  }

  /** Update a record and log the action. */
  async update(
    id: string,
    dto: TUpdateDto,
    user: AuthUser,
    ip?: string,
    userAgent?: string,
  ): Promise<TModel> {
    try {
      await this.findOne(id);

      const data = this.transformUpdateDto(dto);
      const model = this.getDelegate();

      const row = await model.update({
        where: { id },
        data,
        include: this.getInclude(),
      });

      await this.audit.log({
        actorUserId: user.id,
        action: `${this.options.modelName.toLowerCase()}.update`,
        entityType: this.options.modelName,
        entityId: id,
        metadata: this.getAuditMetadata(row),
        ip,
        userAgent,
      });

      return row;
    } catch (e) {
      this.handleWriteError(e);
    }
  }

  /** Soft-delete a record and log the action. */
  async remove(
    id: string,
    user: AuthUser,
    ip?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.findOne(id);

    const model = this.getDelegate();

    await model.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.audit.log({
      actorUserId: user.id,
      action: `${this.options.modelName.toLowerCase()}.delete`,
      entityType: this.options.modelName,
      entityId: id,
      metadata: {},
      ip,
      userAgent,
    });
  }

  // ── Internals ───────────────────────────────────────────────────────────

  /** Return the Prisma delegate for `this.options.modelName`. */
  private getDelegate(): any {
    return this.prisma[this.options.modelName as keyof PrismaService] as any;
  }

  /** Handle Prisma write errors with user-friendly messages. */
  private handleWriteError(e: unknown): never {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2002') {
        const field =
          ErrorHandler.getUniqueConstraintField(
            e,
            this.options.uniqueConstraints,
          ) || 'field';
        throw new ConflictException(`${field} already exists`);
      }
      ErrorHandler.handlePrismaError(e);
    }
    throw e;
  }
}
