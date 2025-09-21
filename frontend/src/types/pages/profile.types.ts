import { User } from '../user.types';
import { PageEditingState, FormPageState } from './common.types';

// Profile Page Types
export interface ProfilePageState extends PageEditingState {
  displayUser: User | null;
  isUpdating: boolean;
  updateError: string | null;
}

export interface SettingsPageState {
  isLoading: boolean;
  error: string | null;
  isDeleting: boolean;
  deleteError: string | null;
  profile: User | null;
}

export interface ChangePasswordPageState extends FormPageState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  passwordChanged: boolean;
}

// Profile Page Props
export interface ProfilePageProps {
  userId?: string;
  readOnly?: boolean;
}