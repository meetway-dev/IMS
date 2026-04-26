/**
 * Shared API response and error types.
 *
 * These types define the contract between the backend API
 * and frontend consumers. Keep them in sync with the NestJS
 * response interceptors and error filters.
 *
 * @module api.types
 */

/** Standard envelope for single-resource API responses. */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: ValidationError[];
}

/** A single field-level validation error. */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Envelope for paginated list responses.
 *
 * The `meta` block mirrors the `PaginationMeta` shape so consumers
 * can drive pagination controls directly from the response.
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** Standard error response returned by the API. */
export interface ApiError {
  success: false;
  message: string;
  code?: string;
  errors?: ValidationError[];
  statusCode?: number;
}
