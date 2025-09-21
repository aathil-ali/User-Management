import { FormPageState } from './common.types';

// Auth Page Types
export interface LoginPageState extends FormPageState {
  showPassword: boolean;
}

export interface RegisterPageState extends FormPageState {
  showPassword: boolean;
  showConfirmPassword: boolean;
}

export interface ForgotPasswordPageState extends FormPageState {
  emailSent: boolean;
  sentToEmail: string;
}

export interface ResetPasswordPageState extends FormPageState {
  token: string;
  isVerified: boolean;
}

export interface VerifyEmailPageState extends FormPageState {
  token: string;
  isVerified: boolean;
}

// Auth Page Props (if needed for routing)
export interface AuthPageProps {
  redirectTo?: string;
  title?: string;
  subtitle?: string;
}