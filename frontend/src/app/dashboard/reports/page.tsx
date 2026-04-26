'use client';

import { ComingSoonPage } from '@/components/ui/coming-soon-page';
import { FileText } from 'lucide-react';

export default function ReportsPage() {
  return (
    <ComingSoonPage
      title="Reports"
      description="Custom reports and data exports"
      icon={FileText}
      badge="Coming Soon"
    />
  );
}
