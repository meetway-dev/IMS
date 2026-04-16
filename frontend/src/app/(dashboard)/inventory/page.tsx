'use client';

import * as React from 'react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Edit, Trash2, MoreHorizontal, PackageOpen, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/tables/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { inventoryService } from '@/services/inventory.service';
import { Inventory } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatCurrency } from '@/lib/utils';

const columns: ColumnDef<Inventory>[] = [
  {
    accessorKey: 'product.name',
    header: 'Product',
    cell: ({ row }) => row.original.product?.name || '-',
  },
  {
    accessorKey: 'quantity',
    header: 'Quantity',
    cell: ({ row }) => {
      const minStock = row.original.product?.minStockLevel;
      const isLowStock = minStock !== undefined && row.original.quantity <= minStock;
      return (
        <div className="flex items-center gap-2">
          <span>{row.original.quantity}</span>
          {isLowStock && (
            <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
              Low
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'product.minStockLevel',
    header: 'Min Stock',
    cell: ({ row }) => row.original.product?.minStockLevel || '-',
  },
  {
    accessorKey: 'product.price',
    header: 'Price',
    cell: ({ row }) => formatCurrency(row.original.product?.price || 0),
  },
  {
    accessorKey: 'product.cost',
    header: 'Cost',
    cell: ({ row }) => formatCurrency(row.original.product?.cost || 0),
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Edit className="mr-2 h-4 w-4" />
            Adjust Stock
          </DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

export default function InventoryPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch inventory
  const { data: inventoryData, isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => inventoryService.getInventory({ page: 1, limit: 100 }),
  });

  // Create inventory adjustment mutation
  const adjustInventoryMutation = useMutation({
    mutationFn: inventoryService.adjustInventory,
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Inventory adjusted successfully.',
      });
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <PackageOpen className="h-8 w-8" />
            Inventory
          </h1>
          <p className="text-muted-foreground">
            Manage your stock levels and inventory adjustments
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Adjust Stock
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adjust Inventory</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdjustInventory} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="productId">Product *</Label>
                <Select name="productId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">LED Bulb 10W</SelectItem>
                    <SelectItem value="2">Copper Wire 2mm</SelectItem>
                    <SelectItem value="3">Switch 2-Way</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Adjustment Type *</Label>
                <Select name="type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IN">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        Stock In
                      </div>
                    </SelectItem>
                    <SelectItem value="OUT">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-red-600" />
                        Stock Out
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  placeholder="Enter quantity"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Input
                  id="reason"
                  name="reason"
                  placeholder="Enter reason (optional)"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={adjustInventoryMutation.isPending}>
                  {adjustInventoryMutation.isPending ? 'Adjusting...' : 'Adjust Inventory'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={inventoryData?.data || []}
        searchKey="product.name"
        searchPlaceholder="Search inventory..."
      />
    </div>
  );
}