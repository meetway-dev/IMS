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
  Type,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/tables/data-table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FormModal } from '@/components/ui/responsive-modal';
import { PageHeader } from '@/components/ui/page-header';
import { ErrorState } from '@/components/ui/states';
import { productTypeService, ProductType } from '@/services/product-type.service';
import { useToast } from '@/components/ui/use-toast';
import { ActionMenu } from '@/components/ui/action-menu';
import { formatDate } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/lib/animations';

export default function ProductTypesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { search, debouncedSearch, setSearch } = useServerSearch();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProductType, setEditingProductType] = useState<ProductType | null>(null);

  const handleEditProductType = (productType: ProductType) => {
    setEditingProductType(productType);
    setIsDialogOpen(true);
  };

  const handleDeleteProductType = async (id: string) => {
    if (confirm('Are you sure you want to delete this product type?')) {
      await deleteProductTypeMutation.mutateAsync(id);
    }
  };

  const handleSubmitProductType = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string || undefined,
    };

    if (editingProductType) {
      await updateProductTypeMutation.mutateAsync({ id: editingProductType.id, data });
    } else {
      await createProductTypeMutation.mutateAsync(data);
    }
  };

  const columns: ColumnDef<ProductType>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Type className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-xs text-muted-foreground">{row.original.slug}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.description || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'success' : 'secondary'}>
          {row.original.isActive ? (
            <>
              <CheckCircle className="mr-1 h-3 w-3" />
              Active
            </>
          ) : (
            <>
              <XCircle className="mr-1 h-3 w-3" />
              Inactive
            </>
          )}
        </Badge>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <ActionMenu
          trigger={{ icon: MoreHorizontal, variant: 'ghost', size: 'icon-sm' }}
          items={[
            {
              label: 'Edit',
              icon: Edit,
              iconPosition: 'start',
              onClick: () => handleEditProductType(row.original),
            },
            {
              label: 'Delete',
              icon: Trash2,
              iconPosition: 'start',
              variant: 'destructive',
              onClick: () => handleDeleteProductType(row.original.id),
            },
          ]}
          align="end"
        />
      ),
    },
  ];

  // Fetch product types
  const {
    data: productTypesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['product-types', { search: debouncedSearch }],
    queryFn: () => productTypeService.getProductTypes({ page: 1, limit: 100, search: debouncedSearch || undefined }),
  });

  // Create product type mutation
  const createProductTypeMutation = useMutation({
    mutationFn: productTypeService.createProductType,
    onSuccess: () => {
      toast({ title: 'Success', description: 'Product type created successfully.' });
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['product-types'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create product type.',
        variant: 'destructive',
      });
    },
  });

  // Update product type mutation
  const updateProductTypeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      productTypeService.updateProductType(id, data),
    onSuccess: () => {
      toast({ title: 'Success', description: 'Product type updated successfully.' });
      setIsDialogOpen(false);
      setEditingProductType(null);
      queryClient.invalidateQueries({ queryKey: ['product-types'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update product type.',
        variant: 'destructive',
      });
    },
  });

  // Delete product type mutation
  const deleteProductTypeMutation = useMutation({
    mutationFn: productTypeService.deleteProductType,
    onSuccess: () => {
      toast({ title: 'Success', description: 'Product type deleted successfully.' });
      queryClient.invalidateQueries({ queryKey: ['product-types'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete product type.',
        variant: 'destructive',
      });
    },
  });

  const isMutating = createProductTypeMutation.isPending || updateProductTypeMutation.isPending;

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          icon={Type}
          title="Product Types"
          description="Manage product classification types"
        />
        <ErrorState
          title="Failed to load product types"
          description="There was an error loading product types. Please try again."
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
          icon={Type}
          title="Product Types"
          description="Manage product classification types"
          actions={
            <Button onClick={() => {
              setEditingProductType(null);
              setIsDialogOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              New Product Type
            </Button>
          }
        />
      </motion.div>

      <motion.div variants={staggerItem}>
        <DataTable
          columns={columns}
          data={productTypesData?.data || []}
          isLoading={isLoading}
          searchPlaceholder="Search product types..."
          searchKey="name"
          onSearchChange={setSearch}
          searchValue={search}
          totalCount={productTypesData?.meta.total}
          pagination={{
            pageSize: 10,
            pageSizeOptions: [10, 25, 50, 100],
          }}
        />
      </motion.div>

      <FormModal
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingProductType(null);
        }}
        title={editingProductType ? 'Edit Product Type' : 'Create Product Type'}
        description={editingProductType ? 'Update product type details' : 'Add a new product type'}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setEditingProductType(null);
              }}
              disabled={isMutating}
            >
              Cancel
            </Button>
            <Button type="submit" form="product-type-form" loading={isMutating}>
              {editingProductType ? 'Update' : 'Create'}
            </Button>
          </div>
        }
      >
        <form id="product-type-form" onSubmit={handleSubmitProductType}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Sanitary, Electrical"
                defaultValue={editingProductType?.name || ''}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Optional description"
                defaultValue={editingProductType?.description || ''}
                rows={3}
              />
            </div>
          </div>
        </form>
      </FormModal>
    </motion.div>
  );
}