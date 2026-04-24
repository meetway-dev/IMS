import { useState, useCallback } from 'react';
import { useDebounce } from './use-debounce';
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '@/lib/constants';

interface UseServerSearchOptions {
  /** Debounce delay in ms (default: 400) */
  debounceMs?: number;
  /** Initial page size (default: 20) */
  initialPageSize?: number;
  /** Initial page number (default: 1) */
  initialPage?: number;
  /** Initial sort field */
  initialSortBy?: string | null;
  /** Initial sort order */
  initialSortOrder?: 'asc' | 'desc' | null;
}

/**
 * Reusable hook for server-side search and pagination with debounce.
 *
 * Returns the raw search value (for the controlled input), the debounced
 * value (to feed into React Query key), pagination state, and setters.
 *
 * @example
 * ```tsx
 * const { search, debouncedSearch, setSearch, page, pageSize, setPage, setPageSize } = useServerSearch();
 *
 * const { data } = useQuery({
 *   queryKey: ['products', { search: debouncedSearch, page, pageSize }],
 *   queryFn: () => productService.getProducts({ search: debouncedSearch, page, limit: pageSize }),
 * });
 *
 * <DataTable
 *   onSearchChange={setSearch}
 *   searchValue={search}
 *   totalCount={data?.meta.total}
 *   currentPage={page}
 *   pageSize={pageSize}
 *   onPageChange={setPage}
 *   onPageSizeChange={setPageSize}
 * />
 * ```
 */
export function useServerSearch(options?: UseServerSearchOptions) {
  const debounceMs = options?.debounceMs ?? 400;
  const initialPageSize = options?.initialPageSize ?? DEFAULT_PAGE_SIZE;
  const initialPage = options?.initialPage ?? 1;
  const initialSortBy = options?.initialSortBy ?? null;
  const initialSortOrder = options?.initialSortOrder ?? null;

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortBy, setSortBy] = useState<string | null>(initialSortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(initialSortOrder);
  
  const debouncedSearch = useDebounce(search, debounceMs);

  const clearSearch = useCallback(() => {
    setSearch('');
    setPage(1); // Reset to first page when clearing search
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(Math.max(1, newPage));
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when changing page size
  }, []);

  const handleSortChange = useCallback((newSortBy: string | null, newSortOrder: 'asc' | 'desc' | null) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPage(1); // Reset to first page when changing sort
  }, []);

  const resetPagination = useCallback(() => {
    setPage(1);
    setPageSize(initialPageSize);
    setSortBy(initialSortBy);
    setSortOrder(initialSortOrder);
  }, [initialPageSize, initialSortBy, initialSortOrder]);

  return {
    // Search state
    search,
    debouncedSearch,
    setSearch,
    clearSearch,
    
    // Pagination state
    page,
    pageSize,
    setPage: handlePageChange,
    setPageSize: handlePageSizeChange,
    
    // Sorting state
    sortBy,
    sortOrder,
    setSort: handleSortChange,
    
    resetPagination,
    
    // Combined query params for API calls
    queryParams: {
      search: debouncedSearch || undefined,
      page,
      limit: pageSize,
      sortBy: sortBy || undefined,
      sortOrder: sortOrder || undefined,
    },
  } as const;
}
