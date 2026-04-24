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
  const { isAuthenticated, isLoading: authLoading, isInitialized, initializeAuth } = useAuthStore();
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);
  const [hasRedirected, setHasRedirected] = React.useState(false);

  // Initialize auth state from localStorage on mount
  React.useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Check authentication status
  React.useEffect(() => {
    // Wait for auth initialization to complete
    if (!isInitialized || authLoading) {
      console.log('DashboardLayout: Waiting for auth initialization', { isInitialized, authLoading });
      return;
    }
    
    console.log('DashboardLayout: Auth initialized', { isAuthenticated, hasRedirected, pathname });
    
    if (!isAuthenticated && !hasRedirected) {
      console.log('DashboardLayout: Not authenticated, redirecting to login with redirect param', pathname);
      setHasRedirected(true);
      // Preserve current path for redirect back after login
      const redirectUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
      router.push(redirectUrl);
    } else if (isAuthenticated) {
      console.log('DashboardLayout: Authenticated, setting isCheckingAuth false');
      setIsCheckingAuth(false);
    }
  }, [isAuthenticated, authLoading, isInitialized, router, hasRedirected, pathname]);

  // Loading state while checking auth or initializing
  if (isCheckingAuth || authLoading || !isInitialized) {
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
