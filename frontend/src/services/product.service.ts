import apiClient from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { Product, PaginatedResponse, PaginationParams } from '@/types';

interface CreateProductData {
  name: string;
  sku: string;
  barcode?: string;
  categoryId: string;
  typeId: string;
  unitId: string;
  price: number;
  cost: number;
  minStockLevel: number;
}

interface UpdateProductData extends Partial<CreateProductData> {
  isActive?: boolean;
}

// Transform frontend data to backend format
// NOTE: The backend CreateProductDto does NOT accept `description` — it is not in the
// Prisma Product model either. Do NOT send it or the ValidationPipe (forbidNonWhitelisted)
// will reject the entire request with 400.
function toBackendFormat(data: CreateProductData | UpdateProductData): any {
  const result: any = {};
  
  if (data.name !== undefined) result.name = data.name;
  if (data.sku !== undefined) result.sku = data.sku;
  if (data.barcode !== undefined) result.barcode = data.barcode;
  // description intentionally omitted — not supported by backend DTO / Prisma schema
  if (data.categoryId !== undefined) result.categoryId = data.categoryId;
  if (data.typeId !== undefined) result.typeId = data.typeId;
  if (data.unitId !== undefined) result.unitId = data.unitId;
  
  if (data.cost !== undefined) result.purchasePrice = data.cost.toString();
  if (data.price !== undefined) result.salePrice = data.price.toString();
  if (data.minStockLevel !== undefined) result.minStockAlert = data.minStockLevel;
  
  return result;
}

// Transform backend data to frontend format
function toFrontendFormat(data: any): Product {
  if (!data) {
    throw new Error('Cannot transform undefined/null data to Product');
  }

  return {
    id: data.id || '',
    name: data.name || '',
    sku: data.sku || '',
    barcode: data.barcode || undefined,
    categoryId: data.categoryId || '',
    typeId: data.typeId || '',
    unitId: data.unitId || '',
    type: data.type?.name || '', // Display name from relation
    unit: data.unit?.name || '', // Display name from relation
    price: data.salePrice ? parseFloat(data.salePrice) : 0,
    cost: data.purchasePrice ? parseFloat(data.purchasePrice) : 0,
    minStockLevel: data.minStockAlert || 0,
    stock: data.inventory?.stockQuantity || 0,
    isActive: !data.deletedAt,
    companyId: data.companyId || '',
    createdAt: data.createdAt || '',
    updatedAt: data.updatedAt || '',
    category: data.category,
  };
}

export const productService = {
  /**
   * Get all products with pagination
   */
  async getProducts(params?: PaginationParams): Promise<PaginatedResponse<Product>> {
    const response = await apiClient.getPaginated<any>(
      API_ENDPOINTS.PRODUCTS.LIST,
      params
    );
    return {
      ...response,
      data: response.data.map(toFrontendFormat),
    };
  },

  /**
   * Get product by ID
   */
  async getProduct(id: string): Promise<Product> {
    const response = await apiClient.get<any>(API_ENDPOINTS.PRODUCTS.DETAIL(id));
    return toFrontendFormat(response.data);
  },

  /**
   * Create new product
   */
  async createProduct(data: CreateProductData): Promise<Product> {
    const backendData = toBackendFormat(data);
    console.log('Creating product with backend data:', backendData);
    console.log('Endpoint:', API_ENDPOINTS.PRODUCTS.CREATE);
    try {
      const response = await apiClient.post<any>(API_ENDPOINTS.PRODUCTS.CREATE, backendData);
      console.log('API response (body):', response);
      console.log('Response data property:', response.data);
      console.log('Response data type:', typeof response.data);
      if (response.data === null || response.data === undefined) {
        throw new Error('API response data is null or undefined. Check backend validation and permissions.');
      }
      return toFrontendFormat(response.data);
    } catch (error) {
      console.error('Error in createProduct:', error);
      throw error;
    }
  },

  /**
   * Update product
   */
  async updateProduct(id: string, data: UpdateProductData): Promise<Product> {
    const backendData = toBackendFormat(data);
    const response = await apiClient.patch<any>(API_ENDPOINTS.PRODUCTS.UPDATE(id), backendData);
    return toFrontendFormat(response.data);
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
    const response = await apiClient.get<any>(API_ENDPOINTS.PRODUCTS.LIST, {
      search: query,
      limit: 20,
    });
    return response.data.map(toFrontendFormat);
  },
};
