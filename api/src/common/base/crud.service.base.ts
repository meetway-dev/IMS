import {
  BadRequestException,
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

export interface CrudServiceOptions {
  modelName: string;
  searchFields: string[];
  uniqueConstraints: Record<string, string>;
}

@Injectable()
export abstract class CrudServiceBase<
  TModel,
  TCreateDto,
  TUpdateDto,
  TListQueryDto,
> {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly audit: AuditService,
    protected readonly options: CrudServiceOptions,
  ) {}

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
        entityId: (row as any).id,
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
    query: TListQueryDto & {
      page?: number;
      limit?: number;
      search?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ): Promise<any> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.Args<TModel, 'findMany'>['where'] = {
      deletedAt: null,
    };

    // Add search filter
    if (query.search && this.options.searchFields.length > 0) {
      where.OR = this.options.searchFields.map((field) => ({
        [field]: { contains: query.search, mode: 'insensitive' as const },
      }));
    }

    // Add sorting
    const orderBy: Prisma.Args<TModel, 'findMany'>['orderBy'] = query.sortBy
      ? { [query.sortBy]: query.sortOrder || 'asc' }
      : { createdAt: 'desc' };

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
