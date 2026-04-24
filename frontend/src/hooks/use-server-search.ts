import { useState, useCallback } from 'react';
import { useDebounce } from './use-debounce';

interface UseServerSearchOptions {
  /** Debounce delay in ms (default: 400) */
  debounceMs?: number;
}

/**
 * Reusable hook for server-side search with debounce.
 *
 * Returns the raw search value (for the controlled input), the debounced
 * value (to feed into React Query key), and a setter.
 *
 * @example
 * ```tsx
 * const { search, debouncedSearch, setSearch } = useServerSearch();
 *
 * const { data } = useQuery({
 *   queryKey: ['products', { search: debouncedSearch }],
 *   queryFn: () => productService.getProducts({ search: debouncedSearch }),
 * });
 *
 * <DataTable
 *   onSearchChange={setSearch}
 *   searchValue={search}
 *   totalCount={data?.meta.total}
 * />
 * ```
 */
export function useServerSearch(options?: UseServerSearchOptions) {
  const debounceMs = options?.debounceMs ?? 400;

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, debounceMs);

  const clearSearch = useCallback(() => setSearch(''), []);

  return { search, debouncedSearch, setSearch, clearSearch } as const;
}
