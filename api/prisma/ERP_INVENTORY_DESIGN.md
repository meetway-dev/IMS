# Enhanced ERP Inventory System - Data Model Design

## Overview
This document describes the professional, scalable ERP inventory system data model designed to support real-world inventory management requirements.

## Key Features Implemented

### 1. Product Variants with Attribute System
- **Flexible attribute definition**: Size, Material, Color, Brand, etc.
- **Attribute values**: Predefined values for consistency
- **Variant creation**: Automatic SKU generation based on attribute combinations

### 2. SKU System
- **Base SKU**: Product family identifier
- **Variant SKU**: Generated from attribute combinations (e.g., PROD-001-RED-L)
- **Human-readable**: Configurable SKU templates

### 3. Units of Measurement
- **Multiple units**: Piece, Box, Meter, Kilogram, Liter, etc.
- **Conversion system**: Define conversion factors between units
- **Base unit**: All calculations in base unit

### 4. Warehouses / Locations
- **Multi-warehouse**: Support for multiple physical locations
- **Location hierarchy**: Warehouse → Aisle → Shelf → Bin
- **Capacity tracking**: Weight and volume limits

### 5. Batches / Lots
- **Batch tracking**: Track production/expiry dates
- **Quality control**: Quarantine status
- **FIFO/LIFO**: Support for different inventory costing methods

### 6. Inventory Transactions
- **Comprehensive types**: Purchase, Sale, Adjustment, Transfer, Return, Write-off
- **Audit trail**: Every stock change recorded
- **Reference linking**: Connect to orders, transfers, adjustments

### 7. Stock Movement Ledger
- **Complete audit trail**: Source, destination, quantity, user, timestamp
- **Real-time tracking**: Current stock vs. reserved vs. available
- **Historical analysis**: Track stock movements over time

## Example Data Structures

### Product with Variants Example

```json
{
  "product": {
    "id": "prod_001",
    "name": "PVC Pipe",
    "baseSku": "PVC-PIPE",
    "type": "PLUMBING",
    "categoryId": "cat_plumbing",
    "baseUnit": "METER",
    "costPrice": 15.50,
    "retailPrice": 25.00,
    "variants": [
      {
        "id": "var_001",
        "sku": "PVC-PIPE-3IN-GREY",
        "attributes": [
          { "attribute": "Size", "value": "3 inch" },
          { "attribute": "Material", "value": "PVC" },
          { "attribute": "Color", "value": "Grey" }
        ],
        "costPrice": 16.00,
        "salePrice": 26.50
      },
      {
        "id": "var_002", 
        "sku": "PVC-PIPE-6IN-WHITE",
        "attributes": [
          { "attribute": "Size", "value": "6 inch" },
          { "attribute": "Material", "value": "PVC" },
          { "attribute": "Color", "value": "White" }
        ],
        "costPrice": 28.00,
        "salePrice": 45.00
      }
    ]
  }
}
```

### Warehouse Inventory Example

```json
{
  "warehouseInventory": {
    "id": "inv_001",
    "warehouse": {
      "code": "WH-MAIN",
      "name": "Main Warehouse"
    },
    "location": {
      "code": "A-01-02",
      "name": "Aisle 1, Shelf 2"
    },
    "variant": {
      "sku": "PVC-PIPE-3IN-GREY",
      "name": "PVC Pipe 3 inch Grey"
    },
    "batch": {
      "batchNumber": "BATCH-2024-001",
      "expiryDate": "2025-12-31"
    },
    "quantity": 1500,
    "reserved": 200,
    "available": 1300,
    "minLevel": 100,
    "maxLevel": 2000,
    "reorderPoint": 300
  }
}
```

### Stock Movement Example

```json
{
  "stockMovement": {
    "id": "mov_001",
    "type": "PURCHASE",
    "quantity": 500,
    "reference": "PO-2024-001",
    "referenceId": "po_001",
    "fromWarehouse": null,
    "toWarehouse": "WH-MAIN",
    "batchId": "batch_001",
    "user": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "notes": "Purchase order from Supplier XYZ",
    "metadata": {
      "supplierInvoice": "INV-12345",
      "deliveryDate": "2024-01-15"
    },
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

## Database Relationships Diagram

```
User ─┬─ Role (RBAC)
      ├─ Order
      └─ StockMovement

Product ─┬─ Category
         ├─ Company
         ├─ Supplier
         ├─ Variant ─┬─ AttributeValue
         │           ├─ WarehouseInventory
         │           └─ Batch
         └─ UnitConversion

Warehouse ─┬─ Location
           ├─ Inventory ─┬─ Variant
           │             ├─ Batch
           │             └─ StockMovement
           └─ Transfer ── TransferItem

Order ── OrderItem ─┬─ Variant
                    └─ Batch
