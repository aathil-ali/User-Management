import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save, UserPlus, Eye, EyeOff } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormSection } from '@/components/ui/Form';
import { LoadingSpinner } from '@/components/ui/Loading';

import { useUser } from '@/hooks/useUserMock';
import { useToast } from '@/hooks/useToast';
import { useToggle } from '@/hooks/useUI';
import { adminCreateUserSchema, type AdminCreateUserFormData } from '@/lib/validations';
import { UserRole, CreateUserPageState } from '@/types';

export const CreateUserPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { createUser, isLoading, error } = useUser();
  const { toast } = useToast();
  const showPasswordToggle = useToggle(false);
  const { value: showPassword, toggle: toggleShowPassword } = showPasswordToggle;

  const form = useForm<AdminCreateUserFormData>({
    resolver: zodResolver(adminCreateUserSchema) as any,
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'user',
      status: 'active',
    },
  });

  const onSubmit = async (data: AdminCreateUserFormData) => {
    try {
      await createUser.mutateAsync(data);
      toast({ type: 'success', message: t('admin.users.createSuccess', 'User created successfully') });
      
      // Redirect to the admin dashboard or to the created user's detail page
      setTimeout(() => {
        navigate('/admin');
      }, 1500);
    } catch (error) {
      toast({ type: 'error', message: t('admin.users.createError', 'Failed to create user') });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('common.back', 'Back')}
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('admin.users.create.title', 'Create New User')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('admin.users.create.subtitle', 'Add a new user to the system')}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>
            {String(t(`errors.${error}`, error))}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            {t('admin.users.create.cardTitle', 'User Information')}
          </CardTitle>
          <CardDescription>
            {t('admin.users.create.cardDescription', 'Enter the details for the new user account')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
              <FormSection title={t('admin.users.create.basicInfo', 'Basic Information')}>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('admin.users.fields.name', 'Full Name')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('admin.users.placeholders.name', 'Enter full name')}
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('admin.users.fields.email', 'Email Address')}</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder={t('admin.users.placeholders.email', 'Enter email address')}
                          autoComplete="email"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('admin.users.fields.password', 'Password')}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder={t('admin.users.placeholders.password', 'Enter password')}
                            autoComplete="new-password"
                            disabled={isLoading}
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={toggleShowPassword}
                            disabled={isLoading}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('admin.users.fields.confirmPassword', 'Confirm Password')}</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder={t('admin.users.placeholders.confirmPassword', 'Confirm password')}
                          autoComplete="new-password"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormSection>

              <FormSection title={t('admin.users.create.permissions', 'Permissions')}>
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('admin.users.fields.role', 'User Role')}</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                          disabled={isLoading}
                        >
                          <option value={UserRole.USER}>
                            {t('roles.user', 'User')} - {t('admin.users.roleDescriptions.user', 'Standard user access')}
                          </option>
                          <option value={UserRole.ADMIN}>
                            {t('roles.admin', 'Administrator')} - {t('admin.users.roleDescriptions.admin', 'Full system access')}
                          </option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormSection>

              <div className="flex gap-4 pt-6">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <LoadingSpinner className="mr-2 h-4 w-4" />
                      {t('admin.users.create.creating', 'Creating...')}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {t('admin.users.create.createUser', 'Create User')}
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link to="/admin">
                    {t('common.cancel', 'Cancel')}
                  </Link>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Helper Information */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <h4 className="font-medium text-gray-900 dark:text-white">
              {t('admin.users.create.notes.title', 'Important Notes:')}
            </h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>{t('admin.users.create.notes.password', 'The user will need to change their password on first login.')}</li>
              <li>{t('admin.users.create.notes.email', 'A welcome email will be sent to the user\'s email address.')}</li>
              <li>{t('admin.users.create.notes.verification', 'The user will need to verify their email address before full access is granted.')}</li>
              <li>{t('admin.users.create.notes.admin', 'Admin users have full access to all system features and user management.')}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateUserPage;
