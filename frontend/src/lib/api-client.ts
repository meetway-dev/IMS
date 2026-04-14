import axiosInstance from './axios';
import { ApiResponse, ApiError, PaginatedResponse, PaginationParams } from '@/types';

class ApiClient {
  async get<T>(url: string, params?: PaginationParams): Promise<ApiResponse<T>> {
    const response = await axiosInstance.get<ApiResponse<T>>(url, { params });
    return response.data;
  }

  async getPaginated<T>(
    url: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<T>> {
    const response = await axiosInstance.get<PaginatedResponse<T>>(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await axiosInstance.post<ApiResponse<T>>(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await axiosInstance.put<ApiResponse<T>>(url, data);
    return response.data;
  }

  async patch<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await axiosInstance.patch<ApiResponse<T>>(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    const response = await axiosInstance.delete<ApiResponse<T>>(url);
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
