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
  Users,
  Settings,
  MoreVertical,
  Copy,
  Edit,
  Trash2,
  Eye,
  GitBranch,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

import { roleService } from '@/services/role-permission.service';
import { Role } from '@/types';
import { useAuthStore } from '@/store/auth-store';
import { RoleFormModal } from './RoleFormModal';
import { RoleDetailsModal } from './RoleDetailsModal';
import { AssignPermissionsModal } from './AssignPermissionsModal';
import { permissionService } from '@/services/role-permission.service';

export default function RolesPage() {
  const [search, setSearch] = React.useState('');
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editRole, setEditRole] = React.useState<Role | null>(null);
  const { user, initializeAuth } = useAuthStore();
  const [density, setDensity] = React.useState<'compact' | 'comfortable'>('comfortable');

  React.useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const isSuperAdmin = user?.roles?.includes('SUPER_ADMIN');

  const [detailsRole, setDetailsRole] = React.useState<Role | null>(null);
  const [assignRole, setAssignRole] = React.useState<Role | null>(null);
  const [permissions, setPermissions] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (isSuperAdmin) {
      permissionService.getAllPermissions().then(res => setPermissions(res.data));
    }
  }, [isSuperAdmin]);

  const { data: rolesData, isLoading, refetch, error } = useQuery({
    queryKey: ['roles', { search }],
    queryFn: () => roleService.getAllRoles({ search }),
    enabled: !!user,
  });

  const roles = rolesData?.data || [];

  const handleAdd = () => {
    setEditRole(null);
    setModalOpen(true);
  };

  const handleEdit = async (role: Role) => {
    setEditRole(role);
    setModalOpen(true);
  };

  const handleDelete = async (role: Role) => {
    if (window.confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      await roleService.deleteRole(role.id);
      refetch();
    }
  };

  const handleClone = async (role: Role) => {
    const name = prompt('Enter new role name:', `${role.name} (Copy)`);
    if (name) {
      await roleService.cloneRole(role.id, name);
      refetch();
    }
  };

  const handleBulkDelete = async (selectedRoles: Role[]) => {
    if (window.confirm(`Are you sure you want to delete ${selectedRoles.length} role(s)? This action cannot be undone.`)) {
      try {
        await Promise.all(selectedRoles.map(role => roleService.deleteRole(role.id)));
        refetch();
      } catch (error) {
        console.error('Failed to delete roles:', error);
      }
    }
  };

  const handleExport = (data: Role[]) => {
    // Simple CSV export
    const csv = [
      ['Name', 'Description', 'Users', 'Permissions', 'Priority', 'Created'],
      ...data.map(role => [
        role.name,
        role.description || '',
        role.userCount.toString(),
        role.permissions?.map(p => p.key).join('; ') || '',
        role.priority.toString(),
        new Date(role.createdAt).toLocaleDateString()
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'roles.csv';
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
      accessorKey: 'name',
      header: 'Role',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/10">
            <Shield className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="font-medium flex items-center gap-2">
              {row.original.name}
              {row.original.isSystem && (
                <Badge variant="secondary" className="text-xs">
                  System
                </Badge>
              )}
              {row.original.isDefault && (
                <Badge variant="outline" className="text-xs">
                  Default
                </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {row.original.description || 'No description'}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'userCount',
      header: 'Users',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.original.userCount}</span>
        </div>
      ),
    },
    {
      accessorKey: 'permissions',
      header: 'Permissions',
      cell: ({ row }: any) => (
        <div className="flex flex-wrap gap-1">
          {row.original.permissions?.slice(0, 3).map((permission: any) => (
            <Badge key={permission.id} variant="outline" className="text-xs">
              {permission.key}
            </Badge>
          ))}
          {row.original.permissions?.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{row.original.permissions.length - 3} more
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }: any) => (
        <Badge variant="secondary" className="font-mono">
          {row.original.priority}
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
      cell: ({ row }: any) => {
// Import helper functions (they're exported from action-menu)
        const { menuItem, menuSeparator, menuLabel } = require('@/components/ui/action-menu');
        
        const items = [
          menuLabel({ label: 'Actions' }),
          menuItem({
            label: 'Copy role ID',
            icon: Copy,
            iconPosition: 'start' as const,
            onClick: () => navigator.clipboard.writeText(row.original.id)
          }),
        ];
        
        if (isSuperAdmin) {
          items.push(
            menuItem({
              label: 'Edit role',
              icon: Edit,
              iconPosition: 'start' as const,
              onClick: () => handleEdit(row.original)
            }),
            menuItem({
              label: 'Clone role',
              icon: GitBranch,
              iconPosition: 'start' as const,
              onClick: () => handleClone(row.original)
            }),
            menuItem({
              label: 'Assign permissions',
              icon: ShieldCheck,
              iconPosition: 'start' as const,
              onClick: () => setAssignRole(row.original)
            }),
            menuItem({
              label: 'Delete role',
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
            onClick: () => setDetailsRole(row.original)
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
          <p className="text-muted-foreground">
            Create and manage roles with specific permissions and access levels
          </p>
        </div>
        {isSuperAdmin && (
          <Button className="gap-2" onClick={handleAdd}>
            <Plus className="h-4 w-4" />
            Create Role
          </Button>
        )}
      </div>

      <RoleFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={refetch}
        role={editRole}
      />
      <RoleDetailsModal
        open={!!detailsRole}
        onClose={() => setDetailsRole(null)}
        role={detailsRole}
      />
      <AssignPermissionsModal
        open={!!assignRole}
        onClose={() => setAssignRole(null)}
        roleId={assignRole?.id || ''}
        currentPermissions={assignRole?.permissions?.map(p => p.id) || []}
        allPermissions={permissions}
        onSuccess={refetch}
      />

      <Card>
        <CardContent className="p-6">
          <DataTable
            columns={columns}
            data={roles}
            searchKey="name"
            searchPlaceholder="Search roles by name..."
            isLoading={isLoading}
            error={error}
            onRetry={refetch}
            emptyState={{
              icon: <Shield className="h-12 w-12 text-muted-foreground/50" />,
              title: 'No roles found',
              description: 'There are no roles to display at the moment.',
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
            <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.length}</div>
            <p className="text-xs text-muted-foreground">
              {roles.filter((r: Role) => r.isSystem).length} system roles
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Role Hierarchy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Parent Roles</span>
                <span className="font-medium">
                  {roles.filter((r: Role) => r.parentRoleId).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Child Roles</span>
                <span className="font-medium">
                  {roles.filter((r: Role) => r.childRoles?.length).length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Permission Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <div className="flex-1">
                  <p className="text-sm">High permission roles</p>
                  <p className="text-xs text-muted-foreground">
                    {roles.filter((r: Role) => (r.permissions?.length || 0) > 10).length} roles
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <div className="flex-1">
                  <p className="text-sm">Medium permission roles</p>
                  <p className="text-xs text-muted-foreground">
                    {roles.filter((r: Role) => {
                      const count = r.permissions?.length || 0;
                      return count > 5 && count <= 10;
                    }).length} roles
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
