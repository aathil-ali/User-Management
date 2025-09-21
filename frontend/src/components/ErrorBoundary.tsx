import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { ErrorBoundaryProps } from '@/types';



interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Global Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the component tree and displays a fallback UI
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console in development
    try {
      if (process.env.NODE_ENV === 'development') {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
      }
    } catch {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // In production, you might want to log this to an error reporting service
    try {
      if (process.env.NODE_ENV === 'production') {
        // Example: logErrorToService(error, errorInfo);
      }
    } catch {
      // Example: logErrorToService(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <CardTitle>Something went wrong</CardTitle>
              <CardDescription>
                An unexpected error occurred. Don't worry, it's not your fault.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-muted-foreground mb-2">
                    Error Details (Development Only)
                  </summary>
                  <div className="bg-muted p-3 rounded-md font-mono text-xs overflow-auto max-h-40">
                    <div className="text-destructive font-semibold mb-1">
                      {this.state.error.name}: {this.state.error.message}
                    </div>
                    {this.state.error.stack && (
                      <pre className="whitespace-pre-wrap text-xs">
                        {this.state.error.stack}
                      </pre>
                    )}
                    {this.state.errorInfo && this.state.errorInfo.componentStack && (
                      <div className="mt-2">
                        <div className="font-semibold mb-1">Component Stack:</div>
                        <pre className="whitespace-pre-wrap text-xs">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={this.handleReset} variant="outline" className="flex-1">
                  Try Again
                </Button>
                <Button onClick={this.handleReload} className="flex-1">
                  Reload Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Custom Error Boundary Hook
 * 
 * Hook for creating error boundaries programmatically
 */
export const useErrorBoundary = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { captureError };
};

/**
 * Async Error Boundary
 * 
 * Error boundary specifically for async operations
 */
interface AsyncErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error) => void;
  fallback?: (error: Error, retry: () => void) => ReactNode;
}

export const AsyncErrorBoundary: React.FC<AsyncErrorBoundaryProps> = ({
  children,
  onError,
  fallback,
}) => {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: Error) => {
    setError(error);
    onError?.(error);
  }, [onError]);

  const retry = React.useCallback(() => {
    setError(null);
  }, []);

  if (error) {
    if (fallback) {
      return <>{fallback(error, retry)}</>;
    }

    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Operation Failed</h3>
        <p className="text-muted-foreground mb-4">
          {error.message || 'An unexpected error occurred'}
        </p>
        <Button onClick={retry} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <ErrorBoundary onError={handleError}>
      {children}
    </ErrorBoundary>
  );
};

export default ErrorBoundary;
