import apiClient from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import {
  StockLevel,
  StockLevelListParams,
  PaginatedResponse,
} from '@/types';

export const stockLevelService = {
  /**
   * Get all stock levels with pagination, filtering, and sorting
   */
  async getStockLevels(params?: StockLevelListParams): Promise<PaginatedResponse<StockLevel>> {
    const response = await apiClient.getPaginated<StockLevel>(
      API_ENDPOINTS.STOCK_LEVELS.LIST,
      params,
    );
    return response;
  },

  /**
   * Get stock level by ID
   */
  async getStockLevel(id: string): Promise<StockLevel> {
    const response = await apiClient.get<StockLevel>(API_ENDPOINTS.STOCK_LEVELS.DETAIL(id));
    return response.data;
  },

  /**
   * Get stock levels for a specific warehouse
   */
  async getStockLevelsByWarehouse(
    warehouseId: string,
    params?: Record<string, any>,
  ): Promise<PaginatedResponse<StockLevel>> {
    const response = await apiClient.getPaginated<StockLevel>(
      API_ENDPOINTS.STOCK_LEVELS.BY_WAREHOUSE(warehouseId),
      params,
    );
    return response;
  },

  /**
   * Get low stock items across all warehouses
   */
  async getLowStockItems(params?: Record<string, any>): Promise<PaginatedResponse<StockLevel>> {
    const response = await apiClient.getPaginated<StockLevel>(
      API_ENDPOINTS.STOCK_LEVELS.LOW_STOCK,
      params,
    );
    return response;
  },
};
