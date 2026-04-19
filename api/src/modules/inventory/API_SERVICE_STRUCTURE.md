# ERP Inventory System - Complete API Structure & Service Logic

## API Structure Overview

### 1. Core Services Architecture

```
src/modules/
├── inventory/
│   ├── services/
│   │   ├── inventory-core.service.ts      # Core inventory operations
│   │   ├── purchase.service.ts            # Purchase flow
│   │   ├── sales.service.ts               # Sales flow  
│   │   ├── transfer.service.ts            # Warehouse transfers
│   │   ├── adjustment.service.ts          # Stock adjustments
│   │   ├── pricing.service.ts             # Pricing logic
│   │   ├── alert.service.ts               # Low stock alerts
│   │   └── reporting.service.ts           # Reports
│   ├── controllers/
│   │   ├── inventory.controller.ts
│   │   ├── purchase.controller.ts
│   │   ├── sales.controller.ts
│   │   └── reports.controller.ts
│   ├── dto/
│   │   ├── inventory.dto.ts
│   │   ├── purchase.dto.ts
│   │   ├── sales.dto.ts
│   │   └── reports.dto.ts
│   └── inventory.module.ts
```

### 2. REST API Endpoints

#### Inventory Management
```
GET    /api/inventory/products/:id/stock     # Get product stock across warehouses
GET    /api/inventory/warehouses/:id/stock   # Get warehouse stock
POST   /api/inventory/movements              # Record stock movement
GET    /api/inventory/movements              # List stock movements
GET    /api/inventory/movements/:id          # Get movement details
GET    /api/inventory/availability/:variantId # Check availability
```

#### Purchase Management
```
POST   /api/purchase/orders                  # Create purchase order
GET    /api/purchase/orders                  # List purchase orders
GET    /api/purchase/orders/:id              # Get purchase order
PUT    /api/purchase/orders/:id/approve      # Approve purchase order
POST   /api/purchase/orders/:id/receive      # Receive goods
POST   /api/purchase/orders/:id/invoice      # Process invoice
GET    /api/purchase/orders/:id/items        # Get PO items
```

#### Sales Management
```
POST   /api/sales/orders                     # Create sales order
GET    /api/sales/orders                     # List sales orders
GET    /api/sales/orders/:id                 # Get sales order
PUT    /api/sales/orders/:id/confirm         # Confirm order
POST   /api/sales/orders/:id/fulfill         # Fulfill order
POST   /api/sales/orders/:id/cancel          # Cancel order
GET    /api/sales/orders/:id/reservations    # Get stock reservations
```

#### Warehouse Transfers
```
POST   /api/transfers                        # Create transfer
GET    /api/transfers                        # List transfers
GET    /api/transfers/:id                    # Get transfer
PUT    /api/transfers/:id/approve            # Approve transfer
POST   /api/transfers/:id/pick               # Pick items
POST   /api/transfers/:id/receive            # Receive at destination
POST   /api/transfers/:id/complete           # Complete transfer
```

#### Stock Adjustments
```
POST   /api/adjustments                      # Create adjustment
GET    /api/adjustments                      # List adjustments
GET    /api/adjustments/:id                  # Get adjustment
PUT    /api/adjustments/:id/approve          # Approve adjustment
POST   /api/adjustments/:id/apply            # Apply adjustment
```

#### Reports
```
GET    /api/reports/stock-levels             # Stock levels report
GET    /api/reports/movement-history         # Movement history
GET    /api/reports/inventory-valuation      # Inventory valuation
GET    /api/reports/low-stock-alerts         # Low stock alerts
GET    /api/reports/expiring-batches         # Expiring batches
GET    /api/reports/turnover                 # Inventory turnover
```

### 3. Service Implementations

