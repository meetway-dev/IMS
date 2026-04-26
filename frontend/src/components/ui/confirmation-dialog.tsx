'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2, type LucideIcon } from 'lucide-react';

export interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'destructive' | 'default';
  icon?: LucideIcon;
  isLoading?: boolean;
}

/**
 * A reusable confirmation dialog that replaces browser's native confirm().
 * Supports destructive and default variants with customizable text and icons.
 */
export function ConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'destructive',
  icon: Icon,
  isLoading = false,
}: ConfirmationDialogProps) {
  const DefaultIcon = variant === 'destructive' ? Trash2 : AlertTriangle;
  const DisplayIcon = Icon || DefaultIcon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                variant === 'destructive'
                  ? 'bg-destructive/10 text-destructive'
                  : 'bg-orange-100 text-orange-600'
              }`}
            >
              <DisplayIcon className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription className="mt-1">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant}
            onClick={() => {
              onConfirm();
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Please wait...' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook that provides state management for a confirmation dialog.
 * Returns the dialog state, open/close handlers, and the dialog component props.
 *
 * Usage:
 * ```tsx
 * const deleteConfirm = useConfirmation();
 *
 * // To trigger:
 * deleteConfirm.open(itemId);
 *
 * // In JSX:
 * <ConfirmationDialog
 *   {...deleteConfirm.dialogProps}
 *   onConfirm={() => {
 *     handleDelete(deleteConfirm.data);
 *     deleteConfirm.close();
 *   }}
 * />
 * ```
 */
export function useConfirmation<T = string>() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [data, setData] = React.useState<T | null>(null);

  const open = React.useCallback((value: T) => {
    setData(value);
    setIsOpen(true);
  }, []);

  const close = React.useCallback(() => {
    setIsOpen(false);
    setData(null);
  }, []);

  const dialogProps = React.useMemo(
    () => ({
      open: isOpen,
      onOpenChange: (open: boolean) => {
        if (!open) close();
      },
    }),
    [isOpen, close]
  );

  return { isOpen, data, open, close, dialogProps };
}
