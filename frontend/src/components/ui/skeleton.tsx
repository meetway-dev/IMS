import * as React from 'react';
import { cn } from '@/lib/utils';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('skeleton-shimmer rounded-lg', className)}
      {...props}
    />
  );
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl border p-6 space-y-4', className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-40" />
    </div>
  );
}

function SkeletonTable({
  rows = 5,
  columns = 4,
  className,
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div className={cn('w-full space-y-0', className)}>
      {/* Header */}
      <div className="flex items-center gap-4 border-b p-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn(
              'h-3 rounded',
              i === 0 ? 'w-32' : i === 1 ? 'w-24' : i === columns - 1 ? 'w-16' : 'w-20'
            )}
          />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex items-center gap-4 border-b border-border/50 p-4 last:border-0"
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              className={cn(
                'h-4 rounded',
                colIndex === 0 ? 'w-32' : colIndex === 1 ? 'w-24' : colIndex === columns - 1 ? 'w-16' : 'w-20'
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function SkeletonLine({ className }: { className?: string }) {
  return <Skeleton className={cn('h-4 w-full rounded', className)} />;
}

export { Skeleton, SkeletonCard, SkeletonTable, SkeletonLine };
