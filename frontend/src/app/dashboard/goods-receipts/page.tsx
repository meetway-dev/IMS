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
  PackageCheck,
  Truck,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/tables/data-table';
import { FormModal } from '@/components/ui/responsive-modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/ui/page-header';
import { ErrorState } from '@/components/ui/states';
import { goodsReceiptService, GoodsReceiptListParams } from '@/services/goods-receipt.service';
import { GoodsReceiptNote, GoodsReceiptStatus } from '@/types';
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

const STATUS_COLORS: Record<GoodsReceiptStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const STATUS_ICONS: Record<GoodsReceiptStatus, React.ReactNode> = {
  DRAFT: <FileText className="h-4 w-4" />,
  COMPLETED: <CheckCircle className="h-4 w-4" />,
  CANCELLED: <XCircle className="h-4 w-4" />,
};

export default function GoodsReceiptsPage() {
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
  const [editingGoodsReceipt, setEditingGoodsReceipt] = useState<GoodsReceiptNote | null>(null);

  // Fetch goods receipts
  const {
    data: goodsReceiptsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['goods-receipts', queryParams],
    queryFn: () => goodsReceiptService.getGoodsReceipts({
      page: queryParams.page,
      limit: queryParams.limit,
      search: queryParams.search || undefined,
      sortBy: queryParams.sortBy,
      sortOrder: queryParams.sortOrder,
    } as GoodsReceiptListParams),
  });

  // Create goods receipt mutation
  const createGoodsReceiptMutation = useMutation({
    mutationFn: goodsReceiptService.createGoodsReceipt,
    onSuccess: () => {
      toast({ title: 'Success', description: 'Goods receipt created successfully.', variant: 'success' });
      setIsDialogOpen(false);
      setEditingGoodsReceipt(null);
      queryClient.invalidateQueries({ queryKey: ['goods-receipts'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create goods receipt.',
        variant: 'error',
      });
    },
  });

  // Update goods receipt mutation
  const updateGoodsReceiptMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      goodsReceiptService.updateGoodsReceipt(id, data),
    onSuccess: () => {
      toast({ title: 'Success', description: 'Goods receipt updated successfully.', variant: 'success' });
      setIsDialogOpen(false);
      setEditingGoodsReceipt(null);
      queryClient.invalidateQueries({ queryKey: ['goods-receipts'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update goods receipt.',
        variant: 'error',
      });
    },
  });

  // Delete goods receipt mutation
  const deleteGoodsReceiptMutation = useMutation({
    mutationFn: goodsReceiptService.deleteGoodsReceipt,
    onSuccess: () => {
      toast({ title: 'Success', description: 'Goods receipt deleted successfully.', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['goods-receipts'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete goods receipt.',
        variant: 'error',
      });
    },
  });

  // Complete goods receipt mutation
  const completeGoodsReceiptMutation = useMutation({
    mutationFn: goodsReceiptService.completeGoodsReceipt,
    onSuccess: () => {
      toast({ title: 'Success', description: 'Goods receipt completed successfully.', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['goods-receipts'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to complete goods receipt.',
        variant: 'error',
      });
    },
  });

  const handleSubmitGoodsReceipt = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    if (editingGoodsReceipt) {
      updateGoodsReceiptMutation.mutate({
        id: editingGoodsReceipt.id,
        data,
      });
    } else {
      createGoodsReceiptMutation.mutate(data as any);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this goods receipt?')) {
      deleteGoodsReceiptMutation.mutate(id);
    }
  };

  const handleComplete = (id: string) => {
    if (confirm('Are you sure you want to mark this goods receipt as completed?')) {
      completeGoodsReceiptMutation.mutate(id);
    }
  };

  const columns: ColumnDef<GoodsReceiptNote>[] = [
    {
      accessorKey: 'grnNumber',
      header: 'GRN Number',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('grnNumber')}</div>
      ),
    },
    {
      accessorKey: 'purchaseOrder',
      header: 'Purchase Order',
      cell: ({ row }) => {
        const goodsReceipt = row.original;
        return (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-500" />
            <span>{goodsReceipt.purchaseOrder?.poNumber || 'N/A'}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'warehouse',
      header: 'Warehouse',
      cell: ({ row }) => {
        const goodsReceipt = row.original;
        return goodsReceipt.warehouse?.name || 'N/A';
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as GoodsReceiptStatus;
        return (
          <Badge className={STATUS_COLORS[status]}>
            <div className="flex items-center gap-1">
              {STATUS_ICONS[status]}
              {status}
            </div>
          </Badge>
        );
      },
    },
    {
      accessorKey: 'receiptDate',
      header: 'Receipt Date',
      cell: ({ row }) => {
        const date = row.getValue('receiptDate') as string;
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
        const goodsReceipt = row.original;
        return (
          <ActionMenu
            items={[
              {
                label: 'View Details',
                icon: <Eye className="h-4 w-4" />,
                onClick: () => {
                  // TODO: Implement view details
                  console.log('View details:', goodsReceipt.id);
                },
              },
              {
                label: 'Edit',
                icon: <Edit className="h-4 w-4" />,
                onClick: () => {
                  setEditingGoodsReceipt(goodsReceipt);
                  setIsDialogOpen(true);
                },
                disabled: goodsReceipt.status !== 'DRAFT',
              },
              {
                label: 'Complete',
                icon: <CheckCircle className="h-4 w-4" />,
                onClick: () => handleComplete(goodsReceipt.id),
                disabled: goodsReceipt.status !== 'DRAFT',
              },
              {
                label: 'Delete',
                icon: <Trash2 className="h-4 w-4" />,
                onClick: () => handleDelete(goodsReceipt.id),
                variant: 'destructive' as const,
                disabled: goodsReceipt.status !== 'DRAFT',
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
        title="Failed to load goods receipts"
        description="An error occurred while loading goods receipts. Please try again."
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
        title="Goods Receipts"
        description="Manage incoming shipments and inventory receipts"
        icon={PackageCheck}
        actions={
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Goods Receipt
          </Button>
        }
      />

      <div className="bg-white rounded-lg border shadow-sm">
        <DataTable
          columns={columns}
          data={goodsReceiptsData?.data || []}
          isLoading={isLoading}
          searchValue={search}
          onSearchChange={setSearch}
          currentPage={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          totalCount={goodsReceiptsData?.meta?.total || 0}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={setSort}
        />
      </div>

      <FormModal
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingGoodsReceipt(null);
        }}
        title={editingGoodsReceipt ? 'Edit Goods Receipt' : 'Create Goods Receipt'}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setEditingGoodsReceipt(null);
              }}
              disabled={
                createGoodsReceiptMutation.isPending || updateGoodsReceiptMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="goods-receipt-form"
              loading={
                createGoodsReceiptMutation.isPending || updateGoodsReceiptMutation.isPending
              }
            >
              {editingGoodsReceipt ? 'Update Goods Receipt' : 'Create Goods Receipt'}
            </Button>
          </div>
        }
      >
        <form
          id="goods-receipt-form"
          onSubmit={handleSubmitGoodsReceipt}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="grnNumber">GRN Number</Label>
              <Input
                id="grnNumber"
                name="grnNumber"
                placeholder="GRN-2024-001"
                defaultValue={editingGoodsReceipt?.grnNumber || ''}
                required
                disabled={
                  createGoodsReceiptMutation.isPending || updateGoodsReceiptMutation.isPending
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchaseOrderId">Purchase Order</Label>
              <Select name="purchaseOrderId" required defaultValue={editingGoodsReceipt?.purchaseOrderId || ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Select purchase order" />
                </SelectTrigger>
                <SelectContent>
                  {/* TODO: Fetch purchase orders dynamically */}
                  <SelectItem value="po-1">PO-2024-001</SelectItem>
                  <SelectItem value="po-2">PO-2024-002</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="warehouseId">Warehouse</Label>
              <Select name="warehouseId" required defaultValue={editingGoodsReceipt?.warehouseId || ''}>
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
              <Label htmlFor="receiptDate">Receipt Date</Label>
              <Input
                id="receiptDate"
                name="receiptDate"
                type="date"
                defaultValue={
                  editingGoodsReceipt?.receiptDate
                    ? new Date(editingGoodsReceipt.receiptDate).toISOString().split('T')[0]
                    : ''
                }
                disabled={
                  createGoodsReceiptMutation.isPending || updateGoodsReceiptMutation.isPending
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
              defaultValue={editingGoodsReceipt?.notes || ''}
              disabled={
                createGoodsReceiptMutation.isPending || updateGoodsReceiptMutation.isPending
              }
            />
          </div>
        </form>
      </FormModal>
    </motion.div>
  );
}