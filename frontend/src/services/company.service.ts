import apiClient from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { Company, PaginatedResponse, PaginationParams } from '@/types';

interface CreateCompanyData {
  name: string;
  code?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  website?: string;
  description?: string;
  isActive?: boolean;
}

interface UpdateCompanyData extends Partial<CreateCompanyData> {
  isActive?: boolean;
}

interface ToggleCompanyStatusData {
  isActive: boolean;
}

export const companyService = {
  /**
   * Get all companies with pagination
   */
  async getCompanies(params?: PaginationParams): Promise<PaginatedResponse<Company>> {
    const response = await apiClient.getPaginated<Company>(
      API_ENDPOINTS.COMPANIES.LIST,
      params
    );
    return response;
  },

  /**
   * Get company by ID
   */
  async getCompany(id: string): Promise<Company> {
    const response = await apiClient.get<Company>(API_ENDPOINTS.COMPANIES.DETAIL(id));
    return response.data;
  },

  /**
   * Create new company
   */
  async createCompany(data: CreateCompanyData): Promise<Company> {
    const response = await apiClient.post<Company>(API_ENDPOINTS.COMPANIES.CREATE, data);
    return response.data;
  },

  /**
   * Update company
   */
  async updateCompany(id: string, data: UpdateCompanyData): Promise<Company> {
    const response = await apiClient.patch<Company>(
      API_ENDPOINTS.COMPANIES.UPDATE(id),
      data
    );
    return response.data;
  },

  /**
   * Delete company
   */
  async deleteCompany(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.COMPANIES.DELETE(id));
  },

  /**
   * Toggle company active status
   */
  async toggleCompanyStatus(id: string, isActive: boolean): Promise<Company> {
    const response = await apiClient.patch<Company>(
      API_ENDPOINTS.COMPANIES.UPDATE(id),
      { isActive }
    );
    return response.data;
  },
};