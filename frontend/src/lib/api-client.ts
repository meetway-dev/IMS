import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { STORAGE_KEYS, API_ENDPOINTS } from './constants';
import { ApiResponse, PaginatedResponse, PaginationParams } from '@/types';

// ── Axios instance with auth interceptors ──────────────────────────────────

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach auth token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// Response interceptor — handle 401 with token refresh
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = typeof window !== 'undefined'
          ? localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
          : null;

        if (!refreshToken) throw new Error('No refresh token available');

        const response = await axiosInstance.post(API_ENDPOINTS.AUTH.REFRESH, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data;

        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
          if (newRefreshToken) localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
          document.cookie = `access_token=${accessToken}; path=/; max-age=900; SameSite=Strict`;
        }

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER);
          document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    const errorMessage = (error.response?.data as any)?.message || (error as any).message || 'An error occurred';
    return Promise.reject({ ...error, message: errorMessage, statusCode: error.response?.status || 500 });
  },
);

export { axiosInstance };

// ── Enhanced API Client ────────────────────────────────────────────────────

class ApiClient {
  private requestCount = 0;
  private pendingRequests = new Map<string, AbortController>();

  private generateRequestId(url: string, method: string): string {
    return `${method}:${url}:${Date.now()}:${++this.requestCount}`;
  }

  private createAbortController(requestId: string): AbortController {
    const controller = new AbortController();
    this.pendingRequests.set(requestId, controller);
    return controller;
  }

  cancelRequest(requestId: string): void {
    const controller = this.pendingRequests.get(requestId);
    if (controller) {
      controller.abort();
      this.pendingRequests.delete(requestId);
    }
  }

  cancelAllRequests(): void {
    this.pendingRequests.forEach(controller => controller.abort());
    this.pendingRequests.clear();
  }

  async get<T>(url: string, params?: PaginationParams, options?: { signal?: AbortSignal; timeout?: number }): Promise<ApiResponse<T>> {
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
    } catch (error) {
      this.pendingRequests.delete(requestId);
      throw error;
    }
  }

  async getPaginated<T>(url: string, params?: PaginationParams, options?: { timeout?: number }): Promise<PaginatedResponse<T>> {
    try {
      const response = await axiosInstance.get<any>(url, { params, timeout: options?.timeout });
      const data = response.data;

      if (data.data !== undefined && data.meta !== undefined) {
        return data as PaginatedResponse<T>;
      }

      return {
        data: data.data || data,
        meta: {
          total: data.total || data.count || 0,
          page: data.page || 1,
          limit: data.limit || data.pageSize || 10,
          totalPages: data.limit ? Math.ceil((data.total || 0) / data.limit) : 1,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async post<T>(url: string, data?: any, options?: { onUploadProgress?: (progressEvent: any) => void; headers?: Record<string, string> }): Promise<ApiResponse<T>> {
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
    } catch (error) {
      this.pendingRequests.delete(requestId);
      throw error;
    }
  }

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const requestId = this.generateRequestId(url, 'PUT');
    const controller = this.createAbortController(requestId);
    try {
      const response = await axiosInstance.put<ApiResponse<T>>(url, data, { signal: controller.signal });
      this.pendingRequests.delete(requestId);
      return response.data;
    } catch (error) {
      this.pendingRequests.delete(requestId);
      throw error;
    }
  }

  async patch<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const requestId = this.generateRequestId(url, 'PATCH');
    const controller = this.createAbortController(requestId);
    try {
      const response = await axiosInstance.patch<ApiResponse<T>>(url, data, { signal: controller.signal });
      this.pendingRequests.delete(requestId);
      return response.data;
    } catch (error) {
      this.pendingRequests.delete(requestId);
      throw error;
    }
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    const requestId = this.generateRequestId(url, 'DELETE');
    const controller = this.createAbortController(requestId);
    try {
      const response = await axiosInstance.delete<ApiResponse<T>>(url, { signal: controller.signal });
      this.pendingRequests.delete(requestId);
      return response.data;
    } catch (error) {
      this.pendingRequests.delete(requestId);
      throw error;
    }
  }

  async uploadFile<T>(url: string, file: File, onProgress?: (percentage: number) => void): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.post<T>(url, formData, {
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        }
      },
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  async downloadFile(url: string, filename: string): Promise<void> {
    const requestId = this.generateRequestId(url, 'GET');
    const controller = this.createAbortController(requestId);
    try {
      const response = await axiosInstance.get(url, { responseType: 'blob', signal: controller.signal });
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

export const apiClient = new ApiClient();
export default apiClient;
