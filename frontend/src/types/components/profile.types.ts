import { User } from '../user.types';
import { BackendProfileFormData } from '../../lib/validations';

// Profile Components
export interface ProfileViewProps {
  user: User;
  onEdit: () => void;
  isLoading?: boolean;
  className?: string;
}

export interface ProfileFormProps {
  user: User;
  onSubmit: (data: BackendProfileFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  error?: any;
  className?: string;
}

export interface AccountDangerZoneProps {
  onDeleteAccount: () => void;
  isDeleting?: boolean;
  className?: string;
}

// Profile Settings
export interface ProfileSettingsProps {
  user: User;
  onSave: (data: any) => void;
  isLoading?: boolean;
}