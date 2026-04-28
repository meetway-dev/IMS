import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StockMovementType, Prisma, AuditAction } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { AuthUser } from '../../types/express';
import { buildPaginatedResult } from '../../common/dto/pagination.dto';
import type {
  AdjustStockDto,
  CreateStockMovementDto,
  StockMovementListQueryDto,
  LowStockQueryDto,
  StockLevelQueryDto,
  TransferStockDto,
} from './dto/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async adjustStockLevel(dto: AdjustStockDto, user: AuthUser, ip?: string, userAgent?: string) {
    if (dto.quantityDelta === 0) {
      throw new BadRequestException('quantityDelta cannot be 0');
    }

    const type = dto.type ?? StockMovementType.ADJUSTMENT;

    const result = await this.prisma.$transaction(async (tx) => {
      // Get stock level with warehouse and product info
      const stockLevel = await tx.stockLevel.findFirst({
        where: { id: dto.stockLevelId, deletedAt: null },
        include: {
          product: true,
          variant: true,
          warehouse: true,
          location: true,
        },
      });

      if (!stockLevel) {
        throw new NotFoundException('Stock level not found');
      }

      const nextQuantity = stockLevel.quantity + dto.quantityDelta;
      if (nextQuantity < 0) {
        throw new BadRequestException('Insufficient stock for this adjustment');
      }

      // Update stock level
      const updatedStockLevel = await tx.stockLevel.update({
        where: { id: stockLevel.id },
        data: {
          quantity: nextQuantity,
          available: nextQuantity - stockLevel.reserved,
          updatedAt: new Date(),
        },
      });

      // Create stock movement record
      const stockMovement = await tx.stockMovement.create({
        data: {
          stockLevelId: stockLevel.id,
          type,
          quantity: dto.quantityDelta,
          previousQuantity: stockLevel.quantity,
          newQuantity: nextQuantity,
          referenceType: dto.reference ? 'ADJUSTMENT' : null,
          referenceId: null,
          warehouseId: stockLevel.warehouseId,
          locationId: stockLevel.locationId,
          productId: stockLevel.productId,
          variantId: stockLevel.variantId,
          notes: dto.note,
          createdByUserId: user.id,
        },
      });

      // Check for low stock alert
      await this.checkLowStockAlert(tx, stockLevel, nextQuantity);

      return {
        stockLevel: updatedStockLevel,
        movement: stockMovement,
      };
    });

    await this.audit.log({
      actorUserId: user.id,
      action: AuditAction.INVENTORY_ADJUSTED,
      entityType: 'StockLevel',
      entityId: dto.stockLevelId,
      metadata: {
        quantityDelta: dto.quantityDelta,
        type,
        previousQuantity: result.movement.previousQuantity,
        newQuantity: result.movement.newQuantity,
      },
      ip,
      userAgent,
    });

    return result;
  }

  async createStockMovement(dto: CreateStockMovementDto, user: AuthUser, ip?: string, userAgent?: string) {
    const result = await this.prisma.$transaction(async (tx) => {
      const stockLevel = await tx.stockLevel.findFirst({
        where: { id: dto.stockLevelId, deletedAt: null },
        include: {
          product: true,
          variant: true,
          warehouse: true,
        },
      });

      if (!stockLevel) {
        throw new NotFoundException('Stock level not found');
      }

      const nextQuantity = stockLevel.quantity + dto.quantity;
      if (nextQuantity < 0) {
        throw new BadRequestException('Insufficient stock for this movement');
      }

      // Update stock level
      const updatedStockLevel = await tx.stockLevel.update({
        where: { id: stockLevel.id },
        data: {
          quantity: nextQuantity,
          available: nextQuantity - stockLevel.reserved,
          updatedAt: new Date(),
        },
      });

      // Create stock movement
      const stockMovement = await tx.stockMovement.create({
        data: {
          stockLevelId: stockLevel.id,
          type: dto.type,
          quantity: dto.quantity,
          previousQuantity: stockLevel.quantity,
          newQuantity: nextQuantity,
          referenceType: dto.referenceType,
          referenceId: dto.referenceId,
          warehouseId: stockLevel.warehouseId,
          locationId: stockLevel.locationId,
          productId: stockLevel.productId,
          variantId: stockLevel.variantId,
          notes: dto.note,
          createdByUserId: user.id,
        },
      });

      // Check for low stock alert
      await this.checkLowStockAlert(tx, stockLevel, nextQuantity);

      return {
        stockLevel: updatedStockLevel,
        movement: stockMovement,
      };
    });

    await this.audit.log({
      actorUserId: user.id,
      action: AuditAction.INVENTORY_ADJUSTED,
      entityType: 'StockMovement',
      entityId: result.movement.id,
      metadata: {
        type: dto.type,
        quantity: dto.quantity,
        stockLevelId: dto.stockLevelId,
      },
      ip,
      userAgent,
    });

    return result;
  }

  async listStockMovements(query: StockMovementListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.StockMovementWhereInput = {};
    
    if (query.stockLevelId) where.stockLevelId = query.stockLevelId;
    if (query.productId) where.productId = query.productId;
    if (query.variantId) where.variantId = query.variantId;
    if (query.warehouseId) where.warehouseId = query.warehouseId;
    if (query.type) where.type = query.type;
    
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.stockMovement.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          stockLevel: {
            include: {
              product: true,
              variant: true,
              warehouse: true,
              location: true,
            },
          },
          createdByUser: {
            select: { id: true, email: true, name: true },
          },
        },
      }),
      this.prisma.stockMovement.count({ where }),
    ]);

    return buildPaginatedResult(rows, total, page, limit);
  }

  async getLowStockAlerts(query: LowStockQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.StockLevelWhereInput = {
      deletedAt: null,
    };

    if (query.warehouseId) where.warehouseId = query.warehouseId;

    // Get all stock levels first, then filter in memory for low stock
    const allStockLevels = await this.prisma.stockLevel.findMany({
      where,
      include: {
        product: true,
        variant: true,
        warehouse: true,
        location: true,
      },
      skip,
      take: limit,
      orderBy: { quantity: 'asc' },
    });

    // Filter for low stock in memory
    const lowStockLevels = allStockLevels.filter((level) => {
      const minQty = level.minQuantity || 0;
      const reorderPoint = level.reorderPoint || minQty;
      const threshold = Math.min(minQty, reorderPoint);
      return level.quantity <= threshold;
    });

    const total = await this.prisma.stockLevel.count({
      where,
    });

    // Calculate alert severity
    const alerts = lowStockLevels.map((level) => {
      const minQty = level.minQuantity || 0;
      const reorderPoint = level.reorderPoint || minQty;
      const threshold = Math.min(minQty, reorderPoint);
      
      let severity = 'LOW';
      if (level.quantity <= 0) severity = 'CRITICAL';
      else if (level.quantity <= threshold * 0.2) severity = 'HIGH';
      else if (level.quantity <= threshold * 0.5) severity = 'MEDIUM';

      return {
        ...level,
        alertSeverity: severity,
        threshold,
        percentage: threshold > 0 ? Math.round((level.quantity / threshold) * 100) : 0,
      };
    });

    return buildPaginatedResult(alerts, lowStockLevels.length, page, limit);
  }

  async listStockLevels(query: StockLevelQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.StockLevelWhereInput = {
      deletedAt: null,
    };

    if (query.productId) where.productId = query.productId;
    if (query.variantId) where.variantId = query.variantId;
    if (query.warehouseId) where.warehouseId = query.warehouseId;
    if (query.locationId) where.locationId = query.locationId;

    // Apply stock level filters
    if (query.filter === 'low') {
      // Get all and filter in memory
      const allLevels = await this.prisma.stockLevel.findMany({
        where,
        include: {
          product: true,
          variant: true,
          warehouse: true,
          location: true,
        },
      });

      const lowLevels = allLevels.filter((level) => {
        const minQty = level.minQuantity || 0;
        const reorderPoint = level.reorderPoint || minQty;
        const threshold = Math.min(minQty, reorderPoint);
        return level.quantity <= threshold;
      }).slice(skip, skip + limit);

      return buildPaginatedResult(lowLevels, lowLevels.length, page, limit);
    } else if (query.filter === 'out') {
      where.quantity = { lte: 0 };
    } else if (query.filter === 'normal') {
      // Get all and filter in memory for normal stock
      const allLevels = await this.prisma.stockLevel.findMany({
        where,
        include: {
          product: true,
          variant: true,
          warehouse: true,
          location: true,
        },
      });

      const normalLevels = allLevels.filter((level) => {
        const minQty = level.minQuantity || 0;
        const reorderPoint = level.reorderPoint || minQty;
        const threshold = Math.min(minQty, reorderPoint);
        return level.quantity > threshold;
      }).slice(skip, skip + limit);

      return buildPaginatedResult(normalLevels, normalLevels.length, page, limit);
    }

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.stockLevel.findMany({
        where,
        include: {
          product: true,
          variant: true,
          warehouse: true,
          location: true,
        },
        skip,
        take: limit,
        orderBy: { quantity: 'asc' },
      }),
      this.prisma.stockLevel.count({ where }),
    ]);

    return buildPaginatedResult(rows, total, page, limit);
  }

  async transferStock(dto: TransferStockDto, user: AuthUser, ip?: string, userAgent?: string) {
    const result = await this.prisma.$transaction(async (tx) => {
      // Get source stock level
      const fromStockLevel = await tx.stockLevel.findFirst({
        where: { id: dto.fromStockLevelId, deletedAt: null },
        include: { warehouse: true, location: true, product: true, variant: true },
      });

      if (!fromStockLevel) {
        throw new NotFoundException('Source stock level not found');
      }

      // Get destination stock level
      const toStockLevel = await tx.stockLevel.findFirst({
        where: { id: dto.toStockLevelId, deletedAt: null },
        include: { warehouse: true, location: true, product: true, variant: true },
      });

      if (!toStockLevel) {
        throw new NotFoundException('Destination stock level not found');
      }

      // Verify products match
      if (fromStockLevel.productId !== toStockLevel.productId || 
          fromStockLevel.variantId !== toStockLevel.variantId) {
        throw new BadRequestException('Cannot transfer between different products/variants');
      }

      // Check sufficient stock
      if (fromStockLevel.quantity < dto.quantity) {
        throw new BadRequestException('Insufficient stock for transfer');
      }

      // Update source stock level (OUT movement)
      const updatedFrom = await tx.stockLevel.update({
        where: { id: fromStockLevel.id },
        data: {
          quantity: fromStockLevel.quantity - dto.quantity,
          available: (fromStockLevel.quantity - dto.quantity) - fromStockLevel.reserved,
          updatedAt: new Date(),
        },
      });

      // Update destination stock level (IN movement)
      const updatedTo = await tx.stockLevel.update({
        where: { id: toStockLevel.id },
        data: {
          quantity: toStockLevel.quantity + dto.quantity,
          available: (toStockLevel.quantity + dto.quantity) - toStockLevel.reserved,
          updatedAt: new Date(),
        },
      });

      // Create OUT movement
      const outMovement = await tx.stockMovement.create({
        data: {
          stockLevelId: fromStockLevel.id,
          type: StockMovementType.TRANSFER_OUT,
          quantity: -dto.quantity,
          previousQuantity: fromStockLevel.quantity,
          newQuantity: updatedFrom.quantity,
          referenceType: 'TRANSFER',
          referenceId: toStockLevel.id,
          warehouseId: fromStockLevel.warehouseId,
          locationId: fromStockLevel.locationId,
          productId: fromStockLevel.productId,
          variantId: fromStockLevel.variantId,
          notes: dto.note || `Transfer to ${toStockLevel.warehouse.name}`,
          createdByUserId: user.id,
        },
      });

      // Create IN movement
      const inMovement = await tx.stockMovement.create({
        data: {
          stockLevelId: toStockLevel.id,
          type: StockMovementType.TRANSFER_IN,
          quantity: dto.quantity,
          previousQuantity: toStockLevel.quantity,
          newQuantity: updatedTo.quantity,
          referenceType: 'TRANSFER',
          referenceId: fromStockLevel.id,
          warehouseId: toStockLevel.warehouseId,
          locationId: toStockLevel.locationId,
          productId: toStockLevel.productId,
          variantId: toStockLevel.variantId,
          notes: dto.note || `Transfer from ${fromStockLevel.warehouse.name}`,
          createdByUserId: user.id,
        },
      });

      // Check low stock alerts
      await this.checkLowStockAlert(tx, fromStockLevel, updatedFrom.quantity);
      await this.checkLowStockAlert(tx, toStockLevel, updatedTo.quantity);

      return {
        from: updatedFrom,
        to: updatedTo,
        outMovement,
        inMovement,
      };
    });

    await this.audit.log({
      actorUserId: user.id,
      action: AuditAction.INVENTORY_ADJUSTED,
      entityType: 'StockLevel',
      entityId: dto.fromStockLevelId,
      metadata: {
        transfer: true,
        quantity: dto.quantity,
        fromStockLevelId: dto.fromStockLevelId,
        toStockLevelId: dto.toStockLevelId,
      },
      ip,
      userAgent,
    });

    return result;
  }

  async getStockHistory(productId?: string, variantId?: string, warehouseId?: string) {
    const where: Prisma.StockMovementWhereInput = {};
    
    if (productId) where.productId = productId;
    if (variantId) where.variantId = variantId;
    if (warehouseId) where.warehouseId = warehouseId;

    const movements = await this.prisma.stockMovement.findMany({
      where,
      include: {
        stockLevel: {
          include: {
            product: true,
            variant: true,
            warehouse: true,
            location: true,
          },
        },
        createdByUser: {
          select: { id: true, email: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit to recent 100 movements
    });

    return movements;
  }

  private async checkLowStockAlert(
    tx: Prisma.TransactionClient,
    stockLevel: any,
    newQuantity: number,
  ) {
    const minQty = stockLevel.minQuantity || 0;
    const reorderPoint = stockLevel.reorderPoint || minQty;
    const threshold = Math.min(minQty, reorderPoint);

    // Check if stock is below threshold
    if (newQuantity <= threshold) {
      const existingAlert = await tx.stockAlert.findFirst({
        where: {
          stockLevelId: stockLevel.id,
          status: 'ACTIVE',
          alertType: 'LOW_STOCK',
        },
      });

      if (!existingAlert) {
        let severity = 'LOW';
        if (newQuantity <= 0) severity = 'CRITICAL';
        else if (newQuantity <= threshold * 0.2) severity = 'HIGH';
        else if (newQuantity <= threshold * 0.5) severity = 'MEDIUM';

        await tx.stockAlert.create({
          data: {
            stockLevelId: stockLevel.id,
            alertType: 'LOW_STOCK',
            severity,
            message: `Stock level is below ${threshold}. Current: ${newQuantity}`,
            status: 'ACTIVE',
          },
        });
      }
    }
  }

  async getStockLevel(id: string) {
    const stockLevel = await this.prisma.stockLevel.findFirst({
      where: { id, deletedAt: null },
      include: {
        product: true,
        variant: true,
        warehouse: true,
        location: true,
      },
    });

    if (!stockLevel) {
      throw new NotFoundException('Stock level not found');
    }

    return stockLevel;
  }
}
