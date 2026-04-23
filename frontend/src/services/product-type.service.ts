import apiClient from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { PaginatedResponse, PaginationParams } from '@/types';

export interface ProductType {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateProductTypeData {
  name: string;
  slug?: string;
  description?: string;
}

interface UpdateProductTypeData extends Partial<CreateProductTypeData> {
  isActive?: boolean;
}

export const productTypeService = {
  /**
   * Get all product types with pagination
   */
  async getProductTypes(params?: PaginationParams): Promise<PaginatedResponse<ProductType>> {
    const response = await apiClient.getPaginated<ProductType>(
      API_ENDPOINTS.PRODUCT_TYPES.LIST,
      params
    );
    return response;
  },

  /**
   * Get all active product types (for dropdowns)
   */
  async getActiveProductTypes(): Promise<ProductType[]> {
    const response = await apiClient.get<ProductType[]>(API_ENDPOINTS.PRODUCT_TYPES.ACTIVE);
    // Handle both wrapped and direct array responses
    if (Array.isArray(response)) {
      return response;
    }
    return response.data;
  },

  /**
   * Get product type by ID
   */
  async getProductType(id: string): Promise<ProductType> {
    const response = await apiClient.get<ProductType>(API_ENDPOINTS.PRODUCT_TYPES.DETAIL(id));
    return response.data;
  },

  /**
   * Create new product type
   */
  async createProductType(data: CreateProductTypeData): Promise<ProductType> {
    const response = await apiClient.post<ProductType>(API_ENDPOINTS.PRODUCT_TYPES.CREATE, data);
    return response.data;
  },

  /**
   * Update product type
   */
  async updateProductType(id: string, data: UpdateProductTypeData): Promise<ProductType> {
    const response = await apiClient.patch<ProductType>(API_ENDPOINTS.PRODUCT_TYPES.UPDATE(id), data);
    return response.data;
  },

  /**
   * Delete product type
   */
  async deleteProductType(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.PRODUCT_TYPES.DELETE(id));
  },
};