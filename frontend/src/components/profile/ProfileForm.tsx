import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Save, X } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { LoadingSpinner } from '@/components/ui/Loading';

import { backendProfileSchema, type BackendProfileFormData } from '@/lib/validations';
import { ProfileFormProps } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';

export const ProfileForm: React.FC<ProfileFormProps> = ({
  user,
  onSubmit,
  onCancel,
  isSubmitting = false,
  error,
}) => {
  const { i18n } = useTranslation();
  const { setTheme } = useTheme();
  const form = useForm<BackendProfileFormData>({
    resolver: zodResolver(backendProfileSchema),
    defaultValues: {
      name: user.name || '',
      avatar: user.avatar || '',
      preferences: {
        theme: (user.preferences?.theme as 'light' | 'dark' | 'system') || 'light',
        notifications: user.preferences?.notifications ?? { email: true, push: true, marketing: false },
        language: (user.preferences?.language as 'en' | 'es' | 'fr') || 'en',
        timezone: user.preferences?.timezone || '',
      },
    },
  });

  const handleSubmit = (data: BackendProfileFormData) => {
    // Clean up empty values
    const cleanData: BackendProfileFormData = {
      ...data,
      avatar: data.avatar?.trim() || undefined,
      preferences: {
        ...data.preferences,
        timezone: data.preferences?.timezone?.trim() || undefined,
      },
    };
    
    onSubmit(cleanData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>
          Update your personal information and preferences
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>
                  {error.message || 'Failed to update profile'}
                </AlertDescription>
              </Alert>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your full name"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avatar URL (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/avatar.jpg"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      Enter a URL to your profile picture
                    </p>
                  </FormItem>
                )}
              />
            </div>

            {/* Preferences */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Preferences</h3>
              
              <FormField
                control={form.control}
                name="preferences.theme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Theme</FormLabel>
                    <FormControl>
                      <select 
                        className="w-full p-2 border border-gray-300 rounded-md"
                        disabled={isSubmitting}
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          // Update theme immediately
                          const newTheme = e.target.value as 'light' | 'dark' | 'system';
                          const mappedTheme = newTheme;
                          setTheme(mappedTheme);
                        }}
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferences.language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <FormControl>
                      <select 
                        className="w-full p-2 border border-gray-300 rounded-md"
                        disabled={isSubmitting}
                        {...field}
                        onChange={async (e) => {
                          field.onChange(e);
                          // Update language immediately
                          await i18n.changeLanguage(e.target.value);
                        }}
                      >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferences.notifications.email"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300"
                        checked={field.value}
                        onChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">
                      Enable notifications
                    </FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferences.timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timezone (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., America/New_York, UTC, Europe/London"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      Your preferred timezone for dates and times
                    </p>
                  </FormItem>
                )}
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ProfileForm;