#### Inventory Core Service
```typescript
// inventory-core.service.ts
@Injectable()
export class InventoryCoreService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService
  ) {}

  async recordStockMovement(
    data: StockMovementData,
    tx?: Prisma.TransactionClient
  ): Promise<StockMovement> {
    const prisma = tx || this.prisma;
    
    return await prisma.$transaction(async (transaction) => {
      // 1. Update warehouse inventory
      const inventory = await this.updateWarehouseInventory(
        data.variantId,
        data.warehouseId,
        data.batchId,
        data.quantity,
        transaction
      );

      // 2. Create stock movement record
      const movement = await transaction.stockMovement.create({
        data: {
          inventoryId: inventory.id,
          type: data.type,
          quantity: data.quantity,
          reference: data.reference,
          referenceId: data.referenceId,
          fromWarehouseId: data.fromWarehouseId,
          toWarehouseId: data.toWarehouseId,
          fromLocationId: data.fromLocationId,
          toLocationId: data.toLocationId,
          batchId: data.batchId,
          userId: data.userId,
          notes: data.notes,
          metadata: data.metadata
        }
      });

      // 3. Update available stock (computed field)
      await transaction.warehouseInventory.update({
        where: { id: inventory.id },
        data: {
          available: { decrement: data.quantity < 0 ? Math.abs(data.quantity) : 0 }
        }
      });

      // 4. Audit log
      await this.auditService.log({
        actorUserId: data.userId,
        action: this.getAuditActionForMovementType(data.type),
        entityType: 'StockMovement',
        entityId: movement.id,
        metadata: {
          variantId: data.variantId,
          warehouseId: data.warehouseId,
          quantity: data.quantity,
          reference: data.reference
        }
      });

      return movement;
    });
  }

  async getAvailableStock(
    variantId: string,
    warehouseId?: string
  ): Promise<number> {
    const where: any = { variantId };
    if (warehouseId) where.warehouseId = warehouseId;

    const inventories = await this.prisma.warehouseInventory.findMany({
      where,
      select: { available: true }
    });

    return inventories.reduce((sum, inv) => sum + inv.available, 0);
  }

  async allocateBatches(
    variantId: string,
    warehouseId: string,
    quantity: number,
    strategy: 'FIFO' | 'LIFO' = 'FIFO'
  ): Promise<BatchAllocation[]> {
    const batches = await this.prisma.warehouseInventory.findMany({
      where: {
        variantId,
        warehouseId,
        batchId: { not: null },
        available: { gt: 0 }
      },
      include: { batch: true },
      orderBy: strategy === 'FIFO' 
        ? { batch: { productionDate: 'asc' } }
        : { batch: { productionDate: 'desc' } }
    });

    const allocations: BatchAllocation[] = [];
    let remaining = quantity;

    for (const inventory of batches) {
      if (remaining <= 0) break;

      const allocate = Math.min(inventory.available, remaining);
      allocations.push({
        batchId: inventory.batchId!,
        quantity: allocate,
        warehouseInventoryId: inventory.id
      });
      remaining -= allocate;
    }

    if (remaining > 0) {
      // Allocate from non-batch stock
      const nonBatch = await this.prisma.warehouseInventory.findFirst({
        where: {
          variantId,
          warehouseId,
          batchId: null,
          available: { gt: 0 }
        }
      });

      if (nonBatch) {
        const allocate = Math.min(nonBatch.available, remaining);
        allocations.push({
          batchId: null,
          quantity: allocate,
          warehouseInventoryId: nonBatch.id
        });
        remaining -= allocate;
      }
    }

    if (remaining > 0) {
      throw new BadRequestException(
        `Insufficient stock for allocation. Required: ${quantity}, Available: ${quantity - remaining}`
      );
    }

    return allocations;
  }

  private async updateWarehouseInventory(
    variantId: string,
    warehouseId: string,
    batchId: string | null,
    quantity: number,
    tx: Prisma.TransactionClient
  ) {
    // Find or create inventory record
    let inventory = await tx.warehouseInventory.findFirst({
      where: {
        variantId,
        warehouseId,
        batchId: batchId || null
      }
    });

    if (!inventory) {
      inventory = await tx.warehouseInventory.create({
        data: {
          variantId,
          warehouseId,
          batchId,
          quantity: 0,
          reserved: 0,
          available: 0
        }
      });
    }

    // Update quantity
    const newQuantity = inventory.quantity + quantity;
    if (newQuantity < 0) {
      throw new BadRequestException(
        `Insufficient stock. Current: ${inventory.quantity}, Attempted: ${quantity}`
      );
    }

    return await tx.warehouseInventory.update({
      where: { id: inventory.id },
      data: {
        quantity: newQuantity,
        available: newQuantity - inventory.reserved
      }
    });
  }
}
```

