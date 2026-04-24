import apiClient from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import {
  PurchaseOrder,
  CreatePurchaseOrderData,
  PurchaseOrderListParams,
  PaginatedResponse,
  GoodsReceiptNote,
  CreateGoodsReceiptData,
} from '@/types';

export const purchaseOrderService = {
  /**
   * Get all purchase orders with pagination, filtering, and sorting
   */
  async getPurchaseOrders(
    params?: PurchaseOrderListParams,
  ): Promise<PaginatedResponse<PurchaseOrder>> {
    const response = await apiClient.getPaginated<PurchaseOrder>(
      API_ENDPOINTS.PURCHASE_ORDERS.LIST,
      params,
    );
    return response;
  },

  /**
   * Get purchase order by ID with items and receipts
   */
  async getPurchaseOrder(id: string): Promise<PurchaseOrder> {
    const response = await apiClient.get<PurchaseOrder>(
      API_ENDPOINTS.PURCHASE_ORDERS.DETAIL(id),
    );
    return response.data;
  },

  /**
   * Create new purchase order
   */
  async createPurchaseOrder(data: CreatePurchaseOrderData): Promise<PurchaseOrder> {
    const response = await apiClient.post<PurchaseOrder>(
      API_ENDPOINTS.PURCHASE_ORDERS.CREATE,
      data,
    );
    return response.data;
  },

  /**
   * Update purchase order
   */
  async updatePurchaseOrder(
    id: string,
    data: Partial<CreatePurchaseOrderData>,
  ): Promise<PurchaseOrder> {
    const response = await apiClient.patch<PurchaseOrder>(
      API_ENDPOINTS.PURCHASE_ORDERS.UPDATE(id),
      data,
    );
    return response.data;
  },

  /**
   * Delete purchase order
   */
  async deletePurchaseOrder(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.PURCHASE_ORDERS.DELETE(id));
  },

  /**
   * Approve purchase order
   */
  async approvePurchaseOrder(id: string): Promise<PurchaseOrder> {
    const response = await apiClient.post<PurchaseOrder>(
      API_ENDPOINTS.PURCHASE_ORDERS.APPROVE(id),
    );
    return response.data;
  },

  /**
   * Reject purchase order
   */
  async rejectPurchaseOrder(id: string, reason?: string): Promise<PurchaseOrder> {
    const response = await apiClient.post<PurchaseOrder>(
      API_ENDPOINTS.PURCHASE_ORDERS.REJECT(id),
      { reason },
    );
    return response.data;
  },

  /**
   * Cancel purchase order
   */
  async cancelPurchaseOrder(id: string, reason?: string): Promise<PurchaseOrder> {
    const response = await apiClient.post<PurchaseOrder>(
      API_ENDPOINTS.PURCHASE_ORDERS.CANCEL(id),
      { reason },
    );
    return response.data;
  },

  // ─── Goods Receipt Notes ───────────────────────────────────────────────

  /**
   * Get goods receipt notes
   */
  async getGoodsReceipts(
    params?: Record<string, any>,
  ): Promise<PaginatedResponse<GoodsReceiptNote>> {
    const response = await apiClient.getPaginated<GoodsReceiptNote>(
      API_ENDPOINTS.GOODS_RECEIPTS.LIST,
      params,
    );
    return response;
  },

  /**
   * Get goods receipt note by ID
   */
  async getGoodsReceipt(id: string): Promise<GoodsReceiptNote> {
    const response = await apiClient.get<GoodsReceiptNote>(
      API_ENDPOINTS.GOODS_RECEIPTS.DETAIL(id),
    );
    return response.data;
  },

  /**
   * Create goods receipt note
   */
  async createGoodsReceipt(data: CreateGoodsReceiptData): Promise<GoodsReceiptNote> {
    const response = await apiClient.post<GoodsReceiptNote>(
      API_ENDPOINTS.GOODS_RECEIPTS.CREATE,
      data,
    );
    return response.data;
  },

  /**
   * Complete goods receipt note (finalize)
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
  async cancelGoodsReceipt(id: string, reason?: string): Promise<GoodsReceiptNote> {
    const response = await apiClient.post<GoodsReceiptNote>(
      API_ENDPOINTS.GOODS_RECEIPTS.CANCEL(id),
      { reason },
    );
    return response.data;
  },
};
