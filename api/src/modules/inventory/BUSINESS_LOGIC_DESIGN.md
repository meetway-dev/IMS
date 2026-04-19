# ERP Inventory System - Business Logic & Workflows

## Overview
This document outlines the business logic, workflows, and service implementations for the enhanced ERP inventory system.

## 1. Purchase Flow with Batch Creation

### Workflow Steps
```
1. Create Purchase Order (PO)
   → Supplier selection
   → Add line items (product variants, quantities, unit prices)
   → Set delivery warehouse/location
   → Set expected delivery date

2. PO Approval (optional workflow)
   → Manager approval if amount > threshold
   → Finance department approval

3. Goods Receipt
   → Scan/enter received items
   → Batch creation (if applicable)
   → Quality inspection
   → Stock increase in warehouse

4. Invoice Processing
   → Match invoice with PO
   → Three-way matching (PO, GRN, Invoice)
   → Payment processing
```

### Service Implementation

```typescript
// purchase.service.ts
@Injectable()
export class PurchaseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryService: InventoryService,
    private readonly auditService: AuditService,
    private readonly notificationService: NotificationService
  ) {}

  async createPurchaseOrder(dto: CreatePurchaseOrderDto, user: AuthUser) {
    return await this.prisma.$transaction(async (tx) => {
      // Generate PO number
      const poNumber = await this.generatePONumber();
      
      // Create PO
      const purchaseOrder = await tx.purchaseOrder.create({
        data: {
          poNumber,
          supplierId: dto.supplierId,
          warehouseId: dto.warehouseId,
          expectedDeliveryDate: dto.expectedDeliveryDate,
          status: 'DRAFT',
          createdByUserId: user.id,
          totalAmount: dto.items.reduce((sum, item) => 
            sum + (item.quantity * item.unitPrice), 0
          ),
          items: {
            create: dto.items.map(item => ({
              variantId: item.variantId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              lineTotal: item.quantity * item.unitPrice,
              notes: item.notes
            }))
          }
        },
        include: { items: true }
      });

      // Audit log
      await this.auditService.log({
        actorUserId: user.id,
        action: AuditAction.PURCHASE_ORDER_CREATED,
        entityType: 'PurchaseOrder',
        entityId: purchaseOrder.id,
        metadata: { poNumber, totalAmount: purchaseOrder.totalAmount }
      });

      return purchaseOrder;
    });
  }

  async receiveGoods(dto: ReceiveGoodsDto, user: AuthUser) {
    return await this.prisma.$transaction(async (tx) => {
      const po = await tx.purchaseOrder.findUniqueOrThrow({
        where: { id: dto.purchaseOrderId },
        include: { items: true }
      });

      // Validate PO status
      if (!['APPROVED', 'PARTIALLY_RECEIVED'].includes(po.status)) {
        throw new BadRequestException('PO not in receivable status');
      }

      const batchPromises = dto.items.map(async (receivedItem) => {
        const poItem = po.items.find(item => item.variantId === receivedItem.variantId);
        if (!poItem) throw new NotFoundException('Item not in PO');

        // Create batch if batch number provided
        let batchId: string | undefined;
        if (receivedItem.batchNumber) {
          const batch = await tx.batch.create({
            data: {
              variantId: receivedItem.variantId,
              batchNumber: receivedItem.batchNumber,
              productionDate: receivedItem.productionDate,
              expiryDate: receivedItem.expiryDate,
              status: receivedItem.qualityStatus || 'ACTIVE',
              qualityNotes: receivedItem.qualityNotes
            }
          });
          batchId = batch.id;
        }

        // Update inventory
        await this.inventoryService.recordStockMovement({
          type: 'PURCHASE',
          variantId: receivedItem.variantId,
          warehouseId: po.warehouseId,
          locationId: receivedItem.locationId,
          batchId,
          quantity: receivedItem.quantity,
          reference: po.poNumber,
          referenceId: po.id,
          userId: user.id,
          notes: `Goods receipt for PO ${po.poNumber}`
        }, tx);

        return { variantId: receivedItem.variantId, quantity: receivedItem.quantity, batchId };
      });

      const results = await Promise.all(batchPromises);

      // Update PO status
      const totalReceived = results.reduce((sum, r) => sum + r.quantity, 0);
      const totalOrdered = po.items.reduce((sum, item) => sum + item.quantity, 0);
      
      const newStatus = totalReceived >= totalOrdered ? 'FULLY_RECEIVED' : 'PARTIALLY_RECEIVED';
      
      await tx.purchaseOrder.update({
        where: { id: po.id },
        data: { status: newStatus, receivedAt: new Date() }
      });

      // Trigger low stock re-evaluation
      await this.notificationService.checkLowStockAlerts();

      return results;
    });
  }

  private async generatePONumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.purchaseOrder.count({
      where: { createdAt: { gte: new Date(`${year}-01-01`) } }
    });
    return `PO-${year}-${(count + 1).toString().padStart(5, '0')}`;
  }
}
```

