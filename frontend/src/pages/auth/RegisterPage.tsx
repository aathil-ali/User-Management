import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, UserPlus } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import { LoadingSpinner } from '@/components/ui/Loading';

import { useAuth } from '@/contexts/AuthContext';
import { useToggle } from '@/hooks/useUI';
import { registerSchema, type RegisterFormData } from '@/lib/validations';
import { getRegistrationErrorMessage } from '@/lib/error-messages';
import { RegisterPageState } from '@/types';

export const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const { register, isLoading, error, user } = useAuth();
  const showPasswordToggle = useToggle(false);
  const { value: showPassword, toggle: toggleShowPassword } = showPasswordToggle;
  const showConfirmPasswordToggle = useToggle(false);
  const { value: showConfirmPassword, toggle: toggleShowConfirmPassword } = showConfirmPasswordToggle;

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });


  const onSubmit = async (data: RegisterFormData) => {
    try {
      await register(data);
    } catch (error) {
      // Error is handled by the hook and context
      console.error('Registration failed:', error);
    }
  };

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary/10">
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            {t('auth.register.title', 'Create your account')}
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t('auth.register.subtitle', 'Join us to get started')}
          </p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {t('auth.register.cardTitle', 'Sign up')}
            </CardTitle>
            <CardDescription className="text-center">
              {t('auth.register.cardDescription', 'Create your account to get started')}
            </CardDescription>
          </CardHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      {getRegistrationErrorMessage(error, t)}
                    </AlertDescription>
                  </Alert>
                )}

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('auth.fields.name', 'Full Name')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('auth.placeholders.name', 'Enter your full name')}
                          autoComplete="name"
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
                      <FormLabel>{t('auth.fields.email', 'Email')}</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder={t('auth.placeholders.email', 'Enter your email')}
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
                      <FormLabel>{t('auth.fields.password', 'Password')}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder={t('auth.placeholders.password', 'Create a password')}
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
                      <FormLabel>{t('auth.fields.confirmPassword', 'Confirm Password')}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder={t('auth.placeholders.confirmPassword', 'Confirm your password')}
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

                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary mt-0.5"
                    disabled={isLoading}
                  />
                  <div className="space-y-1 leading-none">
                    <label htmlFor="acceptTerms" className="text-sm font-normal">
                      {t('auth.fields.acceptTerms', 'I accept the')}{' '}
                      <span className="text-muted-foreground">
                        Terms of Service and Privacy Policy (links coming soon)
                      </span>
                    </label>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner className="mr-2 h-4 w-4" />
                      {t('auth.register.creatingAccount', 'Creating account...')}
                    </>
                  ) : (
                    t('auth.register.createAccount', 'Create account')
                  )}
                </Button>

                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                  {t('auth.register.hasAccount', 'Already have an account?')}{' '}
                  <Link
                    to="/auth/login"
                    className="text-primary hover:underline focus:outline-none focus:underline"
                  >
                    {t('auth.register.signIn', 'Sign in')}
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
