'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  className
}: TableSkeletonProps) {
  return (
    <div className={cn('w-full', className)}>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <motion.div
          key={rowIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: rowIndex * 0.05 }}
          className="flex items-center gap-4 p-4 border-b border-border/30 last:border-b-0"
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              className={cn(
                'h-4 bg-muted/50 rounded animate-pulse',
                colIndex === 0 ? 'w-32' : colIndex === 1 ? 'w-24' : 'w-20'
              )}
            />
          ))}
        </motion.div>
      ))}
    </div>
  );
}

interface TableRowSkeletonProps {
  columns?: number;
  className?: string;
}

export function TableRowSkeleton({
  columns = 4,
  className
}: TableRowSkeletonProps) {
  return (
    <div className={cn('flex items-center gap-4 p-4', className)}>
      {Array.from({ length: columns }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'h-4 bg-muted/50 rounded animate-pulse',
            index === 0 ? 'w-32' : index === 1 ? 'w-24' : 'w-20'
          )}
        />
      ))}
    </div>
  );
}