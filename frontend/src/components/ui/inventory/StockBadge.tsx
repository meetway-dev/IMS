'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, XCircle, Package } from 'lucide-react';

export interface StockBadgeProps {
  quantity: number;
  minStock?: number;
  maxStock?: number;
  showIcon?: boolean;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StockBadge({
  quantity,
  minStock = 10,
  maxStock = 100,
  showIcon = true,
  showText = true,
  size = 'md',
  className,
}: StockBadgeProps) {
  const getStockStatus = () => {
    if (quantity === 0) {
      return {
        variant: 'destructive' as const,
        label: 'Out of Stock',
        icon: <XCircle className="h-3 w-3" />,
      };
    }
    
    if (quantity <= minStock) {
      return {
        variant: 'warning' as const,
        label: 'Low Stock',
        icon: <AlertTriangle className="h-3 w-3" />,
      };
    }
    
    if (quantity >= maxStock) {
      return {
        variant: 'info' as const,
        label: 'Overstock',
        icon: <Package className="h-3 w-3" />,
      };
    }
    
    return {
      variant: 'success' as const,
      label: 'In Stock',
      icon: <CheckCircle className="h-3 w-3" />,
    };
  };

  const status = getStockStatus();
  const sizeClasses = {
    sm: 'h-5 px-2 text-xs',
    md: 'h-6 px-2.5 text-sm',
    lg: 'h-7 px-3 text-base',
  };

  return (
    <Badge
      variant={status.variant}
      className={cn(
        'inline-flex items-center gap-1.5 font-medium',
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <span className="flex-shrink-0">{status.icon}</span>}
      {showText && <span>{status.label}</span>}
      <span className="font-semibold">({quantity})</span>
    </Badge>
  );
}

export function StockLevelIndicator({
  quantity,
  minStock = 10,
  maxStock = 100,
  showLabels = true,
}: {
  quantity: number;
  minStock?: number;
  maxStock?: number;
  showLabels?: boolean;
}) {
  const percentage = Math.min((quantity / maxStock) * 100, 100);
  
  const getBarColor = () => {
    if (quantity === 0) return 'bg-destructive';
    if (quantity <= minStock) return 'bg-warning';
    if (quantity >= maxStock * 0.9) return 'bg-info';
    return 'bg-emerald-500';
  };

  const getStatusText = () => {
    if (quantity === 0) return 'Empty';
    if (quantity <= minStock) return 'Low';
    if (quantity >= maxStock * 0.9) return 'High';
    return 'Good';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        {showLabels && (
          <>
            <span className="text-sm font-medium">Stock Level</span>
            <span className="text-sm font-semibold">{getStatusText()}</span>
          </>
        )}
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-300', getBarColor())}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>0</span>
        <span className="font-medium">{quantity} units</span>
        <span>{maxStock}</span>
      </div>
    </div>
  );
}