import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Input variants
const inputVariants = cva(
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: '',
        error: 'border-destructive focus-visible:ring-destructive',
        success: 'border-green-500 focus-visible:ring-green-500',
      },
      inputSize: {
        default: 'h-10',
        sm: 'h-9',
        lg: 'h-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'default',
    },
  }
);

// Input props interface
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  error?: string;
  success?: string;
  label?: string;
  helperText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  wrapperClassName?: string;
}

// Input component
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    variant,
    inputSize,
    error,
    success,
    label,
    helperText,
    startIcon,
    endIcon,
    wrapperClassName,
    id,
    ...props
  }, ref) => {
    // Generate unique ID if not provided
    const inputId = id || React.useId();
    
    // Determine variant based on error/success state
    const currentVariant = error ? 'error' : success ? 'success' : variant;
    
    // Wrapper classes for icon positioning
    const wrapperClasses = cn(
      'relative',
      wrapperClassName
    );
    
    // Input classes with icon padding
    const inputClasses = cn(
      inputVariants({ variant: currentVariant, inputSize }),
      {
        'pl-10': startIcon,
        'pr-10': endIcon,
      },
      className
    );

    return (
      <div className={wrapperClasses}>
        {/* Label */}
        {label && (
          <label 
            htmlFor={inputId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block"
          >
            {label}
          </label>
        )}
        
        {/* Input wrapper for icons */}
        <div className="relative">
          {/* Start icon */}
          {startIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {startIcon}
            </div>
          )}
          
          {/* Input field */}
          <input
            id={inputId}
            className={inputClasses}
            ref={ref}
            {...props}
          />
          
          {/* End icon */}
          {endIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {endIcon}
            </div>
          )}
        </div>
        
        {/* Helper text, error, or success message */}
        {(error || success || helperText) && (
          <div className="mt-1 text-sm">
            {error && (
              <p className="text-destructive flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </p>
            )}
            {success && !error && (
              <p className="text-green-600 flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                {success}
              </p>
            )}
            {helperText && !error && !success && (
              <p className="text-muted-foreground">{helperText}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };
export default Input;
