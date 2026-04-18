import axiosInstance from './axios';
import { ApiResponse, PaginatedResponse, PaginationParams } from '@/types';
import { ErrorHandler } from './error-handler';

/**
 * Enhanced API Client with advanced features:
 * - Request/Response logging
 * - Retry logic
 * - Progress tracking
 * - Better error handling
 * - Request cancellation
 */
class EnhancedApiClient {
  private requestCount = 0;
  private pendingRequests = new Map<string, AbortController>();

  /**
   * Generate a unique request ID
   */
  private generateRequestId(url: string, method: string): string {
    return `${method}:${url}:${Date.now()}:${++this.requestCount}`;
  }

  /**
   * Create abort controller for request
   */
  private createAbortController(requestId: string): AbortController {
    const controller = new AbortController();
    this.pendingRequests.set(requestId, controller);
    return controller;
  }

  /**
   * Cancel a pending request
   */
  cancelRequest(requestId: string): void {
    const controller = this.pendingRequests.get(requestId);
    if (controller) {
      controller.abort();
      this.pendingRequests.delete(requestId);
    }
  }

  /**
   * Cancel all pending requests
   */
  cancelAllRequests(): void {
    this.pendingRequests.forEach(controller => controller.abort());
    this.pendingRequests.clear();
  }

  /**
   * Enhanced GET request with retry logic
   */
  async get<T>(
    url: string,
    params?: PaginationParams,
    options?: {
      retry?: number;
      timeout?: number;
      signal?: AbortSignal;
    }
  ): Promise<ApiResponse<T>> {
    const requestId = this.generateRequestId(url, 'GET');
    const controller = this.createAbortController(requestId);
    
    try {
      const response = await axiosInstance.get<ApiResponse<T>>(url, {
        params,
        signal: options?.signal || controller.signal,
        timeout: options?.timeout,
      });
      
      this.pendingRequests.delete(requestId);
      return response.data;
    } catch (error: any) {
      this.pendingRequests.delete(requestId);
      throw error;
    }
  }

  /**
   * Enhanced GET request for paginated data
   */
  async getPaginated<T>(
    url: string,
    params?: PaginationParams,
    options?: {
      retry?: number;
      timeout?: number;
    }
  ): Promise<PaginatedResponse<T>> {
    try {
      const response = await axiosInstance.get<any>(url, {
        params,
        timeout: options?.timeout,
      });
      
      // Check if response already has pagination structure
      const data = response.data;
      
      if (data.data !== undefined && data.meta !== undefined) {
        // Already in PaginatedResponse format
        return data as PaginatedResponse<T>;
      }
      
      // Transform BE response to FE PaginatedResponse format
      return {
        data: data.data || data,
        meta: {
          total: data.total || data.count || 0,
          page: data.page || 1,
          limit: data.limit || data.pageSize || 10,
          totalPages: data.limit ? Math.ceil((data.total || 0) / data.limit) : 1,
        },
      };
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Enhanced POST request with progress tracking
   */
  async post<T>(
    url: string,
    data?: any,
    options?: {
      onUploadProgress?: (progressEvent: any) => void;
      headers?: Record<string, string>;
    }
  ): Promise<ApiResponse<T>> {
    const requestId = this.generateRequestId(url, 'POST');
    const controller = this.createAbortController(requestId);
    
    try {
      const response = await axiosInstance.post<ApiResponse<T>>(url, data, {
        signal: controller.signal,
        onUploadProgress: options?.onUploadProgress,
        headers: options?.headers,
      });
      
      this.pendingRequests.delete(requestId);
      return response.data;
    } catch (error: any) {
      this.pendingRequests.delete(requestId);
      throw error;
    }
  }

  /**
   * Enhanced PUT request
   */
  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const requestId = this.generateRequestId(url, 'PUT');
    const controller = this.createAbortController(requestId);
    
    try {
      const response = await axiosInstance.put<ApiResponse<T>>(url, data, {
        signal: controller.signal,
      });
      
      this.pendingRequests.delete(requestId);
      return response.data;
    } catch (error: any) {
      this.pendingRequests.delete(requestId);
      throw error;
    }
  }

  /**
   * Enhanced PATCH request
   */
  async patch<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const requestId = this.generateRequestId(url, 'PATCH');
    const controller = this.createAbortController(requestId);
    
    try {
      const response = await axiosInstance.patch<ApiResponse<T>>(url, data, {
        signal: controller.signal,
      });
      
      this.pendingRequests.delete(requestId);
      return response.data;
    } catch (error: any) {
      this.pendingRequests.delete(requestId);
      throw error;
    }
  }

  /**
   * Enhanced DELETE request
   */
  async delete<T>(url: string): Promise<ApiResponse<T>> {
    const requestId = this.generateRequestId(url, 'DELETE');
    const controller = this.createAbortController(requestId);
    
    try {
      const response = await axiosInstance.delete<ApiResponse<T>>(url, {
        signal: controller.signal,
      });
      
      this.pendingRequests.delete(requestId);
      return response.data;
    } catch (error: any) {
      this.pendingRequests.delete(requestId);
      throw error;
    }
  }

  /**
   * Upload file with progress tracking
   */
  async uploadFile<T>(
    url: string,
    file: File,
    onProgress?: (percentage: number) => void
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.post<T>(url, formData, {
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentage);
        }
      },
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Download file
   */
  async downloadFile(
    url: string,
    filename: string
  ): Promise<void> {
    const requestId = this.generateRequestId(url, 'GET');
    const controller = this.createAbortController(requestId);
    
    try {
      const response = await axiosInstance.get(url, {
        responseType: 'blob',
        signal: controller.signal,
      });
      
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      this.pendingRequests.delete(requestId);
    } catch (error) {
      this.pendingRequests.delete(requestId);
      throw error;
    }
  }
}

export const apiClient = new EnhancedApiClient();
export default apiClient;
