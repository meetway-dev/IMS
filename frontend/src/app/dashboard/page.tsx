'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  Clock,
  XCircle,
  Activity,
  PackageOpen,
  ShieldCheck,
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import { dashboardService } from '@/services/dashboard.service';
import { StatsCard, StatsGrid } from '@/components/ui/stats-card';
import { SkeletonCard } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/states';
import { PageHeader } from '@/components/ui/page-header';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/animations';

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: dashboardStats, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardService.getDashboardStats(),
  });

  const stats = [
    {
      title: 'Total Revenue',
      value: formatCurrency(dashboardStats?.totalRevenue || 0),
      icon: DollarSign,
      trend: { value: '+23.1%', isPositive: true, label: 'vs last month' },
    },
    {
      title: 'Total Products',
      value: dashboardStats?.totalProducts?.toLocaleString() || '0',
      icon: Package,
      trend: { value: '+12.5%', isPositive: true, label: 'in inventory' },
    },
    {
      title: 'Total Orders',
      value: dashboardStats?.totalOrders?.toLocaleString() || '0',
      icon: ShoppingCart,
      trend: { value: '+8.2%', isPositive: true, label: 'this month' },
    },
    {
      title: 'Active Users',
      value: dashboardStats?.activeUsers?.toLocaleString() || '0',
      icon: Users,
      trend: { value: '+5.1%', isPositive: true, label: 'online now' },
    },
    {
      title: 'Low Stock Items',
      value: '12',
      icon: AlertTriangle,
      trend: { value: '-3.2%', isPositive: false, label: 'need restocking' },
    },
    {
      title: 'Fulfillment Rate',
      value: '98.5%',
      icon: ShieldCheck,
      trend: { value: '+1.8%', isPositive: true, label: 'on-time' },
    },
    {
      title: 'Avg Order Value',
      value: formatCurrency(1250),
      icon: TrendingUp,
      trend: { value: '+4.7%', isPositive: true, label: 'per order' },
    },
    {
      title: 'Inventory Turnover',
      value: '4.2x',
      icon: Activity,
      trend: { value: '+0.8%', isPositive: true, label: 'monthly' },
    },
  ];

  const lowStockItems = [
    { id: 1, name: 'LED Bulb 10W', stock: 5, minStock: 20, category: 'Lighting', urgency: 'high' as const },
    { id: 2, name: 'Copper Wire 2mm', stock: 8, minStock: 15, category: 'Wiring', urgency: 'medium' as const },
    { id: 3, name: 'Switch 2-Way', stock: 3, minStock: 10, category: 'Switches', urgency: 'high' as const },
    { id: 4, name: 'Circuit Breaker', stock: 12, minStock: 25, category: 'Safety', urgency: 'low' as const },
  ];

  const recentOrders = dashboardStats?.recentOrders || [
    { id: 'ORD-001', customer: 'John Doe', total: formatCurrency(1250), status: 'Completed', date: '2024-01-15' },
    { id: 'ORD-002', customer: 'Jane Smith', total: formatCurrency(890), status: 'Processing', date: '2024-01-14' },
    { id: 'ORD-003', customer: 'Bob Johnson', total: formatCurrency(2100), status: 'Pending', date: '2024-01-14' },
    { id: 'ORD-004', customer: 'Alice Brown', total: formatCurrency(1560), status: 'Completed', date: '2024-01-13' },
  ];

  const performanceData = dashboardStats?.performanceData || [
    { month: 'Jan', revenue: 65000, orders: 120 },
    { month: 'Feb', revenue: 78000, orders: 145 },
    { month: 'Mar', revenue: 92000, orders: 165 },
    { month: 'Apr', revenue: 105000, orders: 190 },
    { month: 'May', revenue: 125430, orders: 210 },
  ];

  const statusConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
    Completed: { icon: CheckCircle, color: 'text-success' },
    Processing: { icon: Clock, color: 'text-info' },
    Pending: { icon: Clock, color: 'text-warning' },
    Cancelled: { icon: XCircle, color: 'text-destructive' },
  };

  const urgencyConfig: Record<string, { label: string; variant: 'destructive' | 'warning' | 'info' }> = {
    high: { label: 'High', variant: 'destructive' },
    medium: { label: 'Medium', variant: 'warning' },
    low: { label: 'Low', variant: 'info' },
  };

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description={`Welcome back, ${user?.name || 'User'}`} />
        <ErrorState onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${user?.name || 'User'}. Here's what's happening today.`}
      />

      {/* KPI Stats */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <StatsGrid>
          {stats.slice(0, 4).map((stat) => (
            <motion.div key={stat.title} variants={staggerItem}>
              <StatsCard
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                trend={stat.trend}
                loading={isLoading}
              />
            </motion.div>
          ))}
        </StatsGrid>
      </motion.div>

      {/* Secondary Stats */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <StatsGrid className="grid-cols-2 lg:grid-cols-4">
          {stats.slice(4).map((stat) => (
            <motion.div key={stat.title} variants={staggerItem}>
              <StatsCard
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                trend={stat.trend}
                loading={isLoading}
              />
            </motion.div>
          ))}
        </StatsGrid>
      </motion.div>

      {/* Charts & Tables */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Revenue Trend */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Revenue & Orders</CardTitle>
                <CardDescription>Monthly performance</CardDescription>
              </div>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-3 w-8 bg-muted rounded skeleton-shimmer" />
                    <div className="h-2 w-full bg-muted rounded skeleton-shimmer" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {performanceData.map((item) => (
                  <div key={item.month} className="flex items-center gap-3">
                    <div className="w-10 text-xs font-medium text-muted-foreground">{item.month}</div>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Revenue</span>
                        <span className="text-xs font-medium">{formatCurrency(item.revenue)}</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${(item.revenue / 150000) * 100}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Orders</span>
                        <span className="text-xs font-medium">{item.orders}</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-success rounded-full transition-all duration-500"
                          style={{ width: `${(item.orders / 250) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Low Stock Alert</CardTitle>
                <CardDescription>Items needing restocking</CardDescription>
              </div>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-14 bg-muted rounded-lg skeleton-shimmer" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {lowStockItems.map((item) => {
                  const config = urgencyConfig[item.urgency];
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/40"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {item.stock} <span className="text-muted-foreground">/ {item.minStock}</span>
                          </p>
                        </div>
                        <Badge variant={config.variant}>{config.label}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest transactions</CardDescription>
              </div>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 py-3">
                    <div className="h-4 w-20 bg-muted rounded skeleton-shimmer" />
                    <div className="h-4 w-24 bg-muted rounded skeleton-shimmer" />
                    <div className="h-4 w-16 bg-muted rounded skeleton-shimmer ml-auto" />
                  </div>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => {
                    const config = statusConfig[order.status] || statusConfig.Pending;
                    const StatusIcon = config.icon;
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell className="font-medium">{order.total}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <StatusIcon className={cn('h-3.5 w-3.5', config.color)} />
                            <span className="text-sm">{order.status}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">{order.date}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
