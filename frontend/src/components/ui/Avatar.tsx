import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils'
import { getInitials } from '@/lib/utils';

// Avatar variants
const avatarVariants = cva(
  'relative flex shrink-0 overflow-hidden rounded-full',
  {
    variants: {
      size: {
        sm: 'h-8 w-8',
        default: 'h-10 w-10',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16',
        '2xl': 'h-20 w-20',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

// Avatar root component
const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> &
    VariantProps<typeof avatarVariants>
>(({ className, size, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(avatarVariants({ size }), className)}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

// Avatar image component
const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn('aspect-square h-full w-full object-cover', className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

// Avatar fallback component
const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground',
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

// Enhanced Avatar component with automatic initials and status indicator
interface EnhancedAvatarProps extends 
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
  VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  name?: string;
  showStatus?: boolean;
  status?: 'online' | 'offline' | 'away' | 'busy';
  fallbackClassName?: string;
}

const UserAvatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  EnhancedAvatarProps
>(({ 
  className, 
  size, 
  src, 
  alt, 
  name, 
  showStatus, 
  status = 'offline',
  fallbackClassName,
  ...props 
}, ref) => {
  // Status indicator colors
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
  };

  // Status indicator sizes based on avatar size
  const statusSizes = {
    sm: 'h-2 w-2',
    default: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
    xl: 'h-4 w-4',
    '2xl': 'h-5 w-5',
  };

  return (
    <div className="relative">
      <Avatar ref={ref} className={className} size={size} {...props}>
        <AvatarImage src={src} alt={alt || name} />
        <AvatarFallback className={fallbackClassName}>
          {name ? getInitials(name) : 'U'}
        </AvatarFallback>
      </Avatar>
      
      {showStatus && (
        <span
          className={cn(
            'absolute bottom-0 right-0 block rounded-full ring-2 ring-white dark:ring-gray-800',
            statusColors[status],
            statusSizes[size || 'default']
          )}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
});
UserAvatar.displayName = 'UserAvatar';

// Avatar group component for displaying multiple avatars
interface AvatarGroupProps {
  avatars: Array<{
    src?: string;
    alt?: string;
    name?: string;
  }>;
  max?: number;
  size?: VariantProps<typeof avatarVariants>['size'];
  className?: string;
}

const AvatarGroup: React.FC<AvatarGroupProps> = ({ 
  avatars, 
  max = 4, 
  size = 'default',
  className 
}) => {
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = Math.max(0, avatars.length - max);

  return (
    <div className={cn('flex -space-x-2', className)}>
      {visibleAvatars.map((avatar, index) => (
        <UserAvatar
          key={index}
          src={avatar.src}
          alt={avatar.alt}
          name={avatar.name}
          size={size}
          className="ring-2 ring-white dark:ring-gray-800"
        />
      ))}
      
      {remainingCount > 0 && (
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-300 ring-2 ring-white dark:ring-gray-800',
            avatarVariants({ size })
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

export { 
  Avatar, 
  AvatarImage, 
  AvatarFallback, 
  UserAvatar, 
  AvatarGroup,
  avatarVariants 
};
