import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import crypto from 'crypto';
import { buildPaginatedResult } from '../../common/dto/pagination.dto';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { AuthUser } from '../../types/express';
import type { CreateOrderDto, OrderListQueryDto } from './dto/order.dto';

function d(v: string | number | Prisma.Decimal) {
  return new Prisma.Decimal(v.toString());
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async create(dto: CreateOrderDto, user: AuthUser, ip?: string, userAgent?: string) {
    const status = dto.status ?? OrderStatus.DRAFT;
    if (status !== OrderStatus.DRAFT && status !== OrderStatus.CONFIRMED) {
      throw new BadRequestException('New orders must start as DRAFT or CONFIRMED');
    }

    const orderNumber = `ORD-${Date.now().toString(36)}-${crypto.randomBytes(3).toString('hex')}`;

    const lines = await Promise.all(
      dto.items.map(async (item) => {
        if (!item.productId && !item.variantId) {
          throw new BadRequestException('Each line needs productId or variantId');
        }
        if (item.productId && item.variantId) {
          throw new BadRequestException('Line cannot include both productId and variantId');
        }

        let unitPrice: Prisma.Decimal;
        if (item.productId) {
          const p = await this.prisma.product.findFirst({
            where: { id: item.productId, deletedAt: null },
          });
          if (!p) throw new NotFoundException(`Product ${item.productId} not found`);
          unitPrice = item.unitPrice ? d(item.unitPrice) : d(p.salePrice);
        } else {
          const v = await this.prisma.productVariant.findFirst({
            where: { id: item.variantId!, deletedAt: null },
            include: { product: true },
          });
          if (!v?.product || v.product.deletedAt) {
            throw new NotFoundException(`Variant ${item.variantId} not found`);
          }
          unitPrice = item.unitPrice ? d(item.unitPrice) : d(v.product.salePrice);
        }

        const lineTotal = unitPrice.mul(item.quantity);
        return {
          productId: item.productId ?? null,
          variantId: item.variantId ?? null,
          quantity: item.quantity,
          unitPrice,
          lineTotal,
        };
      }),
    );

    const subtotal = lines.reduce((acc, l) => acc.add(l.lineTotal), d(0));
    const discountTotal = dto.discountTotal ? d(dto.discountTotal) : d(0);
    const taxTotal = dto.taxTotal ? d(dto.taxTotal) : d(0);
    const total = subtotal.sub(discountTotal).add(taxTotal);

    const order = await this.prisma.$transaction(async (tx) => {
      const o = await tx.order.create({
        data: {
          orderNumber,
          status,
          subtotal,
          discountTotal,
          taxTotal,
          total,
          notes: dto.notes?.trim() || null,
          createdByUserId: user.id,
          items: {
            create: lines.map((l) => ({
              productId: l.productId,
              variantId: l.variantId,
              quantity: l.quantity,
              unitPrice: l.unitPrice,
              lineTotal: l.lineTotal,
            })),
          },
        },
        include: { items: true },
      });

      if (status === OrderStatus.CONFIRMED) {
        await this.applyStockMovement(tx, o.id, user.id, 'SALE');
      }

      return o;
    });

    await this.audit.log({
      actorUserId: user.id,
      action: 'order.create',
      entityType: 'Order',
      entityId: order.id,
      metadata: { orderNumber: order.orderNumber, status: order.status },
      ip,
      userAgent,
    });

    return order;
  }

  async findAll(query: OrderListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = { deletedAt: null };
    if (query.status) where.status = query.status;
    if (query.q) {
      where.OR = [
        { orderNumber: { contains: query.q, mode: 'insensitive' } },
        { notes: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          items: { include: { product: true, variant: true } },
          createdByUser: { select: { id: true, email: true, name: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return buildPaginatedResult(rows, total, page, limit);
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, deletedAt: null },
      include: {
        items: { include: { product: true, variant: true } },
        createdByUser: { select: { id: true, email: true, name: true } },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async confirm(
    id: string,
    user: AuthUser,
    ip?: string,
    userAgent?: string,
  ) {
    const order = await this.prisma.order.findFirst({
      where: { id, deletedAt: null },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== OrderStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT orders can be confirmed');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const o = await tx.order.update({
        where: { id },
        data: { status: OrderStatus.CONFIRMED },
        include: { items: true },
      });
      await this.applyStockMovement(tx, o.id, user.id, 'SALE');
      return o;
    });

    await this.audit.log({
      actorUserId: user.id,
      action: 'order.confirm',
      entityType: 'Order',
      entityId: id,
      ip,
      userAgent,
    });

    return updated;
  }

  async pay(id: string, user: AuthUser, ip?: string, userAgent?: string) {
    const order = await this.ensureOrder(id);
    if (order.status !== OrderStatus.CONFIRMED) {
      throw new BadRequestException('Only CONFIRMED orders can be marked paid');
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: { status: OrderStatus.PAID },
    });

    await this.audit.log({
      actorUserId: user.id,
      action: 'order.pay',
      entityType: 'Order',
      entityId: id,
      ip,
      userAgent,
    });

    return updated;
  }

  async cancel(id: string, user: AuthUser, ip?: string, userAgent?: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, deletedAt: null },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.REFUNDED) {
      throw new BadRequestException('Order already closed');
    }

    const shouldRestore =
      order.status === OrderStatus.CONFIRMED || order.status === OrderStatus.PAID;

    const updated = await this.prisma.$transaction(async (tx) => {
      const o = await tx.order.update({
        where: { id },
        data: { status: OrderStatus.CANCELLED },
        include: { items: true },
      });
      if (shouldRestore) {
        await this.applyStockMovement(tx, o.id, user.id, 'RETURN');
      }
      return o;
    });

    await this.audit.log({
      actorUserId: user.id,
      action: 'order.cancel',
      entityType: 'Order',
      entityId: id,
      metadata: { restoredStock: shouldRestore },
      ip,
      userAgent,
    });

    return updated;
  }

  private async ensureOrder(id: string) {
    const order = await this.prisma.order.findFirst({ where: { id, deletedAt: null } });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  private async applyStockMovement(
    tx: Prisma.TransactionClient,
    orderId: string,
    userId: string,
    mode: 'SALE' | 'RETURN',
  ) {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('Order not found');

    for (const line of order.items) {
      const inv = await tx.inventoryItem.findFirst({
        where: line.productId
          ? { productId: line.productId, deletedAt: null }
          : { variantId: line.variantId!, deletedAt: null },
      });
      if (!inv) {
        throw new BadRequestException(
          `No inventory row for line (product ${line.productId ?? '—'} / variant ${line.variantId ?? '—'})`,
        );
      }

      const delta = mode === 'SALE' ? -line.quantity : line.quantity;

      if (mode === 'SALE' && inv.stockQuantity < line.quantity) {
        throw new BadRequestException(`Insufficient stock for inventory ${inv.id}`);
      }

      const next = inv.stockQuantity + delta;
      if (next < 0) {
        throw new BadRequestException(`Stock would go negative for inventory ${inv.id}`);
      }

      await tx.inventoryItem.update({
        where: { id: inv.id },
        data: { stockQuantity: next },
      });

      await tx.inventoryTransaction.create({
        data: {
          inventoryItemId: inv.id,
          type: mode === 'SALE' ? 'SALE' : 'RETURN',
          quantityDelta: delta,
          reference: order.orderNumber,
          note: `Order ${order.orderNumber}`,
          createdByUserId: userId,
        },
      });
    }
  }
}
