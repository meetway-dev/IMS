import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditAction, GoodsReceiptStatus, Prisma } from '@prisma/client';
import { buildPaginatedResult } from '../../common/dto/pagination.dto';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import type { AuthUser } from '../../types/express';
import { AuditService } from '../audit/audit.service';
import type {
  CreateGoodsReceiptDto,
  GoodsReceiptListQueryDto,
  UpdateGoodsReceiptDto,
} from './dto/goods-receipt.dto';

@Injectable()
export class GoodsReceiptsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async create(
    dto: CreateGoodsReceiptDto,
    user: AuthUser,
    ip?: string,
    userAgent?: string,
  ) {
    // Validate purchase order exists
    const purchaseOrder = await this.prisma.purchaseOrder.findFirst({
      where: { id: dto.purchaseOrderId, deletedAt: null },
    });
    if (!purchaseOrder) {
      throw new BadRequestException('Purchase order not found');
    }

    // Validate warehouse exists
    const warehouse = await this.prisma.warehouse.findFirst({
      where: { id: dto.warehouseId, deletedAt: null },
    });
    if (!warehouse) {
      throw new BadRequestException('Warehouse not found');
    }

    // Generate GRN number
    const grnNumber = `GRN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    try {
      const row = await this.prisma.goodsReceiptNote.create({
        data: {
          grnNumber,
          purchaseOrderId: dto.purchaseOrderId,
          warehouseId: dto.warehouseId,
          status: GoodsReceiptStatus.DRAFT,
          receiptDate: dto.receiptDate ? new Date(dto.receiptDate) : new Date(),
          notes: dto.notes || null,
          createdByUserId: user.id,
          items: {
            create: dto.items.map((item) => ({
              purchaseOrderItemId: item.purchaseOrderItemId,
              quantity: item.quantity,
              unitPrice: item.unitPrice || 0,
              lineTotal: (item.unitPrice || 0) * item.quantity,
              batchNumber: item.batchNumber || null,
              expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
              notes: item.notes || null,
            })),
          },
        },
        include: {
          items: {
            include: {
              purchaseOrderItem: true,
            },
          },
          purchaseOrder: true,
          warehouse: true,
        },
      });

      await this.audit.log({
        actorUserId: user.id,
        action: AuditAction.ORDER_CREATED, // TODO: Add specific audit action for goods receipt
        entityType: 'GoodsReceiptNote',
        entityId: row.id,
        metadata: { grnNumber: row.grnNumber },
        ip,
        userAgent,
      });

      return row;
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException('Goods receipt already exists');
      }
      throw e;
    }
  }

  async findAll(query: GoodsReceiptListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.GoodsReceiptNoteWhereInput = { deletedAt: null };

    if (query.status) {
      where.status = query.status as GoodsReceiptStatus;
    }
    if (query.purchaseOrderId) {
      where.purchaseOrderId = query.purchaseOrderId;
    }
    if (query.warehouseId) {
      where.warehouseId = query.warehouseId;
    }
    if (query.fromDate) {
      where.receiptDate = { gte: new Date(query.fromDate) };
    }
    if (query.toDate) {
      const toDateCondition = { lte: new Date(query.toDate) };
      if (
        where.receiptDate &&
        typeof where.receiptDate === 'object' &&
        'gte' in where.receiptDate
      ) {
        where.receiptDate = { ...where.receiptDate, ...toDateCondition };
      } else {
        where.receiptDate = toDateCondition;
      }
    }

    if (query.search) {
      where.OR = [
        { grnNumber: { contains: query.search, mode: 'insensitive' } },
        { notes: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.goodsReceiptNote.findMany({
        where,
        orderBy: { receiptDate: 'desc' },
        skip,
        take: limit,
        include: {
          purchaseOrder: true,
          warehouse: true,
          createdByUser: true,
        },
      }),
      this.prisma.goodsReceiptNote.count({ where }),
    ]);

    return buildPaginatedResult(rows, total, page, limit);
  }

  async findOne(id: string) {
    const row = await this.prisma.goodsReceiptNote.findFirst({
      where: { id, deletedAt: null },
      include: {
        items: {
          include: {
            purchaseOrderItem: {
              include: {
                product: true,
                variant: true,
              },
            },
          },
        },
        purchaseOrder: true,
        warehouse: true,
        createdByUser: true,
      },
    });

    if (!row) {
      throw new NotFoundException('Goods receipt note not found');
    }

    return row;
  }

  async update(
    id: string,
    dto: UpdateGoodsReceiptDto,
    user: AuthUser,
    ip?: string,
    userAgent?: string,
  ) {
    const existing = await this.findOne(id);
    if (existing.status !== GoodsReceiptStatus.DRAFT) {
      throw new BadRequestException('Only draft receipts can be updated');
    }

    if (dto.warehouseId) {
      const warehouse = await this.prisma.warehouse.findFirst({
        where: { id: dto.warehouseId, deletedAt: null },
      });
      if (!warehouse) {
        throw new BadRequestException('Warehouse not found');
      }
    }

    const updateData: any = {
      warehouseId: dto.warehouseId,
      notes: dto.notes,
    };

    if (dto.receiptDate) {
      updateData.receiptDate = new Date(dto.receiptDate);
    }

    if (dto.items) {
      updateData.items = {
        deleteMany: {},
        create: dto.items.map((item) => ({
          purchaseOrderItemId: item.purchaseOrderItemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice || 0,
          lineTotal: (item.unitPrice || 0) * item.quantity,
          batchNumber: item.batchNumber || null,
          expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
          notes: item.notes || null,
        })),
      };
    }

    const row = await this.prisma.goodsReceiptNote.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            purchaseOrderItem: true,
          },
        },
        purchaseOrder: true,
        warehouse: true,
      },
    });

    await this.audit.log({
      actorUserId: user.id,
      action: AuditAction.ORDER_UPDATED,
      entityType: 'GoodsReceiptNote',
      entityId: row.id,
      metadata: { grnNumber: row.grnNumber },
      ip,
      userAgent,
    });

    return row;
  }

  async remove(id: string, user: AuthUser, ip?: string, userAgent?: string) {
    const existing = await this.findOne(id);
    if (existing.status !== GoodsReceiptStatus.DRAFT) {
      throw new BadRequestException('Only draft receipts can be deleted');
    }

    const row = await this.prisma.goodsReceiptNote.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.audit.log({
      actorUserId: user.id,
      action: AuditAction.ORDER_DELETED,
      entityType: 'GoodsReceiptNote',
      entityId: row.id,
      metadata: { grnNumber: row.grnNumber },
      ip,
      userAgent,
    });

    return row;
  }

  async complete(id: string, user: AuthUser, ip?: string, userAgent?: string) {
    const existing = await this.findOne(id);
    if (existing.status !== GoodsReceiptStatus.DRAFT) {
      throw new BadRequestException('Only draft receipts can be completed');
    }

    // Update inventory stock levels within a transaction
    const row = await this.prisma.$transaction(async (tx) => {
      // Update goods receipt status
      const updated = await tx.goodsReceiptNote.update({
        where: { id },
        data: { status: GoodsReceiptStatus.COMPLETED },
        include: {
          items: {
            include: {
              purchaseOrderItem: true,
            },
          },
          purchaseOrder: true,
          warehouse: true,
        },
      });

      // Update stock levels for each item
      for (const item of updated.items) {
        const { variantId } = item.purchaseOrderItem;
        const productId = null;
        const quantityReceived = item.quantity;
        const warehouseId = updated.warehouseId;

        if (!variantId) {
          throw new BadRequestException(
            `Goods receipt item ${item.id} must have a variantId`,
          );
        }

        // Find or create stock level
        let stockLevel = await tx.stockLevel.findFirst({
          where: {
            productId: productId || null,
            variantId: variantId || null,
            warehouseId,
            deletedAt: null,
          },
        });

        if (!stockLevel) {
          // Create stock level if it doesn't exist (should exist from product creation)
          stockLevel = await tx.stockLevel.create({
            data: {
              productId: productId || null,
              variantId: variantId || null,
              warehouseId,
              quantity: 0,
              minQuantity: 0,
              reorderPoint: 0,
            },
          });
        }

        // Compute quantities for stock movement
        const previousQuantity = stockLevel.quantity;
        const newQuantity = previousQuantity + quantityReceived;

        // Create stock movement record before updating stock level
        await tx.stockMovement.create({
          data: {
            stockLevelId: stockLevel.id,
            type: 'PURCHASE',
            quantity: quantityReceived,
            previousQuantity,
            newQuantity,
            warehouseId,
            productId: productId || null,
            variantId: variantId || null,
            referenceType: 'GOODS_RECEIPT',
            referenceId: updated.id,
            notes: `Goods receipt ${updated.grnNumber}`,
          },
        });

        // Update stock level quantity after creating movement
        await tx.stockLevel.update({
          where: { id: stockLevel.id },
          data: {
            quantity: { increment: quantityReceived },
            available: { increment: quantityReceived },
          },
        });
      }

      return updated;
    });

    await this.audit.log({
      actorUserId: user.id,
      action: AuditAction.ORDER_CONFIRMED,
      entityType: 'GoodsReceiptNote',
      entityId: row.id,
      metadata: { grnNumber: row.grnNumber },
      ip,
      userAgent,
    });

    return row;
  }

  async cancel(id: string, user: AuthUser, ip?: string, userAgent?: string) {
    const existing = await this.findOne(id);
    if (existing.status === GoodsReceiptStatus.CANCELLED) {
      throw new BadRequestException('Receipt is already cancelled');
    }

    const row = await this.prisma.goodsReceiptNote.update({
      where: { id },
      data: { status: GoodsReceiptStatus.CANCELLED },
      include: {
        items: {
          include: {
            purchaseOrderItem: true,
          },
        },
        purchaseOrder: true,
        warehouse: true,
      },
    });

    await this.audit.log({
      actorUserId: user.id,
      action: AuditAction.ORDER_CANCELLED,
      entityType: 'GoodsReceiptNote',
      entityId: row.id,
      metadata: { grnNumber: row.grnNumber },
      ip,
      userAgent,
    });

    return row;
  }
}
