import apiClient from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { Category, PaginatedResponse, PaginationParams } from '@/types';

interface CreateCategoryData {
  name: string;
  description?: string;
  parentId?: string;
}

interface UpdateCategoryData extends Partial<CreateCategoryData> {}

export const categoryService = {
  /**
   * Get all categories with pagination
   */
  async getCategories(params?: PaginationParams): Promise<PaginatedResponse<Category>> {
    const response = await apiClient.getPaginated<Category>(
      API_ENDPOINTS.CATEGORIES.LIST,
      params
    );
    return response;
  },

  /**
   * Get category tree
   */
  async getCategoryTree(): Promise<Category[]> {
    const response = await apiClient.get<Category[]>(API_ENDPOINTS.CATEGORIES.TREE);
    return response.data;
  },

  /**
   * Get category by ID
   */
  async getCategory(id: string): Promise<Category> {
    const response = await apiClient.get<Category>(API_ENDPOINTS.CATEGORIES.DETAIL(id));
    return response.data;
  },

  /**
   * Create new category
   */
  async createCategory(data: CreateCategoryData): Promise<Category> {
    const response = await apiClient.post<Category>(API_ENDPOINTS.CATEGORIES.CREATE, data);
    return response.data;
  },

  /**
   * Update category
   */
  async updateCategory(id: string, data: UpdateCategoryData): Promise<Category> {
    const response = await apiClient.patch<Category>(API_ENDPOINTS.CATEGORIES.UPDATE(id), data);
    return response.data;
  },

  /**
   * Delete category
   */
  async deleteCategory(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.CATEGORIES.DELETE(id));
  },
};
