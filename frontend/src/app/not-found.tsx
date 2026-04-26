import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="text-center max-w-md space-y-6">
        <div className="space-y-2">
          <p className="text-7xl font-bold tracking-tighter text-foreground">404</p>
          <h1 className="text-xl font-semibold tracking-tight">Page not found</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The page you are looking for does not exist or has been moved to a different location.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Button asChild variant="default">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
