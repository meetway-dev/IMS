import apiClient from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { Order, OrderItem, PaginatedResponse, PaginationParams } from '@/types';

interface CreateOrderData {
  customerId?: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  notes?: string;
}

interface UpdateOrderData {
  status?: string;
  notes?: string;
}

export const orderService = {
  /**
   * Get all orders with pagination
   */
  async getOrders(params?: PaginationParams): Promise<PaginatedResponse<Order>> {
    const response = await apiClient.getPaginated<Order>(
      API_ENDPOINTS.ORDERS.LIST,
      params
    );
    return response;
  },

  /**
   * Get order by ID
   */
  async getOrder(id: string): Promise<Order> {
    const response = await apiClient.get<Order>(API_ENDPOINTS.ORDERS.DETAIL(id));
    return response.data;
  },

  /**
   * Create new order
   */
  async createOrder(data: CreateOrderData): Promise<Order> {
    const response = await apiClient.post<Order>(API_ENDPOINTS.ORDERS.CREATE, data);
    return response.data;
  },

  /**
   * Update order
   */
  async updateOrder(id: string, data: UpdateOrderData): Promise<Order> {
    const response = await apiClient.put<Order>(API_ENDPOINTS.ORDERS.UPDATE(id), data);
    return response.data;
  },

  /**
   * Delete order
   */
  async deleteOrder(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.ORDERS.DELETE(id));
  },

  /**
   * Get order statistics
   */
  async getOrderStats(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    completedOrders: number;
  }> {
    const response = await apiClient.get<{
      totalOrders: number;
      totalRevenue: number;
      pendingOrders: number;
      completedOrders: number;
    }>('/orders/stats');
    return response.data;
  },
};
