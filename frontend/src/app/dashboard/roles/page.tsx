'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/tables/data-table';
import { ActionMenu } from '@/components/ui/action-menu';
import { PageHeader } from '@/components/ui/page-header';
import { ErrorState } from '@/components/ui/states';
import {
  Plus,
  Shield,
  Users,
  MoreVertical,
  Copy,
  Edit,
  Trash2,
  Eye,
  GitBranch,
  ShieldCheck,
  Layers,
  Key,
} from 'lucide-react';

import { roleService } from '@/services/role-permission.service';
import { Role } from '@/types';
import { useAuthStore } from '@/store/auth-store';
import { RoleFormModal } from './RoleFormModal';
import { RoleDetailsModal } from './RoleDetailsModal';
import { AssignPermissionsModal } from './AssignPermissionsModal';
import { permissionService } from '@/services/role-permission.service';
import { useServerSearch } from '@/hooks/use-server-search';

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
};

export default function RolesPage() {
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
    queryKey: ['roles', queryParams],
    queryFn: () => roleService.getAllRoles({
      page: queryParams.page,
      limit: queryParams.limit,
      search: queryParams.search || undefined,
      sortBy: queryParams.sortBy || undefined,
      sortOrder: queryParams.sortOrder || undefined,
    }),
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
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-medium flex items-center gap-2">
              {row.original.name}
              {row.original.isSystem && (
                <Badge variant="muted" className="text-xs">
                  System
                </Badge>
              )}
              {row.original.isDefault && (
                <Badge variant="outline" className="text-xs">
                  Default
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
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
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
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
            <Badge variant="muted" className="text-xs">
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
        <Badge variant="secondary" className="font-mono text-xs">
          {row.original.priority}
        </Badge>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }: any) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }: any) => {
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
            trigger={{ icon: MoreVertical, variant: 'ghost', size: 'icon-sm' }}
            items={items}
            align="end"
          />
        );
      },
    },
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          icon={Shield}
          title="Role Management"
          description="Create and manage roles with specific permissions and access levels"
        />
        <ErrorState onRetry={refetch} />
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={staggerItem}>
        <PageHeader
          icon={Shield}
          title="Role Management"
          description="Create and manage roles with specific permissions and access levels"
          actions={
            isSuperAdmin ? (
              <Button className="gap-2" onClick={handleAdd}>
                <Plus className="h-4 w-4" />
                Create Role
              </Button>
            ) : undefined
          }
        />
      </motion.div>

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

      <motion.div variants={staggerItem}>
        <Card>
          <CardContent className="p-6">
            <DataTable
              columns={columns}
              data={rolesData?.data || []}
              searchKey="name"
              searchPlaceholder="Search roles by name..."
              onSearchChange={setSearch}
              searchValue={search}
              totalCount={rolesData?.meta?.total}
              isLoading={isLoading}
              error={error}
              onRetry={refetch}
              // Server-side pagination props
              currentPage={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              // Server-side sorting props
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={setSort}
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
      </motion.div>

      <motion.div variants={staggerItem}>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Roles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roles.length}</div>
              <div className="flex items-center gap-1.5 mt-1">
                <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {roles.filter((r: Role) => r.isSystem).length} system roles
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Role Hierarchy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm">Parent Roles</span>
                  </div>
                  <Badge variant="muted" className="font-mono text-xs">
                    {roles.filter((r: Role) => r.parentRoleId).length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm">Child Roles</span>
                  </div>
                  <Badge variant="muted" className="font-mono text-xs">
                    {roles.filter((r: Role) => r.childRoles?.length).length}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Permission Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <div className="flex-1">
                    <p className="text-sm">High permission roles</p>
                    <p className="text-xs text-muted-foreground">
                      {roles.filter((r: Role) => (r.permissions?.length || 0) > 10).length} roles
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-warning" />
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
      </motion.div>
    </motion.div>
  );
}
