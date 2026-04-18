import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline:
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    // Render loader and children
    const content = loading ? (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {children}
      </>
    ) : (
      children
    );

    // If asChild is true, ensure a single child for Slot
    let slotChild = content;
    if (asChild) {
      const childCount = React.Children.count(content);
      if (childCount === 0) {
        // No children, provide a placeholder span (invisible) to satisfy Slot
        slotChild = <span className="hidden" />;
      } else if (childCount === 1) {
        // Single child, ensure it's a valid element
        const child = React.Children.toArray(content)[0];
        if (React.isValidElement(child)) {
          slotChild = child;
        } else {
          // Fallback wrap
          slotChild = <span className="inline-flex items-center justify-center gap-2">{content}</span>;
        }
      } else {
        // Multiple children, wrap them in a span
        slotChild = <span className="inline-flex items-center justify-center gap-2">{content}</span>;
      }
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }), loading && 'cursor-wait')}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {slotChild}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
