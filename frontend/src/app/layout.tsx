import type { Metadata } from 'next';
import '../styles/globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { ModalProvider } from '@/context/modal.context';
import { ModalFactoryProvider } from '@/components/ui/modal-factory';
import { Toaster } from '@/components/ui/toaster';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'IMS - Inventory Management System',
  description: 'Sanitary & Electrical Store Inventory Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <ModalProvider>
              <ModalFactoryProvider>
                {children}
              </ModalFactoryProvider>
            </ModalProvider>
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
