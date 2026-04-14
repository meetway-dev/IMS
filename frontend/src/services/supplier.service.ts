import apiClient from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { Supplier, PaginatedResponse, PaginationParams } from '@/types';

interface CreateSupplierData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
  notes?: string;
}

interface UpdateSupplierData extends Partial<CreateSupplierData> {}

export const supplierService = {
  /**
   * Get all suppliers with pagination
   */
  async getSuppliers(params?: PaginationParams): Promise<PaginatedResponse<Supplier>> {
    const response = await apiClient.getPaginated<Supplier>(
      API_ENDPOINTS.SUPPLIERS.LIST,
      params
    );
    return response;
  },

  /**
   * Get supplier by ID
   */
  async getSupplier(id: string): Promise<Supplier> {
    const response = await apiClient.get<Supplier>(API_ENDPOINTS.SUPPLIERS.DETAIL(id));
    return response.data;
  },

  /**
   * Create new supplier
   */
  async createSupplier(data: CreateSupplierData): Promise<Supplier> {
    const response = await apiClient.post<Supplier>(API_ENDPOINTS.SUPPLIERS.CREATE, data);
    return response.data;
  },

  /**
   * Update supplier
   */
  async updateSupplier(id: string, data: UpdateSupplierData): Promise<Supplier> {
    const response = await apiClient.patch<Supplier>(API_ENDPOINTS.SUPPLIERS.UPDATE(id), data);
    return response.data;
  },

  /**
   * Delete supplier
   */
  async deleteSupplier(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.SUPPLIERS.DELETE(id));
  },
};
