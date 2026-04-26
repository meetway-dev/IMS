'use client';

import { ComingSoonPage } from '@/components/ui/coming-soon-page';
import { BarChart3 } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <ComingSoonPage
      title="Analytics"
      description="Business intelligence and data insights"
      icon={BarChart3}
      badge="Beta"
    />
  );
}
