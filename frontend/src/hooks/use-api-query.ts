/**
 * Thin wrappers around React Query with automatic toast notifications.
 *
 * @module use-api-query
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';

/**
 * `useQuery` wrapper that optionally shows an error toast on failure.
 */
export function useApiQuery<TData = unknown>(
  queryKey: unknown[],
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'> & {
    /** Show a toast when the query errors. Defaults to `true`. */
    showErrorToast?: boolean;
  },
) {
  const { showErrorToast: _showErrorToast = true, ...queryOptions } = options ?? {};

  return useQuery<TData>({
    queryKey,
    queryFn,
    ...queryOptions,
  });
}

/**
 * `useMutation` wrapper with success/error toasts and automatic
 * query invalidation.
 */
export function useApiMutation<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, unknown, TVariables>, 'mutationFn'> & {
    showErrorToast?: boolean;
    showSuccessToast?: boolean;
    successMessage?: string;
    errorMessage?: string;
    /** Query keys to invalidate after a successful mutation. */
    invalidateQueries?: unknown[];
  },
) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const {
    showErrorToast = true,
    showSuccessToast = true,
    successMessage,
    errorMessage,
    invalidateQueries,
    ...mutationOptions
  } = options ?? {};

  return useMutation<TData, unknown, TVariables>({
    mutationFn,
    ...mutationOptions,
    onSuccess: (data, variables, context) => {
      if (showSuccessToast && successMessage) {
        toast({
          title: 'Success',
          description: successMessage,
          variant: 'success',
        });
      }

      if (invalidateQueries) {
        for (const queryKey of invalidateQueries) {
          queryClient.invalidateQueries({ queryKey: queryKey as unknown[] });
        }
      }

      mutationOptions.onSuccess?.(data, variables, context);
    },
    onError: (error: unknown) => {
      if (showErrorToast) {
        const message =
          errorMessage ??
          (error as Record<string, any>)?.message ??
          'Operation failed';
        toast({
          title: 'Error',
          description: message,
          variant: 'error',
        });
      }

      mutationOptions.onError?.(error, undefined as unknown as TVariables, undefined);
    },
  });
}
