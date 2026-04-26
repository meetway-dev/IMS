'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="text-center max-w-md space-y-6">
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-semibold tracking-tight">Something went wrong</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {error.message || 'An unexpected error occurred. Please try again.'}
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={reset} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
          <Button asChild className="gap-2">
            <a href="/dashboard">
              <Home className="h-4 w-4" />
              Dashboard
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
