'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import {
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Package,
  User,
  Warehouse,
  FileText,
  Filter,
  Calendar,
  Search,
  Download,
} from 'lucide-react';

export interface StockMovement {
  id: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  productName: string;
  productSku: string;
  userId: string;
  userName: string;
  warehouseName?: string;
  reason?: string;
  reference?: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

interface StockMovementTimelineProps {
  movements: StockMovement[];
  isLoading?: boolean;
  onFilterChange?: (filters: MovementFilters) => void;
  onExport?: () => void;
  showFilters?: boolean;
  compact?: boolean;
}

interface MovementFilters {
  type?: string;
  dateRange?: { start: string; end: string };
  product?: string;
  user?: string;
}

export function StockMovementTimeline({
  movements,
  isLoading = false,
  onFilterChange,
  onExport,
  showFilters = true,
  compact = false,
}: StockMovementTimelineProps) {
  const [filterType, setFilterType] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredMovements = movements.filter(movement => {
    if (filterType !== 'all' && movement.type !== filterType) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        movement.productName.toLowerCase().includes(query) ||
        movement.productSku.toLowerCase().includes(query) ||
        movement.userName.toLowerCase().includes(query) ||
        movement.reason?.toLowerCase().includes(query) ||
        movement.reference?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const getMovementIcon = (type: StockMovement['type']) => {
    switch (type) {
      case 'IN':
        return <ArrowUpRight className="h-4 w-4 text-green-600" />;
      case 'OUT':
        return <ArrowDownRight className="h-4 w-4 text-red-600" />;
      case 'ADJUSTMENT':
        return <RefreshCw className="h-4 w-4 text-blue-600" />;
      case 'TRANSFER':
        return <Warehouse className="h-4 w-4 text-purple-600" />;
      default:
        return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const getMovementColor = (type: StockMovement['type']) => {
    switch (type) {
      case 'IN':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'OUT':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'ADJUSTMENT':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'TRANSFER':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMovementLabel = (type: StockMovement['type']) => {
    switch (type) {
      case 'IN': return 'Stock In';
      case 'OUT': return 'Stock Out';
      case 'ADJUSTMENT': return 'Adjustment';
      case 'TRANSFER': return 'Transfer';
      default: return type;
    }
  };

  const movementTypes = [
    { value: 'all', label: 'All Movements' },
    { value: 'IN', label: 'Stock In' },
    { value: 'OUT', label: 'Stock Out' },
    { value: 'ADJUSTMENT', label: 'Adjustments' },
    { value: 'TRANSFER', label: 'Transfers' },
  ];

  const summary = React.useMemo(() => {
    const totalIn = movements
      .filter(m => m.type === 'IN')
      .reduce((sum, m) => sum + m.quantity, 0);
    const totalOut = movements
      .filter(m => m.type === 'OUT')
      .reduce((sum, m) => sum + m.quantity, 0);
    const netChange = totalIn - totalOut;

    return { totalIn, totalOut, netChange };
  }, [movements]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total In</p>
                <p className="text-2xl font-bold text-green-600">
                  +{summary.totalIn}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <ArrowUpRight className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Out</p>
                <p className="text-2xl font-bold text-red-600">
                  -{summary.totalOut}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <ArrowDownRight className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Net Change</p>
                <p className={cn(
                  "text-2xl font-bold",
                  summary.netChange >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {summary.netChange >= 0 ? '+' : ''}{summary.netChange}
                </p>
              </div>
              <div className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center",
                summary.netChange >= 0 ? "bg-green-100" : "bg-red-100"
              )}>
                {summary.netChange >= 0 ? (
                  <ArrowUpRight className="h-5 w-5 text-green-600" />
                ) : (
                  <ArrowDownRight className="h-5 w-5 text-red-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search movements..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full sm:w-[300px]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {movementTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <Button variant="outline" size="sm" onClick={onExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Stock Movement Timeline
            </div>
            <Badge variant="outline">
              {filteredMovements.length} movement{filteredMovements.length !== 1 ? 's' : ''}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMovements.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No movements found</h3>
              <p className="text-muted-foreground">
                {searchQuery || filterType !== 'all'
                  ? 'Try adjusting your filters or search query'
                  : 'No stock movements recorded yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMovements.map((movement, index) => (
                <div
                  key={movement.id}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-lg border transition-colors hover:bg-muted/50",
                    index !== filteredMovements.length - 1 && "border-b"
                  )}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center border",
                      getMovementColor(movement.type)
                    )}>
                      {getMovementIcon(movement.type)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-medium truncate">
                          {movement.productName}
                          <span className="text-sm text-muted-foreground ml-2">
                            ({movement.productSku})
                          </span>
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={getMovementColor(movement.type)}>
                            {getMovementLabel(movement.type)}
                          </Badge>
                          <span className="text-sm font-semibold">
                            {movement.type === 'IN' ? '+' : movement.type === 'OUT' ? '-' : ''}
                            {movement.quantity} units
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(movement.createdAt, 'MMM d, yyyy h:mm a')}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="truncate">{movement.userName}</span>
                      </div>
                      {movement.warehouseName && (
                        <div className="flex items-center gap-2">
                          <Warehouse className="h-3 w-3 text-muted-foreground" />
                          <span>{movement.warehouseName}</span>
                        </div>
                      )}
                      {movement.reference && (
                        <div className="flex items-center gap-2">
                          <FileText className="h-3 w-3 text-muted-foreground" />
                          <span className="truncate">Ref: {movement.reference}</span>
                        </div>
                      )}
                    </div>

                    {movement.reason && (
                      <div className="mt-3 p-3 bg-muted rounded-md">
                        <p className="text-sm">
                          <span className="font-medium">Reason:</span> {movement.reason}
                        </p>
                      </div>
                    )}

                    {/* Quantity change */}
                    <div className="mt-3 flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">From:</span>
                        <span className="font-medium">{movement.previousQuantity}</span>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">To:</span>
                        <span className="font-medium">{movement.newQuantity}</span>
                      </div>
                      <div className="ml-auto">
                        <span className={cn(
                          "font-semibold",
                          movement.newQuantity > movement.previousQuantity
                            ? "text-green-600"
                            : movement.newQuantity < movement.previousQuantity
                            ? "text-red-600"
                            : "text-blue-600"
                        )}>
                          {movement.newQuantity > movement.previousQuantity ? '+' : ''}
                          {movement.newQuantity - movement.previousQuantity}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}