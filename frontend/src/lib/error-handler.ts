import type { ApiError } from '@/types';

export class ErrorHandler {
  static handleApiError(error: any): string {
    // Handle Axios errors
    if (error?.response) {
      const apiError = error.response.data as ApiError;
      
      if (apiError?.message) {
        return apiError.message;
      }
      
      if (apiError?.errors && apiError.errors.length > 0) {
        return apiError.errors.map((e) => e.message).join(', ');
      }
      
      // Handle specific error codes
      if (apiError?.code === 'P2002') {
        return 'This record already exists';
      }
      if (apiError?.code === 'P2025') {
        return 'Record not found';
      }
      if (apiError?.code === 'P2003') {
        return 'Related record not found';
      }
      
      // Handle HTTP status codes
      switch (error.response.status) {
        case 400:
          return 'Invalid request';
        case 401:
          return 'Unauthorized access';
        case 403:
          return 'Access forbidden';
        case 404:
          return 'Resource not found';
        case 409:
          return 'Conflict: Record already exists';
        case 500:
          return 'Internal server error';
        default:
          return 'An unexpected error occurred';
      }
    }
    
    // Handle network errors
    if (error?.code === 'ERR_NETWORK') {
      return 'Network error. Please check your connection.';
    }
    
    // Handle timeout errors
    if (error?.code === 'ECONNABORTED') {
      return 'Request timeout. Please try again.';
    }
    
    // Default error message
    return error?.message || 'An unexpected error occurred';
  }

  static handleFormError(error: any): Record<string, string> {
    const errors: Record<string, string> = {};
    
    if (error?.response?.data?.errors) {
      error.response.data.errors.forEach((err: any) => {
        if (err.field) {
          errors[err.field] = err.message;
        }
      });
    }
    
    return errors;
  }

  static isNetworkError(error: any): boolean {
    return error?.code === 'ERR_NETWORK' || error?.code === 'ECONNABORTED';
  }

  static isAuthError(error: any): boolean {
    return error?.response?.status === 401;
  }

  static isNotFoundError(error: any): boolean {
    return error?.response?.status === 404;
  }

  static isConflictError(error: any): boolean {
    return error?.response?.status === 409;
  }
}
