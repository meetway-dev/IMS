'use client';

import { ComingSoonPage } from '@/components/ui/coming-soon-page';
import { Settings } from 'lucide-react';

export default function IntegrationsPage() {
  return (
    <ComingSoonPage
      title="Integrations"
      description="Third-party service connections and API integrations"
      icon={Settings}
      badge="Coming Soon"
    />
  );
}
