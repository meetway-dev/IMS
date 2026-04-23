'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { useAuthStore } from '@/store/auth-store';
import { LoadingState } from '@/components/ui/states';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading: authLoading, initializeAuth } = useAuthStore();
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);
  const [hasRedirected, setHasRedirected] = React.useState(false);

  // Initialize auth state from localStorage on mount
  React.useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Check authentication status
  React.useEffect(() => {
    if (!isAuthenticated && !authLoading && !hasRedirected) {
      setHasRedirected(true);
      router.push('/login');
    } else if (isAuthenticated && !authLoading) {
      setIsCheckingAuth(false);
    }
  }, [isAuthenticated, authLoading, router, hasRedirected]);

  // Loading state while checking auth
  if (isCheckingAuth || authLoading) {
    return <LoadingState text="Loading dashboard..." className="h-screen" />;
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
