import apiClient from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { StockLevel, StockMovement, StockAlert, PaginatedResponse, PaginationParams, StockMovementType } from '@/types';

interface AdjustStockDto {
  stockLevelId: string;
  quantityDelta: number;
  type?: StockMovementType;
  reference?: string;
  note?: string;
}

interface CreateStockMovementDto {
  stockLevelId: string;
  type: StockMovementType;
  quantity: number;
  referenceType?: string;
  referenceId?: string;
  note?: string;
}

interface TransferStockDto {
  fromStockLevelId: string;
  toStockLevelId: string;
  quantity: number;
  note?: string;
}

interface StockMovementListQueryDto extends PaginationParams {
  stockLevelId?: string;
  productId?: string;
  variantId?: string;
  warehouseId?: string;
  type?: StockMovementType;
  startDate?: string;
  endDate?: string;
}

interface LowStockQueryDto extends PaginationParams {
  warehouseId?: string;
  threshold?: number;
}

interface StockLevelQueryDto extends PaginationParams {
  productId?: string;
  variantId?: string;
  warehouseId?: string;
  locationId?: string;
  filter?: 'low' | 'out' | 'normal';
}

export const inventoryService = {
  /**
   * Get all stock levels with pagination and filtering
   */
  async getStockLevels(params?: StockLevelQueryDto): Promise<PaginatedResponse<StockLevel>> {
    const response = await apiClient.getPaginated<StockLevel>(
      API_ENDPOINTS.INVENTORY.LEVELS,
      params
    );
    return response;
  },

  /**
   * Get stock level by ID
   */
  async getStockLevel(id: string): Promise<StockLevel> {
    const response = await apiClient.get<StockLevel>(API_ENDPOINTS.INVENTORY.LEVEL_DETAIL(id));
    return response.data;
  },

  /**
   * Adjust stock level quantity
   */
  async adjustStock(data: AdjustStockDto): Promise<{ stockLevel: StockLevel; movement: StockMovement }> {
    const response = await apiClient.post<{ stockLevel: StockLevel; movement: StockMovement }>(
      API_ENDPOINTS.INVENTORY.ADJUST,
      data
    );
    return response.data;
  },

  /**
   * Create a stock movement record
   */
  async createStockMovement(data: CreateStockMovementDto): Promise<{ stockLevel: StockLevel; movement: StockMovement }> {
    const response = await apiClient.post<{ stockLevel: StockLevel; movement: StockMovement }>(
      `${API_ENDPOINTS.INVENTORY.MOVEMENTS}/create`,
      data
    );
    return response.data;
  },

  /**
   * List stock movements with pagination
   */
  async getStockMovements(params?: StockMovementListQueryDto): Promise<PaginatedResponse<StockMovement>> {
    const response = await apiClient.getPaginated<StockMovement>(
      API_ENDPOINTS.INVENTORY.MOVEMENTS,
      params
    );
    return response;
  },

  /**
   * Get low stock items/variants
   */
  async getLowStockAlerts(params?: LowStockQueryDto): Promise<PaginatedResponse<StockLevel>> {
    const response = await apiClient.getPaginated<StockLevel>(
      API_ENDPOINTS.INVENTORY.LOW_STOCK,
      params
    );
    return response;
  },

  /**
   * Transfer stock between warehouses/locations
   */
  async transferStock(data: TransferStockDto): Promise<{ from: StockLevel; to: StockLevel; outMovement: StockMovement; inMovement: StockMovement }> {
    const response = await apiClient.post<{ from: StockLevel; to: StockLevel; outMovement: StockMovement; inMovement: StockMovement }>(
      API_ENDPOINTS.INVENTORY.TRANSFER,
      data
    );
    return response.data;
  },

  /**
   * Get stock history for a product/variant
   */
  async getStockHistory(params?: StockMovementListQueryDto): Promise<StockMovement[]> {
    const response = await apiClient.get<StockMovement[]>(
      `${API_ENDPOINTS.INVENTORY.MOVEMENTS}/history`,
      params
    );
    return Array.isArray(response) ? response : response.data || [];
  },
};
