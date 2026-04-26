/**
 * Pagination primitives shared between backend and frontend.
 *
 * Constants, meta shapes, and query helpers live here so both
 * sides agree on defaults and page-size options.
 *
 * @module pagination.types
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Default number of rows per page when none is specified. */
export const DEFAULT_PAGE_SIZE = 20;

/** Allowed page-size values exposed in UI dropdowns. */
export const PAGE_SIZE_OPTIONS = [10, 20, 30, 50] as const;

/** Utility type derived from `PAGE_SIZE_OPTIONS`. */
export type PageSizeOption = (typeof PAGE_SIZE_OPTIONS)[number];

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

/** Metadata block returned alongside every paginated list. */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/** Generic wrapper: data rows + pagination metadata. */
export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

// ---------------------------------------------------------------------------
// Query types (used by callers to request a page of data)
// ---------------------------------------------------------------------------

/** Base query params accepted by all paginated list endpoints. */
export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  /** Allow additional filter keys without explicit declaration. */
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Builder helpers (used internally by backend query builders)
// ---------------------------------------------------------------------------

/** Options for full-text search across multiple model fields. */
export interface SearchOptions {
  term?: string;
  fields: string[];
  mode?: 'insensitive' | 'default';
}

/** Arbitrary key-value filter map. */
export interface FilterOptions {
  [key: string]: unknown;
}

/** Sort directive for a single column. */
export interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}

/** Composite options bag passed to the query-builder layer. */
export interface QueryBuilderOptions<_T = unknown> {
  search?: SearchOptions;
  filters?: FilterOptions;
  sort?: SortOptions;
  pagination?: {
    page: number;
    limit: number;
  };
  include?: Record<string, unknown>;
}
