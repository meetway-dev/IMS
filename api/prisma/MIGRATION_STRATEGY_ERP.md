# Migration Strategy: Current System to Enhanced ERP Inventory

## Current State Analysis

### Existing Models to Migrate
1. **Product** → Enhanced Product with variants
2. **ProductVariant** → New attribute-based variant system
3. **InventoryItem** → WarehouseInventory with location tracking
4. **InventoryTransaction** → StockMovement ledger
5. **Order/OrderItem** → Enhanced with batch tracking

### Data Volume Assessment
- Products: ~100-1000 records
- Variants: ~500-5000 records  
- Inventory: ~1000-10000 stock records
- Transactions: ~10000-100000 historical records

## Migration Phases

### Phase 1: Schema Preparation (Week 1)

#### Step 1: Create New Tables
```sql
-- Run Prisma migration for new tables
npx prisma migrate dev --name enhance_erp_inventory
```

#### Step 2: Add Foreign Keys Gradually
```sql
-- Add nullable foreign keys first
ALTER TABLE "Product" ADD COLUMN "supplierId" UUID REFERENCES "Supplier"(id);
ALTER TABLE "Product" ADD COLUMN "baseUnit" "UnitOfMeasure" DEFAULT 'PIECE';
```

#### Step 3: Create Default Warehouse
```sql
INSERT INTO "Warehouse" (id, code, name, type, isActive)
VALUES (gen_random_uuid(), 'WH-MAIN', 'Main Warehouse', 'MAIN', true);
```

### Phase 2: Data Migration (Week 2)

#### Migration Scripts

**1. Product Attribute Migration**
```typescript
// Migrate existing variant attributes to new system
async function migrateProductAttributes() {
  const products = await prisma.product.findMany({
    include: { variants: true }
  });
  
  for (const product of products) {
    // Create attribute definitions
    const sizeAttr = await prisma.productAttribute.upsert({
      where: { code: 'SIZE' },
      update: {},
      create: {
        name: 'Size',
        code: 'SIZE',
        dataType: 'STRING',
        isVariant: true
      }
    });
    
    // Migrate variant data
    for (const variant of product.variants) {
      const newVariant = await prisma.productVariant.create({
        data: {
          productId: product.id,
          sku: variant.sku || generateSku(product, variant),
          // Map old fields to new attribute system
          attributes: {
            create: [
              {
                attributeId: sizeAttr.id,
                valueId: await getOrCreateValue(sizeAttr.id, variant.size)
              }
            ]
          }
        }
      });
    }
  }
}
```

**2. Inventory Migration**
```typescript
async function migrateInventory() {
  const mainWarehouse = await prisma.warehouse.findFirst({
    where: { code: 'WH-MAIN' }
  });
  
  const inventoryItems = await prisma.inventoryItem.findMany({
    include: { product: true, variant: true }
  });
  
  for (const item of inventoryItems) {
    const variantId = item.variantId 
      ? await findNewVariantId(item.variantId)
      : await createBaseVariant(item.productId);
    
    await prisma.warehouseInventory.create({
      data: {
        warehouseId: mainWarehouse.id,
        variantId,
        quantity: item.stockQuantity,
        reserved: item.reservedQuantity,
        available: item.stockQuantity - item.reservedQuantity
      }
    });
  }
}
```

**3. Transaction History Migration**
```typescript
async function migrateTransactions() {
  const transactions = await prisma.inventoryTransaction.findMany({
    include: { inventoryItem: true }
  });
  
  for (const tx of transactions) {
    const inventory = await prisma.warehouseInventory.findFirst({
      where: {
        variantId: await findVariantForItem(tx.inventoryItemId)
      }
    });
    
    if (inventory) {
      await prisma.stockMovement.create({
        data: {
          inventoryId: inventory.id,
          type: mapTransactionType(tx.type),
          quantity: tx.quantityDelta,
          reference: tx.reference,
          userId: tx.createdByUserId,
          notes: tx.note,
          createdAt: tx.createdAt
        }
      });
    }
  }
}
```

### Phase 3: Dual-Write Period (Week 3-4)

#### Strategy
1. **Write to both systems**: New transactions update old and new schemas
2. **Read from new system**: Gradually switch read operations
3. **Data validation**: Compare counts between systems daily

#### Implementation
```typescript
class DualWriteService {
  async recordStockMovement(data: StockMovementData) {
    // Write to new system
    const movement = await prisma.stockMovement.create({
      data: {
        ...data,
        createdAt: new Date()
      }
    });
    
    // Write to old system (for backward compatibility)
    const oldTransaction = await prisma.inventoryTransaction.create({
      data: {
        inventoryItemId: await findOldInventoryItem(data.variantId),
        type: mapToOldType(data.type),
        quantityDelta: data.quantity,
        reference: data.reference,
        createdByUserId: data.userId,
        note: data.notes
      }
    });
    
    return movement;
  }
}
```

### Phase 4: Cutover (Week 5)

#### Pre-Cutover Checklist
- [ ] All historical data migrated and validated
- [ ] Dual-write period completed (2 weeks)
- [ ] Performance tests passed
- [ ] Backup of old system
- [ ] Rollback plan documented

