import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';

/**
 * Enhanced useQuery hook with toast notifications
 */
export function useApiQuery<TData = any>(
  queryKey: any[],
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'> & {
    showErrorToast?: boolean;
  }
) {
  const { toast } = useToast();
  const { showErrorToast = true, ...queryOptions } = options || {};

  return useQuery<TData>({
    queryKey,
    queryFn,
    ...queryOptions,
  });
}

/**
 * Enhanced useMutation hook with toast notifications
 */
export function useApiMutation<TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, any, TVariables>, 'mutationFn'> & {
    showErrorToast?: boolean;
    showSuccessToast?: boolean;
    successMessage?: string;
    errorMessage?: string;
    invalidateQueries?: any[];
  }
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
  } = options || {};

  return useMutation<TData, any, TVariables>({
    mutationFn,
    ...mutationOptions,
    onSuccess: (data, variables, context) => {
      if (showSuccessToast && successMessage) {
        toast({
          title: 'Success',
          description: successMessage,
        });
      }

      // Invalidate related queries
      if (invalidateQueries) {
        invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey });
        });
      }
    },
    onError: (error: any) => {
      if (showErrorToast) {
        toast({
          title: 'Error',
          description: errorMessage || error?.message || 'Operation failed',
          variant: 'destructive',
        });
      }
    },
  });
}