### Edge Cases Handling
1. **Partial deliveries**: Track received vs ordered quantities
2. **Quality rejections**: Create quarantined batches
3. **Price variances**: Flag if received price differs from PO price
4. **Early/late deliveries**: Track against expected dates

## 2. Sales Flow with Stock Validation

### Workflow Steps
```
1. Order Creation
   → Customer selection
   → Add items with quantities
   → Price calculation (apply discounts, taxes)

2. Stock Reservation
   → Check availability across warehouses
   → Reserve stock (prevent overselling)
   → Allocate specific batches (FIFO/LIFO)

3. Order Fulfillment
   → Pick list generation
   → Packing and shipping
   → Stock deduction upon shipment

4. Invoicing & Payment
   → Generate invoice
   → Track payment status
```

### Service Implementation

```typescript
// sales.service.ts
@Injectable()
export class SalesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryService: InventoryService,
    private readonly pricingService: PricingService
  ) {}

  async createSalesOrder(dto: CreateSalesOrderDto, user: AuthUser) {
    return await this.prisma.$transaction(async (tx) => {
      // Validate stock availability
      await this.validateStockAvailability(dto.items, dto.warehouseId);

      // Generate order number
      const orderNumber = await this.generateOrderNumber();

      // Calculate pricing
      const pricingResult = await this.pricingService.calculateOrderPricing(
        dto.items,
        dto.customerId,
        dto.discounts
      );

      // Create order
      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId: dto.customerId,
          warehouseId: dto.warehouseId,
          status: 'DRAFT',
          subtotal: pricingResult.subtotal,
          discountTotal: pricingResult.discountTotal,
          taxTotal: pricingResult.taxTotal,
          shippingTotal: pricingResult.shippingTotal,
          total: pricingResult.total,
          createdByUserId: user.id,
          items: {
            create: dto.items.map((item, index) => ({
              variantId: item.variantId,
              quantity: item.quantity,
              unitPrice: pricingResult.lineItems[index].unitPrice,
              lineTotal: pricingResult.lineItems[index].lineTotal,
              notes: item.notes
            }))
          }
        },
        include: { items: true }
      });

      // Reserve stock
      await this.reserveStockForOrder(order.id, dto.items, dto.warehouseId, user.id);

      return order;
    });
  }

  async fulfillOrder(orderId: string, user: AuthUser) {
    return await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUniqueOrThrow({
        where: { id: orderId },
        include: { items: true, reservations: true }
      });

      if (order.status !== 'CONFIRMED') {
        throw new BadRequestException('Order not in confirmable status');
      }

      // Deduct reserved stock
      for (const reservation of order.reservations) {
        await this.inventoryService.recordStockMovement({
          type: 'SALE',
          variantId: reservation.variantId,
          warehouseId: order.warehouseId,
          batchId: reservation.batchId,
          quantity: -reservation.quantity, // Negative for deduction
          reference: order.orderNumber,
          referenceId: order.id,
          userId: user.id,
          notes: `Order fulfillment for ${order.orderNumber}`
        }, tx);
      }

      // Update order status
      await tx.order.update({
        where: { id: orderId },
        data: { 
          status: 'FULFILLED',
          fulfilledAt: new Date(),
          fulfilledByUserId: user.id 
        }
      });

      // Release any remaining reservations
      await tx.stockReservation.deleteMany({
        where: { orderId }
      });

      return order;
    });
  }

  private async validateStockAvailability(
    items: OrderItemDto[], 
    warehouseId: string
  ): Promise<void> {
    for (const item of items) {
      const available = await this.inventoryService.getAvailableStock(
        item.variantId,
        warehouseId
      );
      
      if (available < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for variant ${item.variantId}. ` +
          `Available: ${available}, Requested: ${item.quantity}`
        );
      }
    }
  }

  private async reserveStockForOrder(
    orderId: string,
    items: OrderItemDto[],
    warehouseId: string,
    userId: string
  ): Promise<void> {
    for (const item of items) {
      // Allocate specific batches (FIFO strategy)
      const batches = await this.inventoryService.allocateBatches(
        item.variantId,
        warehouseId,
        item.quantity,
        'FIFO'
      );

      // Create reservations
      for (const batch of batches) {
        await this.prisma.stockReservation.create({
          data: {
            orderId,
            variantId: item.variantId,
            batchId: batch.batchId,
            quantity: batch.quantity,
            reservedByUserId: userId,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
          }
        });
      }
    }
  }
}
```

### Stock Validation Rules
1. **Real-time availability**: Check available = quantity - reserved
2. **Batch allocation**: FIFO (First In First Out) by default
3. **Reservation expiry**: Auto-release after 24 hours
4. **Concurrent orders**: Use database transactions with row locking

## 3. Inventory Transfer Workflow

### Workflow Steps
```
1. Transfer Request
   → Source warehouse/location
   → Destination warehouse/location
   → Items with quantities
   → Reason for transfer

