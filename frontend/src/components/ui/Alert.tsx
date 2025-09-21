import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils'
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

// Alert variants
const alertVariants = cva(
  'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        destructive:
          'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
        success:
          'border-green-500/50 text-green-900 bg-green-50 dark:bg-green-900/20 dark:text-green-100 [&>svg]:text-green-600',
        warning:
          'border-yellow-500/50 text-yellow-900 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-100 [&>svg]:text-yellow-600',
        info:
          'border-blue-500/50 text-blue-900 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-100 [&>svg]:text-blue-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

// Alert component
const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & 
    VariantProps<typeof alertVariants> & {
      dismissible?: boolean;
      onDismiss?: () => void;
    }
>(({ className, variant, dismissible, onDismiss, children, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  >
    {children}
    {dismissible && onDismiss && (
      <button
        onClick={onDismiss}
        className="absolute right-3 top-3 p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        aria-label="Dismiss alert"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
    )}
  </div>
));
Alert.displayName = 'Alert';

// Alert title component
const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn('mb-1 font-medium leading-none tracking-tight', className)}
    {...props}
  />
));
AlertTitle.displayName = 'AlertTitle';

// Alert description component
const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm [&_p]:leading-relaxed', className)}
    {...props}
  />
));
AlertDescription.displayName = 'AlertDescription';

// Enhanced alert component with icons
interface EnhancedAlertProps extends 
  React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof alertVariants> {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  actions?: React.ReactNode;
}

const EnhancedAlert = React.forwardRef<HTMLDivElement, EnhancedAlertProps>(
  ({ 
    variant = 'default', 
    title, 
    description, 
    icon, 
    dismissible, 
    onDismiss,
    actions,
    className,
    children,
    ...props 
  }, ref) => {
    // Default icons based on variant
    const defaultIcons = {
      default: <InformationCircleIcon className="h-4 w-4" />,
      destructive: <XCircleIcon className="h-4 w-4" />,
      success: <CheckCircleIcon className="h-4 w-4" />,
      warning: <ExclamationTriangleIcon className="h-4 w-4" />,
      info: <InformationCircleIcon className="h-4 w-4" />,
    };

    const displayIcon = icon || defaultIcons[variant || 'default'];

    return (
      <Alert 
        ref={ref}
        variant={variant} 
        dismissible={dismissible}
        onDismiss={onDismiss}
        className={className}
        {...props}
      >
        {displayIcon}
        <div className={cn('space-y-1', actions && 'pb-2')}>
          {title && <AlertTitle>{title}</AlertTitle>}
          {description && <AlertDescription>{description}</AlertDescription>}
          {children}
        </div>
        {actions && (
          <div className="mt-3 flex flex-wrap gap-2">
            {actions}
          </div>
        )}
      </Alert>
    );
  }
);
EnhancedAlert.displayName = 'EnhancedAlert';

// Success alert shorthand
interface SuccessAlertProps extends Omit<EnhancedAlertProps, 'variant'> {}

const SuccessAlert: React.FC<SuccessAlertProps> = (props) => (
  <EnhancedAlert variant="success" {...props} />
);

// Error alert shorthand
interface ErrorAlertProps extends Omit<EnhancedAlertProps, 'variant'> {}

const ErrorAlert: React.FC<ErrorAlertProps> = (props) => (
  <EnhancedAlert variant="destructive" {...props} />
);

// Warning alert shorthand
interface WarningAlertProps extends Omit<EnhancedAlertProps, 'variant'> {}

const WarningAlert: React.FC<WarningAlertProps> = (props) => (
  <EnhancedAlert variant="warning" {...props} />
);

// Info alert shorthand
interface InfoAlertProps extends Omit<EnhancedAlertProps, 'variant'> {}

const InfoAlert: React.FC<InfoAlertProps> = (props) => (
  <EnhancedAlert variant="info" {...props} />
);

export {
  Alert,
  AlertTitle,
  AlertDescription,
  EnhancedAlert,
  SuccessAlert,
  ErrorAlert,
  WarningAlert,
  InfoAlert,
  alertVariants,
};
