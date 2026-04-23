import apiClient from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { PaginatedResponse, PaginationParams } from '@/types';

export interface UnitOfMeasure {
  id: string;
  name: string;
  slug: string;
  symbol: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateUnitOfMeasureData {
  name: string;
  slug?: string;
  symbol: string;
  description?: string;
}

interface UpdateUnitOfMeasureData extends Partial<CreateUnitOfMeasureData> {
  isActive?: boolean;
}

export const unitOfMeasureService = {
  /**
   * Get all units of measure with pagination
   */
  async getUnitOfMeasures(params?: PaginationParams): Promise<PaginatedResponse<UnitOfMeasure>> {
    const response = await apiClient.getPaginated<UnitOfMeasure>(
      API_ENDPOINTS.UNIT_OF_MEASURES.LIST,
      params
    );
    return response;
  },

  /**
   * Get all active units of measure (for dropdowns)
   */
  async getActiveUnitOfMeasures(): Promise<UnitOfMeasure[]> {
    const response = await apiClient.get<UnitOfMeasure[]>(API_ENDPOINTS.UNIT_OF_MEASURES.ACTIVE);
    // Handle both wrapped and direct array responses
    if (Array.isArray(response)) {
      return response;
    }
    return response.data;
  },

  /**
   * Get unit of measure by ID
   */
  async getUnitOfMeasure(id: string): Promise<UnitOfMeasure> {
    const response = await apiClient.get<UnitOfMeasure>(API_ENDPOINTS.UNIT_OF_MEASURES.DETAIL(id));
    return response.data;
  },

  /**
   * Create new unit of measure
   */
  async createUnitOfMeasure(data: CreateUnitOfMeasureData): Promise<UnitOfMeasure> {
    const response = await apiClient.post<UnitOfMeasure>(API_ENDPOINTS.UNIT_OF_MEASURES.CREATE, data);
    return response.data;
  },

  /**
   * Update unit of measure
   */
  async updateUnitOfMeasure(id: string, data: UpdateUnitOfMeasureData): Promise<UnitOfMeasure> {
    const response = await apiClient.patch<UnitOfMeasure>(API_ENDPOINTS.UNIT_OF_MEASURES.UPDATE(id), data);
    return response.data;
  },

  /**
   * Delete unit of measure
   */
  async deleteUnitOfMeasure(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.UNIT_OF_MEASURES.DELETE(id));
  },
};