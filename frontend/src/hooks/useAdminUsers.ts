import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';
import { QUERY_KEYS } from '@/lib/constants';
import { User, PaginatedResponse } from '@/types';

/**
 * Hook for admin user management operations
 */

interface UseAdminUsersParams {
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
}

export const useAdminUsers = (params?: UseAdminUsersParams) => {
  const {
    page = 1,
    limit = 10,
    role,
    status,
  } = params || {};

  const queryKey = QUERY_KEYS.ADMIN_USERS({ page, limit, role, status });

  const query = useQuery({
    queryKey,
    queryFn: () => adminService.getUsers({ page, limit, role, status }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });

  return {
    users: query.data?.data || [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    error: query.error,
    isError: query.isError,
    refetch: query.refetch,
  };
};

/**
 * Hook for getting a specific user by ID
 */
export const useAdminUser = (userId: string | undefined) => {
  const query = useQuery({
    queryKey: QUERY_KEYS.USER(userId!),
    queryFn: () => adminService.getUser(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });

  return {
    user: query.data,
    isLoading: query.isLoading,
    error: query.error,
    isError: query.isError,
    refetch: query.refetch,
  };
};

/**
 * Hook for admin user list with search functionality
 */
export const useAdminUsersList = () => {
  const defaultQuery = useAdminUsers({ page: 1, limit: 10 });
  
  const searchUsers = (searchParams: UseAdminUsersParams) => {
    return useAdminUsers(searchParams);
  };

  return {
    ...defaultQuery,
    searchUsers,
  };
};