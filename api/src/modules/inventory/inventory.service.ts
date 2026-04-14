import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InventoryTransactionType, Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { AuthUser } from '../../types/express';
import { buildPaginatedResult } from '../../common/dto/pagination.dto';
import type { AdjustStockDto, TransactionListQueryDto } from './dto/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async adjust(
    dto: AdjustStockDto,
    user: AuthUser,
    ip?: string,
    userAgent?: string,
  ) {
    if (dto.quantityDelta === 0) throw new BadRequestException('quantityDelta cannot be 0');

    const type = dto.type ?? InventoryTransactionType.ADJUSTMENT;

    const result = await this.prisma.$transaction(async (tx) => {
      const item = await tx.inventoryItem.findFirst({
        where: { id: dto.inventoryItemId, deletedAt: null },
      });
      if (!item) throw new NotFoundException('Inventory item not found');

      const next = item.stockQuantity + dto.quantityDelta;
      if (next < 0) {
        throw new BadRequestException('Insufficient stock for this adjustment');
      }

      const updated = await tx.inventoryItem.update({
        where: { id: item.id },
        data: { stockQuantity: next },
      });

      const txRow = await tx.inventoryTransaction.create({
        data: {
          inventoryItemId: item.id,
          type,
          quantityDelta: dto.quantityDelta,
          reference: dto.reference?.trim() || null,
          note: dto.note?.trim() || null,
          createdByUserId: user.id,
        },
      });

      return { item: updated, transaction: txRow };
    });

    await this.audit.log({
      actorUserId: user.id,
      action: 'inventory.adjust',
      entityType: 'InventoryItem',
      entityId: dto.inventoryItemId,
      metadata: {
        quantityDelta: dto.quantityDelta,
        type,
      },
      ip,
      userAgent,
    });

    return result;
  }

  async listTransactions(query: TransactionListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.InventoryTransactionWhereInput = {};
    if (query.inventoryItemId) where.inventoryItemId = query.inventoryItemId;
    if (query.type) where.type = query.type;

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.inventoryTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          inventoryItem: {
            include: {
              product: true,
              variant: { include: { product: true } },
            },
          },
          createdByUser: { select: { id: true, email: true, name: true } },
        },
      }),
      this.prisma.inventoryTransaction.count({ where }),
    ]);

    return buildPaginatedResult(rows, total, page, limit);
  }

  async minStockAlerts() {
    const items = await this.prisma.inventoryItem.findMany({
      where: { deletedAt: null },
      include: {
        product: true,
        variant: { include: { product: true } },
      },
    });

    const alerts: Array<{
      inventoryItemId: string;
      stockQuantity: number;
      minStockAlert: number;
      productId: string | null;
      variantId: string | null;
      sku: string | null;
      name: string | null;
    }> = [];

    for (const row of items) {
      if (row.product?.deletedAt) continue;
      if (row.variant?.deletedAt) continue;

      const min =
        row.product?.minStockAlert ??
        row.variant?.product?.minStockAlert ??
        0;
      if (row.stockQuantity < min) {
        alerts.push({
          inventoryItemId: row.id,
          stockQuantity: row.stockQuantity,
          minStockAlert: min,
          productId: row.productId,
          variantId: row.variantId,
          sku: row.product?.sku ?? row.variant?.sku ?? row.variant?.product?.sku ?? null,
          name: row.product?.name ?? row.variant?.product?.name ?? null,
        });
      }
    }

    return { data: alerts };
  }
}
