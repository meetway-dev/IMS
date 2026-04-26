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
  Ruler,
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
import { unitOfMeasureService, UnitOfMeasure } from '@/services/unit-of-measure.service';
import { useToast } from '@/components/ui/use-toast';
import { ActionMenu } from '@/components/ui/action-menu';
import { formatDate } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/lib/animations';

export default function UnitOfMeasuresPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const {
    search,
    debouncedSearch,
    setSearch,
    sortBy,
    sortOrder,
    setSort,
    page,
    pageSize,
    setPage,
    setPageSize,
  } = useServerSearch();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<UnitOfMeasure | null>(null);

  const handleEditUnit = (unit: UnitOfMeasure) => {
    setEditingUnit(unit);
    setIsDialogOpen(true);
  };

  const handleDeleteUnit = async (id: string) => {
    if (confirm('Are you sure you want to delete this unit of measure?')) {
      await deleteUnitMutation.mutateAsync(id);
    }
  };

  const handleSubmitUnit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      symbol: formData.get('symbol') as string,
      description: formData.get('description') as string || undefined,
    };

    if (editingUnit) {
      await updateUnitMutation.mutateAsync({ id: editingUnit.id, data });
    } else {
      await createUnitMutation.mutateAsync(data);
    }
  };

  const columns: ColumnDef<UnitOfMeasure>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Ruler className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-xs text-muted-foreground">{row.original.slug}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'symbol',
      header: 'Symbol',
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono">
          {row.original.symbol}
        </Badge>
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
              onClick: () => handleEditUnit(row.original),
            },
            {
              label: 'Delete',
              icon: Trash2,
              iconPosition: 'start',
              variant: 'destructive',
              onClick: () => handleDeleteUnit(row.original.id),
            },
          ]}
          align="end"
        />
      ),
    },
  ];

  // Fetch units of measure with pagination and sorting
  const {
    data: unitsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      'unit-of-measures',
      {
        search: debouncedSearch,
        sortBy,
        sortOrder,
        page,
        pageSize,
      },
    ],
    queryFn: () => unitOfMeasureService.getUnitOfMeasures({
      page,
      limit: pageSize,
      search: debouncedSearch || undefined,
      sortBy: sortBy || undefined,
      sortOrder: sortOrder || undefined,
    }),
  });

  // Create unit mutation
  const createUnitMutation = useMutation({
    mutationFn: unitOfMeasureService.createUnitOfMeasure,
    onSuccess: () => {
      toast({ title: 'Success', description: 'Unit of measure created successfully.', variant: 'success' });
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['unit-of-measures'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create unit of measure.',
        variant: 'error',
      });
    },
  });

  // Update unit mutation
  const updateUnitMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      unitOfMeasureService.updateUnitOfMeasure(id, data),
    onSuccess: () => {
      toast({ title: 'Success', description: 'Unit of measure updated successfully.', variant: 'success' });
      setIsDialogOpen(false);
      setEditingUnit(null);
      queryClient.invalidateQueries({ queryKey: ['unit-of-measures'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update unit of measure.',
        variant: 'error',
      });
    },
  });

  // Delete unit mutation
  const deleteUnitMutation = useMutation({
    mutationFn: unitOfMeasureService.deleteUnitOfMeasure,
    onSuccess: () => {
      toast({ title: 'Success', description: 'Unit of measure deleted successfully.', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['unit-of-measures'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete unit of measure.',
        variant: 'error',
      });
    },
  });

  const isMutating = createUnitMutation.isPending || updateUnitMutation.isPending;

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          icon={Ruler}
          title="Units of Measure"
          description="Manage measurement units for products"
        />
        <ErrorState
          title="Failed to load units of measure"
          description="There was an error loading units of measure. Please try again."
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
          icon={Ruler}
          title="Units of Measure"
          description="Manage measurement units for products"
          actions={
            <Button onClick={() => {
              setEditingUnit(null);
              setIsDialogOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              New Unit
            </Button>
          }
        />
      </motion.div>

      <motion.div variants={staggerItem}>
        <DataTable
          columns={columns}
          data={unitsData?.data || []}
          isLoading={isLoading}
          searchPlaceholder="Search units of measure..."
          searchKey="name"
          onSearchChange={setSearch}
          searchValue={search}
          totalCount={unitsData?.meta.total}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={setSort}
          currentPage={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          pagination={{
            pageSize: pageSize,
            pageSizeOptions: [10, 25, 50, 100],
          }}
        />
      </motion.div>

      <FormModal
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingUnit(null);
        }}
        title={editingUnit ? 'Edit Unit of Measure' : 'Create Unit of Measure'}
        description={editingUnit ? 'Update unit details' : 'Add a new unit of measure'}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setEditingUnit(null);
              }}
              disabled={isMutating}
            >
              Cancel
            </Button>
            <Button type="submit" form="unit-form" loading={isMutating}>
              {editingUnit ? 'Update' : 'Create'}
            </Button>
          </div>
        }
      >
        <form id="unit-form" onSubmit={handleSubmitUnit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Kilogram, Liter, Piece"
                defaultValue={editingUnit?.name || ''}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol *</Label>
              <Input
                id="symbol"
                name="symbol"
                placeholder="e.g., kg, L, pcs"
                defaultValue={editingUnit?.symbol || ''}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Optional description"
                defaultValue={editingUnit?.description || ''}
                rows={3}
              />
            </div>
          </div>
        </form>
      </FormModal>
    </motion.div>
  );
}