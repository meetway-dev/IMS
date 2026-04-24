'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/tables/data-table';
import { ActionMenu } from '@/components/ui/action-menu';
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
  XCircle
} from 'lucide-react';

import { permissionService } from '@/services/role-permission.service';
import { Permission } from '@/types';
import { useAuthStore } from '@/store/auth-store';
import { PermissionFormModal } from './PermissionFormModal';
import { PermissionDetailsModal } from './PermissionDetailsModal';
import { useServerSearch } from '@/hooks/use-server-search';

export default function PermissionsPage() {
  const { search, debouncedSearch, setSearch } = useServerSearch();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editPermission, setEditPermission] = React.useState<Permission | null>(null);
  const { user, initializeAuth } = useAuthStore();
  const [density, setDensity] = React.useState<'compact' | 'comfortable'>('comfortable');

  React.useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const isSuperAdmin = user?.roles?.includes('SUPER_ADMIN');

  const [detailsPermission, setDetailsPermission] = React.useState<Permission | null>(null);

  const { data: permissionsData, isLoading, refetch, error } = useQuery({
    queryKey: ['permissions', { search: debouncedSearch }],
    queryFn: () => permissionService.getAllPermissions({ search: debouncedSearch || undefined }),
    enabled: !!user,
  });

  const permissions = permissionsData?.data || [];

  const handleAdd = () => {
    setEditPermission(null);
    setModalOpen(true);
  };

  const handleEdit = async (permission: Permission) => {
    setEditPermission(permission);
    setModalOpen(true);
  };

  const handleDelete = async (permission: Permission) => {
    if (window.confirm('Are you sure you want to delete this permission? This action cannot be undone.')) {
      await permissionService.deletePermission(permission.id);
      refetch();
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

  const handleBulkDelete = async (selectedPermissions: Permission[]) => {
    if (window.confirm(`Are you sure you want to delete ${selectedPermissions.length} permission(s)? This action cannot be undone.`)) {
      try {
        await Promise.all(selectedPermissions.map(permission => permissionService.deletePermission(permission.id)));
        refetch();
      } catch (error) {
        console.error('Failed to delete permissions:', error);
      }
    }
  };

  const handleExport = (data: Permission[]) => {
    // Simple CSV export
    const csv = [
      ['Key', 'Name', 'Description', 'Type', 'Effect', 'Resource', 'Created'],
      ...data.map(permission => [
        permission.key,
        permission.name,
        permission.description || '',
        permission.type,
        permission.effect,
        permission.resource || '',
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'API':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'UI':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'DATA':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const columns = [
    {
      accessorKey: 'key',
      header: 'Permission Key',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/10">
            <Key className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <div className="font-medium font-mono text-sm">
              {row.original.key}
            </div>
            <div className="text-sm text-muted-foreground">
              {row.original.name}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'module',
      header: 'Module',
      cell: ({ row }: any) => (
        <Badge variant="outline" className="font-mono">
          {row.original.module}
        </Badge>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }: any) => (
        <Badge className={getTypeColor(row.original.type)}>
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
          <span className={`font-medium ${
            row.original.effect === 'ALLOW' ? 'text-green-600' :
            row.original.effect === 'DENY' ? 'text-red-600' : 'text-yellow-600'
          }`}>
            {row.original.effect}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'resource',
      header: 'Resource',
      cell: ({ row }: any) => (
        <span className="font-mono text-sm">
          {row.original.resource || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'action',
      header: 'Action',
      cell: ({ row }: any) => (
        <span className="font-mono text-sm">
          {row.original.action || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'isSystem',
      header: 'System',
      cell: ({ row }: any) => (
        row.original.isSystem ? (
          <Badge variant="secondary">System</Badge>
        ) : (
          <Badge variant="outline">Custom</Badge>
        )
      ),
    },
    {
      id: 'actions',
      cell: ({ row }: any) => {
// Import helper functions (they're exported from action-menu)
        const { menuItem, menuSeparator, menuLabel } = require('@/components/ui/action-menu');
        
        const items = [
          menuLabel({ label: 'Actions' }),
          menuItem({
            label: 'Copy permission ID',
            icon: Copy,
            iconPosition: 'start' as const,
            onClick: () => navigator.clipboard.writeText(row.original.id)
          }),
        ];
        
        if (isSuperAdmin) {
          items.push(
            menuItem({
              label: 'Edit permission',
              icon: Edit,
              iconPosition: 'start' as const,
              onClick: () => handleEdit(row.original)
            }),
            menuItem({
              label: 'Delete permission',
              icon: Trash2,
              iconPosition: 'start' as const,
              onClick: () => handleDelete(row.original),
              disabled: row.original.isSystem
            })
          );
        }
        
        items.push(
          menuItem({
            label: 'View details',
            icon: Eye,
            iconPosition: 'start' as const,
            onClick: () => setDetailsPermission(row.original)
          })
        );

        return (
          <ActionMenu
            trigger={{ icon: MoreVertical, variant: 'ghost', size: 'icon' }}
            items={items}
            align="end"
          />
        );
      },
    },
  ];

  // Group permissions by module for statistics
  const moduleStats = React.useMemo(() => {
    const stats: Record<string, number> = {};
    permissions.forEach((permission: Permission) => {
      stats[permission.module] = (stats[permission.module] || 0) + 1;
    });
    return Object.entries(stats).sort(([,a], [,b]) => b - a);
  }, [permissions]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Permission Management</h1>
          <p className="text-muted-foreground">
            Define and manage granular permissions for system access control
          </p>
        </div>
        {isSuperAdmin && (
          <Button className="gap-2" onClick={handleAdd}>
            <Plus className="h-4 w-4" />
            Create Permission
          </Button>
        )}
      </div>

      <PermissionFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={refetch}
        permission={editPermission}
      />
      <PermissionDetailsModal
        open={!!detailsPermission}
        onClose={() => setDetailsPermission(null)}
        permission={detailsPermission}
      />

      <Card>
        <CardContent className="p-6">
          <DataTable
            columns={columns}
            data={permissions}
            searchKey="key"
            searchPlaceholder="Search permissions by key, name, or module..."
            onSearchChange={setSearch}
            searchValue={search}
            totalCount={permissionsData?.meta?.total}
            isLoading={isLoading}
            error={error}
            onRetry={refetch}
            emptyState={{
              icon: <Key className="h-12 w-12 text-muted-foreground/50" />,
              title: 'No permissions found',
              description: 'There are no permissions to display at the moment.',
            }}
            bulkActions={bulkActions}
            exportAction={{
              label: 'Export CSV',
              onClick: handleExport,
            }}
            density={density}
            onDensityChange={setDensity}
          />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{permissions.length}</div>
            <p className="text-xs text-muted-foreground">
              {permissions.filter((p: Permission) => p.isSystem).length} system permissions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Permission Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">API Permissions</span>
                <span className="font-medium">
                  {permissions.filter((p: Permission) => p.type === 'API').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">UI Permissions</span>
                <span className="font-medium">
                  {permissions.filter((p: Permission) => p.type === 'UI').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Data Permissions</span>
                <span className="font-medium">
                  {permissions.filter((p: Permission) => p.type === 'DATA').length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Top Modules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {moduleStats.slice(0, 3).map(([module, count]) => (
                <div key={module} className="flex items-center justify-between">
                  <span className="text-sm font-mono">{module}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
