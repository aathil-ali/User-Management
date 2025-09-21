import { z } from 'zod';
import { VALIDATION_RULES } from './constants';

// Local type definitions to match AuthContext
type LoginFormData = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

// Base validation schemas
export const emailSchema = z
  .string()
  .min(1, 'errors.emailRequired')
  .email('errors.emailInvalid');

export const passwordSchema = z
  .string()
  .min(VALIDATION_RULES.PASSWORD.MIN_LENGTH, 'errors.passwordTooShort')
  .regex(VALIDATION_RULES.PASSWORD.PATTERN, 'errors.passwordInvalid');

export const nameSchema = z
  .string()
  .min(VALIDATION_RULES.NAME.MIN_LENGTH, 'errors.nameRequired')
  .max(VALIDATION_RULES.NAME.MAX_LENGTH, 'errors.nameTooLong')
  .regex(VALIDATION_RULES.NAME.PATTERN, 'errors.nameInvalid');

// Authentication schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'errors.passwordRequired'),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'errors.confirmPasswordRequired'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'errors.passwordsDoNotMatch',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'errors.tokenRequired'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'errors.confirmPasswordRequired'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'errors.passwordsDoNotMatch',
    path: ['confirmPassword'],
  });

// Profile schemas
export const updateProfileSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  phone: z.string().optional(),
  bio: z.string().max(500, 'errors.bioTooLong').optional(),
});

// Backend-compatible profile schema (matches actual backend API)
export const backendProfileSchema = z.object({
  name: nameSchema.optional(),
  avatar: z.string().url().optional().or(z.literal('')),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'system']).optional(),
    notifications: z.object({
      email: z.boolean(),
      push: z.boolean(),
      marketing: z.boolean(),
    }).optional(),
    language: z.enum(['en', 'es', 'fr']).optional(),
    timezone: z.string().optional(),
  }).optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'errors.currentPasswordRequired'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'errors.confirmPasswordRequired'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'errors.passwordsDoNotMatch',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'errors.newPasswordSameAsCurrent',
    path: ['newPassword'],
  });

// Admin schemas
export const adminCreateUserSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'errors.confirmPasswordRequired'),
    role: z.enum(['admin', 'user'], {
      message: 'errors.roleRequired',
    }),
    status: z.enum(['active', 'inactive', 'suspended']).default('active'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'errors.passwordsDoNotMatch',
    path: ['confirmPassword'],
  });

export const adminUpdateUserSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
  role: z.enum(['admin', 'user']).optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
});

// Settings schemas
export const userPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  language: z.enum(['en', 'es', 'fr']).default('en'),
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    marketing: z.boolean().default(false),
  }),
  timezone: z.string().optional(),
});

export const notificationSettingsSchema = z.object({
  email: z.boolean(),
  push: z.boolean(),
  marketing: z.boolean(),
  securityAlerts: z.boolean(),
  profileUpdates: z.boolean(),
});

// Search and filter schemas
export const userSearchSchema = z.object({
  query: z.string().optional(),
  role: z.enum(['admin', 'user']).optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sortBy: z.enum(['name', 'email', 'createdAt', 'lastLogin']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

// Contact/Support schemas
export const contactFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  subject: z
    .string()
    .min(5, 'errors.subjectTooShort')
    .max(200, 'errors.subjectTooLong'),
  message: z
    .string()
    .min(10, 'errors.messageTooShort')
    .max(2000, 'errors.messageTooLong'),
  category: z.enum(['bug', 'feature', 'support', 'billing', 'other']).default('support'),
});

// File upload schemas
export const fileUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= VALIDATION_RULES.FILE_UPLOAD.MAX_SIZE, {
      message: 'errors.fileTooLarge',
    })
    .refine(
      (file) => VALIDATION_RULES.FILE_UPLOAD.ALLOWED_TYPES.includes(file.type as any),
      {
        message: 'errors.fileTypeNotAllowed',
      }
    ),
});

export const avatarUploadSchema = z.object({
  avatar: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, { // 5MB
      message: 'errors.avatarTooLarge',
    })
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      {
        message: 'errors.avatarTypeNotAllowed',
      }
    ),
});

// Two-factor authentication schemas
export const twoFactorSetupSchema = z.object({
  code: z
    .string()
    .length(6, 'errors.invalidTwoFactorCode')
    .regex(/^\d{6}$/, 'errors.invalidTwoFactorCode'),
});

export const twoFactorVerifySchema = z.object({
  code: z
    .string()
    .length(6, 'errors.invalidTwoFactorCode')
    .regex(/^\d{6}$/, 'errors.invalidTwoFactorCode'),
});

// Bulk operations schemas
export const bulkUpdateUsersSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1, 'errors.noUsersSelected'),
  updates: z.object({
    role: z.enum(['admin', 'user']).optional(),
    status: z.enum(['active', 'inactive', 'suspended']).optional(),
  }),
});

export const bulkDeleteUsersSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1, 'errors.noUsersSelected'),
  confirmation: z.literal(true, {
    message: 'errors.confirmationRequired',
  }),
});

// Export type inference helpers
export type { LoginFormData };
export type LoginFormDataInferred = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type BackendProfileFormData = z.infer<typeof backendProfileSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type AdminCreateUserFormData = z.infer<typeof adminCreateUserSchema>;
export type AdminUpdateUserFormData = z.infer<typeof adminUpdateUserSchema>;
export type UserPreferencesFormData = z.infer<typeof userPreferencesSchema>;
export type NotificationSettingsFormData = z.infer<typeof notificationSettingsSchema>;
export type UserSearchFormData = z.infer<typeof userSearchSchema>;
export type ContactFormData = z.infer<typeof contactFormSchema>;
export type FileUploadFormData = z.infer<typeof fileUploadSchema>;
export type AvatarUploadFormData = z.infer<typeof avatarUploadSchema>;
export type TwoFactorSetupFormData = z.infer<typeof twoFactorSetupSchema>;
export type TwoFactorVerifyFormData = z.infer<typeof twoFactorVerifySchema>;
export type BulkUpdateUsersFormData = z.infer<typeof bulkUpdateUsersSchema>;
export type BulkDeleteUsersFormData = z.infer<typeof bulkDeleteUsersSchema>;
