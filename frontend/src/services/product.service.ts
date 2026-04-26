/**
 * Product API service.
 *
 * Handles the FE <-> BE data transformation layer for products.
 * The backend uses `purchasePrice` / `salePrice` (string decimals)
 * while the frontend works with `cost` / `price` (numbers).
 *
 * @module product.service
 */

import apiClient from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import type { Product, PaginatedResponse, PaginationParams } from '@/types';

// ---------------------------------------------------------------------------
// DTO types (frontend-facing)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Transformers
// ---------------------------------------------------------------------------

/**
 * Map frontend field names to the backend DTO shape.
 *
 * NOTE: The backend `CreateProductDto` does NOT accept `description`.
 * Sending it will trigger a 400 from the `ValidationPipe`.
 */
function toBackendFormat(data: CreateProductData | UpdateProductData): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  if (data.name !== undefined) result.name = data.name;
  if (data.sku !== undefined) result.sku = data.sku;
  if (data.barcode !== undefined) result.barcode = data.barcode;
  if (data.categoryId !== undefined) result.categoryId = data.categoryId;
  if (data.typeId !== undefined) result.typeId = data.typeId;
  if (data.unitId !== undefined) result.unitId = data.unitId;
  if (data.cost !== undefined) result.purchasePrice = data.cost.toString();
  if (data.price !== undefined) result.salePrice = data.price.toString();
  if (data.minStockLevel !== undefined) result.minStockAlert = data.minStockLevel;

  return result;
}

/** Map a backend product row to the frontend `Product` shape. */
function toFrontendFormat(data: Record<string, unknown>): Product {
  if (!data) {
    throw new Error('Cannot transform undefined/null data to Product');
  }

  const raw = data as Record<string, any>;

  return {
    id: raw.id ?? '',
    name: raw.name ?? '',
    sku: raw.sku ?? '',
    barcode: raw.barcode ?? undefined,
    categoryId: raw.categoryId ?? '',
    typeId: raw.typeId ?? '',
    unitId: raw.unitId ?? '',
    type: raw.type?.name ?? '',
    unit: raw.unit?.name ?? '',
    price: raw.salePrice ? parseFloat(raw.salePrice) : 0,
    cost: raw.purchasePrice ? parseFloat(raw.purchasePrice) : 0,
    minStockLevel: raw.minStockAlert ?? 0,
    stock: raw.inventory?.stockQuantity ?? 0,
    isActive: !raw.deletedAt,
    companyId: raw.companyId ?? '',
    createdAt: raw.createdAt ?? '',
    updatedAt: raw.updatedAt ?? '',
    category: raw.category,
  };
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export const productService = {
  /** List products with pagination. */
  async getProducts(params?: PaginationParams): Promise<PaginatedResponse<Product>> {
    const response = await apiClient.getPaginated<any>(
      API_ENDPOINTS.PRODUCTS.LIST,
      params,
    );
    return {
      ...response,
      data: response.data.map(toFrontendFormat),
    };
  },

  /** Fetch a single product by ID. */
  async getProduct(id: string): Promise<Product> {
    const response = await apiClient.get<any>(API_ENDPOINTS.PRODUCTS.DETAIL(id));
    const data = response.data !== undefined ? response.data : response;
    if (data == null) {
      throw new Error('Product not found or API returned empty data.');
    }
    return toFrontendFormat(data);
  },

  /** Create a new product. */
  async createProduct(data: CreateProductData): Promise<Product> {
    const backendData = toBackendFormat(data);
    const response = await apiClient.post<any>(
      API_ENDPOINTS.PRODUCTS.CREATE,
      backendData,
    );
    const result = response.data !== undefined ? response.data : response;
    if (result == null) {
      throw new Error('Create failed: API returned empty data. Check backend validation and permissions.');
    }
    return toFrontendFormat(result);
  },

  /** Update an existing product. */
  async updateProduct(id: string, data: UpdateProductData): Promise<Product> {
    const backendData = toBackendFormat(data);
    const response = await apiClient.patch<any>(
      API_ENDPOINTS.PRODUCTS.UPDATE(id),
      backendData,
    );
    const result = response.data !== undefined ? response.data : response;
    if (result == null) {
      throw new Error('Update failed: API returned empty data.');
    }
    return toFrontendFormat(result);
  },

  /** Soft-delete a product. */
  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.PRODUCTS.DELETE(id));
  },

  /** Quick search for products (e.g. autocomplete). */
  async searchProducts(query: string): Promise<Product[]> {
    const response = await apiClient.get<any>(API_ENDPOINTS.PRODUCTS.LIST, {
      search: query,
      limit: 20,
    });
    const data = response.data !== undefined ? response.data : response;
    if (data == null) return [];
    const items = Array.isArray(data) ? data : (data.data ?? []);
    return items.map(toFrontendFormat);
  },
};
