'use client';

import { ComingSoonPage } from '@/components/ui/coming-soon-page';
import { Users } from 'lucide-react';

export default function CustomersPage() {
  return (
    <ComingSoonPage
      title="Customers"
      description="Customer management and CRM features"
      icon={Users}
      badge="Coming Soon"
    />
  );
}
