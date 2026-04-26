'use client';

import { ComingSoonPage } from '@/components/ui/coming-soon-page';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <ComingSoonPage
      title="Settings"
      description="System configuration and preferences"
      icon={Settings}
      badge="Coming Soon"
    />
  );
}
