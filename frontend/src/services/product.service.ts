import apiClient from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { Product, PaginatedResponse, PaginationParams } from '@/types';

interface CreateProductData {
  name: string;
  sku: string;
  barcode?: string;
  description?: string;
  categoryId: string;
  price: number;
  cost: number;
  unit: string;
  minStockLevel: number;
}

interface UpdateProductData extends Partial<CreateProductData> {
  isActive?: boolean;
}

export const productService = {
  /**
   * Get all products with pagination
   */
  async getProducts(params?: PaginationParams): Promise<PaginatedResponse<Product>> {
    const response = await apiClient.getPaginated<Product>(
      API_ENDPOINTS.PRODUCTS.LIST,
      params
    );
    return response;
  },

  /**
   * Get product by ID
   */
  async getProduct(id: string): Promise<Product> {
    const response = await apiClient.get<Product>(API_ENDPOINTS.PRODUCTS.DETAIL(id));
    return response.data;
  },

  /**
   * Create new product
   */
  async createProduct(data: CreateProductData): Promise<Product> {
    const response = await apiClient.post<Product>(API_ENDPOINTS.PRODUCTS.CREATE, data);
    return response.data;
  },

  /**
   * Update product
   */
  async updateProduct(id: string, data: UpdateProductData): Promise<Product> {
    const response = await apiClient.put<Product>(API_ENDPOINTS.PRODUCTS.UPDATE(id), data);
    return response.data;
  },

  /**
   * Delete product
   */
  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.PRODUCTS.DELETE(id));
  },

  /**
   * Search products
   */
  async searchProducts(query: string): Promise<Product[]> {
    const response = await apiClient.get<Product[]>(API_ENDPOINTS.PRODUCTS.LIST, {
      search: query,
      limit: 20,
    });
    return response.data;
  },
};
