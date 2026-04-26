import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './dialog';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export interface ResponsiveModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full' | 'auto';
  maxHeight?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'auto' | string;
  scrollable?: boolean;
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
}

const sizeClasses = {
  xs: 'max-w-xs',
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  full: 'max-w-[95vw]',
  auto: 'max-w-[95vw] lg:max-w-[90vw] xl:max-w-[85vw] 2xl:max-w-[80vw]',
};

const heightClasses = {
  sm: 'max-h-[50vh]',
  md: 'max-h-[65vh]',
  lg: 'max-h-[75vh]',
  xl: 'max-h-[85vh]',
  full: 'max-h-[95vh]',
  auto: 'max-h-[95vh]',
};

export function ResponsiveModal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'auto',
  maxHeight = 'auto',
  scrollable = true,
  closeOnOverlayClick = true,
  showCloseButton = true,
  className,
  contentClassName,
  headerClassName,
  bodyClassName,
  footerClassName,
}: ResponsiveModalProps) {
  const handleOpenChange = (openState: boolean) => {
    if (!openState && closeOnOverlayClick) {
      onClose();
    }
  };

  const heightClass = typeof maxHeight === 'string' && !['sm', 'md', 'lg', 'xl', 'full', 'auto'].includes(maxHeight)
    ? maxHeight
    : heightClasses[maxHeight as keyof typeof heightClasses];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          sizeClasses[size],
          'flex flex-col p-0 gap-0 overflow-hidden max-h-[90vh] rounded-xl border shadow-2xl backdrop-blur-xl bg-background/95',
          className
        )}
      >
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-50 rounded-lg p-2 opacity-70 ring-offset-background transition-all hover:opacity-100 hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        )}

        {(title || description) && (
          <DialogHeader className={cn('px-8 pt-8 pb-6 border-b bg-gradient-to-b from-background to-background/80', headerClassName)}>
            {title && (
              <DialogTitle className="text-xl font-semibold tracking-tight">
                {title}
              </DialogTitle>
            )}
            {description && (
              <p className="text-sm text-muted-foreground mt-2">
                {description}
              </p>
            )}
          </DialogHeader>
        )}

        <div className={cn(
          'flex-1 min-h-0 overflow-y-auto px-8 py-6',
          contentClassName,
          heightClass !== 'auto' && heightClass
        )}>
          <div className={cn('flex flex-col gap-6', bodyClassName)}>
            {children}
          </div>
        </div>

        {footer && (
          <DialogFooter className={cn('px-8 py-6 border-t bg-gradient-to-t from-muted/10 to-transparent', footerClassName)}>
            <div className="flex items-center justify-between w-full gap-3">
              {footer}
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Pre-configured modal variants for common use cases
export function DataRichModal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  ...props
}: Omit<ResponsiveModalProps, 'size' | 'maxHeight' | 'scrollable'>) {
  return (
    <ResponsiveModal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="auto"
      maxHeight="xl"
      scrollable={true}
      footer={footer}
      {...props}
    >
      {children}
    </ResponsiveModal>
  );
}

export function FormModal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  ...props
}: Omit<ResponsiveModalProps, 'size' | 'maxHeight' | 'scrollable'>) {
  return (
    <ResponsiveModal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="lg"
      maxHeight="xl"
      scrollable={true}
      footer={footer}
      {...props}
    >
      {children}
    </ResponsiveModal>
  );
}

export function DetailModal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  ...props
}: Omit<ResponsiveModalProps, 'size' | 'maxHeight' | 'scrollable'>) {
  return (
    <ResponsiveModal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="xl"
      maxHeight="lg"
      scrollable={true}
      footer={footer}
      {...props}
    >
      {children}
    </ResponsiveModal>
  );
}