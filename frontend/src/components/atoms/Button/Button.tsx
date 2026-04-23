/**
 * Button Component - Atom Level
 * 
 * A basic button component with variants, sizes, and loading states.
 * This component follows the Atomic Design pattern as a foundational UI element.
 * 
 * @component
 * @example
 * ```tsx
 * <Button variant="primary" size="md" loading={isLoading}>
 *   Click Me
 * </Button>
 * ```
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

// Define button variants using class-variance-authority
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-4 py-2 text-sm',
        lg: 'h-10 px-8 text-base',
        icon: 'h-9 w-9',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Display loading spinner and disable button */
  loading?: boolean;
  /** Icon to display before text */
  icon?: React.ReactNode;
  /** Icon to display after text */
  iconAfter?: React.ReactNode;
}

/**
 * Button component - A versatile button with multiple variants and states.
 * 
 * Features:
 * - Multiple variants (primary, secondary, destructive, outline, ghost, link)
 * - Multiple sizes (sm, md, lg, icon)
 * - Loading state with spinner
 * - Icon support
 * - Full-width option
 * - Accessibility compliant
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      loading = false,
      disabled = false,
      icon,
      iconAfter,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {!loading && icon && <span className="flex-shrink-0" aria-hidden="true">{icon}</span>}
        {children && <span className="truncate">{children}</span>}
        {!loading && iconAfter && <span className="flex-shrink-0" aria-hidden="true">{iconAfter}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };