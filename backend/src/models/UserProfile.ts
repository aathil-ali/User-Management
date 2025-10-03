export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  preferences?: {
    theme: string;
    notifications: boolean;
    language: string;
    timezone: string;
  };
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}
