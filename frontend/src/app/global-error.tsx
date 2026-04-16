'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-muted/10 p-4">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <CardTitle className="text-4xl font-bold">Critical Error</CardTitle>
              <CardDescription>Application error</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {error.message || 'A critical error occurred. Please refresh the page.'}
              </p>
              <Button onClick={() => window.location.reload()} className="w-full">
                Refresh Page
              </Button>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  );
}
