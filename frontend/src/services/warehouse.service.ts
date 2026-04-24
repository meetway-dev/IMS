import apiClient from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import {
  Warehouse,
  WarehouseStatistics,
  CreateWarehouseData,
  UpdateWarehouseData,
  WarehouseListParams,
  PaginatedResponse,
  WarehouseLocation,
  CreateLocationData,
  UpdateLocationData,
} from '@/types';

export const warehouseService = {
  /**
   * Get all warehouses with pagination, filtering, and sorting
   */
  async getWarehouses(params?: WarehouseListParams): Promise<PaginatedResponse<Warehouse>> {
    const response = await apiClient.getPaginated<Warehouse>(
      API_ENDPOINTS.WAREHOUSES.LIST,
      params,
    );
    return response;
  },

  /**
   * Get warehouse by ID with related data
   */
  async getWarehouse(id: string): Promise<Warehouse> {
    const response = await apiClient.get<Warehouse>(API_ENDPOINTS.WAREHOUSES.DETAIL(id));
    return response.data;
  },

  /**
   * Create new warehouse
   */
  async createWarehouse(data: CreateWarehouseData): Promise<Warehouse> {
    const response = await apiClient.post<Warehouse>(API_ENDPOINTS.WAREHOUSES.CREATE, data);
    return response.data;
  },

  /**
   * Update warehouse
   */
  async updateWarehouse(id: string, data: UpdateWarehouseData): Promise<Warehouse> {
    const response = await apiClient.patch<Warehouse>(API_ENDPOINTS.WAREHOUSES.UPDATE(id), data);
    return response.data;
  },

  /**
   * Delete warehouse (soft delete)
   */
  async deleteWarehouse(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.WAREHOUSES.DELETE(id));
  },

  /**
   * Archive warehouse (set inactive)
   */
  async archiveWarehouse(id: string): Promise<Warehouse> {
    const response = await apiClient.post<Warehouse>(API_ENDPOINTS.WAREHOUSES.ARCHIVE(id));
    return response.data;
  },

  /**
   * Get warehouse statistics
   */
  async getWarehouseStatistics(id: string): Promise<WarehouseStatistics> {
    const response = await apiClient.get<WarehouseStatistics>(
      API_ENDPOINTS.WAREHOUSES.STATISTICS(id),
    );
    return response.data;
  },

  // ─── Location Management ───────────────────────────────────────────────

  /**
   * Get locations for a warehouse
   */
  async getLocations(
    warehouseId: string,
    params?: Record<string, any>,
  ): Promise<PaginatedResponse<WarehouseLocation>> {
    const response = await apiClient.getPaginated<WarehouseLocation>(
      API_ENDPOINTS.LOCATIONS.LIST(warehouseId),
      params,
    );
    return response;
  },

  /**
   * Get a single location
   */
  async getLocation(warehouseId: string, locationId: string): Promise<WarehouseLocation> {
    const response = await apiClient.get<WarehouseLocation>(
      API_ENDPOINTS.LOCATIONS.DETAIL(warehouseId, locationId),
    );
    return response.data;
  },

  /**
   * Create a new location in a warehouse
   */
  async createLocation(warehouseId: string, data: CreateLocationData): Promise<WarehouseLocation> {
    const response = await apiClient.post<WarehouseLocation>(
      API_ENDPOINTS.LOCATIONS.CREATE(warehouseId),
      data,
    );
    return response.data;
  },

  /**
   * Update a location
   */
  async updateLocation(
    warehouseId: string,
    locationId: string,
    data: UpdateLocationData,
  ): Promise<WarehouseLocation> {
    const response = await apiClient.patch<WarehouseLocation>(
      API_ENDPOINTS.LOCATIONS.UPDATE(warehouseId, locationId),
      data,
    );
    return response.data;
  },

  /**
   * Delete a location
   */
  async deleteLocation(warehouseId: string, locationId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.LOCATIONS.DELETE(warehouseId, locationId));
  },
};
