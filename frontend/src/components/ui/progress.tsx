'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/lib/utils';

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    indicatorClassName?: string;
    showValue?: boolean;
    valueLabel?: string;
  }
>(({ className, value, indicatorClassName, showValue = false, valueLabel, ...props }, ref) => {
  const normalizedValue = Math.min(100, Math.max(0, value || 0));
  
  return (
    <div className="flex items-center gap-3 w-full">
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          'relative h-3 w-full overflow-hidden rounded-full bg-secondary',
          className
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            'h-full w-full flex-1 transition-all duration-500 ease-out',
            'bg-gradient-to-r from-primary to-primary/80',
            indicatorClassName
          )}
          style={{ transform: `translateX(-${100 - normalizedValue}%)` }}
        />
      </ProgressPrimitive.Root>
      {showValue && (
        <span className="text-sm font-medium text-muted-foreground min-w-10 text-right">
          {valueLabel || `${Math.round(normalizedValue)}%`}
        </span>
      )}
    </div>
  );
});
Progress.displayName = 'Progress';

export { Progress };