/**
 * Input Component - Atom Level
 * 
 * A basic input component with variants, error states, and validation.
 * This component follows the Atomic Design pattern as a foundational form element.
 * 
 * @component
 * @example
 * ```tsx
 * <Input
 *   type="text"
 *   placeholder="Enter your name"
 *   error={errors.name?.message}
 *   disabled={isSubmitting}
 * />
 * ```
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Define input variants using class-variance-authority
const inputVariants = cva(
  'flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-input focus-visible:ring-ring',
        error: 'border-destructive focus-visible:ring-destructive',
        success: 'border-success focus-visible:ring-success',
        warning: 'border-warning focus-visible:ring-warning',
      },
      size: {
        sm: 'h-8 px-2 py-1 text-xs',
        md: 'h-9 px-3 py-2 text-sm',
        lg: 'h-10 px-4 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  /** Error message to display below input */
  error?: string;
  /** Helper text to display below input */
  helperText?: string;
  /** Label for the input (for accessibility) */
  label?: string;
  /** Whether the input is required */
  required?: boolean;
  /** Icon to display before input */
  iconBefore?: React.ReactNode;
  /** Icon to display after input */
  iconAfter?: React.ReactNode;
}

/**
 * Input component - A versatile input field with validation states.
 * 
 * Features:
 * - Multiple variants (default, error, success, warning)
 * - Multiple sizes (sm, md, lg)
 * - Error state with message display
 * - Helper text support
 * - Icon support (before/after)
 * - Accessibility compliant with proper labels
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      size,
      error,
      helperText,
      label,
      required,
      iconBefore,
      iconAfter,
      id,
      type = 'text',
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || React.useId();
    const hasError = !!error;
    const currentVariant = hasError ? 'error' : variant;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1 block text-sm font-medium text-foreground"
          >
            {label}
            {required && <span className="ml-1 text-destructive">*</span>}
          </label>
        )}
        
        <div className="relative">
          {iconBefore && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {iconBefore}
            </div>
          )}
          
          <input
            id={inputId}
            type={type}
            className={cn(
              inputVariants({ variant: currentVariant, size, className }),
              iconBefore && 'pl-10',
              iconAfter && 'pr-10',
              disabled && 'cursor-not-allowed'
            )}
            ref={ref}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            aria-required={required}
            {...props}
          />
          
          {iconAfter && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {iconAfter}
            </div>
          )}
        </div>
        
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-1 text-xs text-destructive"
            role="alert"
          >
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p
            id={`${inputId}-helper`}
            className="mt-1 text-xs text-muted-foreground"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };