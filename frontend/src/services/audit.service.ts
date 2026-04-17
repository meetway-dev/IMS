import apiClient from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { PaginatedResponse, PaginationParams } from '@/types';

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  actor?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface AuditLogFilters extends PaginationParams {
  action?: string;
  entityType?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  search?: string; // Frontend passes this, will be mapped to 'action'
}

export const auditService = {
  /**
   * Get all audit logs with pagination and filters
   */
  async getAuditLogs(params?: AuditLogFilters): Promise<PaginatedResponse<AuditLog>> {
    // Map 'search' parameter to 'action' since backend doesn't accept 'search'
    // but accepts 'action' with contains search
    const mappedParams = params ? { ...params } : {};
    
    if (mappedParams.search) {
      mappedParams.action = mappedParams.search;
      delete mappedParams.search;
    }
    
    const response = await apiClient.getPaginated<AuditLog>(
      API_ENDPOINTS.AUDIT.LIST,
      mappedParams
    );
    return response;
  },

  /**
   * Get audit log by ID
   */
  async getAuditLog(id: string): Promise<AuditLog> {
    const response = await apiClient.get<AuditLog>(API_ENDPOINTS.AUDIT.DETAIL(id));
    return response.data;
  },
};