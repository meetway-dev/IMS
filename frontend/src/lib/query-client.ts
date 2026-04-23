import { QueryClient } from '@tanstack/react-query';

// Create a new QueryClient instance with default configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Time in milliseconds that data remains fresh
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Time in milliseconds that inactive queries will remain in cache
      gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
      // Number of times to retry failed requests
      retry: 1,
      // Retry only on specific status codes
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus (can be disabled for better performance)
      refetchOnWindowFocus: false,
      // Refetch on reconnect
      refetchOnReconnect: true,
      // Refetch on mount
      refetchOnMount: true,
    },
    mutations: {
      // Mutations must NOT auto-retry — they have side effects (e.g. creating records).
      // A retry after a successful-but-misinterpreted call creates duplicates or
      // hits uniqueness constraints ("first success, second reject").
      retry: false,
    },
  },
});

export default queryClient;
