import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils'

// Loading spinner variants
const spinnerVariants = cva(
  'animate-spin rounded-full border-2 border-current border-t-transparent',
  {
    variants: {
      size: {
        sm: 'h-4 w-4',
        default: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12',
      },
      variant: {
        default: 'text-primary',
        secondary: 'text-secondary',
        muted: 'text-muted-foreground',
        white: 'text-white',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
  }
);

// Loading spinner props
interface LoadingSpinnerProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  label?: string;
}

// Loading spinner component
const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size, variant, label, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(spinnerVariants({ size, variant }), className)}
      aria-label={label || 'Loading'}
      role="status"
      {...props}
    >
      <span className="sr-only">{label || 'Loading...'}</span>
    </div>
  )
);
LoadingSpinner.displayName = 'LoadingSpinner';

// Full page loading component
interface LoadingPageProps {
  message?: string;
  className?: string;
}

const LoadingPage: React.FC<LoadingPageProps> = ({ 
  message = 'Loading...', 
  className 
}) => (
  <div 
    className={cn(
      'flex flex-col items-center justify-center min-h-[400px] space-y-4',
      className
    )}
  >
    <LoadingSpinner size="xl" />
    <p className="text-muted-foreground text-sm">{message}</p>
  </div>
);

// Inline loading component
interface LoadingInlineProps {
  message?: string;
  size?: VariantProps<typeof spinnerVariants>['size'];
  className?: string;
}

const LoadingInline: React.FC<LoadingInlineProps> = ({ 
  message = 'Loading...', 
  size = 'sm',
  className 
}) => (
  <div className={cn('flex items-center space-x-2', className)}>
    <LoadingSpinner size={size} />
    <span className="text-muted-foreground text-sm">{message}</span>
  </div>
);

// Skeleton component for loading placeholders
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'rounded' | 'circle';
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variantClasses = {
      default: 'rounded-md',
      rounded: 'rounded-lg',
      circle: 'rounded-full',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'animate-pulse bg-muted',
          variantClasses[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Skeleton.displayName = 'Skeleton';

// Card skeleton for loading states
const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('space-y-4 p-6', className)}>
    <div className="space-y-2">
      <Skeleton className="h-4 w-[250px]" />
      <Skeleton className="h-4 w-[200px]" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  </div>
);

// User list skeleton
const UserListSkeleton: React.FC<{ count?: number; className?: string }> = ({ 
  count = 5, 
  className 
}) => (
  <div className={cn('space-y-4', className)}>
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
        <Skeleton variant="circle" className="h-12 w-12" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-3 w-[150px]" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-6 w-[80px]" />
          <Skeleton className="h-4 w-[60px]" />
        </div>
      </div>
    ))}
  </div>
);

// Table skeleton
const TableSkeleton: React.FC<{ 
  rows?: number; 
  cols?: number; 
  className?: string; 
}> = ({ 
  rows = 5, 
  cols = 4, 
  className 
}) => (
  <div className={cn('space-y-4', className)}>
    {/* Table header */}
    <div className="flex space-x-4 p-4 border-b">
      {Array.from({ length: cols }).map((_, index) => (
        <Skeleton key={index} className="h-4 flex-1" />
      ))}
    </div>
    
    {/* Table rows */}
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4 p-4 border-b">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

// Form skeleton
const FormSkeleton: React.FC<{ 
  fields?: number; 
  className?: string; 
}> = ({ 
  fields = 4, 
  className 
}) => (
  <div className={cn('space-y-6', className)}>
    {Array.from({ length: fields }).map((_, index) => (
      <div key={index} className="space-y-2">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-10 w-full" />
      </div>
    ))}
    <div className="flex justify-end space-x-2">
      <Skeleton className="h-10 w-[80px]" />
      <Skeleton className="h-10 w-[100px]" />
    </div>
  </div>
);

// Chart skeleton
const ChartSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('space-y-4', className)}>
    <div className="flex justify-between items-center">
      <Skeleton className="h-6 w-[200px]" />
      <Skeleton className="h-4 w-[100px]" />
    </div>
    <Skeleton className="h-[300px] w-full" variant="rounded" />
    <div className="flex justify-center space-x-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex items-center space-x-2">
          <Skeleton variant="circle" className="h-3 w-3" />
          <Skeleton className="h-4 w-[60px]" />
        </div>
      ))}
    </div>
  </div>
);

export {
  LoadingSpinner,
  LoadingPage,
  LoadingInline,
  Skeleton,
  CardSkeleton,
  UserListSkeleton,
  TableSkeleton,
  FormSkeleton,
  ChartSkeleton,
  spinnerVariants,
};

export default LoadingSpinner;
