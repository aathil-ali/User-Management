import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils'

// Label variants
const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
);

// Label component
const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants> & {
      required?: boolean;
      optional?: boolean;
    }
>(({ className, children, required, optional, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  >
    {children}
    {required && (
      <span className="text-destructive ml-1" aria-label="required">
        *
      </span>
    )}
    {optional && !required && (
      <span className="text-muted-foreground ml-1 text-xs font-normal">
        (optional)
      </span>
    )}
  </LabelPrimitive.Root>
));

Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
