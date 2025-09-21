import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Eye, EyeOff, Save, Shield, Lock } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormSection } from '@/components/ui/Form';
import { LoadingSpinner } from '@/components/ui/Loading';

import { useUser } from '@/hooks/useUserMock';
import { useToast } from '@/hooks/useToast';
import { useToggle } from '@/hooks/useUI';
import { changePasswordSchema, type ChangePasswordFormData } from '@/lib/validations';
import { ChangePasswordPageState } from '@/types';

export const ChangePasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { changePassword, isLoading, error } = useUser();
  const { toast } = useToast();
  
  const showCurrentPasswordToggle = useToggle(false);
  const { value: showCurrentPassword, toggle: toggleShowCurrentPassword } = showCurrentPasswordToggle;
  const showNewPasswordToggle = useToggle(false);
  const { value: showNewPassword, toggle: toggleShowNewPassword } = showNewPasswordToggle;
  const showConfirmPasswordToggle = useToggle(false);
  const { value: showConfirmPassword, toggle: toggleShowConfirmPassword } = showConfirmPasswordToggle;

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      await changePassword.mutateAsync(data);
      toast({ type: 'success', message: t('profile.password.changeSuccess', 'Password changed successfully') });
      form.reset();
      
      // Redirect back to profile after successful password change
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (error) {
      toast({ type: 'error', message: t('profile.password.changeError', 'Failed to change password') });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/profile">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('common.back', 'Back')}
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('profile.password.title', 'Change Password')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('profile.password.subtitle', 'Update your account password')}
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
            <Shield className="h-5 w-5" />
            {t('profile.password.cardTitle', 'Password Security')}
          </CardTitle>
          <CardDescription>
            {t('profile.password.cardDescription', 'Choose a strong password to keep your account secure')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormSection title={t('profile.password.section', 'Change Your Password')}>
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('profile.password.current', 'Current Password')}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showCurrentPassword ? 'text' : 'password'}
                            placeholder={t('profile.password.currentPlaceholder', 'Enter your current password')}
                            autoComplete="current-password"
                            disabled={isLoading}
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={toggleShowCurrentPassword}
                            disabled={isLoading}
                          >
                            {showCurrentPassword ? (
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
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('profile.password.new', 'New Password')}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showNewPassword ? 'text' : 'password'}
                            placeholder={t('profile.password.newPlaceholder', 'Enter your new password')}
                            autoComplete="new-password"
                            disabled={isLoading}
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={toggleShowNewPassword}
                            disabled={isLoading}
                          >
                            {showNewPassword ? (
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
                      <FormLabel>{t('profile.password.confirm', 'Confirm New Password')}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder={t('profile.password.confirmPlaceholder', 'Confirm your new password')}
                            autoComplete="new-password"
                            disabled={isLoading}
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={toggleShowConfirmPassword}
                            disabled={isLoading}
                          >
                            {showConfirmPassword ? (
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
              </FormSection>

              <div className="flex gap-4 pt-6">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <LoadingSpinner className="mr-2 h-4 w-4" />
                      {t('profile.password.changing', 'Changing...')}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {t('profile.password.change', 'Change Password')}
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link to="/profile">
                    {t('common.cancel', 'Cancel')}
                  </Link>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Password Requirements */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lock className="h-4 w-4" />
            {t('profile.password.requirements.title', 'Password Requirements')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
              {t('profile.password.requirements.length', 'At least 8 characters long')}
            </p>
            <p className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
              {t('profile.password.requirements.uppercase', 'Contains uppercase letters (A-Z)')}
            </p>
            <p className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
              {t('profile.password.requirements.lowercase', 'Contains lowercase letters (a-z)')}
            </p>
            <p className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
              {t('profile.password.requirements.numbers', 'Contains numbers (0-9)')}
            </p>
            <p className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
              {t('profile.password.requirements.special', 'Contains special characters (!@#$%^&*)')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Security Tips */}
      <Alert className="mt-6">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>{t('profile.password.securityTip.title', 'Security Tip:')}</strong>{' '}
          {t('profile.password.securityTip.description', 
            'Use a unique password that you don\'t use anywhere else. Consider using a password manager to generate and store strong passwords securely.')}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ChangePasswordPage;
