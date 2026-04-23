/**
 * Atoms Barrel Export
 *
 * Export all atom-level components from the Atomic Design structure.
 * Atoms are basic UI elements that cannot be broken down further.
 *
 * @example
 * ```tsx
 * import { Button, Input, Badge, Checkbox, Label, Spinner } from '@/components/atoms';
 * ```
 */

export { Button, type ButtonProps, buttonVariants } from './Button';
export { Input, type InputProps, inputVariants } from './Input';
export { Badge, type BadgeProps, badgeVariants } from './Badge';
export { Checkbox, type CheckboxProps } from './Checkbox';
export { Label, type LabelProps, labelVariants } from './Label';
export { Spinner, type SpinnerProps } from './Spinner';