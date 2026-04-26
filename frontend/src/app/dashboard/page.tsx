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
  AlertTriangle,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  Clock,
  XCircle,
  Activity,
  PackageOpen,
  ShieldCheck,
  TrendingUp,
  MoreVertical,
  Download,
  Filter,
  Calendar,
  Eye,
  ChevronDown,
  type LucideIcon,
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
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
      color: 'from-primary to-primary/80',
    },
    {
      title: 'Total Products',
      value: dashboardStats?.totalProducts?.toLocaleString() || '0',
      icon: Package,
      trend: { value: '+12.5%', isPositive: true, label: 'in inventory' },
      color: 'from-success to-success/80',
    },
    {
      title: 'Total Orders',
      value: dashboardStats?.totalOrders?.toLocaleString() || '0',
      icon: ShoppingCart,
      trend: { value: '+8.2%', isPositive: true, label: 'this month' },
      color: 'from-info to-info/80',
    },
    {
      title: 'Active Users',
      value: dashboardStats?.activeUsers?.toLocaleString() || '0',
      icon: Users,
      trend: { value: '+5.1%', isPositive: true, label: 'online now' },
      color: 'from-warning to-warning/80',
    },
    {
      title: 'Low Stock Items',
      value: '12',
      icon: AlertTriangle,
      trend: { value: '-3.2%', isPositive: false, label: 'need restocking' },
      color: 'from-destructive to-destructive/80',
    },
    {
      title: 'Fulfillment Rate',
      value: '98.5%',
      icon: ShieldCheck,
      trend: { value: '+1.8%', isPositive: true, label: 'on-time' },
      color: 'from-success to-success/80',
    },
    {
      title: 'Avg Order Value',
      value: formatCurrency(1250),
      icon: TrendingUp,
      trend: { value: '+4.7%', isPositive: true, label: 'per order' },
      color: 'from-primary to-primary/80',
    },
    {
      title: 'Inventory Turnover',
      value: '4.2x',
      icon: Activity,
      trend: { value: '+0.8%', isPositive: true, label: 'monthly' },
      color: 'from-info to-info/80',
    },
  ];

  const lowStockItems = [
    { id: 1, name: 'LED Bulb 10W', stock: 5, minStock: 20, category: 'Lighting', urgency: 'high' as const, progress: 25 },
    { id: 2, name: 'Copper Wire 2mm', stock: 8, minStock: 15, category: 'Wiring', urgency: 'medium' as const, progress: 53 },
    { id: 3, name: 'Switch 2-Way', stock: 3, minStock: 10, category: 'Switches', urgency: 'high' as const, progress: 30 },
    { id: 4, name: 'Circuit Breaker', stock: 12, minStock: 25, category: 'Safety', urgency: 'low' as const, progress: 48 },
  ];

  const recentOrders = dashboardStats?.recentOrders || [
    { id: 'ORD-001', customer: 'John Doe', total: formatCurrency(1250), status: 'Completed', date: '2024-01-15' },
    { id: 'ORD-002', customer: 'Jane Smith', total: formatCurrency(890), status: 'Processing', date: '2024-01-14' },
    { id: 'ORD-003', customer: 'Bob Johnson', total: formatCurrency(2100), status: 'Pending', date: '2024-01-14' },
    { id: 'ORD-004', customer: 'Alice Brown', total: formatCurrency(1560), status: 'Completed', date: '2024-01-13' },
    { id: 'ORD-005', customer: 'Michael Chen', total: formatCurrency(3200), status: 'Completed', date: '2024-01-12' },
  ];

  const performanceData = [
    { month: 'Jan', revenue: 65000, orders: 120, target: 80000 },
    { month: 'Feb', revenue: 78000, orders: 145, target: 85000 },
    { month: 'Mar', revenue: 92000, orders: 165, target: 90000 },
    { month: 'Apr', revenue: 105000, orders: 190, target: 100000 },
    { month: 'May', revenue: 125430, orders: 210, target: 120000 },
  ];

  const statusConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; bgColor: string }> = {
    Completed: { icon: CheckCircle, color: 'text-success', bgColor: 'bg-success/10' },
    Processing: { icon: Clock, color: 'text-info', bgColor: 'bg-info/10' },
    Pending: { icon: Clock, color: 'text-warning', bgColor: 'bg-warning/10' },
    Cancelled: { icon: XCircle, color: 'text-destructive', bgColor: 'bg-destructive/10' },
  };

  const urgencyConfig: Record<string, { label: string; variant: 'destructive' | 'warning' | 'info' | 'success'; color: string }> = {
    high: { label: 'Critical', variant: 'destructive', color: 'bg-destructive/10 text-destructive' },
    medium: { label: 'Medium', variant: 'warning', color: 'bg-warning/10 text-warning' },
    low: { label: 'Low', variant: 'info', color: 'bg-info/10 text-info' },
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Dashboard"
          description={`Welcome back, ${user?.name || 'User'}. Here's what's happening today.`}
        />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="h-3.5 w-3.5" />
            Last 30 days
            <ChevronDown className="h-3 w-3 ml-0.5" />
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        </div>
      </div>

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
                color={stat.color}
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
                color={stat.color}
              />
            </motion.div>
          ))}
        </StatsGrid>
      </motion.div>

      {/* Charts & Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Trend */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Revenue & Orders</CardTitle>
                <CardDescription className="mt-1 text-xs">Monthly performance vs target</CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>View details</DropdownMenuItem>
                  <DropdownMenuItem>Export data</DropdownMenuItem>
                  <DropdownMenuItem>Set alerts</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
              <div className="space-y-4">
                {performanceData.map((item) => {
                  const revenuePercentage = (item.revenue / item.target) * 100;
                  const orderPercentage = (item.orders / 250) * 100;
                  return (
                    <div key={item.month} className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-8 text-sm font-medium text-foreground">{item.month}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatCurrency(item.revenue)}
                          </span>
                        </div>
                        <span className="text-xs font-medium">
                          {revenuePercentage >= 100 ? (
                            <span className="text-success flex items-center gap-0.5">
                              <ArrowUpRight className="h-3 w-3" />
                              {revenuePercentage.toFixed(0)}%
                            </span>
                          ) : (
                            <span className="text-warning flex items-center gap-0.5">
                              <ArrowDownRight className="h-3 w-3" />
                              {revenuePercentage.toFixed(0)}%
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <Progress value={Math.min(revenuePercentage, 100)} className="h-1.5" />
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span>{item.orders} orders</span>
                          <span>{revenuePercentage.toFixed(0)}% of target</span>
                        </div>
                      </div>
                      {item.month !== 'May' && <Separator />}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Low Stock Alert</CardTitle>
                <CardDescription className="mt-1 text-xs">Items needing attention</CardDescription>
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
                      className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-muted/50 border border-border/50"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', config.color)}>
                          <PackageOpen className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-[11px] text-muted-foreground">{item.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <p className="text-sm font-medium tabular-nums">
                            {item.stock} <span className="text-muted-foreground font-normal">/ {item.minStock}</span>
                          </p>
                          <div className="w-14 h-1 bg-muted rounded-full overflow-hidden mt-1">
                            <div 
                              className={cn('h-full rounded-full', {
                                'bg-destructive': item.urgency === 'high',
                                'bg-warning': item.urgency === 'medium',
                                'bg-info': item.urgency === 'low',
                              })}
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                        </div>
                        <Badge variant={config.variant} className="text-[10px] px-1.5 py-0 h-5">
                          {config.label}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
                <Button variant="ghost" className="w-full mt-1 text-sm text-muted-foreground hover:text-foreground">
                  View all low stock items
                  <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Recent Orders</CardTitle>
                <CardDescription className="mt-1 text-xs">Latest transactions and their status</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                View all
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-3 p-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-muted rounded skeleton-shimmer" />
                      <div className="h-3 w-24 bg-muted rounded skeleton-shimmer" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-20 bg-muted rounded skeleton-shimmer" />
                      <div className="h-3 w-16 bg-muted rounded skeleton-shimmer" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs font-medium text-muted-foreground">Order ID</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground">Customer</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground">Total</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground">Status</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground">Date</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order: any) => {
                    const config = statusConfig[order.status] || statusConfig.Pending;
                    const StatusIcon = config.icon;
                    return (
                      <TableRow key={order.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium text-sm">{order.id}</TableCell>
                        <TableCell className="text-sm">{order.customer}</TableCell>
                        <TableCell className="text-sm font-medium tabular-nums">{order.total}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              'inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full border-0',
                              config.bgColor,
                              config.color
                            )}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{order.date}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon-sm" className="h-7 w-7">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
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
