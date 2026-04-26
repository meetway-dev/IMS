/**
 * Generic CRUD service base for frontend API consumers.
 *
 * Extend this class for simple domain entities that follow the
 * standard list / get / create / update / delete pattern.
 *
 * @module crud.service.base
 */

import apiClient from '@/lib/api-client';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types';
import { ErrorHandler } from '@/lib/error-handler';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

export interface CrudServiceOptions {
  /** API endpoint path (e.g. `/products`). */
  endpoint: string;
  /** Default page size when none is provided. */
  defaultLimit?: number;
  /** Maximum page size the server allows. */
  maxLimit?: number;
}

// ---------------------------------------------------------------------------
// Base class
// ---------------------------------------------------------------------------

export abstract class CrudServiceBase<T, TCreateDto, TUpdateDto> {
  protected readonly endpoint: string;
  protected readonly defaultLimit: number;
  protected readonly maxLimit: number;

  constructor(options: CrudServiceOptions | string) {
    if (typeof options === 'string') {
      this.endpoint = options;
      this.defaultLimit = DEFAULT_PAGE_SIZE;
      this.maxLimit = 100;
    } else {
      this.endpoint = options.endpoint;
      this.defaultLimit = options.defaultLimit ?? DEFAULT_PAGE_SIZE;
      this.maxLimit = options.maxLimit ?? 100;
    }
  }

  /** The base API path for this resource. */
  getEndpoint(): string {
    return this.endpoint;
  }

  /** List records with pagination, search, and sorting. */
  async getAll(params?: PaginationParams): Promise<PaginatedResponse<T>> {
    try {
      const safeParams = this.sanitizePaginationParams(params);
      return await apiClient.getPaginated(this.getEndpoint(), safeParams);
    } catch (error) {
      throw ErrorHandler.handleApiError(error);
    }
  }

  /** Fetch a single record by ID. */
  async getById(id: string): Promise<T> {
    try {
      const response = await apiClient.get<ApiResponse<T>>(
        `${this.getEndpoint()}/${id}`,
      );
      return response.data.data;
    } catch (error) {
      throw ErrorHandler.handleApiError(error);
    }
  }

  /** Create a new record. */
  async create(data: TCreateDto): Promise<T> {
    try {
      const response = await apiClient.post<ApiResponse<T>>(
        this.getEndpoint(),
        data,
      );
      return response.data.data;
    } catch (error) {
      throw ErrorHandler.handleApiError(error);
    }
  }

  /** Update an existing record. */
  async update(id: string, data: TUpdateDto): Promise<T> {
    try {
      const response = await apiClient.patch<ApiResponse<T>>(
        `${this.getEndpoint()}/${id}`,
        data,
      );
      return response.data.data;
    } catch (error) {
      throw ErrorHandler.handleApiError(error);
    }
  }

  /** Delete a record. */
  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.getEndpoint()}/${id}`);
    } catch (error) {
      throw ErrorHandler.handleApiError(error);
    }
  }

  /** Search with custom query parameters. */
  async search(
    searchTerm: string,
    searchFields: string[],
    params?: PaginationParams & { searchFields?: string },
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

  // ── Helpers ─────────────────────────────────────────────────────────────

  /** Clamp page/limit to safe bounds. */
  protected sanitizePaginationParams(
    params?: PaginationParams,
  ): PaginationParams {
    if (!params) return { page: 1, limit: this.defaultLimit };

    return {
      ...params,
      page: Math.max(1, params.page ?? 1),
      limit: Math.min(
        Math.max(1, params.limit ?? this.defaultLimit),
        this.maxLimit,
      ),
    };
  }

  /** Build a URL with non-empty query parameters. */
  protected buildUrl(path: string, params?: Record<string, unknown>): string {
    if (!params || Object.keys(params).length === 0) return path;

    const qs = new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => [k, String(v)]),
    ).toString();

    return qs ? `${path}?${qs}` : path;
  }
}
