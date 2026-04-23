import apiClient from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { Inventory, InventoryTransaction, PaginatedResponse, PaginationParams } from '@/types';

interface CreateInventoryData {
  productId: string;
  quantity: number;
  location?: string;
}

interface UpdateInventoryData extends Partial<CreateInventoryData> {}

interface AdjustInventoryData {
  productId: string;
  quantity: number;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  reason?: string;
}

export const inventoryService = {
  /**
   * Get all inventory items with pagination
   */
  async getInventory(params?: PaginationParams): Promise<PaginatedResponse<Inventory>> {
    const response = await apiClient.getPaginated<Inventory>(
      API_ENDPOINTS.INVENTORY.LIST,
      params
    );
    return response;
  },

  /**
   * Get inventory item by ID
   */
  async getInventoryItem(id: string): Promise<Inventory> {
    const response = await apiClient.get<Inventory>(API_ENDPOINTS.INVENTORY.DETAIL(id));
    return response.data;
  },

  /**
   * Create inventory item
   */
  async createInventory(data: CreateInventoryData): Promise<Inventory> {
    const response = await apiClient.post<Inventory>(API_ENDPOINTS.INVENTORY.CREATE, data);
    return response.data;
  },

  /**
   * Update inventory item
   */
  async updateInventory(id: string, data: UpdateInventoryData): Promise<Inventory> {
    const response = await apiClient.patch<Inventory>(API_ENDPOINTS.INVENTORY.UPDATE(id), data);
    return response.data;
  },

  /**
   * Delete inventory item
   */
  async deleteInventory(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.INVENTORY.DELETE(id));
  },

  /**
   * Adjust inventory quantity
   */
  async adjustInventory(data: AdjustInventoryData): Promise<InventoryTransaction> {
    const response = await apiClient.post<InventoryTransaction>(
      API_ENDPOINTS.INVENTORY.ADJUST,
      data
    );
    return response.data;
  },

  /**
   * Get inventory transactions
   */
  async getTransactions(params?: PaginationParams): Promise<PaginatedResponse<InventoryTransaction>> {
    const response = await apiClient.getPaginated<InventoryTransaction>(
      API_ENDPOINTS.INVENTORY.TRANSACTIONS,
      params
    );
    return response;
  },

  /**
   * Get low stock items
   */
  async getLowStockItems(): Promise<Inventory[]> {
    const response = await apiClient.get<Inventory[]>(API_ENDPOINTS.INVENTORY.LIST, {
      lowStock: true,
    });
    // Handle both wrapped and direct array responses
    if (Array.isArray(response)) {
      return response;
    }
    return response.data;
  },
};
