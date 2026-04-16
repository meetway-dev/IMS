import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import {
  PaginationQueryDto,
  buildPaginatedResult,
} from '../../common/dto/pagination.dto';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@ApiTags('Audit')
@ApiBearerAuth('access-token')
@Controller({ path: 'audit-logs', version: '1' })
export class AuditController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Permissions('audit.read')
  @ApiOperation({ summary: 'List audit logs (paginated)' })
  @ApiResponse({
    status: 200,
    description: 'Paginated audit entries',
    schema: {
      example: {
        data: [
          {
            id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            actorType: 'USER',
            action: 'product.create',
            entityType: 'Product',
            entityId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
            createdAt: '2026-04-14T12:00:00.000Z',
            details: { name: 'PVC Pipe', sku: 'PVC-PIPE-001' },
            actor: {
              id: 'b3d1d2f2-4c6b-4a9f-9f8f-1f75a6c6f2a1',
              name: 'Admin User',
              email: 'admin@ims.local',
            },
          },
        ],
        meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
      },
    },
  })
  async list(
    @Query() query: PaginationQueryDto,
    @Query('action') action?: string,
    @Query('entityType') entityType?: string,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.AuditLogWhereInput = {};
    if (action) where.action = { contains: action, mode: 'insensitive' };
    if (entityType)
      where.entityType = { equals: entityType, mode: 'insensitive' };
    if (userId) where.actorUserId = userId;
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          actorUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    const formattedRows = rows.map((row) => ({
      ...row,
      actor: row.actorUser
        ? {
            id: row.actorUser.id,
            name: row.actorUser.name,
            email: row.actorUser.email,
          }
        : null,
      actorUser: undefined,
    }));

    return buildPaginatedResult(formattedRows, total, page, limit);
  }

  @Get(':id')
  @Permissions('audit.read')
  @ApiOperation({ summary: 'Get audit log by ID' })
  @ApiResponse({
    status: 200,
    description: 'Audit log details',
    schema: {
      example: {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        actorType: 'USER',
        action: 'product.create',
        entityType: 'Product',
        entityId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
        details: { name: 'PVC Pipe', sku: 'PVC-PIPE-001' },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        createdAt: '2026-04-14T12:00:00.000Z',
        actor: {
          id: 'b3d1d2f2-4c6b-4a9f-9f8f-1f75a6c6f2a1',
          name: 'Admin User',
          email: 'admin@ims.local',
        },
      },
    },
  })
  async get(@Param('id', ParseUUIDPipe) id: string) {
    const auditLog = await this.prisma.auditLog.findUnique({
      where: { id },
      include: {
        actorUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!auditLog) {
      throw new Error('Audit log not found');
    }

    return {
      ...auditLog,
      actor: auditLog.actorUser
        ? {
            id: auditLog.actorUser.id,
            name: auditLog.actorUser.name,
            email: auditLog.actorUser.email,
          }
        : null,
      actorUser: undefined,
    };
  }
}
