import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { PaginationQueryDto, buildPaginatedResult } from '../../common/dto/pagination.dto';
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
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.AuditLogWhereInput = {};
    if (action) where.action = { contains: action, mode: 'insensitive' };
    if (entityType) where.entityType = { equals: entityType, mode: 'insensitive' };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return buildPaginatedResult(rows, total, page, limit);
  }
}
