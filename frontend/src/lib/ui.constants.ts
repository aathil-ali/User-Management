// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_DATA: 'userData',
  USER_PREFERENCES: 'userPreferences',
  LANGUAGE: 'language',
  THEME: 'theme',
} as const

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
} as const

// User Status
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const

// Theme Options
export const THEME_OPTIONS = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto',
} as const

// Language Options
export const LANGUAGE_OPTIONS = {
  EN: 'en',
  ES: 'es',
  FR: 'fr',
} as const

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_PAGE_SIZE: 100,
} as const

// Toast Types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const

// Date Formats
export const DATE_FORMATS = {
  SHORT: 'MMM dd, yyyy',
  LONG: 'MMMM dd, yyyy',
  WITH_TIME: 'MMM dd, yyyy HH:mm',
  TIME_ONLY: 'HH:mm',
} as const

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ACCEPTED_IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
} as const