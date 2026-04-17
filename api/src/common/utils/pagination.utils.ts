// Enhanced Pagination Utilities

import { Prisma } from '@prisma/client';
import { PaginationQueryDto } from '../dto/pagination.dto';

export interface PaginationOptions {
  page: number;
  limit: number;
  search?: string;
  searchFields?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
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

export class PaginationBuilder<T> {
  private where: Prisma.Args<T, 'findMany'>['where'] = {};
  private orderBy: Prisma.Args<T, 'findMany'>['orderBy'] = {};
  private skip = 0;
  private take = 20;
  private include: Record<string, any> = {};

  constructor(
    private modelName: string,
    private prisma: any,
  ) {}

  /**
   * Apply search to query
   */
  search(term: string, fields: string[]): this {
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

  /**
   * Apply filters to query
   */
  filter(filters: Record<string, any>): this {
    if (filters) {
      this.where = { ...this.where, ...filters };
    }
    return this;
  }

  /**
   * Apply sorting to query
   */
  sort(field: string, order: 'asc' | 'desc' = 'asc'): this {
    if (field) {
      this.orderBy = { [field]: order };
    }
    return this;
  }

  /**
   * Apply pagination to query
   */
  paginate(page: number, limit: number): this {
    this.skip = Math.max(0, (page - 1) * limit);
    this.take = Math.max(1, limit);
    return this;
  }

  /**
   * Apply include relations to query
   */
  includeRelations(include: Record<string, any>): this {
    this.include = include;
    return this;
  }

  /**
   * Execute the query and return paginated results
   */
  async execute(): Promise<PaginationResult<T>> {
    const model = this.prisma[this.modelName];

    const [data, total] = await Promise.all([
      model.findMany({
        where: this.where,
        orderBy: this.orderBy,
        skip: this.skip,
        take: this.take,
        include: this.include,
      }),
      model.count({ where: this.where }),
    ]);

    const page = Math.floor(this.skip / this.take) + 1;
    const limit = this.take;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    };
  }

  /**
   * Build where clause from query options
   */
  static buildWhereClause<T>(
    options: PaginationOptions,
    additionalFilters?: Record<string, any>,
  ): Prisma.Args<T, 'findMany'>['where'] {
    const where: Prisma.Args<T, 'findMany'>['where'] = {};

    // Apply search
    if (
      options.search &&
      options.searchFields &&
      options.searchFields.length > 0
    ) {
      where.OR = options.searchFields.map((field) => ({
        [field]: { contains: options.search, mode: 'insensitive' as const },
      }));
    }

    // Apply filters
    if (options.filters) {
      Object.assign(where, options.filters);
    }

    // Apply additional filters
    if (additionalFilters) {
      Object.assign(where, additionalFilters);
    }

    return where;
  }

  /**
   * Build order by clause from query options
   */
  static buildOrderByClause<T>(
    options: PaginationOptions,
    defaultSort: { field: string; order: 'asc' | 'desc' } = {
      field: 'createdAt',
      order: 'desc',
    },
  ): Prisma.Args<T, 'findMany'>['orderBy'] {
    if (options.sortBy) {
      return { [options.sortBy]: options.sortOrder || 'asc' };
    }
    return { [defaultSort.field]: defaultSort.order };
  }

  /**
   * Calculate pagination metadata
   */
  static calculatePaginationMeta(total: number, page: number, limit: number) {
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      page,
      limit,
      total,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    };
  }

  /**
   * Sanitize pagination parameters
   */
  static sanitizePaginationParams(
    params: PaginationQueryDto,
    defaultLimit: number = 20,
    maxLimit: number = 100,
  ): { page: number; limit: number } {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(Math.max(1, params.limit || defaultLimit), maxLimit);

    return { page, limit };
  }
}
