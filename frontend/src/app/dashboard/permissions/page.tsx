'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/tables/data-table';
import { ActionMenu, menuItem, menuSeparator, menuLabel } from '@/components/ui/action-menu';
import { PageHeader } from '@/components/ui/page-header';
import { ErrorState } from '@/components/ui/states';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatsCard } from '@/components/ui/stats-card';
import {
  Search,
  Plus,
  Shield,
  Key,
  Settings,
  MoreVertical,
  Copy,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Filter,
  Database,
  Globe,
  Smartphone,
  Lock,
  Unlock,
  Crown,
  FileText,
  Loader2,
  Download,
} from 'lucide-react';

import { permissionService } from '@/services/role-permission.service';
import { Permission } from '@/types';
import { useAuthStore } from '@/store/auth-store';
import { PermissionFormModal } from './PermissionFormModal';
import { PermissionDetailsModal } from './PermissionDetailsModal';
import { ConfirmationDialog, useConfirmation } from '@/components/ui/confirmation-dialog';
import { useServerSearch } from '@/hooks/use-server-search';
import { usePermissions } from '@/hooks/use-permissions';

export default function PermissionsPage() {
  const { canWrite, canDelete } = usePermissions();
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
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editPermission, setEditPermission] = React.useState<Permission | null>(null);
  const { user, initializeAuth } = useAuthStore();
  const deleteConfirm = useConfirmation<Permission>();
  const bulkDeleteConfirm = useConfirmation<Permission[]>();
  const [density, setDensity] = React.useState<'compact' | 'comfortable'>('comfortable');
  const [activeTab, setActiveTab] = React.useState('all');

  React.useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const isSuperAdmin = user?.roles?.includes('SUPER_ADMIN');

  const [detailsPermission, setDetailsPermission] = React.useState<Permission | null>(null);

  const { data: permissionsData, isLoading, refetch, error } = useQuery({
    queryKey: [
      'permissions',
      {
        search: debouncedSearch,
        sortBy,
        sortOrder,
        page,
        pageSize,
      },
    ],
    queryFn: () => permissionService.getAllPermissions({
      search: debouncedSearch || undefined,
      sortBy: sortBy || undefined,
      sortOrder: sortOrder || undefined,
      page,
      limit: pageSize,
    }),
    enabled: !!user,
  });

  const permissions = permissionsData?.data || [];

  // Filter permissions based on active tab
  const filteredPermissions = React.useMemo(() => {
    if (activeTab === 'all') return permissions;
    if (activeTab === 'system') return permissions.filter(p => p.isSystem);
    if (activeTab === 'custom') return permissions.filter(p => !p.isSystem);
    if (activeTab === 'api') return permissions.filter(p => p.type === 'API');
    if (activeTab === 'ui') return permissions.filter(p => p.type === 'UI');
    if (activeTab === 'data') return permissions.filter(p => p.type === 'DATA');
    return permissions;
  }, [permissions, activeTab]);

  const handleAdd = () => {
    setEditPermission(null);
    setModalOpen(true);
  };

  const handleEdit = async (permission: Permission) => {
    setEditPermission(permission);
    setModalOpen(true);
  };

  const handleDelete = (permission: Permission) => {
    deleteConfirm.open(permission);
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirm.data) {
      try {
        await permissionService.deletePermission(deleteConfirm.data.id);
        refetch();
      } catch (error) {
        console.error('Failed to delete permission:', error);
      }
      deleteConfirm.close();
    }
  };

  const getEffectIcon = (effect: string) => {
    switch (effect) {
      case 'ALLOW':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'DENY':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const handleBulkDelete = (selectedPermissions: Permission[]) => {
    bulkDeleteConfirm.open(selectedPermissions);
  };

  const handleBulkDeleteConfirm = async () => {
    if (bulkDeleteConfirm.data) {
      try {
        await Promise.all(bulkDeleteConfirm.data.map(permission => permissionService.deletePermission(permission.id)));
        refetch();
      } catch (error) {
        console.error('Failed to delete permissions:', error);
      }
      bulkDeleteConfirm.close();
    }
  };

  const handleExport = (data: Permission[]) => {
    const csv = [
      ['Key', 'Name', 'Description', 'Type', 'Effect', 'Module', 'Resource', 'Action', 'System', 'Created'],
      ...data.map(permission => [
        permission.key,
        permission.name,
        permission.description || '',
        permission.type,
        permission.effect,
        permission.module,
        permission.resource || '',
        permission.action || '',
        permission.isSystem ? 'Yes' : 'No',
        new Date(permission.createdAt).toLocaleDateString()
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'permissions.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const bulkActions = [
    {
      label: 'Delete Selected',
      icon: Trash2,
      onClick: handleBulkDelete,
      variant: 'destructive' as const,
    },
  ];

  const columns = [
    {
      accessorKey: 'key',
      header: 'Key',
      cell: ({ row }: any) => (
        <div className="font-mono text-sm">{row.original.key}</div>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.name}</div>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }: any) => (
        <div className="text-muted-foreground">{row.original.description || '-'}</div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }: any) => (
        <Badge variant="outline" className="text-xs">
          {row.original.type}
        </Badge>
      ),
    },
    {
      accessorKey: 'effect',
      header: 'Effect',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          {getEffectIcon(row.original.effect)}
          <span>{row.original.effect}</span>
        </div>
      ),
    },
    {
      accessorKey: 'module',
      header: 'Module',
      cell: ({ row }: any) => row.original.module,
    },
    {
      accessorKey: 'resource',
      header: 'Resource',
      cell: ({ row }: any) => row.original.resource || '-',
    },
    {
      accessorKey: 'action',
      header: 'Action',
      cell: ({ row }: any) => row.original.action || '-',
    },
    {
      accessorKey: 'isSystem',
      header: 'System',
      cell: ({ row }: any) => (
        <Badge variant={row.original.isSystem ? 'destructive' : 'outline'} className="text-xs">
          {row.original.isSystem ? 'Yes' : 'No'}
        </Badge>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }: any) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }: any) => (
        <ActionMenu
          items={[
            ...(canWrite('permissions')
              ? [{
                  label: 'Edit',
                  icon: Edit,
                  onClick: () => handleEdit(row.original),
                  disabled: row.original.isSystem,
                }]
              : []),
            ...(canDelete('permissions')
              ? [{
                  label: 'Delete',
                  icon: Trash2,
                  onClick: () => handleDelete(row.original),
                  variant: 'destructive' as const,
                  disabled: row.original.isSystem,
                }]
              : []),
          ]}
        />
      ),
    },
  ];

  const stats = React.useMemo(() => {
    const total = permissions?.length || 0;
    const system = permissions?.filter(p => p.isSystem).length || 0;
    const custom = total - system;
    const allow = permissions?.filter(p => p.effect === 'ALLOW').length || 0;
    const deny = permissions?.filter(p => p.effect === 'DENY').length || 0;

    return [
      {
        title: 'Total Permissions',
        value: total,
        description: `${system} system, ${custom} custom`,
        icon: Shield,
        color: 'blue',
      },
      {
        title: 'Allow Effect',
        value: allow,
        description: `${Math.round((allow / total) * 100) || 0}% of total`,
        icon: CheckCircle,
        color: 'green',
      },
      {
        title: 'Deny Effect',
        value: deny,
        description: `${Math.round((deny / total) * 100) || 0}% of total`,
        icon: XCircle,
        color: 'red',
      },
      {
        title: 'System Permissions',
        value: system,
        description: 'Built-in, cannot be modified',
        icon: Lock,
        color: 'orange',
      },
      {
        title: 'Custom Permissions',
        value: custom,
        description: 'User-defined permissions',
        icon: FileText,
        color: 'purple',
      },
    ];
  }, [permissions]);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Permissions</h1>
          <p className="text-muted-foreground">
            Define and manage granular permissions for system access control
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport(filteredPermissions)}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          {canWrite('permissions') && (
            <Button className="gap-2" onClick={handleAdd}>
              <Plus className="h-4 w-4" />
              Add Permission
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Permission List</h2>
              <p className="text-sm text-muted-foreground">
                {filteredPermissions.length} permission(s) found
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search permissions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-[250px]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={filteredPermissions}
            bulkActions={bulkActions}
            onRowClick={(permission) => {}}
          />
        </CardContent>
      </Card>

      <PermissionFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        permission={editPermission}
        onSuccess={() => {
          setModalOpen(false);
          setEditPermission(null);
          refetch();
        }}
      />

      <ConfirmationDialog
        {...deleteConfirm.dialogProps}
        title="Delete Permission"
        description={`Are you sure you want to delete the permission "${deleteConfirm.data?.name || ''}"? This action cannot be undone and may affect roles that use this permission.`}
        confirmLabel="Delete Permission"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />

      <ConfirmationDialog
        {...bulkDeleteConfirm.dialogProps}
        title="Delete Permissions"
        description={`Are you sure you want to delete ${bulkDeleteConfirm.data?.length || 0} permission(s)? This action cannot be undone and may affect roles that use these permissions.`}
        confirmLabel="Delete All"
        variant="destructive"
        onConfirm={handleBulkDeleteConfirm}
      />
    </div>
  );
}