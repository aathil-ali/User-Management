import React from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, LogIn } from 'lucide-react';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/Card';
import { Alert, AlertDescription } from '../../components/ui/Alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/Form';
import { LoadingSpinner } from '../../components/ui/Loading';

import { useAuth } from '../../contexts/AuthContext';
import { useToggle } from '../../hooks/useUI';
import { loginSchema, type LoginFormData } from '../../lib/validations';
import { getLoginErrorMessage } from '../../lib/error-messages';
import { UserRole, LoginPageState } from '@/types';
import { getDefaultRoute } from '@/lib/page-utils';

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { login, isLoading, error, user } = useAuth();
  const { value: showPassword, toggle: toggleShowPassword } = useToggle(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });


  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password, data.rememberMe);
    } catch (error) {
      // Error is handled by the hook and context
      console.error('Login failed:', error);
    }
  };

  // Redirect if already authenticated
  if (user) {
    const from = location.state?.from?.pathname;
    const defaultRoute = getDefaultRoute(user.role);
    return <Navigate to={from || defaultRoute} replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary/10">
            <LogIn className="h-6 w-6 text-primary" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            {t('auth.login.title', 'Welcome back')}
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t('auth.login.subtitle', 'Sign in to your account')}
          </p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {t('auth.login.cardTitle', 'Sign in')}
            </CardTitle>
            <CardDescription className="text-center">
              {t('auth.login.cardDescription', 'Enter your email and password to access your account')}
            </CardDescription>
          </CardHeader>

          <Form {...form}>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit(onSubmit)(e);
              }} 
              className="space-y-4"
            >
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      {getLoginErrorMessage(error, t)}
                    </AlertDescription>
                  </Alert>
                )}

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
                            placeholder={t('auth.placeholders.password', 'Enter your password')}
                            autoComplete="current-password"
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
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          checked={field.value}
                          onChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        {t('auth.fields.rememberMe', 'Remember me')}
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-end">
                  <span className="text-sm text-muted-foreground cursor-not-allowed">
                    {t('auth.login.forgotPassword', 'Forgot your password?')} (Coming soon)
                  </span>
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
                      {t('auth.login.signingIn', 'Signing in...')}
                    </>
                  ) : (
                    t('auth.login.signIn', 'Sign in')
                  )}
                </Button>

                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                  {t('auth.login.noAccount', "Don't have an account?")}{' '}
                  <Link
                    to="/auth/register"
                    className="text-primary hover:underline focus:outline-none focus:underline"
                  >
                    {t('auth.login.signUp', 'Sign up')}
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

export default LoginPage;
