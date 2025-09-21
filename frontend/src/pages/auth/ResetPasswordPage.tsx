import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, KeyRound, Mail } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import { LoadingSpinner } from '@/components/ui/Loading';

import { useAuth } from '@/hooks/useAuth';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validations';
import { ForgotPasswordPageState } from '@/types';
import { simulateApiDelay } from '@/lib/page-utils';

export const ResetPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [sentToEmail, setSentToEmail] = useState('');

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call for now - password reset not implemented in backend
      await simulateApiDelay();
      setEmailSent(true);
      setSentToEmail(data.email);
      form.reset();
    } catch (error) {
      setError(t('auth.resetPassword.notImplemented'));
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
              {t('auth.resetPassword.emailSent.title', 'Check your email')}
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {t('auth.resetPassword.emailSent.subtitle', 'We sent a password reset link to')}
            </p>
            <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
              {sentToEmail}
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('auth.resetPassword.emailSent.instruction', 
                    "Didn't receive the email? Check your spam folder or try again.")}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEmailSent(false);
                      setSentToEmail('');
                    }}
                  >
                    {t('auth.resetPassword.emailSent.tryAgain', 'Try again')}
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link to="/auth/login">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      {t('auth.resetPassword.emailSent.backToLogin', 'Back to sign in')}
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary/10">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            {t('auth.resetPassword.title', 'Reset your password')}
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t('auth.resetPassword.subtitle', 'Enter your email address and we\'ll send you a reset link')}
          </p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {t('auth.resetPassword.cardTitle', 'Forgot password')}
            </CardTitle>
            <CardDescription className="text-center">
              {t('auth.resetPassword.cardDescription', 'No worries, we\'ll send you reset instructions')}
            </CardDescription>
          </CardHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      {t(`errors.${error}`, error)}
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
                      {t('auth.resetPassword.sending', 'Sending...')}
                    </>
                  ) : (
                    t('auth.resetPassword.sendReset', 'Send reset link')
                  )}
                </Button>

                <Button variant="ghost" className="w-full" asChild>
                  <Link to="/auth/login">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t('auth.resetPassword.backToLogin', 'Back to sign in')}
                  </Link>
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('auth.resetPassword.helpText', 
              'Remember your password?')} {' '}
            <Link 
              to="/auth/login" 
              className="text-primary hover:underline focus:outline-none focus:underline"
            >
              {t('auth.resetPassword.signIn', 'Sign in')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
