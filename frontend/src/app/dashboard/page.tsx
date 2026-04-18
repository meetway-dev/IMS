'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  TrendingDown,
  Activity,
  PackageOpen,
  ShieldCheck
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import { dashboardService } from '@/services/dashboard.service';
import { StatsCard, StatsGrid } from '@/components/ui/stats-card';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: dashboardStats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardService.getDashboardStats(),
  });

  // Enhanced stats with fallback values
  const enhancedStats = [
    {
      title: 'Total Revenue',
      value: formatCurrency(dashboardStats?.totalRevenue || 0),
      icon: DollarSign,
      trend: '+23.1%',
      trendUp: true,
      description: 'From last month',
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Total Products',
      value: dashboardStats?.totalProducts?.toLocaleString() || '0',
      icon: Package,
      trend: '+12.5%',
      trendUp: true,
      description: 'Active in inventory',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Total Orders',
      value: dashboardStats?.totalOrders?.toLocaleString() || '0',
      icon: ShoppingCart,
      trend: '+8.2%',
      trendUp: true,
      description: 'This month',
      color: 'from-purple-500 to-violet-500',
    },
    {
      title: 'Active Users',
      value: dashboardStats?.activeUsers?.toLocaleString() || '0',
      icon: Users,
      trend: '+5.1%',
      trendUp: true,
      description: 'Currently online',
      color: 'from-orange-500 to-amber-500',
    },
    {
      title: 'Low Stock Items',
      value: '12',
      icon: AlertTriangle,
      trend: '-3.2%',
      trendUp: false,
      description: 'Need restocking',
      color: 'from-red-500 to-rose-500',
    },
    {
      title: 'Order Fulfillment',
      value: '98.5%',
      icon: ShieldCheck,
      trend: '+1.8%',
      trendUp: true,
      description: 'On-time delivery',
      color: 'from-indigo-500 to-blue-500',
    },
    {
      title: 'Avg Order Value',
      value: formatCurrency(1250),
      icon: TrendingUp,
      trend: '+4.7%',
      trendUp: true,
      description: 'Customer spending',
      color: 'from-teal-500 to-emerald-500',
    },
    {
      title: 'Inventory Turnover',
      value: '4.2x',
      icon: Activity,
      trend: '+0.8%',
      trendUp: true,
      description: 'Monthly rate',
      color: 'from-pink-500 to-rose-500',
    },
  ];

  const lowStockItems = [
    { id: 1, name: 'LED Bulb 10W', stock: 5, minStockLevel: 20, category: 'Lighting', urgency: 'high' },
    { id: 2, name: 'Copper Wire 2mm', stock: 8, minStockLevel: 15, category: 'Wiring', urgency: 'medium' },
    { id: 3, name: 'Switch 2-Way', stock: 3, minStockLevel: 10, category: 'Switches', urgency: 'high' },
    { id: 4, name: 'Circuit Breaker', stock: 12, minStockLevel: 25, category: 'Safety', urgency: 'low' },
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Processing':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'Pending':
        return <Clock className="h-4 w-4 text-orange-500" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, <span className="font-semibold text-primary">{user?.name || 'User'}</span>! Here's what's happening with your inventory today.
        </p>
      </div>

      {/* Enhanced Stats Cards */}
      <StatsGrid>
        {enhancedStats.slice(0, 4).map((stat, index) => (
          <StatsCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
            trend={{
              value: stat.trend,
              isPositive: stat.trendUp,
              label: stat.description
            }}
            color={stat.color}
            loading={isLoading}
            gradient={stat.color}
          />
        ))}
      </StatsGrid>

      {/* Additional Stats Grid */}
      <StatsGrid>
        {enhancedStats.slice(4).map((stat, index) => (
          <StatsCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
            trend={{
              value: stat.trend,
              isPositive: stat.trendUp,
              label: stat.description
            }}
            color={stat.color}
            loading={isLoading}
            gradient={stat.color}
          />
        ))}
      </StatsGrid>

      {/* Charts and Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Performance Chart */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Revenue & Orders Trend</CardTitle>
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Monthly performance overview</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performanceData.map((item) => (
                <div key={item.month} className="flex items-center">
                  <div className="w-16 text-sm font-medium">{item.month}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Revenue</span>
                      <span className="text-sm font-semibold">{formatCurrency(item.revenue)}</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                        style={{ width: `${(item.revenue / 150000) * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm">Orders</span>
                      <span className="text-sm font-semibold">{item.orders}</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mt-1">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
                        style={{ width: `${(item.orders / 250) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Low Stock Alert</CardTitle>
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <p className="text-sm text-muted-foreground">Items that need restocking</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">{item.stock} / {item.minStockLevel}</p>
                      <p className="text-xs text-muted-foreground">Current / Min</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(item.urgency)}`}>
                      {item.urgency.toUpperCase()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="border-0 shadow-lg lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Latest transactions</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Order ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Customer</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Total</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50/50">
                      <td className="py-3 px-4 font-medium">{order.id}</td>
                      <td className="py-3 px-4">{order.customer}</td>
                      <td className="py-3 px-4 font-semibold">{order.total}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          <span>{order.status}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
