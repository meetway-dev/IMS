'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/tables/data-table';
import { ActionMenu, menuItem, menuSeparator, menuLabel } from '@/components/ui/action-menu';
import { PageHeader } from '@/components/ui/page-header';
import { ErrorState } from '@/components/ui/states';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatsCard } from '@/components/ui/stats-card';
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
  Settings,
  UserCheck,
  Crown,
  Lock,
  Unlock,
  Filter,
  Search,
  Download,
  Upload,
  RefreshCw,
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
  const [activeTab, setActiveTab] = React.useState('all');

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

  // Filter roles based on active tab
  const filteredRoles = React.useMemo(() => {
    if (activeTab === 'all') return roles;
    if (activeTab === 'system') return roles.filter(role => role.isSystem);
    if (activeTab === 'custom') return roles.filter(role => !role.isSystem);
    if (activeTab === 'default') return roles.filter(role => role.isDefault);
    return roles;
  }, [roles, activeTab]);

  const handleAdd = () => {
    setEditRole(null);
    setModalOpen(true);
  };

  const handleEdit = async (role: Role) => {
    setEditRole(role);
    setModalOpen(true);
  };

  const handleDelete = async (role: Role) => {
    if (window.confirm(`Are you sure you want to delete the role "${role.name}"? This action cannot be undone and may affect users assigned to this role.`)) {
      try {
        await roleService.deleteRole(role.id);
        refetch();
      } catch (error) {
        console.error('Failed to delete role:', error);
      }
    }
  };

  const handleClone = async (role: Role) => {
    const name = prompt('Enter new role name:', `${role.name} (Copy)`);
    if (name && name.trim()) {
      try {
        await roleService.cloneRole(role.id, name.trim());
        refetch();
      } catch (error) {
        console.error('Failed to clone role:', error);
      }
    }
  };

  const handleBulkDelete = async (selectedRoles: Role[]) => {
    if (window.confirm(`Are you sure you want to delete ${selectedRoles.length} role(s)? This action cannot be undone and may affect users assigned to these roles.`)) {
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
      ['Name', 'Description', 'Users', 'Permissions', 'Priority', 'System', 'Default', 'Created'],
      ...data.map(role => [
        role.name,
        role.description || '',
        role.userCount.toString(),
        role.permissions?.map(p => p.key).join('; ') || '',
        role.priority.toString(),
        role.isSystem ? 'Yes' : 'No',
        role.isDefault ? 'Yes' : 'No',
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

  const getRoleTypeIcon = (role: Role) => {
    if (role.isSystem) return <Lock className="h-4 w-4" />;
    if (role.isDefault) return <Crown className="h-4 w-4" />;
    return <Shield className="h-4 w-4" />;
  };

  const getRoleTypeBadge = (role: Role) => {
    if (role.isSystem) return <Badge variant="destructive" className="text-xs">System</Badge>;
    if (role.isDefault) return <Badge variant="secondary" className="text-xs">Default</Badge>;
    return <Badge variant="outline" className="text-xs">Custom</Badge>;
  };

  const columns = [
    {
      accessorKey: 'name',
      header: 'Role',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
            row.original.isSystem ? 'bg-red-100 text-red-600' :
            row.original.isDefault ? 'bg-blue-100 text-blue-600' :
            'bg-primary/10 text-primary'
          }`}>
            {getRoleTypeIcon(row.original)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div className="font-medium truncate">{row.original.name}</div>
              {getRoleTypeBadge(row.original)}
            </div>
            <div className="text-sm text-muted-foreground truncate">
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
        <div className="flex flex-wrap gap-1 max-w-xs">
          {row.original.permissions?.slice(0, 2).map((permission: any) => (
            <Badge key={permission.id} variant="outline" className="text-xs truncate max-w-24">
              {permission.key}
            </Badge>
          ))}
          {row.original.permissions?.length > 2 && (
            <Badge variant="muted" className="text-xs">
              +{row.original.permissions.length - 2}
            </Badge>
          )}
          {(!row.original.permissions || row.original.permissions.length === 0) && (
            <Badge variant="muted" className="text-xs">No permissions</Badge>
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
      cell: ({ row }: any) => (
        <div>Actions</div>
      ),
    },
  ];

  // Statistics
  const stats = React.useMemo(() => {
    const total = roles.length;
    const system = roles.filter(r => r.isSystem).length;
    const custom = roles.filter(r => !r.isSystem).length;
    const defaultRoles = roles.filter(r => r.isDefault).length;
    const totalUsers = roles.reduce((sum, r) => sum + r.userCount, 0);

    return { total, system, custom, defaultRoles, totalUsers };
  }, [roles]);

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
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button className="gap-2" onClick={handleAdd}>
                  <Plus className="h-4 w-4" />
                  Create Role
                </Button>
              </div>
            ) : undefined
          }
        />
      </motion.div>

      {/* Statistics Cards */}
      <motion.div variants={staggerItem}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <StatsCard
            title="Total Roles"
            value={stats.total}
            icon={Shield}
            description="All roles in system"
          />
          <StatsCard
            title="System Roles"
            value={stats.system}
            icon={Lock}
            description="Built-in roles"
          />
          <StatsCard
            title="Custom Roles"
            value={stats.custom}
            icon={Settings}
            description="User-created roles"
          />
          <StatsCard
            title="Default Roles"
            value={stats.defaultRoles}
            icon={Crown}
            description="Auto-assigned roles"
          />
          <StatsCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            description="Users with roles"
          />
        </div>
      </motion.div>

      {/* Tabs and Table */}
      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Roles</CardTitle>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                  <TabsTrigger value="system">System ({stats.system})</TabsTrigger>
                  <TabsTrigger value="custom">Custom ({stats.custom})</TabsTrigger>
                  <TabsTrigger value="default">Default ({stats.defaultRoles})</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={filteredRoles}
              searchKey="name"
              searchPlaceholder="Search roles by name or description..."
              onSearchChange={setSearch}
              searchValue={search}
              totalCount={rolesData?.meta?.total}
              isLoading={isLoading}
              error={error}
              onRetry={refetch}
              currentPage={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={setSort}
              emptyState={{
                icon: <Shield className="h-12 w-12 text-muted-foreground/50" />,
                title: 'No roles found',
                description: activeTab === 'all'
                  ? 'There are no roles to display at the moment.'
                  : `No ${activeTab} roles found.`,
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

      {/* Modals */}
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
    </motion.div>
  );
}
