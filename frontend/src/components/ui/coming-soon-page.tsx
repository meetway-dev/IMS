'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { ArrowLeft, Construction } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface ComingSoonPageProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  badge?: string;
  backHref?: string;
  backLabel?: string;
}

export function ComingSoonPage({
  title,
  description,
  icon: Icon = Construction,
  badge = 'Coming Soon',
  backHref = '/dashboard',
  backLabel = 'Back to Dashboard',
}: ComingSoonPageProps) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />

      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 p-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6">
          <Icon className="h-8 w-8" />
        </div>

        <h2 className="text-xl font-semibold tracking-tight text-foreground mb-2">
          Under Development
        </h2>

        <p className="text-sm text-muted-foreground text-center max-w-md mb-2">
          We're working hard to bring you the <strong>{title}</strong> feature.
          This section will be available in an upcoming release.
        </p>

        {badge && (
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-6">
            {badge}
          </span>
        )}

        <Button asChild variant="outline" size="sm" className="gap-2">
          <Link href={backHref}>
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>
        </Button>
      </div>
    </div>
  );
}
