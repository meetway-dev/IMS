import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { buildPaginatedResult } from '../dto/pagination.dto';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuditService } from '../../modules/audit/audit.service';
import type { AuthUser } from '../../types/express';
import { ErrorHandler } from '../errors/error-handler';
import {
  PaginationQuery,
  PaginatedResult,
  SearchOptions,
  FilterOptions,
  SortOptions,
} from '@ims/shared';

export interface CrudServiceOptions {
  modelName: string;
  searchFields: string[];
  uniqueConstraints: Record<string, string>;
  defaultSort?: SortOptions;
  defaultLimit?: number;
  maxLimit?: number;
}

export interface QueryOptions {
  search?: SearchOptions;
  filters?: FilterOptions;
  sort?: SortOptions;
  pagination?: {
    page: number;
    limit: number;
  };
}

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
    this.defaultLimit = options.defaultLimit || 20;
    this.maxLimit = options.maxLimit || 100;
    this.defaultSort = options.defaultSort || {
      field: 'createdAt',
      order: 'desc',
    };
  }

  /**
   * Get include object for queries (to be implemented by child classes)
   */
  abstract getInclude(): Record<string, any>;

  /**
   * Transform create DTO to Prisma data (to be implemented by child classes)
   */
  abstract transformCreateDto(
    dto: TCreateDto,
  ): Prisma.Args<TModel, 'create'>['data'];

  /**
   * Transform update DTO to Prisma data (to be implemented by child classes)
   */
  abstract transformUpdateDto(
    dto: TUpdateDto,
  ): Prisma.Args<TModel, 'update'>['data'];

  /**
   * Get metadata for audit logging (to be implemented by child classes)
   */
  abstract getAuditMetadata(entity: any): Record<string, any>;

  /**
   * Build where clause from query options
   */
  protected buildWhereClause(
    query: TListQueryDto,
    additionalFilters?: Record<string, any>,
  ): Prisma.Args<TModel, 'findMany'>['where'] {
    const where: Prisma.Args<TModel, 'findMany'>['where'] = {
      deletedAt: null,
    };

    // Add search filter
    if (query.search && this.options.searchFields.length > 0) {
      where.OR = this.options.searchFields.map((field) => ({
        [field]: { contains: query.search, mode: 'insensitive' as const },
      }));
    }

    // Add additional filters
    if (additionalFilters) {
      Object.assign(where, additionalFilters);
    }

    return where;
  }

  /**
   * Build order by clause from query options
   */
  protected buildOrderByClause(
    query: TListQueryDto,
  ): Prisma.Args<TModel, 'findMany'>['orderBy'] {
    if (query.sortBy) {
      return { [query.sortBy]: query.sortOrder || 'asc' };
    }
    return { [this.defaultSort.field]: this.defaultSort.order };
  }

  /**
   * Create a new record
   */
  async create(
    dto: TCreateDto,
    user: AuthUser,
    ip?: string,
    userAgent?: string,
  ): Promise<TModel> {
    try {
      const data = this.transformCreateDto(dto);
      const model = this.prisma[
        this.options.modelName as keyof PrismaService
      ] as any;

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

  /**
   * Find all records with pagination and search
   */
  async findAll(
    query: TListQueryDto,
    additionalFilters?: Record<string, any>,
  ): Promise<PaginatedResult<TModel>> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? this.defaultLimit, this.maxLimit);
    const skip = (page - 1) * limit;

    const where = this.buildWhereClause(query, additionalFilters);
    const orderBy = this.buildOrderByClause(query);

    const model = this.prisma[
      this.options.modelName as keyof PrismaService
    ] as any;

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

  /**
   * Find all records without pagination (for exports, etc.)
   */
  async findAllWithoutPagination(
    query: TListQueryDto,
    additionalFilters?: Record<string, any>,
  ): Promise<TModel[]> {
    const where = this.buildWhereClause(query, additionalFilters);
    const orderBy = this.buildOrderByClause(query);

    const model = this.prisma[
      this.options.modelName as keyof PrismaService
    ] as any;

    return model.findMany({
      where,
      orderBy,
      include: this.getInclude(),
    });
  }

  /**
   * Find one record by ID
   */
  async findOne(id: string): Promise<TModel> {
    const model = this.prisma[
      this.options.modelName as keyof PrismaService
    ] as any;

    const row = await model.findFirst({
      where: { id, deletedAt: null },
      include: this.getInclude(),
    });

    if (!row) {
      throw new NotFoundException(`${this.options.modelName} not found`);
    }

    return row;
  }

  /**
   * Update a record
   */
  async update(
    id: string,
    dto: TUpdateDto,
    user: AuthUser,
    ip?: string,
    userAgent?: string,
  ): Promise<TModel> {
    try {
      await this.findOne(id); // Check if exists

      const data = this.transformUpdateDto(dto);
      const model = this.prisma[
        this.options.modelName as keyof PrismaService
      ] as any;

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

  /**
   * Soft delete a record
   */
  async remove(
    id: string,
    user: AuthUser,
    ip?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.findOne(id); // Check if exists

    const model = this.prisma[
      this.options.modelName as keyof PrismaService
    ] as any;

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
}
