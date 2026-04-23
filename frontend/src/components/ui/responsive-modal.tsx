import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './dialog';
import { ScrollArea } from './scroll-area';
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

  const renderContent = () => {
    const content = (
      <div className={cn('flex flex-col h-full', bodyClassName)}>
        {children}
      </div>
    );

    if (scrollable) {
      return (
        <ScrollArea className={cn('flex-1 pr-4 -mr-4', heightClass !== 'auto' && heightClass)}>
          {content}
        </ScrollArea>
      );
    }

    return content;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(sizeClasses[size], 'flex flex-col p-0 gap-0', className)}
      >
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-50 rounded-md p-1 opacity-70 ring-offset-background transition-all hover:opacity-100 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        )}

        {(title || description) && (
          <DialogHeader className={cn('px-6 pt-6 pb-4 border-b', headerClassName)}>
            {title && (
              <DialogTitle className="text-lg font-semibold tracking-tight">
                {title}
              </DialogTitle>
            )}
            {description && (
              <p className="text-sm text-muted-foreground mt-1.5">
                {description}
              </p>
            )}
          </DialogHeader>
        )}

        <div className={cn(
          'flex-1 px-6 py-5',
          contentClassName,
          !scrollable && heightClass !== 'auto' && heightClass
        )}>
          {renderContent()}
        </div>

        {footer && (
          <DialogFooter className={cn('px-6 py-4 border-t bg-muted/30', footerClassName)}>
            {footer}
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
      maxHeight="auto"
      scrollable={false}
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