2. Approval (if required)
   → Warehouse manager approval
   → Inventory controller approval

3. Stock Pick & Pack
   → Generate pick list
   → Physical movement
   → Update system status

4. Receipt at Destination
   → Verify received items
   → Update destination stock
   → Complete transfer
```

### Service Implementation

```typescript
// transfer.service.ts
@Injectable()
export class TransferService {
  async createTransfer(dto: CreateTransferDto, user: AuthUser) {
    return await this.prisma.$transaction(async (tx) => {
      // Validate source stock
      await this.validateSourceStock(dto.items, dto.fromWarehouseId);

      // Generate transfer number
      const transferNumber = await this.generateTransferNumber();

      // Create transfer
      const transfer = await tx.warehouseTransfer.create({
        data: {
          transferNumber,
          fromWarehouseId: dto.fromWarehouseId,
          toWarehouseId: dto.toWarehouseId,
          status: 'PENDING',
          notes: dto.notes,
          createdByUserId: user.id,
          items: {
            create: dto.items.map(item => ({
              variantId: item.variantId,
              quantity: item.quantity,
              batchId: item.batchId
            }))
          }
        },
        include: { items: true }
      });

      // Reserve stock at source
      for (const item of dto.items) {
        await this.inventoryService.recordStockMovement({
          type: 'TRANSFER_OUT',
          variantId: item.variantId,
          warehouseId: dto.fromWarehouseId,
          batchId: item.batchId,
          quantity: -item.quantity,
          reference: transferNumber,
          referenceId: transfer.id,
          userId: user.id,
          notes: `Transfer out to ${dto.toWarehouseId}`
        }, tx);
      }

      return transfer;
    });
  }

