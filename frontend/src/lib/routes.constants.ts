// Routes - Match App.tsx routing structure
export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  RESET_PASSWORD: '/auth/reset-password',
  
  // Protected routes
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  PROFILE_PASSWORD: '/profile/password',
  SETTINGS: '/settings',
  
  // Admin routes
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_USERS_CREATE: '/admin/users/create',
  ADMIN_USER_DETAILS: (id: string) => `/admin/users/${id}`,
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_AUDIT_LOGS: '/admin/audit-logs',
} as const