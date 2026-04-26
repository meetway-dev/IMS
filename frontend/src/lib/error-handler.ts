/**
 * Centralised error handling for API responses.
 *
 * All service-layer `catch` blocks should delegate to `ErrorHandler`
 * so that toast messages and form-level errors are consistent.
 *
 * @module error-handler
 */

import type { ApiError } from '@/types';

export class ErrorHandler {
  /**
   * Extract a human-readable message from an Axios error (or any
   * thrown value). Returns a string suitable for toast display.
   */
  static handleApiError(error: unknown): string {
    const err = error as Record<string, any> | undefined;

    // Axios response errors
    if (err?.response) {
      const apiError = err.response.data as ApiError | undefined;

      if (apiError?.message) return apiError.message;

      if (apiError?.errors && apiError.errors.length > 0) {
        return apiError.errors.map((e) => e.message).join(', ');
      }

      // Prisma error codes that leak through
      if (apiError?.code === 'P2002') return 'This record already exists';
      if (apiError?.code === 'P2025') return 'Record not found';
      if (apiError?.code === 'P2003') return 'Related record not found';

      // Fall back to HTTP status
      switch (err.response.status) {
        case 400: return 'Invalid request';
        case 401: return 'Unauthorized access';
        case 403: return 'Access forbidden';
        case 404: return 'Resource not found';
        case 409: return 'Conflict: Record already exists';
        case 500: return 'Internal server error';
        default:  return 'An unexpected error occurred';
      }
    }

    // Network / timeout
    if (err?.code === 'ERR_NETWORK') return 'Network error. Please check your connection.';
    if (err?.code === 'ECONNABORTED') return 'Request timeout. Please try again.';

    return (err?.message as string) || 'An unexpected error occurred';
  }

  /**
   * Extract field-level validation errors from an API response
   * into a `{ field: message }` map for use with form libraries.
   */
  static handleFormError(error: unknown): Record<string, string> {
    const errors: Record<string, string> = {};
    const err = error as Record<string, any> | undefined;

    if (err?.response?.data?.errors) {
      for (const e of err.response.data.errors) {
        if (e.field) errors[e.field] = e.message;
      }
    }

    return errors;
  }

  // ── Type guards ───────────────────────────────────────────────────────

  static isNetworkError(error: unknown): boolean {
    const code = (error as Record<string, any>)?.code;
    return code === 'ERR_NETWORK' || code === 'ECONNABORTED';
  }

  static isAuthError(error: unknown): boolean {
    return (error as Record<string, any>)?.response?.status === 401;
  }

  static isNotFoundError(error: unknown): boolean {
    return (error as Record<string, any>)?.response?.status === 404;
  }

  static isConflictError(error: unknown): boolean {
    return (error as Record<string, any>)?.response?.status === 409;
  }
}
