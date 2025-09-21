import React from 'react';
import { cn } from '../../lib/utils'

interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const Separator: React.FC<SeparatorProps> = ({ 
  orientation = 'horizontal',
  className,
  ...props 
}) => {
  return (
    <div
      className={cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-px w-full' : 'w-px h-full',
        className
      )}
      {...props}
    />
  );
};

export default Separator;
