import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from './card';
import { LucideIcon } from 'lucide-react';
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
  className?: string;
  gradient?: string;
  loading?: boolean;
  color?: string;
  trendUp?: boolean;
}

const StatsCard = React.forwardRef<HTMLDivElement, StatsCardProps>(
  ({ 
    title, 
    value, 
    description, 
    icon: Icon, 
    trend, 
    className, 
    gradient, 
    loading = false, 
    color = 'from-blue-500 to-cyan-500',
    trendUp = true,
    ...props 
  }, ref) => {
    if (loading) {
      return (
        <Card ref={ref} className={cn('overflow-hidden border-0 shadow-lg animate-pulse', className)} {...props}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-8 bg-muted rounded w-32"></div>
                <div className="h-3 bg-muted rounded w-40"></div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-muted"></div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card
          ref={ref}
          className={cn(
            'group relative overflow-hidden rounded-2xl border bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1',
            gradient && `bg-gradient-to-br ${gradient}`,
            className
          )}
          {...props}
        >
          {/* Background gradient accent */}
          <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
          
          {/* Animated border effect */}
          <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-white/20 transition-colors duration-300" />
          
          <div className="relative z-10">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{title}</p>
                  <p className="text-2xl font-bold mt-2">{value}</p>
                  
                  {(description || trend) && (
                    <div className="flex items-center mt-2 space-x-2">
                      {trend && (
                        <>
                          <div className={cn(
                            'flex items-center text-sm font-medium',
                            trend.isPositive ? 'text-green-600' : 'text-red-600'
                          )}>
                            <span>{trend.isPositive ? '↗' : '↘'}</span>
                            <span className="ml-1">{trend.value}</span>
                          </div>
                          {trend.label && (
                            <span className="text-xs text-muted-foreground">{trend.label}</span>
                          )}
                        </>
                      )}
                      {description && !trend && (
                        <span className="text-xs text-muted-foreground">{description}</span>
                      )}
                    </div>
                  )}
                </div>
                
                {Icon && (
                  <div className={cn(
                    'h-12 w-12 rounded-xl flex items-center justify-center shadow-md',
                    gradient 
                      ? 'bg-white/20 backdrop-blur-sm' 
                      : `bg-gradient-to-br ${color}`
                  )}>
                    <Icon className={cn(
                      'h-6 w-6',
                      gradient ? 'text-white' : 'text-white'
                    )} />
                  </div>
                )}
              </div>
            </CardContent>
          </div>
          
          {/* Animated shimmer effect */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000">
            <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
        </Card>
      </motion.div>
    );
  }
);

StatsCard.displayName = 'StatsCard';

export { StatsCard };

// StatsGrid component for layout
interface StatsGridProps {
  children: React.ReactNode;
  className?: string;
}

export function StatsGrid({ children, className }: StatsGridProps) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6', className)}>
      {children}
    </div>
  );
}