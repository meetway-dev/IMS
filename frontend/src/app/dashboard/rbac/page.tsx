'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PageHeader } from '@/components/ui/page-header';
import { StatsCard } from '@/components/ui/stats-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield,
  Users,
  Key,
  Settings,
  Crown,
  Lock,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Activity,
  BarChart3,
  RefreshCw,
  Plus,
  Eye,
  Edit,
  ArrowRight,
} from 'lucide-react';

import { roleService, permissionService } from '@/services/role-permission.service';
import { userService } from '@/services/user.service';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';

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

export default function RBACDashboardPage() {
  const { user, initializeAuth } = useAuthStore();

  React.useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const isSuperAdmin = user?.roles?.includes('SUPER_ADMIN');

  // Fetch all data
  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => roleService.getAllRoles({ limit: 100 }),
    enabled: !!user,
  });

  const { data: permissionsData, isLoading: permissionsLoading } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => permissionService.getAllPermissions({ limit: 100 }),
    enabled: !!user,
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getUsers({ limit: 100 }),
    enabled: !!user,
  });

  const roles = rolesData?.data || [];
  const permissions = permissionsData?.data || [];
  const users = usersData?.data || [];

  // Calculate statistics
  const stats = React.useMemo(() => {
    const totalRoles = roles.length;
    const systemRoles = roles.filter(r => r.isSystem).length;
    const customRoles = roles.filter(r => !r.isSystem).length;
    const defaultRoles = roles.filter(r => r.isDefault).length;

    const totalPermissions = permissions.length;
    const systemPermissions = permissions.filter(p => p.isSystem).length;
    const customPermissions = permissions.filter(p => !p.isSystem).length;
    const apiPermissions = permissions.filter(p => p.type === 'API').length;
    const uiPermissions = permissions.filter(p => p.type === 'UI').length;
    const dataPermissions = permissions.filter(p => p.type === 'DATA').length;

    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'ACTIVE').length;
    const usersWithRoles = users.filter(u => u.roles && u.roles.length > 0).length;

    // Role utilization
    const roleUtilization = roles.map(role => ({
      ...role,
      utilizationRate: totalUsers > 0 ? (role.userCount / totalUsers) * 100 : 0,
    })).sort((a, b) => b.utilizationRate - a.utilizationRate);

    // Permission distribution by module
    const permissionsByModule = permissions.reduce((acc, perm) => {
      acc[perm.module] = (acc[perm.module] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topModules = Object.entries(permissionsByModule)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    return {
      totalRoles,
      systemRoles,
      customRoles,
      defaultRoles,
      totalPermissions,
      systemPermissions,
      customPermissions,
      apiPermissions,
      uiPermissions,
      dataPermissions,
      totalUsers,
      activeUsers,
      usersWithRoles,
      roleUtilization,
      topModules,
    };
  }, [roles, permissions, users]);

  const quickActions = [
    {
      title: 'Create Role',
      description: 'Add a new role with custom permissions',
      icon: Shield,
      href: '/dashboard/roles',
      action: 'create',
      variant: 'default' as const,
    },
    {
      title: 'Add Permission',
      description: 'Define a new system permission',
      icon: Key,
      href: '/dashboard/permissions',
      action: 'create',
      variant: 'secondary' as const,
    },
    {
      title: 'Manage Users',
      description: 'Assign roles to user accounts',
      icon: Users,
      href: '/dashboard/users',
      action: 'manage',
      variant: 'outline' as const,
    },
  ];

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
          title="RBAC Dashboard"
          description="Role-Based Access Control system overview and management"
          actions={
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          }
        />
      </motion.div>

      {/* Overview Statistics */}
      <motion.div variants={staggerItem}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Roles"
            value={stats.totalRoles}
            icon={Shield}
            description={`${stats.systemRoles} system, ${stats.customRoles} custom`}
          />
          <StatsCard
            title="Total Permissions"
            value={stats.totalPermissions}
            icon={Key}
            description={`${stats.systemPermissions} system, ${stats.customPermissions} custom`}
          />
          <StatsCard
            title="Active Users"
            value={stats.activeUsers}
            icon={UserCheck}
            description={`${stats.usersWithRoles} with roles assigned`}
          />
          <StatsCard
            title="Role Utilization"
            value={`${stats.roleUtilization.length > 0 ? Math.round(stats.roleUtilization[0].utilizationRate) : 0}%`}
            icon={TrendingUp}
            description="Most used role"
          />
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {quickActions.map((action) => (
                <Link key={action.title} href={action.href}>
                  <Card className="cursor-pointer transition-all hover:shadow-md border-2 hover:border-primary/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                          action.variant === 'default' ? 'bg-primary/10 text-primary' :
                          action.variant === 'secondary' ? 'bg-secondary text-secondary-foreground' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          <action.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{action.title}</h3>
                          <p className="text-sm text-muted-foreground">{action.description}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detailed Analytics */}
      <motion.div variants={staggerItem}>
        <Tabs defaultValue="roles" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="roles">Role Analytics</TabsTrigger>
            <TabsTrigger value="permissions">Permission Analytics</TabsTrigger>
            <TabsTrigger value="users">User Analytics</TabsTrigger>
            <TabsTrigger value="modules">Module Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="roles" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Role Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>System Roles</span>
                      <span>{stats.systemRoles} / {stats.totalRoles}</span>
                    </div>
                    <Progress value={(stats.systemRoles / stats.totalRoles) * 100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Custom Roles</span>
                      <span>{stats.customRoles} / {stats.totalRoles}</span>
                    </div>
                    <Progress value={(stats.customRoles / stats.totalRoles) * 100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Default Roles</span>
                      <span>{stats.defaultRoles} / {stats.totalRoles}</span>
                    </div>
                    <Progress value={(stats.defaultRoles / stats.totalRoles) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Most Used Roles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.roleUtilization.slice(0, 5).map((role) => (
                      <div key={role.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{role.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={role.utilizationRate} className="w-16 h-2" />
                          <span className="text-sm text-muted-foreground w-12 text-right">
                            {Math.round(role.utilizationRate)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Permission Types</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>API Permissions</span>
                      <span>{stats.apiPermissions}</span>
                    </div>
                    <Progress value={(stats.apiPermissions / stats.totalPermissions) * 100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>UI Permissions</span>
                      <span>{stats.uiPermissions}</span>
                    </div>
                    <Progress value={(stats.uiPermissions / stats.totalPermissions) * 100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Data Permissions</span>
                      <span>{stats.dataPermissions}</span>
                    </div>
                    <Progress value={(stats.dataPermissions / stats.totalPermissions) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">System vs Custom</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>System Permissions</span>
                      <span>{stats.systemPermissions}</span>
                    </div>
                    <Progress value={(stats.systemPermissions / stats.totalPermissions) * 100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Custom Permissions</span>
                      <span>{stats.customPermissions}</span>
                    </div>
                    <Progress value={(stats.customPermissions / stats.totalPermissions) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Effect Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Allow</span>
                    </div>
                    <Badge variant="default">
                      {permissions.filter(p => p.effect === 'ALLOW').length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Deny</span>
                    </div>
                    <Badge variant="destructive">
                      {permissions.filter(p => p.effect === 'DENY').length}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {['ACTIVE', 'INACTIVE', 'SUSPENDED'].map((status) => {
                    const count = users.filter(u => u.status === status).length;
                    return (
                      <div key={status} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{status.toLowerCase()}</span>
                          <span>{count} / {stats.totalUsers}</span>
                        </div>
                        <Progress value={(count / stats.totalUsers) * 100} className="h-2" />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Role Assignment Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Users with Roles</span>
                      <span>{stats.usersWithRoles} / {stats.totalUsers}</span>
                    </div>
                    <Progress value={(stats.usersWithRoles / stats.totalUsers) * 100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Users without Roles</span>
                      <span>{stats.totalUsers - stats.usersWithRoles} / {stats.totalUsers}</span>
                    </div>
                    <Progress value={((stats.totalUsers - stats.usersWithRoles) / stats.totalUsers) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="modules" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Permissions by Module
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {stats.topModules.map(([module, count]) => (
                    <div key={module} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{module}</div>
                        <div className="text-sm text-muted-foreground">{count} permissions</div>
                      </div>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}