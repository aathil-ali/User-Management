import { useAuth as useAuthContext } from '@/contexts/AuthContext';
import { UserRole, isAdmin } from '@/types';

/**
 * Simplified Authentication Hooks
 * 
 * For development and testing
 */

// Main auth hook that wraps the context
export const useAuth = () => {
  const auth = useAuthContext();
  
  return {
    ...auth,
    // Utility methods
    isAdmin: auth.user?.role ? isAdmin(auth.user.role) : false,
    isUser: auth.user?.role === UserRole.USER,
    hasRole: (role: UserRole) => auth.user?.role === role,
  };
};

export default useAuth;
