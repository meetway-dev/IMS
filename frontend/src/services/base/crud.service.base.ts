import apiClient from '@/lib/api-client';
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from '@/types';
import { ErrorHandler } from '@/lib/error-handler';

export interface CrudServiceOptions {
  endpoint: string;
  defaultLimit?: number;
  maxLimit?: number;
}

export abstract class CrudServiceBase<T, TCreateDto, TUpdateDto> {
  protected readonly endpoint: string;
  protected readonly defaultLimit: number;
  protected readonly maxLimit: number;

  constructor(options: CrudServiceOptions | string) {
    if (typeof options === 'string') {
      this.endpoint = options;
      this.defaultLimit = 20;
      this.maxLimit = 100;
    } else {
      this.endpoint = options.endpoint;
      this.defaultLimit = options.defaultLimit || 20;
      this.maxLimit = options.maxLimit || 100;
    }
  }

  /**
   * Get the base endpoint for this service
   */
  getEndpoint(): string {
    return this.endpoint;
  }

  /**
   * Get all records with pagination
   */
  async getAll(params?: PaginationParams): Promise<PaginatedResponse<T>> {
    try {
      const safeParams = this.sanitizePaginationParams(params);
      return await apiClient.getPaginated(this.getEndpoint(), safeParams);
    } catch (error) {
      throw ErrorHandler.handleApiError(error);
    }
  }

  /**
   * Get a single record by ID
   */
  async getById(id: string): Promise<T> {
    try {
      const response = await apiClient.get<ApiResponse<T>>(`${this.getEndpoint()}/${id}`);
      return response.data.data;
    } catch (error) {
      throw ErrorHandler.handleApiError(error);
    }
  }

  /**
   * Create a new record
   */
  async create(data: TCreateDto): Promise<T> {
    try {
      const response = await apiClient.post<ApiResponse<T>>(this.getEndpoint(), data);
      return response.data.data;
    } catch (error) {
      throw ErrorHandler.handleApiError(error);
    }
  }

  /**
   * Update an existing record
   */
  async update(id: string, data: TUpdateDto): Promise<T> {
    try {
      const response = await apiClient.patch<ApiResponse<T>>(`${this.getEndpoint()}/${id}`, data);
      return response.data.data;
    } catch (error) {
      throw ErrorHandler.handleApiError(error);
    }
  }

  /**
   * Delete a record
   */
  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.getEndpoint()}/${id}`);
    } catch (error) {
      throw ErrorHandler.handleApiError(error);
    }
  }

  /**
   * Search records with custom query parameters
   */
  async search(
    searchTerm: string,
    searchFields: string[],
    params?: PaginationParams & { searchFields?: string }
  ): Promise<PaginatedResponse<T>> {
    try {
      const safeParams = this.sanitizePaginationParams({
        ...params,
        search: searchTerm,
        searchFields: searchFields.join(','),
      });
      return await apiClient.getPaginated(this.getEndpoint(), safeParams);
    } catch (error) {
      throw ErrorHandler.handleApiError(error);
    }
  }

  /**
   * Get all records without pagination (for exports, etc.)
   */
  async getAllWithoutPagination(filters?: Record<string, any>): Promise<T[]> {
    try {
      const response = await apiClient.get<ApiResponse<T[]>>(this.getEndpoint(), {
        ...filters,
        limit: -1, // Signal to backend to return all
      });
      return response.data.data;
    } catch (error) {
      throw ErrorHandler.handleApiError(error);
    }
  }

  /**
   * Sanitize pagination parameters
   */
  protected sanitizePaginationParams(params?: PaginationParams): PaginationParams {
    if (!params) {
      return {
        page: 1,
        limit: this.defaultLimit,
      };
    }

    const page = Math.max(1, params.page || 1);
    const limit = Math.min(
      Math.max(1, params.limit || this.defaultLimit),
      this.maxLimit
    );

    return {
      ...params,
      page,
      limit,
    };
  }

  /**
   * Build URL with query parameters
   */
  protected buildUrl(path: string, params?: Record<string, any>): string {
    if (!params || Object.keys(params).length === 0) {
      return path;
    }

    const queryString = new URLSearchParams(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => [key, String(value)])
    ).toString();

    return queryString ? `${path}?${queryString}` : path;
  }
}
