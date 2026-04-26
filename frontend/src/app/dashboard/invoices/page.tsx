'use client';

import { ComingSoonPage } from '@/components/ui/coming-soon-page';
import { FileText } from 'lucide-react';

export default function InvoicesPage() {
  return (
    <ComingSoonPage
      title="Invoices"
      description="Billing and invoice management"
      icon={FileText}
      badge="Coming Soon"
    />
  );
}
