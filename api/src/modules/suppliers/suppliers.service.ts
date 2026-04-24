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
  CreateSupplierDto,
  SupplierListQueryDto,
  UpdateSupplierDto,
} from './dto/supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async create(
    dto: CreateSupplierDto,
    user: AuthUser,
    ip?: string,
    userAgent?: string,
  ) {
    try {
      const row = await this.prisma.supplier.create({
        data: {
          name: dto.name.trim(),
          email: dto.email?.trim(),
          phone: dto.phone?.trim(),
          address: dto.address?.trim(),
          contactPerson: dto.contactPerson?.trim(),
          notes: dto.notes?.trim(),
        },
      });

      await this.audit.log({
        actorUserId: user.id,
        action: AuditAction.SUPPLIER_CREATED,
        entityType: 'Supplier',
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
        throw new ConflictException('Email already exists');
      }
      throw e;
    }
  }

  async findAll(query: SupplierListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.SupplierWhereInput = { deletedAt: null };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } },
        { contactPerson: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.supplier.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.supplier.count({ where }),
    ]);

    return buildPaginatedResult(rows, total, page, limit);
  }

  async findOne(id: string) {
    const row = await this.prisma.supplier.findFirst({
      where: { id, deletedAt: null },
    });

    if (!row) {
      throw new NotFoundException('Supplier not found');
    }

    return row;
  }

  async update(
    id: string,
    dto: UpdateSupplierDto,
    user: AuthUser,
    ip?: string,
    userAgent?: string,
  ) {
    await this.findOne(id);

    try {
      const row = await this.prisma.supplier.update({
        where: { id },
        data: {
          ...(dto.name !== undefined && { name: dto.name.trim() }),
          ...(dto.email !== undefined && { email: dto.email.trim() }),
          ...(dto.phone !== undefined && { phone: dto.phone.trim() }),
          ...(dto.address !== undefined && { address: dto.address.trim() }),
          ...(dto.contactPerson !== undefined && {
            contactPerson: dto.contactPerson.trim(),
          }),
          ...(dto.notes !== undefined && { notes: dto.notes.trim() }),
        },
      });

      await this.audit.log({
        actorUserId: user.id,
        action: AuditAction.SUPPLIER_UPDATED,
        entityType: 'Supplier',
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
        throw new ConflictException('Email already exists');
      }
      throw e;
    }
  }

  async remove(id: string, user: AuthUser, ip?: string, userAgent?: string) {
    const row = await this.findOne(id);

    await this.prisma.supplier.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.audit.log({
      actorUserId: user.id,
      action: AuditAction.SUPPLIER_DELETED,
      entityType: 'Supplier',
      entityId: row.id,
      metadata: { name: row.name },
      ip,
      userAgent,
    });

    return { message: 'Supplier deleted successfully' };
  }
}
