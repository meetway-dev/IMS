# Modern Inventory Management UI/UX Design

## Overview
Enterprise-grade inventory UI/UX design following modern SaaS patterns with Next.js, React, and MUI.

## 1. UI Architecture & Component Structure

### Project Structure
```
frontend/src/
├── app/dashboard/
│   ├── products/                    # Product management
│   │   ├── page.tsx                 # Products list
│   │   ├── [id]/page.tsx           # Product detail
│   │   ├── variants/               # Variant management
│   │   └── bulk-edit/              # Bulk operations
│   ├── inventory/
│   │   ├── page.tsx                # Inventory dashboard
│   │   ├── warehouses/             # Warehouse management
│   │   ├── movements/              # Stock movement ledger
│   │   └── alerts/                 # Low stock alerts
│   ├── purchases/
│   │   ├── page.tsx                # Purchase orders list
│   │   ├── create/                 # Create purchase order
│   │   └── [id]/                   # Purchase order detail
│   ├── sales/
│   │   ├── page.tsx                # Sales orders list
│   │   ├── create/                 # Create sales order
│   │   └── [id]/                   # Sales order detail
│   └── transfers/                  # Warehouse transfers
│
├── components/inventory/
│   ├── ProductVariantSelector.tsx  # Advanced variant selector
│   ├── InventoryDashboard.tsx      # Dashboard with stats
│   ├── StockMovementTimeline.tsx   # Timeline/ledger view
│   ├── WarehouseStockView.tsx      # Warehouse-specific view
│   ├── PurchaseOrderForm.tsx       # Purchase form with auto-calc
│   ├── SalesOrderForm.tsx          # Sales form with auto-calc
│   └── AdvancedDataTable.tsx       # Enhanced table component
│
├── components/ui/inventory/
│   ├── StockBadge.tsx              # Stock level indicators
│   ├── BatchChip.tsx               # Batch/lot display
│   ├── QuantityInput.tsx           # Smart quantity input
│   ├── PriceCalculator.tsx         # Auto price calculation
│   └── AlertIndicator.tsx          # Alert badges
│
└── hooks/inventory/
    ├── useInventoryQuery.ts        # Optimized inventory queries
    ├── useStockMovement.ts         # Stock movement operations
    └── useBulkOperations.ts        # Bulk edit operations
```

## 2. Product Management UI

### Product List with Advanced Filtering
```tsx
// components/inventory/ProductList.tsx
import { AdvancedDataTable } from '@/components/inventory/AdvancedDataTable';
import { ProductVariantSelector } from '@/components/inventory/ProductVariantSelector';
import { BulkEditToolbar } from '@/components/inventory/BulkEditToolbar';

export default function ProductList() {
  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500">Manage your product catalog</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outlined" startIcon={<FilterIcon />}>
            Filters
          </Button>
          <Button variant="outlined" startIcon={<ImportIcon />}>
            Import
          </Button>
          <Button variant="contained" startIcon={<AddIcon />}>
            Add Product
          </Button>
        </div>
      </div>

      {/* Advanced filtering */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <TextField
              label="Search Products"
              placeholder="Name, SKU, or description"
              variant="outlined"
              size="small"
              fullWidth
            />
            <Autocomplete
              options={categories}
              renderInput={(params) => (
                <TextField {...params} label="Category" size="small" />
              )}
            />
            <Autocomplete
              options={suppliers}
              renderInput={(params) => (
                <TextField {...params} label="Supplier" size="small" />
              )}
            />
            <FormControl size="small" fullWidth>
              <InputLabel>Stock Status</InputLabel>
              <Select label="Stock Status">
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="in-stock">In Stock</MenuItem>
                <MenuItem value="low-stock">Low Stock</MenuItem>
                <MenuItem value="out-of-stock">Out of Stock</MenuItem>
              </Select>
            </FormControl>
          </div>
        </CardContent>
      </Card>

      {/* Products table */}
      <AdvancedDataTable
        columns={productColumns}
        data={products}
        onRowClick={(product) => router.push(`/dashboard/products/${product.id}`)}
        enableSelection
        enableBulkActions
        bulkActions={[
          { label: 'Update Category', action: handleBulkCategoryUpdate },
          { label: 'Update Pricing', action: handleBulkPricingUpdate },
          { label: 'Export Selected', action: handleBulkExport },
        ]}
      />
    </div>
  );
}
```

