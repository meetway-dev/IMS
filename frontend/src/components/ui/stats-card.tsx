'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { type LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';

export interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
    label?: string;
  };
  /** Optional gradient class for the icon container background (e.g. "from-blue-500 to-cyan-500") */
  color?: string;
  className?: string;
  loading?: boolean;
}

const StatsCard = React.forwardRef<HTMLDivElement, StatsCardProps>(
  ({ title, value, description, icon: Icon, trend, color, className, loading = false }, ref) => {
    if (loading) {
      return (
        <Card ref={ref} className={cn('p-6', className)}>
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-28" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
        </Card>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Card
          ref={ref}
          className={cn(
            'group p-6 transition-shadow duration-200 hover:shadow-medium',
            className
          )}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {title}
              </p>
              <p className="text-2xl font-bold tracking-tight">{value}</p>
              <div className="flex items-center gap-2">
                {trend && (
                  <span
                    className={cn(
                      'inline-flex items-center text-xs font-semibold',
                      trend.isPositive ? 'text-success' : 'text-destructive'
                    )}
                  >
                    {trend.isPositive ? (
                      <ArrowUpRight className="mr-0.5 h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="mr-0.5 h-3 w-3" />
                    )}
                    {trend.value}
                  </span>
                )}
                {(description || trend?.label) && (
                  <span className="text-xs text-muted-foreground">
                    {trend?.label || description}
                  </span>
                )}
              </div>
            </div>
            {Icon && (
              <div className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl',
                color ? `bg-gradient-to-br ${color}` : 'bg-muted'
              )}>
                <Icon className={cn('h-5 w-5', color ? 'text-white' : 'text-muted-foreground')} />
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    );
  }
);

StatsCard.displayName = 'StatsCard';

export { StatsCard };

// ─── Stats Grid ─────────────────────────────────────────────────────────────

interface StatsGridProps {
  children: React.ReactNode;
  className?: string;
}

export function StatsGrid({ children, className }: StatsGridProps) {
  return (
    <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {children}
    </div>
  );
}
