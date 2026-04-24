'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users as UsersIcon, Plus, User, Shield, MoreVertical, Copy, Edit, Trash2, Eye, ShieldCheck, Activity, UserCheck, Clock } from 'lucide-react';
import { DataTable } from '@/components/tables/data-table';
import { ActionMenu } from '@/components/ui/action-menu';
import { PageHeader } from '@/components/ui/page-header';
import { ErrorState } from '@/components/ui/states';

import { userService } from '@/services/user.service';
import { User as UserType } from '@/types';
import { useAuthStore } from '@/store/auth-store';
import { UserFormModal } from './UserFormModal';
import { UserDetailsModal } from './UserDetailsModal';
import { SimpleAssignRolesModal } from './SimpleAssignRolesModal';
import { roleService, permissionService } from '@/services/role-permission.service';
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

const roleVariantMap: Record<string, 'destructive' | 'info' | 'secondary' | 'muted'> = {
  SUPER_ADMIN: 'destructive',
  ADMIN: 'destructive',
  MANAGER: 'info',
  STAFF: 'secondary',
};

const statusVariantMap: Record<string, 'success' | 'secondary' | 'destructive'> = {
  ACTIVE: 'success',
  INACTIVE: 'secondary',
  SUSPENDED: 'destructive',
};

export default function UsersPage() {
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
  const [editUser, setEditUser] = React.useState<UserType | null>(null);
  const { user, initializeAuth } = useAuthStore();
  const [density, setDensity] = React.useState<'compact' | 'comfortable'>('comfortable');

  React.useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Handle roles - they might be missing or in different format
  const userRoles = user?.roles;
  let roleNames: string[] = [];

  if (Array.isArray(userRoles)) {
    if (userRoles.length > 0 && typeof userRoles[0] === 'string') {
      roleNames = userRoles as string[];
    } else if (userRoles.length > 0 && typeof userRoles[0] === 'object') {
      roleNames = userRoles.map((role: any) => role?.name || role?.id || '').filter(Boolean);
    }
  }

  const isSuperAdmin = roleNames.includes('SUPER_ADMIN');
  const isAdmin = roleNames.includes('ADMIN');
  const canAssignRoles = !!user;

  const [detailsUser, setDetailsUser] = React.useState<UserType | null>(null);
  const [assignUser, setAssignUser] = React.useState<UserType | null>(null);
  const [roles, setRoles] = React.useState<{ id: string; name: string }[]>([]);
  const [permissions, setPermissions] = React.useState<{ id: string; key: string; name: string }[]>([]);

  React.useEffect(() => {
    if (canAssignRoles) {
      roleService.getAllRoles().then(response => setRoles(response.data));
      permissionService.getAllPermissions().then(response => setPermissions(response.data));
    }
  }, [canAssignRoles]);

  const { data: usersData, isLoading, refetch, error } = useQuery({
    queryKey: ['users', queryParams],
    queryFn: () => userService.getUsers({
      page: queryParams.page,
      limit: queryParams.limit,
      search: queryParams.search || undefined,
      sortBy: queryParams.sortBy || undefined,
      sortOrder: queryParams.sortOrder || undefined,
    }),
    enabled: !!user,
  });

  const handleBulkDelete = async (selectedUsers: UserType[]) => {
    if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} user(s)? This action cannot be undone.`)) {
      try {
        await Promise.all(selectedUsers.map(u => userService.deleteUser(u.id)));
        refetch();
      } catch (error) {
        console.error('Failed to delete users:', error);
      }
    }
  };

  const handleExport = (data: UserType[]) => {
    const csv = [
      ['Name', 'Email', 'Roles', 'Status', 'Created', 'Last Login'],
      ...data.map(u => [
        u.name,
        u.email,
        u.roles?.join('; ') || '',
        u.status,
        new Date(u.createdAt).toLocaleDateString(),
        'N/A'
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
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

  const handleAdd = () => {
    setEditUser(null);
    setModalOpen(true);
  };

  const handleEdit = (u: UserType) => {
    setEditUser(u);
    setModalOpen(true);
  };

  const handleDelete = async (u: UserType) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await userService.deleteUser(u.id);
      refetch();
    }
  };

  const columns = [
    {
      accessorKey: 'name',
      header: 'User',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-xs text-muted-foreground">{row.original.email}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'roles',
      header: 'Roles',
      cell: ({ row }: any) => (
        <div className="flex flex-wrap gap-1">
          {row.original.roles?.map((role: string) => (
            <Badge
              key={role}
              variant={roleVariantMap[role] || 'muted'}
              className="text-xs"
            >
              {role}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => (
        <Badge variant={statusVariantMap[row.original.status] || 'secondary'}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Joined',
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
            label: 'Copy user ID',
            icon: Copy,
            iconPosition: 'start' as const,
            onClick: () => navigator.clipboard.writeText(row.original.id)
          }),
          menuSeparator(),
        ];

        if (canAssignRoles) {
          items.push(
            menuItem({
              label: 'Edit user',
              icon: Edit,
              iconPosition: 'start' as const,
              onClick: () => handleEdit(row.original)
            }),
            menuItem({
              label: 'Delete user',
              icon: Trash2,
              iconPosition: 'start' as const,
              variant: 'destructive' as const,
              onClick: () => handleDelete(row.original)
            }),
            menuItem({
              label: 'Assign roles/permissions',
              icon: ShieldCheck,
              iconPosition: 'start' as const,
              onClick: () => setAssignUser(row.original)
            })
          );
        }

        items.push(
          menuItem({
            label: 'View details',
            icon: Eye,
            iconPosition: 'start' as const,
            onClick: () => setDetailsUser(row.original)
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
          icon={UsersIcon}
          title="User Management"
          description="Manage system users, roles, and permissions"
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
          icon={UsersIcon}
          title="User Management"
          description="Manage system users, roles, and permissions"
          actions={
            canAssignRoles ? (
              <Button className="gap-2" onClick={handleAdd}>
                <Plus className="h-4 w-4" />
                Add User
              </Button>
            ) : undefined
          }
        />
      </motion.div>

      <UserFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={refetch}
        user={editUser}
      />
      <UserDetailsModal
        open={!!detailsUser}
        onClose={() => setDetailsUser(null)}
        user={detailsUser}
      />
      <SimpleAssignRolesModal
        open={!!assignUser}
        onClose={() => setAssignUser(null)}
        userId={assignUser?.id || ''}
        userName={assignUser?.name || ''}
        currentRoles={assignUser?.roles || []}
        onSuccess={refetch}
      />

      <motion.div variants={staggerItem}>
        <Card>
          <CardContent className="p-6">
            <DataTable
              columns={columns}
              data={usersData?.data || []}
              searchKey="name"
              searchPlaceholder="Search users by name or email..."
              onSearchChange={setSearch}
              searchValue={search}
              totalCount={usersData?.meta?.total}
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
                icon: <User className="h-12 w-12 text-muted-foreground/50" />,
                title: 'No users found',
                description: 'There are no users to display at the moment.',
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
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usersData?.data?.length || 0}</div>
              <div className="flex items-center gap-1.5 mt-1">
                <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-xs text-muted-foreground">
                  Active: {usersData?.data?.filter((u: UserType) => u.status === 'ACTIVE').length || 0}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Role Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-3.5 w-3.5 text-destructive" />
                    <span className="text-sm">Admins</span>
                  </div>
                  <Badge variant="muted" className="font-mono text-xs">
                    {usersData?.data?.filter((u: UserType) => u.roles?.includes('ADMIN')).length || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-3.5 w-3.5 text-info" />
                    <span className="text-sm">Managers</span>
                  </div>
                  <Badge variant="muted" className="font-mono text-xs">
                    {usersData?.data?.filter((u: UserType) => u.roles?.includes('MANAGER')).length || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm">Staff</span>
                  </div>
                  <Badge variant="muted" className="font-mono text-xs">
                    {usersData?.data?.filter((u: UserType) => u.roles?.includes('STAFF')).length || 0}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <div className="flex-1">
                    <p className="text-sm">2 new users this week</p>
                    <p className="text-xs text-muted-foreground">+15% from last week</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="text-sm">5 active sessions</p>
                    <p className="text-xs text-muted-foreground">Currently online</p>
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