  async completeTransfer(transferId: string, user: AuthUser) {
    return await this.prisma.$transaction(async (tx) => {
      const transfer = await tx.warehouseTransfer.findUniqueOrThrow({
        where: { id: transferId },
        include: { items: true }
      });

      if (transfer.status !== 'IN_TRANSIT') {
        throw new BadRequestException('Transfer not in transit');
      }

      // Add stock at destination
      for (const item of transfer.items) {
        await this.inventoryService.recordStockMovement({
          type: 'TRANSFER_IN',
          variantId: item.variantId,
          warehouseId: transfer.toWarehouseId,
          batchId: item.batchId,
          quantity: item.quantity,
          reference: transfer.transferNumber,
          referenceId: transfer.id,
          userId: user.id,
          notes: `Transfer in from ${transfer.fromWarehouseId}`
        }, tx);
      }

      // Update transfer status
      await tx.warehouseTransfer.update({
        where: { id: transferId },
        data: { 
          status: 'COMPLETED',
          completedAt: new Date(),
          completedByUserId: user.id
        }
      });

      return transfer;
    });
  }
}
```

## 4. Stock Adjustment System

### Adjustment Types
1. **Physical count**: Periodic stocktaking corrections
2. **Damage/waste**: Record damaged or expired items
3. **Theft/loss**: Unaccounted stock reductions
4. **Manual correction**: Administrative adjustments

### Service Implementation

```typescript
// adjustment.service.ts
@Injectable()
export class AdjustmentService {
  async createAdjustment(dto: CreateAdjustmentDto, user: AuthUser) {
    return await this.prisma.$transaction(async (tx) => {
      // Validate adjustment reason and permissions
      await this.validateAdjustmentPermissions(dto.reason, user);

      // Record adjustment
      const adjustment = await tx.stockAdjustment.create({
        data: {
          reason: dto.reason,
          notes: dto.notes,
          createdByUserId: user.id,
          items: {
            create: dto.items.map(item => ({
              variantId: item.variantId,
              warehouseId: item.warehouseId,
              batchId: item.batchId,
              quantityChange: item.quantityChange,
              unitCost: item.unitCost,
              totalValueChange: item.quantityChange * item.unitCost
            }))
          }
        }
      });

      // Apply stock changes
      for (const item of dto.items) {
        const movementType = item.quantityChange > 0 ? 'ADJUSTMENT_IN' : 'ADJUSTMENT_OUT';
        
        await this.inventoryService.recordStockMovement({
          type: movementType,
          variantId: item.variantId,
          warehouseId: item.warehouseId,
          batchId: item.batchId,
          quantity: item.quantityChange,
          reference: `ADJ-${adjustment.id}`,
          referenceId: adjustment.id,
          userId: user.id,
          notes: `Adjustment: ${dto.reason} - ${dto.notes}`
        }, tx);
      }

      // Trigger variance analysis if significant
      if (Math.abs(dto.items.reduce((sum, i) => sum + i.quantityChange, 0)) > 100) {
        await this.analyzeVariance(adjustment.id);
      }

      return adjustment;
    });
  }

  private async validateAdjustmentPermissions(reason: string, user: AuthUser) {
    const requiredPermission = this.getRequiredPermissionForReason(reason);
    
    const hasPermission = await this.permissionService.userHasPermission(
      user.id,
      requiredPermission
    );
    
    if (!hasPermission) {
      throw new ForbiddenException(
        `Insufficient permissions for adjustment reason: ${reason}`
      );
    }
  }
}
```

## 5. Low Stock Alert System

### Alert Triggers
1. **Quantity threshold**: Stock below reorder point
2. **Time-based**: Items not replenished in X days
3. **Demand spike**: Unusual increase in sales
4. **Batch expiry**: Items expiring soon

### Service Implementation

```typescript
// alert.service.ts
@Injectable()
export class AlertService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService
  ) {}

  async checkLowStockAlerts() {
    const lowStockItems = await this.prisma.warehouseInventory.findMany({
      where: {
        quantity: { lte: this.prisma.warehouseInventory.fields.reorderPoint },
        available: { gt: 0 } // Don't alert for zero stock items
      },
      include: {
        variant: { include: { product: true } },
        warehouse: true
      }
    });

    // Group by severity
    const critical = lowStockItems.filter(item => 
      item.quantity <= item.reorderPoint * 0.5
    );
    const warning = lowStockItems