import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { User, UpdateProfileRequest } from '@/types';
import { QUERY_KEYS } from '@/lib/constants';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook for managing user profile data
 */
export const useProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { updateUser } = useAuth();

  // Fetch profile data
  const profileQuery = useQuery({
    queryKey: QUERY_KEYS.PROFILE,
    queryFn: () => userService.getProfile(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry if it's a 404 (user not found) or if backend service is not implemented
      if (error?.status === 404 || error?.message?.includes('not implemented')) {
        return false;
      }
      // Otherwise retry up to 2 times
      return failureCount < 2;
    },
    // Fallback to auth context user data if profile API fails
    placeholderData: (previousData) => previousData,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileRequest) => userService.updateProfile(data),
    onSuccess: (updatedUser: User) => {
      // Update the profile cache
      queryClient.setQueryData(QUERY_KEYS.PROFILE, updatedUser);
      
      // Update auth user cache if it exists
      queryClient.setQueryData(QUERY_KEYS.AUTH_USER, updatedUser);
      
      // Update the auth context with new user data
      updateUser(updatedUser);
      
      // Show success toast
      toast({
        title: 'Success',
        message: 'Profile updated successfully',
        type: 'success',
      });
    },
    onError: (error: any) => {
      // Provide better error messages based on error type
      let errorMessage = 'Failed to update profile';
      
      if (error?.message?.includes('not implemented')) {
        errorMessage = 'Profile update feature is not yet available. Please try again later.';
      } else if (error?.status === 400) {
        errorMessage = 'Invalid profile data. Please check your inputs.';
      } else if (error?.status === 401) {
        errorMessage = 'Session expired. Please log in again.';
      } else if (error?.status === 403) {
        errorMessage = 'You do not have permission to update this profile.';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Error',
        message: errorMessage,
        type: 'error',
      });
    },
  });

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: () => userService.deleteAccount(),
    onSuccess: () => {
      // Clear all caches
      queryClient.clear();
      
      // Show success toast
      toast({
        title: 'Account Deleted',
        message: 'Your account has been deleted successfully',
        type: 'success',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        message: error.message || 'Failed to delete account',
        type: 'error',
      });
    },
  });

  return {
    // Query data
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    error: profileQuery.error,
    isError: profileQuery.isError,
    
    // Mutations
    updateProfile: updateProfileMutation.mutate,
    updateProfileAsync: updateProfileMutation.mutateAsync,
    isUpdating: updateProfileMutation.isPending,
    updateError: updateProfileMutation.error,
    
    deleteAccount: deleteAccountMutation.mutate,
    isDeleting: deleteAccountMutation.isPending,
    deleteError: deleteAccountMutation.error,
    
    // Utilities
    refetch: profileQuery.refetch,
  };
};

/**
 * Hook specifically for profile form management
 */
export const useProfileForm = () => {
  const { profile, updateProfile, isUpdating, updateError } = useProfile();

  const handleSubmit = (data: UpdateProfileRequest) => {
    updateProfile(data);
  };

  return {
    initialData: profile,
    onSubmit: handleSubmit,
    isSubmitting: isUpdating,
    error: updateError,
  };
};

/**
 * Hook for account deletion with confirmation
 */
export const useAccountDeletion = () => {
  const { deleteAccount, isDeleting, deleteError } = useProfile();

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      deleteAccount();
    }
  };

  return {
    deleteAccount: handleDelete,
    isDeleting,
    error: deleteError,
  };
};