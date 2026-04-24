// Pagination Types

// Pagination constants
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 30, 50] as const;
export type PageSizeOption = typeof PAGE_SIZE_OPTIONS[number];

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: any;
}

export interface SearchOptions {
  term?: string;
  fields: string[];
  mode?: 'insensitive' | 'default';
}

export interface FilterOptions {
  [key: string]: any;
}

export interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}

// Helper types for query building
export interface QueryBuilderOptions<T> {
  search?: SearchOptions;
  filters?: FilterOptions;
  sort?: SortOptions;
  pagination?: {
    page: number;
    limit: number;
  };
  include?: Record<string, any>;
}