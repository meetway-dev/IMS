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
  CompanyListQueryDto,
  CreateCompanyDto,
  UpdateCompanyDto,
} from './dto/company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async create(
    dto: CreateCompanyDto,
    user: AuthUser,
    ip?: string,
    userAgent?: string,
  ) {
    try {
      const row = await this.prisma.company.create({
        data: {
          name: dto.name.trim(),
          code: dto.code?.trim() || null,
        },
      });

      await this.audit.log({
        actorUserId: user.id,
        action: AuditAction.COMPANY_CREATED,
        entityType: 'Company',
        entityId: row.id,
        metadata: { name: row.name },
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

  async findAll(query: CompanyListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.CompanyWhereInput = { deletedAt: null };
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.company.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.company.count({ where }),
    ]);

    return buildPaginatedResult(rows, total, page, limit);
  }

  async findOne(id: string) {
    const row = await this.prisma.company.findFirst({
      where: { id, deletedAt: null },
    });
    if (!row) throw new NotFoundException('Company not found');
    return row;
  }

  async update(
    id: string,
    dto: UpdateCompanyDto,
    user: AuthUser,
    ip?: string,
    userAgent?: string,
  ) {
    await this.ensureExists(id);
    try {
      const updated = await this.prisma.company.update({
        where: { id },
        data: {
          name: dto.name?.trim(),
          code: dto.code === undefined ? undefined : dto.code?.trim() || null,
        },
      });

      await this.audit.log({
        actorUserId: user.id,
        action: AuditAction.COMPANY_UPDATED,
        entityType: 'Company',
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
        throw new ConflictException('Name or code already exists');
      }
      throw e;
    }
  }

  async remove(id: string, user: AuthUser, ip?: string, userAgent?: string) {
    await this.ensureExists(id);
    const updated = await this.prisma.company.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.audit.log({
      actorUserId: user.id,
      action: AuditAction.COMPANY_DELETED,
      entityType: 'Company',
      entityId: id,
      ip,
      userAgent,
    });

    return updated;
  }

  private async ensureExists(id: string) {
    const row = await this.prisma.company.findFirst({
      where: { id, deletedAt: null },
    });
    if (!row) throw new NotFoundException('Company not found');
  }
}
