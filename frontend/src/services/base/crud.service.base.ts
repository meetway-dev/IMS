import apiClient from '@/lib/api-client';
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

export abstract class CrudServiceBase<T, TCreateDto, TUpdateDto> {
  /**
   * Get the base endpoint for this service (to be implemented by child classes)
   */
  abstract getEndpoint(): string;

  /**
   * Get all records with pagination
   */
  async getAll(params?: PaginationParams): Promise<PaginatedResponse<T>> {
    return apiClient.getPaginated(this.getEndpoint(), params);
  }

  /**
   * Get a single record by ID
   */
  async getById(id: string): Promise<T> {
    const response = await apiClient.get(`${this.getEndpoint()}/${id}`);
    return response.data as T;
  }

  /**
   * Create a new record
   */
  async create(data: TCreateDto): Promise<T> {
    const response = await apiClient.post(this.getEndpoint(), data);
    return response.data as T;
  }

  /**
   * Update an existing record
   */
  async update(id: string, data: TUpdateDto): Promise<T> {
    const response = await apiClient.patch(`${this.getEndpoint()}/${id}`, data);
    return response.data as T;
  }

  /**
   * Delete a record
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.getEndpoint()}/${id}`);
  }
}
