'use client';

import * as React from 'react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { 
  Package, 
  TrendingUp, 
  Filter, 
  Download, 
  Plus,
  Edit,
  Eye,
  MoreHorizontal,
  AlertTriangle,
  RefreshCw,
  Warehouse,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

import { InventoryDashboard } from '@/components/ui/inventory-dashboard';
import { DataTable } from '@/components/tables/data-table';
import { StockBadge } from '@/components/ui/inventory/StockBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { inventoryService } from '@/services/inventory.service';
import { Inventory } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function InventoryPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>('');

  // Fetch inventory with pagination
  const { data: inventoryData, isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => inventoryService.getInventory({ page: 1, limit: 100 }),
  });

  // Fetch low stock items
  const { data: lowStockData } = useQuery({
    queryKey: ['inventory', 'low-stock'],
    queryFn: () => inventoryService.getLowStockItems(),
  });

  // Adjust inventory mutation
  const adjustInventoryMutation = useMutation({
    mutationFn: inventoryService.adjustInventory,
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Inventory adjusted successfully.',
      });
      setIsAdjustModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'low-stock'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to adjust inventory.',
        variant: 'destructive',
      });
    },
  });

  const handleAdjustInventory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      productId: formData.get('productId') as string,
      quantity: parseInt(formData.get('quantity') as string),
      type: formData.get('type') as 'IN' | 'OUT',
      reason: formData.get('reason') as string,
    };
    await adjustInventoryMutation.mutateAsync(data);
  };

  const handleBulkExport = (selectedRows: Inventory[]) => {
    const csvContent = [
      ['ID', 'Product', 'SKU', 'Quantity', 'Min Stock', 'Status'].join(','),
      ...selectedRows.map(row => [
        row.id,
        row.product?.name || '',
        row.product?.sku || '',
        row.quantity,
        row.product?.minStockLevel || '',
        row.quantity <= (row.product?.minStockLevel || 0) ? 'Low Stock' : 'In Stock'
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    toast({
      title: 'Exported',
      description: `${selectedRows.length} items exported successfully.`,
    });
  };

  const handleBulkUpdate = (selectedRows: Inventory[]) => {
    toast({
      title: 'Bulk Update',
      description: `Update functionality for ${selectedRows.length} items would open here.`,
    });
  };

  // Define columns for the advanced table
  const columns: ColumnDef<Inventory>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          className="h-4 w-4 rounded border-gray-300"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="h-4 w-4 rounded border-gray-300"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'product.name',
      header: 'Product',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <div className="font-medium">{row.original.product?.name || '-'}</div>
            <div className="text-sm text-muted-foreground">
              {row.original.product?.sku || 'No SKU'}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'product.sku',
      header: 'SKU',
      cell: ({ row }) => row.original.product?.sku || '-',
    },
    {
      accessorKey: 'product.category',
      header: 'Category',
      cell: ({ row }) => row.original.product?.category?.name || '-',
    },
    {
      accessorKey: 'quantity',
      header: 'Stock Level',
      cell: ({ row }) => {
        const quantity = row.original.quantity || 0;
        const minStock = row.original.product?.minStockLevel || 10;
        return <StockBadge quantity={quantity} minStock={minStock} />;
      },
    },
    {
      accessorKey: 'product.price',
      header: 'Price',
      cell: ({ row }) => formatCurrency(row.original.product?.price || 0),
    },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: ({ row }) => row.original.location || 'Main Warehouse',
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const quantity = row.original.quantity || 0;
        const minStock = row.original.product?.minStockLevel || 10;
        
        if (quantity === 0) {
          return <Badge variant="destructive">Out of Stock</Badge>;
        } else if (quantity <= minStock) {
          return <Badge variant="warning">Low Stock</Badge>;
        } else {
          return <Badge variant="success">In Stock</Badge>;
        }
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const inventory = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedProduct(inventory.id);
                setIsAdjustModalOpen(true);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const inventoryItems = inventoryData?.data || [];
  const lowStockCount = lowStockData?.length || 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">
            Modern inventory dashboard with real-time tracking and analytics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setIsAdjustModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Adjust Stock
          </Button>
        </div>
      </div>

      {/* Dashboard Overview */}
      <InventoryDashboard showActions={false} />

      {/* Low Stock Alert Banner */}
      {lowStockCount > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div>
                  <h4 className="font-semibold text-orange-800">
                    {lowStockCount} items need immediate attention
                  </h4>
                  <p className="text-sm text-orange-700">
                    These items are below minimum stock levels and may need reordering.
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="border-orange-300 text-orange-700">
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Inventory Items
            </div>
            <Badge variant="outline">
              {inventoryItems.length} items
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={inventoryItems}
            searchPlaceholder="Search products, SKU, or category..."
            searchKey="product.name"
            enableSelection={true}
            enableBulkActions={true}
            bulkActions={[
              {
                label: 'Update Selected',
                onClick: handleBulkUpdate,
              },
              {
                label: 'Export Selected',
                onClick: handleBulkExport,
              },
            ]}
            isLoading={isLoading}
            filters={[
              {
                column: 'status',
                label: 'Stock Status',
                options: [
                  { label: 'All', value: 'all' },
                  { label: 'In Stock', value: 'in-stock' },
                  { label: 'Low Stock', value: 'low-stock' },
                  { label: 'Out of Stock', value: 'out-of-stock' },
                ],
              },
              {
                column: 'location',
                label: 'Location',
                options: [
                  { label: 'All Locations', value: 'all' },
                  { label: 'Main Warehouse', value: 'Main Warehouse' },
                  { label: 'Store Front', value: 'Store Front' },
                  { label: 'Storage Unit', value: 'Storage Unit' },
                ],
              },
            ]}
            pagination={{
              pageSize: 10,
              pageSizeOptions: [10, 25, 50, 100],
            }}
          />
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    inventoryItems.reduce((sum, item) => 
                      sum + ((item.quantity || 0) * (item.product?.price || 0)), 0
                    )
                  )}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{inventoryItems.length}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Stock Movements</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Adjust Stock Modal */}
      <ResponsiveModal
        open={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title="Adjust Inventory"
        size="md"
      >
        <form onSubmit={handleAdjustInventory} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="productId">Product</Label>
            <Select name="productId" required defaultValue={selectedProduct}>
              <SelectTrigger>
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {inventoryItems.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.product?.name} ({item.product?.sku})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Adjustment Type</Label>
            <Select name="type" required defaultValue="IN">
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IN">
                  <div className="flex items-center gap-2">
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                    <span>Stock In (Add)</span>
                  </div>
                </SelectItem>
                <SelectItem value="OUT">
                  <div className="flex items-center gap-2">
                    <ArrowDownRight className="h-4 w-4 text-red-600" />
                    <span>Stock Out (Remove)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              name="quantity"
              type="number"
              min="1"
              required
              placeholder="Enter quantity"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Input
              name="reason"
              placeholder="Enter reason for adjustment"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAdjustModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={adjustInventoryMutation.isPending}>
              {adjustInventoryMutation.isPending ? 'Processing...' : 'Adjust Stock'}
            </Button>
          </div>
        </form>
      </ResponsiveModal>
    </div>
  );
}
