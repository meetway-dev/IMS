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
  Trash2,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  User,
  Truck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/tables/data-table';
import { FormModal } from '@/components/ui/responsive-modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/ui/page-header';
import { ErrorState } from '@/components/ui/states';
import { supplierService } from '@/services/supplier.service';
import { Supplier } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { ActionMenu } from '@/components/ui/action-menu';
import { ConfirmationDialog, useConfirmation } from '@/components/ui/confirmation-dialog';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { usePermissions } from '@/hooks/use-permissions';

export default function SuppliersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { canWrite, canDelete } = usePermissions();
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
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const deleteConfirm = useConfirmation<string>();

  // Fetch suppliers
  const {
    data: suppliersData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['suppliers', queryParams],
    queryFn: () => supplierService.getSuppliers({
      page: queryParams.page,
      limit: queryParams.limit,
      search: queryParams.search || undefined,
      sortBy: queryParams.sortBy,
      sortOrder: queryParams.sortOrder,
    }),
  });

  // Create supplier mutation
  const createSupplierMutation = useMutation({
    mutationFn: supplierService.createSupplier,
    onSuccess: () => {
      toast({ title: 'Success', description: 'Supplier created successfully.', variant: 'success' });
      setIsDialogOpen(false);
      setEditingSupplier(null);
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create supplier.',
        variant: 'error',
      });
    },
  });

  // Update supplier mutation
  const updateSupplierMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      supplierService.updateSupplier(id, data),
    onSuccess: () => {
      toast({ title: 'Success', description: 'Supplier updated successfully.', variant: 'success' });
      setIsDialogOpen(false);
      setEditingSupplier(null);
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update supplier.',
        variant: 'error',
      });
    },
  });

  // Delete supplier mutation
  const deleteSupplierMutation = useMutation({
    mutationFn: supplierService.deleteSupplier,
    onSuccess: () => {
      toast({ title: 'Success', description: 'Supplier deleted successfully.', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete supplier.',
        variant: 'error',
      });
    },
  });

  const isMutating = createSupplierMutation.isPending || updateSupplierMutation.isPending;

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsDialogOpen(true);
  };

  const handleDeleteSupplier = (id: string) => {
    deleteConfirm.open(id);
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirm.data) {
      await deleteSupplierMutation.mutateAsync(deleteConfirm.data);
      deleteConfirm.close();
    }
  };

  const handleSubmitSupplier = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string | undefined,
      phone: formData.get('phone') as string | undefined,
      address: formData.get('address') as string | undefined,
      contactPerson: formData.get('contactPerson') as string | undefined,
      notes: formData.get('notes') as string | undefined,
    };

    if (editingSupplier) {
      await updateSupplierMutation.mutateAsync({ id: editingSupplier.id, data });
    } else {
      await createSupplierMutation.mutateAsync(data);
    }
  };

  const columns: ColumnDef<Supplier>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Truck className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-medium">{row.original.name}</div>
            {row.original.contactPerson && (
              <div className="text-xs text-muted-foreground">
                {row.original.contactPerson}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm">
          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">{row.original.email || '-'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm">
          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">{row.original.phone || '-'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'address',
      header: 'Address',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="max-w-[200px] truncate text-muted-foreground">
            {row.original.address || '-'}
          </span>
        </div>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <ActionMenu
          trigger={{ icon: MoreHorizontal, variant: 'ghost', size: 'icon-sm' }}
          items={[
            ...(canWrite('suppliers')
              ? [{
                  label: 'Edit',
                  icon: Edit,
                  iconPosition: 'start' as const,
                  onClick: () => handleEditSupplier(row.original),
                }]
              : []),
            ...(canDelete('suppliers')
              ? [{
                  label: 'Delete',
                  icon: Trash2,
                  iconPosition: 'start' as const,
                  variant: 'destructive' as const,
                  onClick: () => handleDeleteSupplier(row.original.id),
                }]
              : []),
          ]}
          align="end"
        />
      ),
    },
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          icon={Truck}
          title="Suppliers"
          description="Manage your suppliers"
        />
        <ErrorState
          title="Failed to load suppliers"
          description="There was an error loading your suppliers. Please try again."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      <motion.div variants={staggerItem}>
        <PageHeader
          icon={Truck}
          title="Suppliers"
          description="Manage your suppliers and vendor relationships"
          actions={
            canWrite('suppliers') ? (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Supplier
              </Button>
            ) : undefined
          }
        />
      </motion.div>

      <motion.div variants={staggerItem}>
        <DataTable
          columns={columns}
          data={suppliersData?.data || []}
          searchKey="name"
          searchPlaceholder="Search suppliers..."
          onSearchChange={setSearch}
          searchValue={search}
          totalCount={suppliersData?.meta.total}
          isLoading={isLoading}
          // Server-side pagination props
          currentPage={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          // Server-side sorting props
          onSortChange={setSort}
          sortBy={sortBy}
          sortOrder={sortOrder}
          emptyState={{
            icon: <Truck className="h-12 w-12 text-muted-foreground/50" />,
            title: 'No suppliers found',
            description: 'Get started by adding your first supplier.',
          }}
        />
      </motion.div>

      <FormModal
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingSupplier(null);
        }}
        title={editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setEditingSupplier(null);
              }}
              disabled={isMutating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="supplier-form"
              loading={isMutating}
            >
              {editingSupplier ? 'Update Supplier' : 'Create Supplier'}
            </Button>
          </div>
        }
      >
        <form id="supplier-form" onSubmit={handleSubmitSupplier} className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Supplier Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter supplier name"
                defaultValue={editingSupplier?.name || ''}
                required
                disabled={isMutating}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="contact@supplier.com"
                  defaultValue={editingSupplier?.email || ''}
                  disabled={isMutating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="+1234567890"
                  defaultValue={editingSupplier?.phone || ''}
                  disabled={isMutating}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                name="contactPerson"
                placeholder="John Doe"
                defaultValue={editingSupplier?.contactPerson || ''}
                disabled={isMutating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                placeholder="123 Main St, City"
                defaultValue={editingSupplier?.address || ''}
                disabled={isMutating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                name="notes"
                placeholder="Additional notes..."
                defaultValue={editingSupplier?.notes || ''}
                disabled={isMutating}
              />
            </div>
          </div>
        </form>
      </FormModal>

      <ConfirmationDialog
        {...deleteConfirm.dialogProps}
        title="Delete Supplier"
        description="Are you sure you want to delete this supplier? This action cannot be undone."
        confirmLabel="Delete Supplier"
        variant="destructive"
        isLoading={deleteSupplierMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </motion.div>
  );
}
