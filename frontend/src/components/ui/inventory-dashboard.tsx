'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { StatsCard } from '@/components/ui/stats-card';
import {
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Warehouse,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { inventoryService } from '@/services/inventory.service';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { StockLevel } from '@/types';

interface InventoryDashboardProps {
  showActions?: boolean;
  compact?: boolean;
}

interface DashboardStats {
  totalValue: number;
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  monthlyMovement: number;
  warehouseCount: number;
  totalValueChange: number;
  itemsChange: number;
}

export function InventoryDashboard({ showActions = true, compact = false }: InventoryDashboardProps) {
  const { data: stockLevelsData, isLoading } = useQuery({
    queryKey: ['stock-levels', 'dashboard'],
    queryFn: () => inventoryService.getStockLevels({ page: 1, limit: 100 }),
  });

  const { data: lowStockData } = useQuery({
    queryKey: ['stock-levels', 'low-stock'],
    queryFn: () => inventoryService.getLowStockAlerts({ page: 1, limit: 100 }),
  });

  // Mock data for demonstration
  const dashboardStats: DashboardStats = {
    totalValue: 1254300,
    totalItems: stockLevelsData?.data?.length || 2456,
    lowStockItems: lowStockData?.data?.length || 12,
    outOfStockItems: stockLevelsData?.data?.filter(s => s.quantity === 0).length || 8,
    monthlyMovement: 456,
    warehouseCount: 4,
    totalValueChange: 12.5,
    itemsChange: 3.2,
  };

  const stockLevels: StockLevel[] = stockLevelsData?.data || [];
  const totalStock = stockLevels.reduce((sum: number, level: StockLevel) => sum + (level.quantity || 0), 0);
  const averageStockLevel = stockLevels.length > 0 ? totalStock / stockLevels.length : 0;

  const getStockStatusColor = (quantity: number, minStock: number = 10) => {
    if (quantity === 0) return 'destructive';
    if (quantity <= minStock) return 'warning';
    return 'success';
  };

  const getStockStatusText = (quantity: number, minStock: number = 10) => {
    if (quantity === 0) return 'Out of Stock';
    if (quantity <= minStock) return 'Low Stock';
    return 'In Stock';
  };

  if (isLoading && !stockLevelsData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      {showActions && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Inventory Dashboard</h2>
            <p className="text-sm text-muted-foreground">
              Real-time overview of your inventory performance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Warehouse className="h-4 w-4 mr-2" />
              Warehouse View
            </Button>
            <Button size="sm">
              <Package className="h-4 w-4 mr-2" />
              Add Stock
            </Button>
          </div>
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Inventory Value"
          value={formatCurrency(dashboardStats.totalValue)}
          description="Current stock value"
          icon={Package}
          trend={{
            value: `${dashboardStats.totalValueChange > 0 ? '+' : ''}${dashboardStats.totalValueChange.toFixed(1)}%`,
            isPositive: dashboardStats.totalValueChange > 0,
            label: 'vs last month',
          }}
          color="from-blue-500 to-cyan-500"
        />

        <StatsCard
          title="Total Items"
          value={formatNumber(dashboardStats.totalItems)}
          description="Unique products in stock"
          icon={Warehouse}
          trend={{
            value: `${dashboardStats.itemsChange > 0 ? '+' : ''}${dashboardStats.itemsChange.toFixed(1)}%`,
            isPositive: dashboardStats.itemsChange > 0,
            label: 'vs last month',
          }}
          color="from-green-500 to-emerald-500"
        />

        <StatsCard
          title="Low Stock Alerts"
          value={dashboardStats.lowStockItems.toString()}
          description="Items below minimum stock"
          icon={AlertTriangle}
          trend={{
            value: '-2',
            isPositive: false,
            label: 'from yesterday',
          }}
          color="from-orange-500 to-amber-500"
        />

        <StatsCard
          title="Monthly Movement"
          value={formatNumber(dashboardStats.monthlyMovement)}
          description="Items moved this month"
          icon={TrendingUp}
          trend={{
            value: '+8.2%',
            isPositive: true,
            label: 'vs last month',
          }}
          color="from-purple-500 to-violet-500"
        />
      </div>

      {/* Stock Distribution */}
      {!compact && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                Stock Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">In Stock</span>
                  <span className="text-sm font-semibold">
                    {stockLevels.filter(item => (item.quantity || 0) > 10).length} items
                  </span>
                </div>
                <Progress 
                  value={
                    (stockLevels.filter(item => (item.quantity || 0) > 10).length / 
                    stockLevels.length) * 100 || 0
                  } 
                  className="h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Low Stock</span>
                  <span className="text-sm font-semibold">
                    {stockLevels.filter(item => (item.quantity || 0) > 0 && (item.quantity || 0) <= 10).length} items
                  </span>
                </div>
                <Progress 
                  value={
                    (stockLevels.filter(item => (item.quantity || 0) > 0 && (item.quantity || 0) <= 10).length / 
                    stockLevels.length) * 100 || 0
                  } 
                  className="h-2"
                  indicatorClassName="bg-orange-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Out of Stock</span>
                  <span className="text-sm font-semibold">
                    {stockLevels.filter(item => (item.quantity || 0) === 0).length} items
                  </span>
                </div>
                <Progress 
                  value={
                    (stockLevels.filter(item => (item.quantity || 0) === 0).length / 
                    stockLevels.length) * 100 || 0
                  } 
                  className="h-2"
                  indicatorClassName="bg-red-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Receive Stock
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <ArrowDownRight className="h-4 w-4 mr-2" />
                Issue Stock
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <RefreshCw className="h-4 w-4 mr-2" />
                Transfer Stock
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <AlertTriangle className="h-4 w-4 mr-2" />
                View Alerts
              </Button>
            </CardContent>
          </Card>

          {/* Stock Status Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Stock Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <span className="text-sm">Healthy Stock</span>
                  </div>
                  <Badge variant="outline" className="font-normal">
                    {stockLevels.filter(item => (item.quantity || 0) > 20).length} items
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                    <span className="text-sm">Needs Reorder</span>
                  </div>
                  <Badge variant="outline" className="font-normal">
                    {stockLevels.filter(item => (item.quantity || 0) > 0 && (item.quantity || 0) <= 20).length} items
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <span className="text-sm">Critical</span>
                  </div>
                  <Badge variant="outline" className="font-normal">
                    {stockLevels.filter(item => (item.quantity || 0) === 0).length} items
                  </Badge>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Average Stock Level</span>
                    <span className="text-sm font-semibold">
                      {formatNumber(averageStockLevel)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-medium">Total Stock Units</span>
                    <span className="text-sm font-semibold">
                      {formatNumber(totalStock)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Low Stock Alert Banner */}
      {lowStockData && lowStockData.data && lowStockData.data.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div>
                  <h4 className="font-semibold text-orange-800">
                    {lowStockData.data.length} items need immediate attention
                  </h4>
                  <p className="text-sm text-orange-700">
                    These items are below minimum stock levels and may need reordering.
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="border-orange-300 text-orange-700">
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}