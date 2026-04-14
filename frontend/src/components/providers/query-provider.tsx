'use client';

import * as React from 'react';
import { QueryClientProvider as TanStackQueryProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <TanStackQueryProvider client={queryClient}>
      {children}
    </TanStackQueryProvider>
  );
}
