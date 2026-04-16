'use client';

import * as React from 'react';
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
  XCircle
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';

export default function DashboardPage() {
  const { user } = useAuthStore();

  // Mock data - replace with actual API calls
  const stats = [
    {
      title: 'Total Revenue',
      value: formatCurrency(125430),
      icon: DollarSign,
      trend: '+23.1%',
      trendUp: true,
      description: 'From last month',
      color: 'from-green-500 to-emerald-600',
    },
    {
      title: 'Total Products',
      value: '1,234',
      icon: Package,
      trend: '+12.5%',
      trendUp: true,
      description: 'Active in inventory',
      color: 'from-blue-500 to-cyan-600',
    },
    {
      title: 'Total Orders',
      value: '456',
      icon: ShoppingCart,
      trend: '+8.2%',
      trendUp: true,
      description: 'This month',
      color: 'from-purple-500 to-violet-600',
    },
    {
      title: 'Active Users',
      value: '89',
      icon: Users,
      trend: '+5.1%',
      trendUp: true,
      description: 'Currently online',
      color: 'from-orange-500 to-amber-600',
    },
  ];

  const lowStockItems = [
    { id: 1, name: 'LED Bulb 10W', stock: 5, minStock: 20, category: 'Lighting', urgency: 'high' },
    { id: 2, name: 'Copper Wire 2mm', stock: 8, minStock: 15, category: 'Wiring', urgency: 'medium' },
    { id: 3, name: 'Switch 2-Way', stock: 3, minStock: 10, category: 'Switches', urgency: 'high' },
    { id: 4, name: 'Circuit Breaker', stock: 12, minStock: 25, category: 'Safety', urgency: 'low' },
  ];

  const recentOrders = [
    { id: 'ORD-001', customer: 'John Doe', total: formatCurrency(1250), status: 'Completed', date: '2024-01-15' },
    { id: 'ORD-002', customer: 'Jane Smith', total: formatCurrency(890), status: 'Processing', date: '2024-01-14' },
    { id: 'ORD-003', customer: 'Bob Johnson', total: formatCurrency(2100), status: 'Pending', date: '2024-01-14' },
    { id: 'ORD-004', customer: 'Alice Brown', total: formatCurrency(1560), status: 'Completed', date: '2024-01-13' },
  ];

  const performanceData = [
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, <span className="font-semibold text-primary">{user?.name || 'User'}</span>! Here's what's happening with your inventory today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="overflow-hidden border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold mt-2">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    {stat.trendUp ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.trend}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">{stat.description}</span>
                  </div>
                </div>
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Low Stock Alert
              </CardTitle>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-orange-100 text-orange-800">
                {lowStockItems.length} items
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Items requiring immediate attention</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${getUrgencyColor(item.urgency)}`}>
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                          {item.category}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Stock: <span className="font-semibold">{item.stock}</span> / Min: {item.minStock}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-medium px-2 py-1 rounded-full ${getUrgencyColor(item.urgency)}`}>
                      {item.urgency.charAt(0).toUpperCase() + item.urgency.slice(1)}
                    </div>
                    <div className="mt-2">
                      <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${item.urgency === 'high' ? 'bg-red-500' : item.urgency === 'medium' ? 'bg-orange-500' : 'bg-yellow-500'}`}
                          style={{ width: `${(item.stock / item.minStock) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
            <ShoppingCart className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Latest transactions and their status</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Order ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-medium">{order.id}</span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium">{order.customer}</p>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold">{order.total}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <span className={`text-sm font-medium ${
                          order.status === 'Completed' ? 'text-green-600' :
                          order.status === 'Processing' ? 'text-blue-600' :
                          'text-orange-600'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex justify-center">
            <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
              View all orders →
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inventory Value</p>
                <p className="text-2xl font-bold mt-2">{formatCurrency(452180)}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">Total value of all inventory items</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Order Value</p>
                <p className="text-2xl font-bold mt-2">{formatCurrency(2750)}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">Average value per order</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Stock Turnover</p>
                <p className="text-2xl font-bold mt-2">4.2x</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">Inventory turnover rate this year</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
