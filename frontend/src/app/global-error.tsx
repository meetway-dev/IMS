'use client';

import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="font-sans antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center p-6">
          <div className="text-center max-w-md space-y-6">
            <div className="space-y-2">
              <p className="text-5xl font-bold tracking-tighter">Error</p>
              <h1 className="text-lg font-semibold">Critical Application Error</h1>
              <p className="text-sm text-gray-500 leading-relaxed">
                {error.message || 'A critical error occurred. Please refresh the page.'}
              </p>
            </div>
            <Button onClick={() => window.location.reload()} className="w-full">
              Refresh Page
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