#### Cutover Steps
1. **Maintenance window announcement**
2. **Disable write to old system**
3. **Final data sync**
4. **Update application to use new schema only**
5. **Enable new API endpoints**
6. **Monitor for 24 hours**

#### Rollback Plan
```sql
-- If issues occur, revert to old schema
-- 1. Disable new endpoints
-- 2. Re-enable old write paths
-- 3. Use old schema for reads
-- 4. Investigate and fix issues
```

## Data Validation Procedures

### Daily Validation Scripts

**1. Stock Count Validation**
```sql
-- Compare total stock between old and new systems
SELECT 
  'Old System' as system,
  SUM(stockQuantity) as total_stock
FROM "InventoryItem"
UNION ALL
SELECT 
  'New System' as system,
  SUM(quantity) as total_stock
FROM "WarehouseInventory";
```

**2. Transaction Count Validation**
```sql
-- Compare transaction counts by date
SELECT 
  DATE(t1.createdAt) as date,
  COUNT(t1.id) as old_count,
  COUNT(t2.id) as new_count
FROM "InventoryTransaction" t1
LEFT JOIN "StockMovement" t2 ON DATE(t1.createdAt) = DATE(t2.createdAt)
GROUP BY DATE(t1.createdAt)
ORDER BY date DESC;
```

**3. Product Variant Mapping Validation**
```sql
-- Ensure all variants migrated
SELECT 
  p.name as product_name,
  COUNT(DISTINCT pv.id) as old_variants,
  COUNT(DISTINCT pv2.id) as new_variants
FROM "Product" p
LEFT JOIN "ProductVariant" pv ON pv.productId = p.id
LEFT JOIN "ProductVariant" pv2 ON pv2.productId = p.id
GROUP BY p.id, p.name
HAVING COUNT(DISTINCT pv.id) != COUNT(DISTINCT pv2.id);
```

## Performance Considerations During Migration

### Large Table Migration
```typescript
// Use batch processing for large datasets
async function migrateInBatches(
  model: string,
  batchSize: number,
  processFn: (batch: any[]) => Promise<void>
) {
  let skip = 0;
  let hasMore = true;
  
  while (hasMore) {
    const batch = await prisma[model].findMany({
      skip,
      take: batchSize,
      orderBy: { id: 'asc' }
    });
    
    if (batch.length === 0) {
      hasMore = false;
      break;
    }
    
    await processFn(batch);
    skip += batchSize;
    
    // Progress logging
    console.log(`Migrated ${skip} records from ${model}`);
  }
}
```

### Index Management
```sql
-- Disable indexes during bulk insert
DROP INDEX IF EXISTS idx_warehouse_inventory_variant;
-- Perform bulk insert
INSERT INTO "WarehouseInventory" (...)
SELECT ... FROM old_inventory;
-- Recreate indexes
CREATE INDEX idx_warehouse_inventory_variant 
ON "WarehouseInventory"(warehouseId, variantId);
```

## Risk Mitigation

### High-Risk Areas
1. **Data loss during migration**
   - Mitigation: Comprehensive backups before each phase
   - Verification: Checksum validation of migrated data

2. **Performance degradation**
   - Mitigation: Staggered migration during off-peak hours
   - Monitoring: Real-time performance metrics

3. **Business disruption**
   - Mitigation: Gradual rollout with feature flags
   - Fallback: Quick rollback capability

### Testing Strategy
1. **Unit tests**: Individual migration functions
2. **Integration tests**: End-to-end migration scenarios
3. **Load tests**: Performance under production-like load
4. **UAT**: User acceptance testing with sample data

## Post-Migration Tasks

### Cleanup (Week 6)
```sql
-- Archive old tables (keep for 90 days)
ALTER TABLE "InventoryItem" RENAME TO "InventoryItem_archive_202401";
ALTER TABLE "InventoryTransaction" RENAME TO "InventoryTransaction_archive_202401";

-- Remove old columns after verification
ALTER TABLE "Product" DROP COLUMN "purchasePrice";
ALTER TABLE "Product" DROP COLUMN "salePrice";
```

### Monitoring
1. **Data consistency alerts**: Daily validation reports
2. **Performance monitoring**: Query performance baseline
3. **Error tracking**: New system error rates

### Documentation Update
1. Update API documentation
2. Update data dictionary
3. Update operational runbooks

## Timeline Summary

| Phase | Duration | Key Activities |
|-------|----------|----------------|
| Preparation | Week 1 | Schema changes, default data |
| Data Migration | Week 2 | Historical data migration |
| Dual-Write | Week 3-4 | Parallel operation, validation |
| Cutover | Week 5 | Switch to new system |
| Cleanup | Week 6 | Archive old data, optimization |

## Success Criteria

1. **Data accuracy**: 100% match between old and new systems
2. **Performance**: No degradation in response times
3. **Uptime**: 99.9% availability during migration
4. **User satisfaction**: No disruption to business operations
5. **Compliance**: All audit requirements maintained

## Emergency Contacts

- **Database Admin**: For rollback procedures
- **Application Team**: For API issues
- **Business Stakeholders**: For communication
- **Monitoring Team**: For performance alerts

## Conclusion

This migration strategy provides a systematic approach to upgrading the inventory system while minimizing business risk. The phased approach allows for thorough testing and validation at each step, ensuring a smooth transition to the enhanced ERP inventory system.