### Product Variant Selector Component
```tsx
// components/inventory/ProductVariantSelector.tsx
import { useState } from 'react';
import { Chip, Box, Grid, Typography, Divider } from '@mui/material';

interface VariantAttribute {
  id: string;
  name: string;
  values: Array<{ id: string; value: string; code: string }>;
}

interface ProductVariantSelectorProps {
  attributes: VariantAttribute[];
  variants: Array<{
    id: string;
    sku: string;
    attributes: Record<string, string>;
    stock: number;
    price: number;
  }>;
  onVariantSelect: (variantId: string) => void;
  selectedVariant?: string;
}

export function ProductVariantSelector({
  attributes,
  variants,
  onVariantSelect,
  selectedVariant,
}: ProductVariantSelectorProps) {
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});

  const handleAttributeSelect = (attributeId: string, valueId: string) => {
    const newSelection = { ...selectedAttributes, [attributeId]: valueId };
    setSelectedAttributes(newSelection);

    // Find matching variant
    const matchingVariant = variants.find(variant =>
      Object.entries(newSelection).every(([attrId, valId]) =>
        variant.attributes[attrId] === valId
      )
    );

    if (matchingVariant) {
      onVariantSelect(matchingVariant.id);
    }
  };

  const getAvailableValues = (attributeId: string) => {
    const otherSelections = { ...selectedAttributes };
    delete otherSelections[attributeId];

    return attributes
      .find(attr => attr.id === attributeId)
      ?.values.filter(value =>
        variants.some(variant =>
          variant.attributes[attributeId] === value.id &&
          Object.entries(otherSelections).every(([attrId, valId]) =>
            variant.attributes[attrId] === valId
          )
        )
      ) || [];
  };

  return (
    <Box className="space-y-6">
      <Typography variant="h6" className="font-medium">
        Select Variant
      </Typography>
      
      <Grid container spacing={3}>
        {attributes.map((attribute) => (
          <Grid item xs={12} md={6} key={attribute.id}>
            <Typography variant="subtitle2" className="mb-2 text-gray-600">
              {attribute.name}
            </Typography>
            <Box className="flex flex-wrap gap-2">
              {getAvailableValues(attribute.id).map((value) => {
                const isSelected = selectedAttributes[attribute.id] === value.id;
                const isDisabled = !getAvailableValues(attribute.id).some(v => v.id === value.id);
                
                return (
                  <Chip
                    key={value.id}
                    label={value.value}
                    onClick={() => handleAttributeSelect(attribute.id, value.id)}
                    color={isSelected ? 'primary' : 'default'}
                    variant={isSelected ? 'filled' : 'outlined'}
                    disabled={isDisabled}
                    className="transition-all hover:shadow-sm"
                  />
                );
              })}
            </Box>
          </Grid>
        ))}
      </Grid>

      {selectedVariant && (
        <>
          <Divider />
          <VariantDetails
            variant={variants.find(v => v.id === selectedVariant)!}
          />
        </>
      )}
    </Box>
  );
}

function VariantDetails({ variant }: { variant: any }) {
  return (
    <Box className="p-4 bg-gray-50 rounded-lg">
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Typography variant="subtitle2" className="text-gray-500">
            SKU
          </Typography>
          <Typography variant="body1" className="font-mono">
            {variant.sku}
          </Typography>
        </Grid>
        <Grid item xs={12} md={3}>
          <Typography variant="subtitle2" className="text-gray-500">
            Price
          </Typography>
          <Typography variant="body1" className="font-semibold">
            ${variant.price.toFixed(2)}
          </Typography>
        </Grid>
        <Grid item xs={12} md={3}>
          <Typography variant="subtitle2" className="text-gray-500">
            Stock
          </Typography>
          <Box className="flex items-center gap-2">
            <Typography
              variant="body1"
              className={cn(
                'font-semibold',
                variant.stock === 0 && 'text-red-600',
                variant.stock > 0 && variant.stock < 10 && 'text-amber-600'
              )}
            >
              {variant.stock}
            </Typography>
            {variant.stock < 10 && (
              <Chip
                label="Low Stock"
                size="small"
                color="warning"
                variant="outlined"
              />
            )}
          </Box>
        </Grid>
        <Grid item xs={12} md={3}>
          <Button
            variant="contained"
            fullWidth
            disabled={variant.stock === 0}
          >
            Add to Order
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
```

## 3. Inventory Dashboard

