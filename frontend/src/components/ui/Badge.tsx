import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils'

// Badge variants
const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        success:
          'border-transparent bg-green-500 text-white hover:bg-green-500/80',
        warning:
          'border-transparent bg-yellow-500 text-white hover:bg-yellow-500/80',
        info:
          'border-transparent bg-blue-500 text-white hover:bg-blue-500/80',
      },
      size: {
        default: 'text-xs px-2.5 py-0.5',
        sm: 'text-xs px-2 py-0.5',
        lg: 'text-sm px-3 py-1',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

// Badge props interface
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
  removable?: boolean;
  onRemove?: () => void;
}

// Badge component
function Badge({ 
  className, 
  variant, 
  size,
  icon,
  removable,
  onRemove,
  children,
  ...props 
}: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {icon && (
        <span className="mr-1 flex-shrink-0">
          {icon}
        </span>
      )}
      {children}
      {removable && (
        <button
          onClick={onRemove}
          className="ml-1 flex-shrink-0 rounded-full hover:bg-black/10 p-0.5 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-white"
          aria-label="Remove badge"
        >
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

// Status badge component for common status values
interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: 'active' | 'inactive' | 'pending' | 'suspended' | 'banned';
}

function StatusBadge({ status, ...props }: StatusBadgeProps) {
  const statusConfig = {
    active: { variant: 'success' as const, text: 'Active' },
    inactive: { variant: 'secondary' as const, text: 'Inactive' },
    pending: { variant: 'warning' as const, text: 'Pending' },
    suspended: { variant: 'destructive' as const, text: 'Suspended' },
    banned: { variant: 'destructive' as const, text: 'Banned' },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} {...props}>
      {config.text}
    </Badge>
  );
}

// Role badge component for user roles
interface RoleBadgeProps extends Omit<BadgeProps, 'variant'> {
  role: 'admin' | 'user' | 'moderator' | 'guest';
}

function RoleBadge({ role, ...props }: RoleBadgeProps) {
  const roleConfig = {
    admin: { variant: 'destructive' as const, text: 'Admin' },
    moderator: { variant: 'warning' as const, text: 'Moderator' },
    user: { variant: 'default' as const, text: 'User' },
    guest: { variant: 'outline' as const, text: 'Guest' },
  };

  const config = roleConfig[role];

  return (
    <Badge variant={config.variant} {...props}>
      {config.text}
    </Badge>
  );
}

export { Badge, StatusBadge, RoleBadge, badgeVariants };
export default Badge;
