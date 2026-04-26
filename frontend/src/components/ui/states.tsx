'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AlertCircle, Inbox, RefreshCw, type LucideIcon } from 'lucide-react';

// ─── Empty State ────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-6 text-center rounded-xl border border-dashed',
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-1.5 text-sm text-muted-foreground max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <Button
          onClick={action.onClick}
          className="mt-6"
          size="sm"
        >
          {action.icon && <action.icon className="mr-2 h-4 w-4" />}
          {action.label}
        </Button>
      )}
    </div>
  );
}

// ─── Error State ────────────────────────────────────────────────────────────

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-6 text-center rounded-xl border border-destructive/20',
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
        <AlertCircle className="h-6 w-6 text-destructive" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground max-w-sm leading-relaxed">
        {description}
      </p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          size="sm"
          className="mt-6"
        >
          <RefreshCw className="mr-2 h-3.5 w-3.5" />
          Try again
        </Button>
      )}
    </div>
  );
}

// ─── Loading State ──────────────────────────────────────────────────────────

interface LoadingStateProps {
  text?: string;
  className?: string;
}

export function LoadingState({
  text = 'Loading...',
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-6',
        className
      )}
    >
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
      {text && (
        <p className="mt-4 text-sm text-muted-foreground">
          {text}
        </p>
      )}
    </div>
  );
}