#### Pricing Service
```typescript
// pricing.service.ts
@Injectable()
export class PricingService {
  constructor(private readonly prisma: PrismaService) {}

  async calculateOrderPricing(
    items: OrderItemDto[],
    customerId?: string,
    discounts?: DiscountDto[]
  ): Promise<PricingResult> {
    const lineItems: LineItemPricing[] = [];
    let subtotal = 0;

    // Calculate line items
    for (const item of items) {
      const variant = await this.prisma.productVariant.findUniqueOrThrow({
        where: { id: item.variantId },
        include: { product: true }
      });

      // Get price based on customer pricing tier
      const unitPrice = await this.getCustomerPrice(
        variant.id,
        customerId,
        item.quantity
      );

      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;

      lineItems.push({
        variantId: item.variantId,
        unitPrice,
        lineTotal,
        basePrice: variant.salePrice || variant.product.retailPrice,
        discountApplied: 0
      });
    }

    // Apply discounts
    const discountTotal = await this.applyDiscounts(subtotal, discounts, customerId);

    // Calculate taxes
    const taxTotal = this.calculateTax(subtotal - discountTotal);

    // Calculate shipping
    const shippingTotal = await this.calculateShipping(items, customerId);

    const total = subtotal - discountTotal + taxTotal + shippingTotal;

    return {
      subtotal,
      discountTotal,
      taxTotal,
      shippingTotal,
      total,
      lineItems
    };
  }

  async getCustomerPrice(
    variantId: string,
    customerId?: string,
    quantity?: number
  ): Promise<number> {
    // 1. Check for customer-specific pricing
    if (customerId) {
      const customerPrice = await this.prisma.customerPrice.findFirst({
        where: {
          variantId,
          customerId,
          ...(quantity && { minQuantity: { lte: quantity } })
        },
        orderBy: { minQuantity: 'desc' }
      });

      if (customerPrice) {
        return customerPrice.price.toNumber();
      }
    }

    // 2. Check for quantity breaks
    if (quantity) {
      const quantityPrice = await this.prisma.quantityPrice.findFirst({
        where: {
          variantId,
          minQuantity: { lte: quantity },
          maxQuantity: { gte: quantity }
        }
      });

      if (quantityPrice) {
        return quantityPrice.price.toNumber();
      }
    }

    // 3. Get variant price or fallback to product price
    const variant = await this.prisma.productVariant.findUniqueOrThrow({
      where: { id: variantId },
      include: { product: true }
    });

    return variant.salePrice?.toNumber() || variant.product.retailPrice.toNumber();
  }

  calculateProfitMargin(costPrice: number, salePrice: number): number {
    if (costPrice <= 0) return 0;
    return ((salePrice - costPrice) / costPrice) * 100;
  }
}
```

