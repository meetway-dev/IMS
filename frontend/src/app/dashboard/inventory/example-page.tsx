'use client';

import * as React from 'react';
import { useState } from 'react';
import { InventoryDashboard } from '@/components/inventory/InventoryDashboard';
import { ProductVariantSelector } from '@/components/inventory/ProductVariantSelector';
import { StockMovementTimeline } from '@/components/inventory/StockMovementTimeline';
import { AdvancedDataTable } from '@/components/inventory/AdvancedDataTable';
import { StockBadge } from '@/components/ui/inventory/StockBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';
import { 
  Package, 
  TrendingUp, 
  Filter, 
  Download, 
  Plus,
  Edit,
  Eye,
  MoreHorizontal
} from 'lucide-react';

// Example data for demonstration
const exampleProducts = [
  { id: '1', name: 'Premium T-Shirt', sku: 'TSH-PRM-BLK', category: 'Apparel', stock: 45, price: 29.99, status: 'active' },
  { id: '2', name: 'Wireless Headphones', sku: 'AUD-WLS-PRO', category: 'Electronics', stock: 12, price: 129.99, status: 'active' },
  { id: '3', name: 'Desk Lamp', sku: 'LMP-DSK-LED', category: 'Home', stock: 0, price: 49.99, status: 'inactive' },
  { id: '4', name: 'Notebook Set', sku: 'STN-NTB-SET', category: 'Stationery', stock: 78, price: 24.99, status: 'active' },
  { id: '5', name: 'Water Bottle', sku: 'BTL-WTR-1L', category: 'Accessories', stock: 5, price: 19.99, status: 'active' },
];

const exampleVariants = [
  { id: '1', sku: 'TSH-PRM-BLK-S', attributes: { size: 'S', color: 'black' }, stock: 15, price: 29.99 },
  { id: '2', sku: 'TSH-PRM-BLK-M', attributes: { size: 'M', color: 'black' }, stock: 20, price: 29.99 },
  { id: '3', sku: 'TSH-PRM-BLK-L', attributes: { size: 'L', color: 'black' }, stock: 10, price: 29.99 },
  { id: '4', sku: 'TSH-PRM-WHT-S', attributes: { size: 'S', color: 'white' }, stock: 0, price: 29.99 },
  { id: '5', sku: 'TSH-PRM-WHT-M', attributes: { size: 'M', color: 'white' }, stock: 8, price: 29.99 },
];

const exampleAttributes = [
  {
    id: 'size',
    name: 'Size',
    values: [
      { id: 'S', value: 'Small', code: 'S' },
      { id: 'M', value: 'Medium', code: 'M' },
      { id: 'L', value: 'Large', code: 'L' },
      { id: 'XL', value: 'Extra Large', code: 'XL' },
    ],
  },
  {
    id: 'color',
    name: 'Color',
    values: [
      { id: 'black', value: 'Black', code: 'BLK' },
      { id: 'white', value: 'White', code: 'WHT' },
      { id: 'blue', value: 'Blue', code: 'BLU' },
      { id: 'red', value: 'Red', code: 'RED' },
    ],
  },
];

const exampleMovements = [
  {
    id: '1',
    type: 'IN' as const,
    quantity: 50,
    previousQuantity: 100,
    newQuantity: 150,
    productName: 'Premium T-Shirt',
    productSku: 'TSH-PRM-BLK',
    userId: 'user1',
    userName: 'John Doe',
    warehouseName: 'Main Warehouse',
    reason: 'Restock from supplier',
    reference: 'PO-2024-001',
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    type: 'OUT' as const,
    quantity: 25,
    previousQuantity: 150,
    newQuantity: 125,
    productName: 'Premium T-Shirt',
    productSku: 'TSH-PRM-BLK',
    userId: 'user2',
    userName: 'Jane Smith',
    warehouseName: 'Main Warehouse',
    reason: 'Customer order fulfillment',
    reference: 'SO-2024-045',
    createdAt: '2024-01-16T14:20:00Z',
  },
  {
    id: '3',
    type: 'ADJUSTMENT' as const,
    quantity: -5,
    previousQuantity: 125,
    newQuantity: 120,
    productName: 'Premium T-Shirt',
    productSku: 'TSH-PRM-BLK',
    userId: 'user3',
    userName: 'Inventory Manager',
    warehouseName: 'Main Warehouse',
    reason: 'Damaged goods write-off',
    reference: 'ADJ-2024-012',
    createdAt: '2024-01-17T09:15:00Z',
  },
];

