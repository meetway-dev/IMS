import apiClient from '@/lib/api-client';
import { productService } from './product.service';
import { orderService } from './order.service';
import { userService } from './user.service';
import { inventoryService } from './inventory.service';

export interface DashboardStats {
  totalRevenue: number;
  totalProducts: number;
  totalOrders: number;
  activeUsers: number;
  lowStockItems: number;
  recentOrders: any[];
  performanceData: { month: string; revenue: number; orders: number }[];
}

export interface LowStockItem {
  id: string;
  name: string;
  stock: number;
  minStockLevel: number;
  category: string;
  urgency: 'high' | 'medium' | 'low';
}

export const dashboardService = {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    // Fetch data in parallel
    const [productsRes, ordersRes, usersRes] = await Promise.allSettled([
      productService.getProducts({ limit: 1 }),
      orderService.getOrders({ limit: 1 }),
      userService.getUsers({ limit: 1 }),
    ]);

    const totalProducts = productsRes.status === 'fulfilled' ? productsRes.value.meta.total : 0;
    const totalOrders = ordersRes.status === 'fulfilled' ? ordersRes.value.meta.total : 0;
    const activeUsers = usersRes.status === 'fulfilled' ? usersRes.value.meta.total : 0;

    // Calculate total revenue from recent orders (simplified - in real app would have a dedicated endpoint)
    let totalRevenue = 0;
    if (ordersRes.status === 'fulfilled' && ordersRes.value.data.length > 0) {
      // Sum up order totals (assuming order has totalAmount field)
      totalRevenue = ordersRes.value.data.reduce((sum: number, order: any) => {
        return sum + (parseFloat(order.totalAmount) || 0);
      }, 0);
    }

    // Get low stock items
    const lowStockItems = await this.getLowStockItems();
    
    // Get recent orders
    const recentOrders = ordersRes.status === 'fulfilled' 
      ? ordersRes.value.data.slice(0, 5).map((order: any) => ({
          id: order.id,
          customer: order.customerName || 'Unknown',
          total: order.totalAmount || 0,
          status: order.status,
          date: new Date(order.createdAt).toLocaleDateString(),
        }))
      : [];

    // Mock performance data (in real app would come from analytics endpoint)
    const performanceData = [
      { month: 'Jan', revenue: 65000, orders: 120 },
      { month: 'Feb', revenue: 78000, orders: 145 },
      { month: 'Mar', revenue: 92000, orders: 165 },
      { month: 'Apr', revenue: 105000, orders: 190 },
      { month: 'May', revenue: totalRevenue || 125430, orders: totalOrders || 210 },
    ];

    return {
      totalRevenue,
      totalProducts,
      totalOrders,
      activeUsers,
      lowStockItems: lowStockItems.length,
      recentOrders,
      performanceData,
    };
  },

  /**
   * Get low stock items
   */
  async getLowStockItems(): Promise<LowStockItem[]> {
    try {
      // In a real app, there would be an endpoint for low stock items
      // For now, we'll mock some data
      return [
        { id: '1', name: 'LED Bulb 10W', stock: 5, minStockLevel: 20, category: 'Lighting', urgency: 'high' },
        { id: '2', name: 'Copper Wire 2mm', stock: 8, minStockLevel: 15, category: 'Wiring', urgency: 'medium' },
        { id: '3', name: 'Switch 2-Way', stock: 3, minStockLevel: 10, category: 'Switches', urgency: 'high' },
        { id: '4', name: 'Circuit Breaker', stock: 12, minStockLevel: 25, category: 'Safety', urgency: 'low' },
      ];
    } catch (error) {
      console.error('Failed to fetch low stock items:', error);
      return [];
    }
  },

  /**
   * Get performance data for charts
   */
  async getPerformanceData(): Promise<{ month: string; revenue: number; orders: number }[]> {
    // Mock data - in real app would come from analytics API
    return [
      { month: 'Jan', revenue: 65000, orders: 120 },
      { month: 'Feb', revenue: 78000, orders: 145 },
      { month: 'Mar', revenue: 92000, orders: 165 },
      { month: 'Apr', revenue: 105000, orders: 190 },
      { month: 'May', revenue: 125430, orders: 210 },
    ];
  },
};