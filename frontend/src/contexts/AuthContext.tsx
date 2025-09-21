import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import { authService } from '@/services/auth.service';
import { STORAGE_KEYS } from '@/lib/constants';
import { User, UserRole } from '@/types';

// Auth context interface
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  checkAuth: () => void;
  clearError: () => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// User role mapping for API compatibility
const mapApiUserRole = (role: string): UserRole => {
  switch (role.toLowerCase()) {
    case 'admin':
    case 'super_admin':
      return UserRole.ADMIN;
    case 'user':
    default:
      return UserRole.USER;
  }
};

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const isAuthenticated = !!user;

  // Real login function
  const login = useCallback(async (email: string, password: string, rememberMe?: boolean): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.login({ email, password, rememberMe });
      
      // Store tokens from response
      if (response.accessToken) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
      }
      if (response.refreshToken) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
      }
      
      // Map API user to our User type - backend sends lowercase role values
      const user: User = {
        ...response.user,
        role: mapApiUserRole(response.user.role),
      };
      
      setUser(user);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed';
      setError(errorMessage);
      // Don't throw error - let the UI handle error display
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Real register function
  const register = useCallback(async (data: any): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.register({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      
      // Store tokens from response
      if (response.accessToken) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
      }
      if (response.refreshToken) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
      }
      
      // Map API user to our User type - backend sends lowercase role values
      const user: User = {
        ...response.user,
        role: mapApiUserRole(response.user.role),
      };
      
      setUser(user);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed';
      setError(errorMessage);
      // Don't throw error - let the UI handle error display
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Real logout function
  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Get current user ID before clearing
      if (user?.id) {
        await authService.logout(user.id);
      }
      
      // Clear local state
      setUser(null);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error: any) {
      // Even if logout fails, clear local data
      setUser(null);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      const errorMessage = error.message || 'Logout failed';
      setError(errorMessage);
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Password reset functions removed - not implemented in backend yet

  // Check authentication status
  const checkAuth = useCallback((): void => {
    try {
      const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      const hasAccessToken = !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      
      if (userData && hasAccessToken) {
        const user = JSON.parse(userData);
        setUser(user);
      } else {
        // Clear any stale data
        setUser(null);
        authService.clearAuth();
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setUser(null);
      authService.clearAuth();
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update user data function
  const updateUser = useCallback((userData: Partial<User>): void => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
    }
  }, [user]);

  // Clear error function
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Context value
  const contextValue: AuthContextType = useMemo(() => ({
    user,
    isLoading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    checkAuth,
    clearError,
  }), [user, isLoading, error, isAuthenticated, login, register, logout, updateUser, checkAuth, clearError]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;
