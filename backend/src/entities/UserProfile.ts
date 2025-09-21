export interface UserProfile {
  _id?: string;
  userId: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
    displayName: string;
    bio?: string;
    location?: string;
    website?: string;
    dateOfBirth?: Date;
    avatar?: {
      url: string;
      filename: string;
      size: number;
      mimeType: string;
    };
  };
  preferences: {
    language: 'en' | 'es' | 'fr';
    theme: 'light' | 'dark' | 'auto';
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    privacy: {
      profileVisibility: 'public' | 'friends' | 'private';
      showEmail: boolean;
      showLocation: boolean;
    };
  };
  social?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    facebook?: string;
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    version: number;
  };
}
