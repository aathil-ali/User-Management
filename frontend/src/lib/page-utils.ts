// Page Helper Functions

/**
 * Get initials from a full name
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Format date with optional relative formatting
 */
export const formatDate = (dateString: string, options?: { relative?: boolean }): string => {
  const date = new Date(dateString);
  if (options?.relative) {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  }
  return date.toLocaleDateString();
};

/**
 * Check if backend error indicates feature not implemented
 */
export const isBackendNotImplemented = (error: any): boolean => {
  return error?.message?.includes('not implemented') || 
         error?.message?.includes('Not implemented');
};

/**
 * Filter users by search term (client-side filtering)
 */
export const filterUsersBySearch = <T extends { name?: string; email?: string }>(
  users: T[], 
  searchTerm: string
): T[] => {
  if (!searchTerm) return users;
  
  const lowerSearch = searchTerm.toLowerCase();
  return users.filter(user =>
    user.name?.toLowerCase().includes(lowerSearch) ||
    user.email?.toLowerCase().includes(lowerSearch)
  );
};

/**
 * Get default redirect route based on user role
 */
export const getDefaultRoute = (userRole?: string): string => {
  return userRole === 'admin' ? '/admin' : '/dashboard';
};

/**
 * Simulate API delay for development
 */
export const simulateApiDelay = (ms: number = 2000): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};