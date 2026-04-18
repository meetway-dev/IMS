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

export default function PermissionsPage() {
  const [search, setSearch] = React.useState('');
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editPermission, setEditPermission] = React.useState<Permission | null>(null);
  const { user, initializeAuth } = useAuthStore();

  React.useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const isSuperAdmin = user?.roles?.includes('SUPER_ADMIN');

  const [detailsPermission, setDetailsPermission] = React.useState<Permission | null>(null);

  const { data: permissionsData, isLoading, refetch } = useQuery({
    queryKey: ['permissions', { search }],
    queryFn: () => permissionService.getAllPermissions({ search }),
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'API':
        return 'bg-blue-100 text-blue-800';
      case 'UI':
        return 'bg-green-100 text-green-800';
      case 'DATA':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
        <CardHeader>
          <CardTitle>All Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search permissions by key, name, or module..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Filter by Module</Button>
              <Button variant="outline">Filter by Type</Button>
              <Button variant="outline">Export</Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <DataTable columns={columns} data={permissions} />
          )}
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