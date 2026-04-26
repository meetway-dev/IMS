'use client';

import * as React from 'react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerSearch } from '@/hooks/use-server-search';
import { ColumnDef } from '@tanstack/react-table';
import { motion } from 'framer-motion';
import {
  Plus,
  Edit,
  Eye,
  Trash2,
  MoreHorizontal,
  FileText,
  Truck,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/tables/data-table';
import { FormModal } from '@/components/ui/responsive-modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/ui/page-header';
import { ErrorState } from '@/components/ui/states';
import { purchaseOrderService } from '@/services/purchase-order.service';
import { PurchaseOrder, PurchaseOrderStatus } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { ActionMenu } from '@/components/ui/action-menu';
import { staggerContainer, staggerItem } from '@/lib/animations';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const STATUS_COLORS: Record<PurchaseOrderStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PENDING_APPROVAL: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-blue-100 text-blue-800',
  REJECTED: 'bg-red-100 text-red-800',
  PARTIALLY_RECEIVED: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
};

const STATUS_ICONS: Record<PurchaseOrderStatus, React.ReactNode> = {
  DRAFT: <FileText className="h-4 w-4" />,
  PENDING_APPROVAL: <Clock className="h-4 w-4" />,
  APPROVED: <CheckCircle className="h-4 w-4" />,
  REJECTED: <XCircle className="h-4 w-4" />,
  PARTIALLY_RECEIVED: <Package className="h-4 w-4" />,
  COMPLETED: <CheckCircle className="h-4 w-4" />,
  CANCELLED: <XCircle className="h-4 w-4" />,
};

