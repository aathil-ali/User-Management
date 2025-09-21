import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import toast from 'react-hot-toast';

// Query client configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Time in milliseconds that unused/inactive cache data remains in memory
      gcTime: 1000 * 60 * 5, // 5 minutes
      
      // Time in milliseconds that the data is considered fresh
      staleTime: 1000 * 60 * 1, // 1 minute
      
      // Number of retry attempts for failed queries
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      
      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch on window focus (disabled in development for better DX)
      refetchOnWindowFocus: import.meta.env.PROD,
      
      // Refetch on reconnect
      refetchOnReconnect: true,
      
      // Refetch interval (disabled by default)
      refetchInterval: false,
    },
    mutations: {
      // Number of retry attempts for failed mutations
      retry: (failureCount, error: any) => {
        // Don't retry mutations on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry up to 1 time for 5xx errors
        return failureCount < 1;
      },
      
      // Retry delay for mutations
      retryDelay: 1000,
    },
  },
  
  // Global query cache configuration
  queryCache: new QueryCache({
    onError: (error: any) => {
      // Log errors in development
      if (import.meta.env.DEV) {
        console.error('Query error:', error);
      }
      
      // Show toast notification for query errors (non-auth errors)
      if (error?.status !== 401 && error?.status !== 403) {
        const errorMessage = error?.message || 'Something went wrong. Please try again.';
        toast.error(errorMessage);
      }
    },
  }),
  
  // Global mutation cache configuration
  mutationCache: new MutationCache({
    onError: (error: any) => {
      // Log errors in development
      if (import.meta.env.DEV) {
        console.error('Mutation error:', error);
      }
      
      // Show toast notification for mutation errors (non-auth errors)
      if (error?.status !== 401 && error?.status !== 403) {
        const errorMessage = error?.message || 'Something went wrong. Please try again.';
        toast.error(errorMessage);
      }
    },
    onSuccess: (_data: any, _variables: any, _context: any, mutation: any) => {
      // Show success toast for specific mutations
      const mutationKey = mutation.options.mutationKey?.[0];
      
      if (mutationKey === 'login') {
        // Note: These should use translations in a real app
        // For now using hardcoded strings since this is global config
        toast.success('Welcome back!');
      } else if (mutationKey === 'register') {
        toast.success('Account created successfully!');
      } else if (mutationKey === 'updateProfile') {
        toast.success('Profile updated successfully!');
      } else if (mutationKey === 'changePassword') {
        toast.success('Password changed successfully!');
      }
    },
  }),
});

// Helper function to clear all queries
export const clearQueries = () => {
  queryClient.clear();
};

// Helper function to invalidate specific query patterns
export const invalidateQueries = (queryKey: unknown[]) => {
  return queryClient.invalidateQueries({ queryKey });
};

// Helper function to set query data
export const setQueryData = <T>(queryKey: unknown[], data: T) => {
  return queryClient.setQueryData(queryKey, data);
};

// Helper function to get query data
export const getQueryData = <T>(queryKey: unknown[]): T | undefined => {
  return queryClient.getQueryData<T>(queryKey);
};

// Helper function to prefetch queries
export const prefetchQuery = async <T>(
  queryKey: unknown[],
  queryFn: () => Promise<T>,
  options?: { staleTime?: number }
) => {
  return queryClient.prefetchQuery({
    queryKey,
    queryFn,
    staleTime: options?.staleTime,
  });
};

// Helper function to reset queries
export const resetQueries = () => {
  return queryClient.resetQueries();
};

export default queryClient;
