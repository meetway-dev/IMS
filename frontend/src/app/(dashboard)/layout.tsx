'use client';

import * as React from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { useProfile } from '@/hooks/use-auth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch user profile when in dashboard
  useProfile();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-muted/10 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
