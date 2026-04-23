import * as React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'success';
  text?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  xs: 'h-4 w-4',
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

const variantClasses = {
  default: 'text-primary',
  primary: 'text-primary',
  secondary: 'text-muted-foreground',
  destructive: 'text-destructive',
  success: 'text-emerald-500',
};

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = 'md', variant = 'default', text, fullScreen = false, ...props }, ref) => {
    const spinner = (
      <div
        ref={ref}
        className={cn(
          'inline-flex flex-col items-center justify-center',
          fullScreen && 'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm',
          className
        )}
        {...props}
      >
        <div className={cn('flex flex-col items-center justify-center', fullScreen && 'space-y-4')}>
          <Loader2
            className={cn(
              'animate-spin',
              sizeClasses[size],
              variantClasses[variant]
            )}
          />
          {text && (
            <p className={cn(
              'mt-2 text-sm text-muted-foreground',
              size === 'xs' && 'text-xs',
              size === 'sm' && 'text-sm',
              size === 'md' && 'text-base',
              size === 'lg' && 'text-lg',
              size === 'xl' && 'text-xl'
            )}>
              {text}
            </p>
          )}
        </div>
      </div>
    );

    return spinner;
  }
);
Spinner.displayName = 'Spinner';

export { Spinner };