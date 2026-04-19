'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Plus, User, Mail, Shield, MoreVertical, Copy, Edit, Trash2, Eye, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/tables/data-table';
import { ActionMenu } from '@/components/ui/action-menu';

import { userService } from '@/services/user.service';
import { User as UserType } from '@/types';
import { useAuthStore } from '@/store/auth-store';
import { UserFormModal } from './UserFormModal';
import { UserDetailsModal } from './UserDetailsModal';
import { EnhancedAssignRolesPermissionsModal } from './EnhancedAssignRolesPermissionsModal';
import { roleService, permissionService } from '@/services/role-permission.service';

export default function UsersPage() {
  const [search, setSearch] = React.useState('');
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editUser, setEditUser] = React.useState<UserType | null>(null);
  const { user, initializeAuth } = useAuthStore();
  const [density, setDensity] = React.useState<'compact' | 'comfortable'>('comfortable');

  // Ensure user is loaded from storage/cookie on mount
  React.useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Debug the user object structure
  React.useEffect(() => {
    console.log('=== AUTH DEBUG ===');
    console.log('Full user object:', user);
    console.log('User keys:', user ? Object.keys(user) : 'No user');
    console.log('User roles property:', user?.roles);
    console.log('User roles type:', typeof user?.roles);
    console.log('=== END DEBUG ===');
  }, [user]);

  // Handle roles - they might be missing or in different format
  const userRoles = user?.roles;
  let roleNames: string[] = [];
  
  if (Array.isArray(userRoles)) {
    // Type guard for string array
    if (userRoles.length > 0 && typeof userRoles[0] === 'string') {
      roleNames = userRoles as string[];
    } else if (userRoles.length > 0 && typeof userRoles[0] === 'object') {
      // Handle object array - extract name or id property
      roleNames = userRoles.map((role: any) => role?.name || role?.id || '').filter(Boolean);
    }
  }
  
  const isSuperAdmin = roleNames.includes('SUPER_ADMIN');
  const isAdmin = roleNames.includes('ADMIN');
  
  // TEMPORARY: Allow all logged in users to see the assign roles action for debugging
  const canAssignRoles = !!user; // Temporary - allow any logged in user

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
    queryKey: ['users', { search }],
    queryFn: () => userService.getUsers({ search }),
    enabled: !!user, // only fetch if user is logged in
  });

  const handleBulkDelete = async (selectedUsers: UserType[]) => {
    if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} user(s)? This action cannot be undone.`)) {
      try {
        await Promise.all(selectedUsers.map(user => userService.deleteUser(user.id)));
        refetch();
      } catch (error) {
        console.error('Failed to delete users:', error);
      }
    }
  };

  const handleExport = (data: UserType[]) => {
    // Simple CSV export
    const csv = [
      ['Name', 'Email', 'Roles', 'Status', 'Created', 'Last Login'],
      ...data.map(user => [
        user.name,
        user.email,
        user.roles?.join('; ') || '',
        user.status,
        new Date(user.createdAt).toLocaleDateString(),
        'N/A' // lastLoginAt not in User interface
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
  const handleEdit = (user: UserType) => {
    setEditUser(user);
    setModalOpen(true);
  };
  const handleDelete = async (user: UserType) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await userService.deleteUser(user.id);
      refetch();
    }
  };

  const columns = [
    {
      accessorKey: 'name',
      header: 'User',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-sm text-muted-foreground">{row.original.email}</div>
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
            <span
              key={role}
              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                role === 'ADMIN'
                  ? 'bg-red-100 text-red-800'
                  : role === 'MANAGER'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {role}
            </span>
          ))}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            row.original.status === 'ACTIVE'
              ? 'bg-green-100 text-green-800'
              : row.original.status === 'INACTIVE'
              ? 'bg-gray-100 text-gray-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {row.original.status}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Joined',
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
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage system users, roles, and permissions
          </p>
        </div>
        {canAssignRoles && (
          <Button className="gap-2" onClick={handleAdd}>
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        )}
      </div>


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
      <EnhancedAssignRolesPermissionsModal
        open={!!assignUser}
        onClose={() => setAssignUser(null)}
        userId={assignUser?.id || ''}
        userName={assignUser?.name || ''}
        currentRoles={assignUser?.roles || []}
        currentPermissions={[]}
        onSuccess={refetch}
      />

      <Card>
        <CardContent className="p-6">
          <DataTable
            columns={columns}
            data={usersData?.data || []}
            searchKey="name"
            searchPlaceholder="Search users by name or email..."
            isLoading={isLoading}
            error={error}
            onRetry={refetch}
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

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usersData?.data?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active users: {usersData?.data?.filter((u: UserType) => u.status === 'ACTIVE').length || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Role Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Admins</span>
                <span className="font-medium">
                  {usersData?.data?.filter((u: UserType) => u.roles?.includes('ADMIN')).length || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Managers</span>
                <span className="font-medium">
                  {usersData?.data?.filter((u: UserType) => u.roles?.includes('MANAGER')).length || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Staff</span>
                <span className="font-medium">
                  {usersData?.data?.filter((u: UserType) => u.roles?.includes('STAFF')).length || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <div className="flex-1">
                  <p className="text-sm">2 new users this week</p>
                  <p className="text-xs text-muted-foreground">+15% from last week</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <div className="flex-1">
                  <p className="text-sm">5 active sessions</p>
                  <p className="text-xs text-muted-foreground">Currently online</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
