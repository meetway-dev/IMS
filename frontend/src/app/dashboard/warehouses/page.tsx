'use client';

import * as React from 'react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import {
  Warehouse as WarehouseIcon,
  Plus,
  Edit,
  Eye,
  Trash2,
  Archive,
  MapPin,
  Building2,
  Package,
  MoreHorizontal,
  ThermometerSnowflake,
  Store,
  Container,
} from 'lucide-react';

import { DataTable } from '@/components/tables/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { PageHeader } from '@/components/ui/page-header';
import { ErrorState } from '@/components/ui/states';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useServerSearch } from '@/hooks/use-server-search';
import { warehouseService } from '@/services/warehouse.service';
import {
  Warehouse,
  WarehouseType,
  CreateWarehouseData,
  UpdateWarehouseData,
} from '@/types';

// ─── Constants ──────────────────────────────────────────────────────────────

const WAREHOUSE_TYPE_CONFIG: Record<
  WarehouseType,
  { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive'; icon: React.ElementType; color: string }
> = {
  MAIN: { label: 'Main', variant: 'default', icon: WarehouseIcon, color: 'text-blue-600' },
  DISTRIBUTION: { label: 'Distribution', variant: 'secondary', icon: Container, color: 'text-purple-600' },
  RETAIL: { label: 'Retail', variant: 'outline', icon: Store, color: 'text-green-600' },
  COLD_STORAGE: { label: 'Cold Storage', variant: 'secondary', icon: ThermometerSnowflake, color: 'text-cyan-600' },
  BONDED: { label: 'Bonded', variant: 'outline', icon: Building2, color: 'text-amber-600' },
};

const WAREHOUSE_TYPE_OPTIONS = Object.entries(WAREHOUSE_TYPE_CONFIG).map(
  ([value, { label }]) => ({ value, label }),
);

// ─── Warehouse Form Modal ──────────────────────────────────────────────────

interface WarehouseFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warehouse?: Warehouse | null;
  onSubmit: (data: CreateWarehouseData | UpdateWarehouseData) => void;
  isPending: boolean;
}

function WarehouseFormModal({
  open,
  onOpenChange,
  warehouse,
  onSubmit,
  isPending,
}: WarehouseFormModalProps) {
  const isEditing = !!warehouse;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data: CreateWarehouseData | UpdateWarehouseData = {
      name: formData.get('name') as string,
      code: (formData.get('code') as string) || undefined,
      type: (formData.get('type') as WarehouseType) || undefined,
      address: (formData.get('address') as string) || undefined,
      city: (formData.get('city') as string) || undefined,
      state: (formData.get('state') as string) || undefined,
      country: (formData.get('country') as string) || undefined,
      postalCode: (formData.get('postalCode') as string) || undefined,
      phone: (formData.get('phone') as string) || undefined,
      email: (formData.get('email') as string) || undefined,
      capacity: formData.get('capacity')
        ? Number(formData.get('capacity'))
        : undefined,
      notes: (formData.get('notes') as string) || undefined,
      isActive: formData.get('isActive') === 'on',
    };

    onSubmit(data);
  };

  return (
    <ResponsiveModal
      open={open}
      onClose={() => onOpenChange(false)}
      title={isEditing ? 'Edit Warehouse' : 'Create New Warehouse'}
      description={
        isEditing
          ? 'Update warehouse information and settings'
          : 'Add a new warehouse to your inventory system'
      }
      size="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-1">
              <Label htmlFor="name">
                Warehouse Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Main Warehouse"
                defaultValue={warehouse?.name || ''}
                required
                minLength={1}
                maxLength={255}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Warehouse Code</Label>
              <Input
                id="code"
                name="code"
                placeholder="WH-001"
                defaultValue={warehouse?.code || ''}
                maxLength={32}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Warehouse Type</Label>
              <Select name="type" defaultValue={warehouse?.type || 'MAIN'}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {WAREHOUSE_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                placeholder="10000"
                defaultValue={warehouse?.capacity || ''}
                min={0}
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Address
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                name="address"
                placeholder="123 Main St"
                defaultValue={warehouse?.address || ''}
                maxLength={500}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                placeholder="New York"
                defaultValue={warehouse?.city || ''}
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State / Province</Label>
              <Input
                id="state"
                name="state"
                placeholder="NY"
                defaultValue={warehouse?.state || ''}
                maxLength={50}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                name="country"
                placeholder="USA"
                defaultValue={warehouse?.country || ''}
                maxLength={50}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                name="postalCode"
                placeholder="10001"
                defaultValue={warehouse?.postalCode || ''}
                maxLength={20}
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Contact
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="+1234567890"
                defaultValue={warehouse?.phone || ''}
                maxLength={20}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="warehouse@example.com"
                defaultValue={warehouse?.email || ''}
                maxLength={100}
              />
            </div>
          </div>
        </div>

        {/* Additional */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Additional notes about this warehouse..."
              defaultValue={warehouse?.notes || ''}
              maxLength={1000}
              rows={3}
            />
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="isActive"
              name="isActive"
              defaultChecked={warehouse?.isActive ?? true}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? isEditing
                ? 'Updating...'
                : 'Creating...'
              : isEditing
                ? 'Update Warehouse'
                : 'Create Warehouse'}
          </Button>
        </div>
      </form>
    </ResponsiveModal>
  );
}

// ─── Main Page Component ───────────────────────────────────────────────────