// Define columns for the advanced table
const productColumns: ColumnDef<any>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllPageRowsSelected()}
        onChange={table.getToggleAllPageRowsSelectedHandler()}
        className="h-4 w-4"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
        className="h-4 w-4"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: 'Product Name',
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
          <Package className="h-5 w-5" />
        </div>
        <div>
          <div className="font-medium">{row.getValue('name')}</div>
          <div className="text-sm text-muted-foreground">{row.getValue('sku')}</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'sku',
    header: 'SKU',
  },
  {
    accessorKey: 'category',
    header: 'Category',
  },
  {
    accessorKey: 'stock',
    header: 'Stock Level',
    cell: ({ row }) => {
      const stock = row.getValue('stock') as number;
      return <StockBadge quantity={stock} />;
    },
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('price'));
      return <div className="font-medium">${price.toFixed(2)}</div>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <Badge variant={status === 'active' ? 'success' : 'secondary'}>
          {status}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];

export default function InventoryExamplePage() {
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);

  const handleBulkAction = (products: any[]) => {
    console.log('Bulk action on products:', products);
    alert(`Bulk action on ${products.length} products`);
  };

  const handleRowClick = (product: any) => {
    console.log('Row clicked:', product);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">
            Modern inventory UI with advanced features and real-time tracking
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Dashboard Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Inventory Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <InventoryDashboard showActions={false} compact />
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="products" className="space-y-6">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="variants">Variants</TabsTrigger>
          <TabsTrigger value="movements">Stock Movements</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Catalog</CardTitle>
            </CardHeader>
            <CardContent>
              <AdvancedDataTable
                columns={productColumns}
                data={exampleProducts}
                searchPlaceholder="Search products..."
                searchColumn="name"
                enableSelection
                enableBulkActions
                bulkActions={[
                  {
                    label: 'Update Category',
                    action: handleBulkAction,
                  },
                  {
                    label: 'Update Pricing',
                    action: handleBulkAction,
                  },
                  {
                    label: 'Export Selected',
                    action: handleBulkAction,
                  },
                ]}
                onRowClick={handleRowClick}
                filters={[
                  {
                    column: 'category',
                    label: 'Category',
                    options: [
                      { label: 'Apparel', value: 'Apparel' },
                      { label: 'Electronics', value: 'Electronics' },
                      { label: 'Home', value: 'Home' },
                      { label: 'Stationery', value: 'Stationery' },
                      { label: 'Accessories', value: 'Accessories' },
                    ],
                  },
                  {
                    column: 'status',
                    label: 'Status',
                    options: [
                      { label: 'Active', value: 'active' },
                      { label: 'Inactive', value: 'inactive' },
                    ],
                  },
                ]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Variants Tab */}
        <TabsContent value="variants" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Variant Selector</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductVariantSelector
                attributes={exampleAttributes}
                variants={exampleVariants}
                onVariantSelect={setSelectedVariant}
                selectedVariant={selectedVariant}
                showStock
                showPrice
              />
              {selectedVariant && (
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Selected Variant Details</h4>
                  <pre className="text-sm bg-background p-3 rounded overflow-auto">
                    {JSON.stringify(
                      exampleVariants.find(v => v.id === selectedVariant),
                      null,
                      2
                    )}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Movements Tab */}
        <TabsContent value="movements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stock Movement Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <StockMovementTimeline
                movements={exampleMovements}
                showFilters
                onExport={() => alert('Exporting movements...')}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Stock Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {exampleProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                          <Package className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">{product.sku}</div>
                        </div>
                      </div>
                      <StockBadge quantity={product.stock} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                    <Package className="h-6 w-6" />
                    <span>Receive Stock</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                    <Download className="h-6 w-6" />
                    <span>Issue Stock</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                    <TrendingUp className="h-6 w-6" />
                    <span>Adjust Stock</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                    <Filter className="h-6 w-6" />
                    <span>Generate Report</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Performance Notes */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">UI/UX Best Practices Implemented</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span><strong>Server-side pagination</strong> for large datasets</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span><strong>Advanced filtering</strong> with multiple criteria</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span><strong>Real-time stock indicators</strong> with color coding</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span><strong>Bulk operations</strong> for efficient management</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span><strong>Role-based UI</strong> with permission checks</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span><strong>Responsive design</strong> for all devices</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}