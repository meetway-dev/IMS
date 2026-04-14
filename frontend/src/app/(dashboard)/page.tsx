'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';

export default function DashboardPage() {
  const { user } = useAuthStore();

  // Mock data - replace with actual API calls
  const stats = [
    {
      title: 'Total Products',
      value: '1,234',
      icon: Package,
      trend: '+12.5%',
      trendUp: true,
    },
    {
      title: 'Total Orders',
      value: '456',
      icon: ShoppingCart,
      trend: '+8.2%',
      trendUp: true,
    },
    {
      title: 'Total Users',
      value: '89',
      icon: Users,
      trend: '+5.1%',
      trendUp: true,
    },
    {
      title: 'Revenue',
      value: formatCurrency(125430),
      icon: TrendingUp,
      trend: '+23.1%',
      trendUp: true,
    },
  ];

  const lowStockItems = [
    { id: 1, name: 'LED Bulb 10W', stock: 5, minStock: 20 },
    { id: 2, name: 'Copper Wire 2mm', stock: 8, minStock: 15 },
    { id: 3, name: 'Switch 2-Way', stock: 3, minStock: 10 },
  ];

  const recentOrders = [
    { id: 'ORD-001', customer: 'John Doe', total: formatCurrency(1250), status: 'Completed' },
    { id: 'ORD-002', customer: 'Jane Smith', total: formatCurrency(890), status: 'Processing' },
    { id: 'ORD-003', customer: 'Bob Johnson', total: formatCurrency(2100), status: 'Pending' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name || 'User'}! Here's what's happening with your store today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p
                className={`text-xs ${
                  stat.trendUp ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {stat.trend} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Stock: {item.stock} / Min: {item.minStock}
                    </p>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-orange-500" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{order.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.customer}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{order.total}</p>
                    <p
                      className={`text-xs ${
                        order.status === 'Completed'
                          ? 'text-green-600'
                          : order.status === 'Processing'
                          ? 'text-blue-600'
                          : 'text-orange-600'
                      }`}
                    >
                      {order.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