export default function WarehousesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(
    null,
  );
  const [typeFilter, setTypeFilter] = useState<string>('all');

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
  } = useServerSearch();

  // ── Fetch warehouses ────────────────────────────────────────────────────
  const {
    data: warehousesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['warehouses', { ...queryParams, type: typeFilter }],
    queryFn: () =>
      warehouseService.getWarehouses({
        page: queryParams.page,
        limit: queryParams.limit,
        search: queryParams.search || undefined,
        sortBy: queryParams.sortBy,
        sortOrder: queryParams.sortOrder,
        type: typeFilter !== 'all' ? (typeFilter as WarehouseType) : undefined,
      }),
  });

  // ── Mutations ───────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: warehouseService.createWarehouse,
    onSuccess: () => {
      toast({ title: 'Success', description: 'Warehouse created successfully.', variant: 'success' });
      setIsFormModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err.message || 'Failed to create warehouse.',
        variant: 'error',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWarehouseData }) =>
      warehouseService.updateWarehouse(id, data),
    onSuccess: () => {
      toast({ title: 'Success', description: 'Warehouse updated successfully.', variant: 'success' });
      setIsFormModalOpen(false);
      setEditingWarehouse(null);
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update warehouse.',
        variant: 'error',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: warehouseService.deleteWarehouse,
    onSuccess: () => {
      toast({ title: 'Success', description: 'Warehouse deleted successfully.', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete warehouse.',
        variant: 'error',
      });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: warehouseService.archiveWarehouse,
    onSuccess: () => {
      toast({ title: 'Success', description: 'Warehouse archived successfully.', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err.message || 'Failed to archive warehouse.',
        variant: 'error',
      });
    },
  });

  const isMutating = createMutation.isPending || updateMutation.isPending;

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleEdit = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    setIsFormModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this warehouse? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleArchive = (id: string) => {
    if (confirm('Are you sure you want to archive this warehouse?')) {
      archiveMutation.mutate(id);
    }
  };

  const handleFormSubmit = (data: CreateWarehouseData | UpdateWarehouseData) => {
    if (editingWarehouse) {
      updateMutation.mutate({ id: editingWarehouse.id, data: data as UpdateWarehouseData });
    } else {
      createMutation.mutate(data as CreateWarehouseData);
    }
  };

  const handleModalClose = (open: boolean) => {
    setIsFormModalOpen(open);
    if (!open) setEditingWarehouse(null);
  };

  // ── Table Columns ───────────────────────────────────────────────────────
  const columns: ColumnDef<Warehouse>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => {
        const wh = row.original;
        const typeConfig = WAREHOUSE_TYPE_CONFIG[wh.type];
        const IconComponent = typeConfig?.icon || WarehouseIcon;
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <IconComponent className={`h-5 w-5 ${typeConfig?.color || 'text-primary'}`} />
            </div>
            <div>
              <div className="font-medium">{wh.name}</div>
              {wh.code && (
                <div className="text-xs text-muted-foreground">{wh.code}</div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const typeConfig = WAREHOUSE_TYPE_CONFIG[row.original.type];
        return (
          <Badge variant={typeConfig?.variant || 'outline'}>
            {typeConfig?.label || row.original.type}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'city',
      header: 'Location',
      cell: ({ row }) => {
        const wh = row.original;
        const locationParts = [wh.city, wh.state, wh.country].filter(Boolean);
        return (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">
              {locationParts.length > 0 ? locationParts.join(', ') : '—'}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'default' : 'secondary'}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      id: 'stats',
      header: 'Stats',
      cell: ({ row }) => (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm font-medium">
              {row.original._count?.locations || 0}
            </span>
            <span className="text-xs text-muted-foreground">Locations</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Package className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm font-medium">
              {row.original._count?.stockLevels || 0}
            </span>
            <span className="text-xs text-muted-foreground">Items</span>
          </div>
        </div>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const wh = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => router.push(`/dashboard/warehouses/${wh.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(wh)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Warehouse
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleArchive(wh.id)}>
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDelete(wh.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // ── Error State ─────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Warehouses"
          description="Manage your warehouse locations and storage facilities"
        />
        <ErrorState
          title="Failed to load warehouses"
          description={error instanceof Error ? error.message : 'An unexpected error occurred'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Warehouses"
        description="Manage your warehouse locations and storage facilities"
        actions={
          <Button onClick={() => setIsFormModalOpen(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Warehouse
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={warehousesData?.data || []}
        searchPlaceholder="Search warehouses by name, code, or city..."
        onSearchChange={setSearch}
        searchValue={search}
        totalCount={warehousesData?.meta?.total}
        currentPage={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onSortChange={setSort}
        sortBy={sortBy}
        sortOrder={sortOrder}
        isLoading={isLoading}
        onRowClick={(wh) => router.push(`/dashboard/warehouses/${wh.id}`)}
        filters={[
          {
            column: 'type',
            label: 'Type',
            options: [
              { label: 'All Types', value: 'all' },
              ...WAREHOUSE_TYPE_OPTIONS,
            ],
          },
        ]}
        emptyState={{
          icon: <WarehouseIcon className="h-12 w-12 text-muted-foreground/50" />,
          title: 'No warehouses found',
          description:
            'Get started by creating your first warehouse to manage inventory locations.',
        }}
      />

      {/* Create / Edit Warehouse Modal */}
      <WarehouseFormModal
        open={isFormModalOpen}
        onOpenChange={handleModalClose}
        warehouse={editingWarehouse}
        onSubmit={handleFormSubmit}
        isPending={isMutating}
      />
    </div>
  );
}