### Dashboard with Warehouse View
```tsx
// components/inventory/InventoryDashboard.tsx
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { TrendingUp, TrendingDown, Warehouse, AlertTriangle } from 'lucide-react';

export function InventoryDashboard() {
  const stats = [
    {
      title: 'Total Stock Value',
      value: '$124,580',
      change: '+12.5%',
      trend: 'up',
      icon: <TrendingUp className="h-5 w-5" />,
    },
    {
      title: 'Total Items',
      value: '2,845',
      change: '+8.2%',
      trend: 'up',
      icon: <Warehouse className="h-5 w-5" />,
    },
    {
      title: 'Low Stock Items',
      value: '42',
      change: '+5',
      trend: 'warning',
      icon: <AlertTriangle className="h-5 w-5" />,
    },
    {
      title: 'Out of Stock',
      value: '18',
      change: '-3',
      trend: 'down',
      icon: <TrendingDown className="h-5 w-5" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent>
                <Box className="flex items-center justify-between">
                  <div>
                    <Typography
                      variant="body2"
                      className="text-gray-500"
                    >
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" className="font-bold mt-1">
                      {stat.value}
                    </Typography>
                    <Box className="flex items-center gap-1 mt-2">
                      {stat.trend === 'up' && (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      )}
                      {stat.trend === 'down' && (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      {stat.trend === 'warning' && (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      )}
                      <Typography
                        variant="body2"
                        className={cn(
                          'font-medium',
                          stat.trend === 'up' && 'text-green-600',
                          stat.trend === 'down' && 'text-red-600',
                          stat.trend === 'warning' && 'text-amber-600'
                        )}
                      >
                        {stat.change}
                      </Typography>
                      <Typography variant="body2" className="text-gray-500">
                        from last month
                      </Typography>
                    </Box>
                  </div>
                  <Box className="p-3 rounded-full bg-primary-50">
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Warehouse Stock View */}
      <Card>
        <CardContent>
          <Typography variant="h6" className="font-semibold mb-4">
            Warehouse Stock Overview
          </Typography>
          <WarehouseStockGrid />
        </CardContent>
      </Card>

      {/* Low Stock Alerts */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <Typography variant="h6" className="font-semibold">
              Low Stock Alerts
            </Typography>
            <Button variant="text" size="small">
              View All
            </Button>
          </div>
          <LowStockAlertsList />
        </CardContent>
      </Card>
    </div>
  );
}

function WarehouseStockGrid() {
  const warehouses = [
    { id: 'wh1', name: 'Main Warehouse', stock: 1245, capacity: 2000 },
    { id: 'wh2', name: 'East Branch', stock: 842, capacity: 1200 },
    { id: 'wh3', name: 'West Store', stock: 321, capacity: 500 },
    { id: 'wh4', name: 'North Hub', stock: 567, capacity: 800 },
  ];

  return (
    <Grid container spacing={3}>
      {warehouses.map((warehouse) => {
        const percentage = (warehouse.stock / warehouse.capacity) * 100;
        
        return (
          <Grid item xs={12} sm={6} lg={3} key={warehouse.id}>
            <Card variant="outlined" className="h-full">
              <CardContent>
                <Typography variant="subtitle1" className="font-medium">
                  {warehouse.name}
                </Typography>
                <Typography variant="body2" className="text-gray-500 mb-2">
                  {warehouse.stock.toLocaleString()} items
                </Typography>
                
                <Box className="space-y-2">
                  <Box className="flex justify-between text-sm">
                    <span>Capacity</span>
                    <span className="font-medium">
                      {Math.round(percentage)}%
                    </span>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={percentage}
                    className={cn(
                      'h-2 rounded-full',
                      percentage > 90 && 'bg-red-100',
                      percentage > 70 && percentage <= 90 && 'bg-amber-100',
                      percentage <= 70 && 'bg-green-100'
                    )}
                    classes={{
                      bar: cn(
                        percentage > 90 && 'bg-red-500',
                        percentage > 70 && percentage <= 90 && 'bg-amber-500',
                        percentage <= 70 && 'bg-green-500'
                      ),
                    }}
                  />
                </Box>

                <Button
                  variant="outlined"
                  size="small"
                  fullWidth
                  className="mt-4"
                  onClick={() => router.push(`/dashboard/inventory/warehouses/${warehouse.id}`)}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}
```

## 4. Stock Movement Timeline/Ledger UI

```tsx
// components/inventory/StockMovementTimeline.tsx
import { Timeline, TimelineItem, TimelineSeparator, TimelineDot, TimelineConnector, TimelineContent } from '@mui/lab';
import { Avatar, Chip, Paper } from '@mui/material';
import { ArrowUp, ArrowDown, RefreshCw, Truck, Package } from 'lucide-react';

export function StockMovementTimeline({ movements }: { movements: StockMovement[] }) {
  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'PURCHASE':
        return <ArrowUp className="h-4 w-4 text-green-500" />;
      case 'SALE':
        return <ArrowDown className="h-4 w-4 text-red-500" />;
      case 'TRANSFER':
        return <Truck className="h-4 w-4 text-blue-500" />;
      case 'ADJUSTMENT':
        return <RefreshCw className="h-4 w-4 text-amber-500" />;
      default:
        return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case