```

## Indexing Strategy for Scalability

### Critical Indexes for Performance

1. **Product/Variant Search**
   ```sql
   CREATE INDEX idx_product_sku ON "Product"(baseSku);
   CREATE INDEX idx_variant_sku ON "ProductVariant"(sku);
   CREATE INDEX idx_product_category ON "Product"(categoryId);
   ```

2. **Inventory Queries**
   ```sql
   CREATE INDEX idx_inventory_warehouse_variant ON "WarehouseInventory"(warehouseId, variantId);
   CREATE INDEX idx_inventory_quantity ON "WarehouseInventory"(quantity) WHERE quantity > 0;
   CREATE INDEX idx_inventory_batch ON "WarehouseInventory"(batchId) WHERE batchId IS NOT NULL;
   ```

3. **Stock Movement Analytics**
   ```sql
   CREATE INDEX idx_movement_type_date ON "StockMovement"(type, createdAt);
   CREATE INDEX idx_movement_reference ON "StockMovement"(reference);
   CREATE INDEX idx_movement_warehouses ON "StockMovement"(fromWarehouseId, toWarehouseId);
   ```

4. **Batch Tracking**
   ```sql
   CREATE INDEX idx_batch_expiry ON "Batch"(expiryDate) WHERE expiryDate IS NOT NULL;
   CREATE INDEX idx_batch_status ON "Batch"(status);
   ```

## Best Practices for Scalability

### 1. Data Partitioning Strategy
- **Time-based partitioning**: Partition `StockMovement` by month/year
- **Warehouse-based partitioning**: For large multi-warehouse deployments
- **Product category partitioning**: For large product catalogs

### 2. Read/Write Optimization
- **Materialized views**: For frequently accessed aggregated data
- **Caching layer**: Redis for inventory counts, product details
- **Async processing**: Use message queues for stock updates

### 3. Consistency Patterns
- **Event sourcing**: Use `StockMovement` as source of truth
- **Eventual consistency**: For inventory counts across warehouses
- **Idempotent operations**: Prevent duplicate transactions

### 4. Audit and Compliance
- **Immutable ledger**: `StockMovement` records cannot be modified
- **Full traceability**: From supplier to customer
- **Regulatory compliance**: FDA, ISO, etc. for batch tracking

## API Design Considerations

### Inventory Service Endpoints
```
GET    /api/inventory/warehouses/{id}/stock
POST   /api/inventory/transactions
GET    /api/inventory/products/{id}/availability
POST   /api/inventory/transfers
GET    /api/inventory/reports/stock-levels
GET    /api/inventory/reports/movement-history
```

### Product Service Endpoints
```
GET    /api/products/{id}/variants
POST   /api/products/{id}/variants
GET    /api/products/search?q={query}&category={id}
POST   /api/products/{id}/sku-generate
```

## Migration Strategy from Current System

### Phase 1: Schema Migration
1. Add new tables (ProductAttribute, Warehouse, Batch, etc.)
2. Create foreign key relationships
3. Migrate existing data with transformation scripts

### Phase 2: Data Migration
1. Convert existing products to new variant system
2. Migrate inventory records to warehouse-based model
3. Create batch records from existing stock

### Phase 3: API Migration
1. Implement new endpoints alongside existing ones
2. Gradual feature flag rollout
3. Data consistency validation

## Performance Benchmarks

### Expected Scale
- **Products**: 100K+ with 5 variants each = 500K+ variants
- **Warehouses**: 10-50 locations
- **Daily transactions**: 10K-100K stock movements
- **Concurrent users**: 100-500

### Query Performance Targets
- **Product search**: < 100ms
- **Inventory check**: < 50ms  
- **Stock movement recording**: < 200ms
- **Batch expiry alerts**: < 1s for 10K batches

## Security Considerations

### Data Access Control
- **Warehouse-level permissions**: Users only see assigned warehouses
- **Product category restrictions**: Limit access to sensitive products
- **Batch quarantine**: Restricted access to quarantined batches

### Audit Requirements
- **All stock changes**: Who, what, when, why
- **Batch modifications**: Track quality status changes
- **User authentication**: MFA for critical operations

## Monitoring and Alerting

### Key Metrics to Monitor
- **Inventory accuracy**: Physical vs. system counts
- **Stockout rate**: Percentage of out-of-stock items
- **Movement velocity**: Turnover rate by product category
- **Batch expiry**: Upcoming expirations

### Alert Conditions
- **Low stock**: Below reorder point
- **Expiring batches**: Within 30 days
- **Negative inventory**: System inconsistencies
- **High movement anomalies**: Potential theft/fraud

## Conclusion

This enhanced ERP inventory system provides a production-ready, scalable foundation for real-world inventory management. The design supports:

1. **Complex product hierarchies** with flexible variants
2. **Multi-warehouse operations** with precise location tracking
3. **Batch/lot traceability** for compliance requirements
4. **Comprehensive audit trails** for financial and operational integrity
5. **High performance** through strategic indexing and partitioning

The system is designed to scale from small businesses to enterprise-level deployments while maintaining data consistency, performance, and compliance with industry standards.