#### Alert Service
```typescript
// alert.service.ts
@Injectable()
export class AlertService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService
  ) {}

  async checkLowStockAlerts(): Promise<Alert[]> {
    const alerts: Alert[] = [];

    // Check low stock levels
    const lowStockItems = await this.prisma.warehouseInventory.findMany({
      where: {
        quantity: { lte: this.prisma.warehouseInventory.fields.reorderPoint },
        available: { gt: 0 }
      },
      include: {
        variant: { include: { product: true } },
        warehouse: true
      }
    });

    for (const item of lowStockItems) {
      const severity = this.calculateSeverity(item.quantity, item.reorderPoint || 0);
      
      alerts.push({
        type: 'LOW_STOCK',
        severity,
        title: `Low Stock Alert: ${item.variant.product.name}`,
        message: `${item.variant.sku} is below reorder point in ${item.warehouse.name}`,
        data: {
          variantId: item.variantId,
          warehouseId: item.warehouseId,
          currentQuantity: item.quantity,
          reorderPoint: item.reorderPoint,
          available: item.available
        },
        createdAt: new Date()
      });
    }

    // Check expiring batches
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringBatches = await this.prisma.batch.findMany({
      where: {
        expiryDate: { lte: thirtyDaysFromNow, gt: new Date() },
        status: 'ACTIVE'
      },
      include: {
        variant: { include: { product: true } },
        inventories: { include: { warehouse: true } }
      }
    });

    for (const batch of expiringBatches) {
      const daysUntilExpiry = Math.ceil(
        (batch.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      alerts.push({
        type: 'BATCH_EXPIRY',
        severity: daysUntilExpiry <= 7 ? 'CRITICAL' : 'WARNING',
        title: `Batch Expiring: ${batch.batchNumber}`,
        message: `${batch.variant.product.name} batch expires in ${daysUntilExpiry} days`,
        data: {
          batchId: batch.id,
          variantId: batch.variantId,
          expiryDate: batch.expiryDate,
          daysUntilExpiry,
          totalQuantity: batch.inventories.reduce((sum, inv) => sum + inv.quantity, 0)
        },
        createdAt: new Date()
      });
    }

    // Send notifications for critical alerts
    const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL');
    if (criticalAlerts.length > 0) {
      await this.notificationService.sendBatchNotifications(criticalAlerts);
    }

    return alerts;
  }

  private calculateSeverity(current: number, reorderPoint: number): AlertSeverity {
    const percentage = (current / reorderPoint) * 100;
    
    if (percentage <= 25) return 'CRITICAL';
    if (percentage <= 50) return 'HIGH';
    if (percentage <= 75) return 'MEDIUM';
    return 'LOW';
  }
}
```

#### Reporting Service
```typescript
// reporting.service.ts
@Injectable()
export class ReportingService {
  constructor(private readonly prisma: PrismaService) {}

  async generateStockLevelsReport(filters: ReportFilters): Promise<StockLevelsReport> {
    const where = this.buildWhereClause(filters);

    const stockData = await this.prisma.warehouseInventory.findMany({
      where,
      include: {
        variant: {
          include: {
            product: {
              include: { category: true, supplier: true }
            }
          }
        },
        warehouse: true,
        batch: true
      },
      orderBy: { quantity: 'asc' }
    });

    // Calculate totals
    const totalValue = stockData.reduce((sum, item) => {
      const cost = item.variant.costPrice?.toNumber() || 
                  item.variant.product.costPrice.toNumber();
      return sum + (item.quantity * cost);
    }, 0);

    const totalItems = stockData.reduce((sum, item) => sum + item.quantity, 0);
    const totalSKUs = new Set(stockData.map(item => item.variantId)).size;

    // Group by category
    const byCategory = stockData.reduce((acc, item) => {
      const category = item.variant.product.category?.name || 'Uncategorized';
      if (!acc[category]) acc[category] = { quantity: 0, value: 0 };
      
      const cost = item.variant.costPrice?.toNumber() || 
                  item.variant.product.costPrice.toNumber();
      
      acc[category].quantity += item.quantity;
      acc[category].value += item.quantity * cost;
      return acc;
    }, {} as Record<string, { quantity: number; value: number }>);

    // Identify low stock items
    const lowStock = stockData.filter(item => {
      const reorderPoint = item.reorderPoint || item.variant.product.reorderPoint || 0;
      return item.quantity <= reorderPoint;
    });

    return