export default function PurchaseOrdersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const {
    search,
    debouncedSearch,
    setSearch,
    page,
    pageSize,
    setPage,
    setPageSize,
    sortBy,
    sortOrder,
    setSort,
    queryParams,
    resetPagination,
  } = useServerSearch();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPurchaseOrder, setEditingPurchaseOrder] = useState<PurchaseOrder | null>(null);

  // Fetch purchase orders
  const {
    data: purchaseOrdersData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['purchase-orders', queryParams],
    queryFn: () => purchaseOrderService.getPurchaseOrders({
      page: queryParams.page,
      limit: queryParams.limit,
      search: queryParams.search || undefined,
      sortBy: queryParams.sortBy,
      sortOrder: queryParams.sortOrder,
    }),
  });

  // Create purchase order mutation
  const createPurchaseOrderMutation = useMutation({
    mutationFn: purchaseOrderService.createPurchaseOrder,
    onSuccess: () => {
      toast({ title: 'Success', description: 'Purchase order created successfully.', variant: 'success' });
      setIsDialogOpen(false);
      setEditingPurchaseOrder(null);
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create purchase order.',
        variant: 'error',
      });
    },
  });

  // Update purchase order mutation
  const updatePurchaseOrderMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      purchaseOrderService.updatePurchaseOrder(id, data),
    onSuccess: () => {
      toast({ title: 'Success', description: 'Purchase order updated successfully.', variant: 'success' });
      setIsDialogOpen(false);
      setEditingPurchaseOrder(null);
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update purchase order.',
        variant: 'error',
      });
    },
  });

  // Delete purchase order mutation
  const deletePurchaseOrderMutation = useMutation({
    mutationFn: purchaseOrderService.deletePurchaseOrder,
    onSuccess: () => {
      toast({ title: 'Success', description: 'Purchase order deleted successfully.', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete purchase order.',
        variant: 'error',
      });
    },
  });

  // Approve purchase order mutation
  const approvePurchaseOrderMutation = useMutation({
    mutationFn: purchaseOrderService.approvePurchaseOrder,
    onSuccess: () => {
      toast({ title: 'Success', description: 'Purchase order approved successfully.', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve purchase order.',
        variant: 'error',
      });
    },
  });

  const handleSubmitPurchaseOrder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    if (editingPurchaseOrder) {
      updatePurchaseOrderMutation.mutate({
        id: editingPurchaseOrder.id,
        data,
      });
    } else {
      createPurchaseOrderMutation.mutate(data as any);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this purchase order?')) {
      deletePurchaseOrderMutation.mutate(id);
    }
  };

  const handleApprove = (id: string) => {
    if (confirm('Are you sure you want to approve this purchase order?')) {
      approvePurchaseOrderMutation.mutate(id);
    }
  };

  const columns: ColumnDef<PurchaseOrder>[] = [
    {
      accessorKey: 'poNumber',
      header: 'PO Number',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('poNumber')}</div>
      ),
    },
    {
      accessorKey: 'supplier',
      header: 'Supplier',
      cell: ({ row }) => {
        const purchaseOrder = row.original;
        return (
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-gray-500" />
            <span>{purchaseOrder.supplier?.name || 'N/A'}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'warehouse',
      header: 'Warehouse',
      cell: ({ row }) => {
        const purchaseOrder = row.original;
        return purchaseOrder.warehouse?.name || 'N/A';
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as PurchaseOrderStatus;
        return (
          <Badge className={STATUS_COLORS[status]}>
            <div className="flex items-center gap-1">
              {STATUS_ICONS[status]}
              {status.replace('_', ' ')}
            </div>
          </Badge>
        );
      },
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total Amount',
      cell: ({ row }) => {
        const amount = row.getValue('totalAmount') as number;
        return (
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4 text-gray-500" />
            <span>{amount.toLocaleString()}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'expectedDeliveryDate',
      header: 'Expected Delivery',
      cell: ({ row }) => {
        const date = row.getValue('expectedDeliveryDate') as string;
        return date ? (
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>{new Date(date).toLocaleDateString()}</span>
          </div>
        ) : (
          'N/A'
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const purchaseOrder = row.original;
        return (
          <ActionMenu
            items={[
              {
                label: 'View Details',
                icon: <Eye className="h-4 w-4" />,
                onClick: () => {
                  // TODO: Implement view details
                  console.log('View details:', purchaseOrder.id);
                },
              },
              {
                label: 'Edit',
                icon: <Edit className="h-4 w-4" />,
                onClick: () => {
                  setEditingPurchaseOrder(purchaseOrder);
                  setIsDialogOpen(true);
                },
                disabled: purchaseOrder.status !== 'DRAFT',
              },
              {
                label: 'Approve',
                icon: <CheckCircle className="h-4 w-4" />,
                onClick: () => handleApprove(purchaseOrder.id),
                disabled: purchaseOrder.status !== 'PENDING_APPROVAL',
              },
              {
                label: 'Delete',
                icon: <Trash2 className="h-4 w-4" />,
                onClick: () => handleDelete(purchaseOrder.id),
                variant: 'destructive' as const,
                disabled: !['DRAFT', 'PENDING_APPROVAL'].includes(purchaseOrder.status),
              },
            ]}
          />
        );
      },
    },
  ];

  if (error) {
    return (
      <ErrorState
        title="Failed to load purchase orders"
        description="An error occurred while loading purchase orders. Please try again."
        onRetry={refetch}
      />
    );
  }

  return (
    <motion.div
      className="space-y-6"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      <PageHeader
        title="Purchase Orders"
        description="Manage purchase orders from suppliers"
        icon={FileText}
        actions={
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Purchase Order
          </Button>
        }
      />

      <div className="bg-white rounded-lg border shadow-sm">
        <DataTable
          columns={columns}
          data={purchaseOrdersData?.data || []}
          isLoading={isLoading}
          searchValue={search}
          onSearchChange={setSearch}
          currentPage={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          totalCount={purchaseOrdersData?.meta?.total || 0}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={setSort}
        />
      </div>

      <FormModal
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingPurchaseOrder(null);
        }}
        title={editingPurchaseOrder ? 'Edit Purchase Order' : 'Create Purchase Order'}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setEditingPurchaseOrder(null);
              }}
              disabled={
                createPurchaseOrderMutation.isPending || updatePurchaseOrderMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="purchase-order-form"
              loading={
                createPurchaseOrderMutation.isPending || updatePurchaseOrderMutation.isPending
              }
            >
              {editingPurchaseOrder ? 'Update Purchase Order' : 'Create Purchase Order'}
            </Button>
          </div>
        }
      >
        <form
          id="purchase-order-form"
          onSubmit={handleSubmitPurchaseOrder}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="poNumber">PO Number</Label>
              <Input
                id="poNumber"
                name="poNumber"
                placeholder="PO-2024-001"
                defaultValue={editingPurchaseOrder?.poNumber || ''}
                required
                disabled={
                  createPurchaseOrderMutation.isPending || updatePurchaseOrderMutation.isPending
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplierId">Supplier</Label>
              <Select name="supplierId" required defaultValue={editingPurchaseOrder?.supplierId || ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {/* TODO: Fetch suppliers dynamically */}
                  <SelectItem value="supplier-1">Supplier 1</SelectItem>
                  <SelectItem value="supplier-2">Supplier 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="warehouseId">Warehouse</Label>
              <Select name="warehouseId" required defaultValue={editingPurchaseOrder?.warehouseId || ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Select warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {/* TODO: Fetch warehouses dynamically */}
                  <SelectItem value="warehouse-1">Warehouse 1</SelectItem>
                  <SelectItem value="warehouse-2">Warehouse 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expectedDeliveryDate">Expected Delivery Date</Label>
              <Input
                id="expectedDeliveryDate"
                name="expectedDeliveryDate"
                type="date"
                defaultValue={
                  editingPurchaseOrder?.expectedDeliveryDate
                    ? new Date(editingPurchaseOrder.expectedDeliveryDate).toISOString().split('T')[0]
                    : ''
                }
                disabled={
                  createPurchaseOrderMutation.isPending || updatePurchaseOrderMutation.isPending
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Additional notes..."
              rows={3}
              defaultValue={editingPurchaseOrder?.notes || ''}
              disabled={
                createPurchaseOrderMutation.isPending || updatePurchaseOrderMutation.isPending
              }
            />
          </div>
        </form>
      </FormModal>
    </motion.div>
  );
}