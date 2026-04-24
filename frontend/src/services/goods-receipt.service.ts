import apiClient from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import {
  GoodsReceiptNote,
  CreateGoodsReceiptData,
  PaginatedResponse,
  PaginationParams,
  GoodsReceiptStatus,
} from '@/types';

export interface GoodsReceiptListParams extends PaginationParams {
  status?: GoodsReceiptStatus;
  purchaseOrderId?: string;
  warehouseId?: string;
  fromDate?: string;
  toDate?: string;
}

export const goodsReceiptService = {
  /**
   * Get all goods receipt notes with pagination, filtering, and sorting
   */
  async getGoodsReceipts(
    params?: GoodsReceiptListParams,
  ): Promise<PaginatedResponse<GoodsReceiptNote>> {
    const response = await apiClient.getPaginated<GoodsReceiptNote>(
      API_ENDPOINTS.GOODS_RECEIPTS.LIST,
      params,
    );
    return response;
  },

  /**
   * Get goods receipt note by ID with items
   */
  async getGoodsReceipt(id: string): Promise<GoodsReceiptNote> {
    const response = await apiClient.get<GoodsReceiptNote>(
      API_ENDPOINTS.GOODS_RECEIPTS.DETAIL(id),
    );
    return response.data;
  },

  /**
   * Create new goods receipt note
   */
  async createGoodsReceipt(data: CreateGoodsReceiptData): Promise<GoodsReceiptNote> {
    const response = await apiClient.post<GoodsReceiptNote>(
      API_ENDPOINTS.GOODS_RECEIPTS.CREATE,
      data,
    );
    return response.data;
  },

  /**
   * Update goods receipt note
   */
  async updateGoodsReceipt(id: string, data: Partial<CreateGoodsReceiptData>): Promise<GoodsReceiptNote> {
    const response = await apiClient.patch<GoodsReceiptNote>(
      API_ENDPOINTS.GOODS_RECEIPTS.UPDATE(id),
      data,
    );
    return response.data;
  },

  /**
   * Delete goods receipt note
   */
  async deleteGoodsReceipt(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.GOODS_RECEIPTS.DETAIL(id));
  },

  /**
   * Complete goods receipt note
   */
  async completeGoodsReceipt(id: string): Promise<GoodsReceiptNote> {
    const response = await apiClient.post<GoodsReceiptNote>(
      API_ENDPOINTS.GOODS_RECEIPTS.COMPLETE(id),
    );
    return response.data;
  },

  /**
   * Cancel goods receipt note
   */
  async cancelGoodsReceipt(id: string): Promise<GoodsReceiptNote> {
    const response = await apiClient.post<GoodsReceiptNote>(
      API_ENDPOINTS.GOODS_RECEIPTS.CANCEL(id),
    );
    return response.data;
  },
};