// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  TIMEOUT: 30000, // 30 seconds
} as const

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const

// Query Keys (for TanStack Query)
export const QUERY_KEYS = {
  // Auth
  AUTH_USER: ['auth', 'user'],
  
  // Users
  USERS: ['users'],
  USER: (id: string) => ['users', id],
  USERS_LIST: (filters?: Record<string, any>) => ['users', 'list', filters],
  
  // Profile
  PROFILE: ['profile'],
  
  // Admin
  ADMIN_STATS: ['admin', 'stats'],
  ADMIN_USERS: (params?: Record<string, any>) => ['admin', 'users', params],
} as const