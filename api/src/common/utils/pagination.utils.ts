/**
 * Pagination query-builder utility.
 *
 * Provides a fluent API for constructing Prisma paginated queries.
 * Used as an alternative to the `CrudServiceBase` for services that
 * need more control over their query construction.
 *
 * @example
 * ```ts
 * const result = await new PaginationBuilder('product', this.prisma)
 *   .search(query.search, ['name', 'sku'])
 *   .filter({ deletedAt: null })
 *   .sort(query.sortBy ?? 'name', query.sortOrder ?? 'asc')
 *   .paginate(query.page ?? 1, query.limit ?? 20)
 *   .includeRelations({ category: true })
 *   .execute();
 * ```
 *
 * @module pagination.utils
 */

import { Prisma } from '@prisma/client';
import { PaginationQueryDto, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../dto/pagination.dto';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PaginationOptions {
  page: number;
  limit: number;
  search?: string;
  searchFields?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, unknown>;
}

export interface PaginationResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------

export class PaginationBuilder<T> {
  private where: Prisma.Args<T, 'findMany'>['where'] = {};
  private orderBy: Prisma.Args<T, 'findMany'>['orderBy'] = {};
  private skip = 0;
  private take = DEFAULT_PAGE_SIZE;
  private _include: Record<string, unknown> = {};

  constructor(
    private readonly modelName: string,
    private readonly prisma: unknown,
  ) {}

  /** Apply a full-text search across the given fields. */
  search(term: string | undefined, fields: string[]): this {
    if (term && fields.length > 0) {
      this.where = {
        ...this.where,
        OR: fields.map((field) => ({
          [field]: { contains: term, mode: 'insensitive' as const },
        })),
      };
    }
    return this;
  }

  /** Merge additional where-clause filters. */
  filter(filters: Record<string, unknown>): this {
    if (filters) {
      this.where = { ...this.where, ...filters };
    }
    return this;
  }

  /** Set the sort column and direction. */
  sort(field: string, order: 'asc' | 'desc' = 'asc'): this {
    if (field) {
      this.orderBy = { [field]: order };
    }
    return this;
  }

  /** Set page and limit for offset-based pagination. */
  paginate(page: number, limit: number): this {
    this.skip = Math.max(0, (page - 1) * limit);
    this.take = Math.max(1, limit);
    return this;
  }

  /** Specify Prisma `include` relations. */
  includeRelations(include: Record<string, unknown>): this {
    this._include = include;
    return this;
  }

  /** Execute the query and return paginated results with metadata. */
  async execute(): Promise<PaginationResult<T>> {
    const model = (this.prisma as Record<string, unknown>)[
      this.modelName
    ] as Record<string, (...args: unknown[]) => Promise<unknown>>;

    const [data, total] = (await Promise.all([
      model.findMany({
        where: this.where,
        orderBy: this.orderBy,
        skip: this.skip,
        take: this.take,
        include: this._include,
      }),
      model.count({ where: this.where }),
    ])) as [T[], number];

    const page = Math.floor(this.skip / this.take) + 1;
    const limit = this.take;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  // ── Static helpers ────────────────────────────────────────────────────

  /** Sanitise raw pagination params into safe values. */
  static sanitizePaginationParams(
    params: PaginationQueryDto,
    defaultLimit = DEFAULT_PAGE_SIZE,
    maxLimit = MAX_PAGE_SIZE,
  ): { page: number; limit: number; skip: number } {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(Math.max(1, params.limit ?? defaultLimit), maxLimit);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
  }
}
