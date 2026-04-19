'use client';

import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Search,
  Filter,
  Columns,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  X,
  Download,
  Loader2,
  AlertCircle,
  FileText,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  onRowClick?: (row: TData) => void;
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  emptyState?: {
    icon?: React.ReactNode;
    title: string;
    description?: string;
  };
  bulkActions?: {
    label: string;
    icon?: React.ComponentType<any>;
    onClick: (selectedRows: TData[]) => void;
    variant?: 'default' | 'destructive';
  }[];
  exportAction?: {
    label?: string;
    onClick: (data: TData[]) => void;
  };
  density?: 'compact' | 'comfortable';
  onDensityChange?: (density: 'compact' | 'comfortable') => void;
  className?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = 'Search...',
  onRowClick,
  isLoading = false,
  error = null,
  onRetry,
  emptyState = {
    icon: <FileText className="h-12 w-12 text-muted-foreground/50" />,
    title: 'No data found',
    description: 'There are no items to display at the moment.',
  },
  bulkActions = [],
  exportAction,
  density = 'comfortable',
  onDensityChange,
  className,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [searchValue, setSearchValue] = React.useState('');
  const [isFiltersOpen, setIsFiltersOpen] = React.useState(false);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  // Debounced search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchKey) {
        table.getColumn(searchKey)?.setFilterValue(searchValue);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue, searchKey, table]);

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const hasSelection = selectedRows.length > 0;
  const hasActiveFilters = columnFilters.length > 0 || searchValue.length > 0;

  const clearFilters = () => {
    setSearchValue('');
    setColumnFilters([]);
    table.resetColumnFilters();
  };

  const getDensityClasses = () => {
    switch (density) {
      case 'compact':
        return {
          header: 'h-8 px-3 text-xs',
          cell: 'p-2 text-sm',
          row: 'h-10',
        };
      case 'comfortable':
      default:
        return {
          header: 'h-12 px-4 text-sm',
          cell: 'p-4 text-sm',
          row: 'h-14',
        };
    }
  };

  const densityClasses = getDensityClasses();

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Modern Toolbar */}
      <div className="flex items-center justify-between gap-4 rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm p-4 shadow-sm">
        <div className="flex items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-9 h-9 bg-background border-border/50 focus:border-primary/50 transition-colors"
            />
            {searchValue && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-muted"
                onClick={() => setSearchValue('')}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Active Filters Display */}
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-2"
              >
                <Badge variant="secondary" className="text-xs">
                  {columnFilters.length + (searchValue ? 1 : 0)} filter{columnFilters.length + (searchValue ? 1 : 0) !== 1 ? 's' : ''} active
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-8 px-2 text-xs hover:bg-muted"
                >
                  Clear all
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2">
          {/* Filters Popover */}
          <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 border-border/50 hover:bg-muted/50"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {columnFilters.length > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                    {columnFilters.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="p-4">
                <h4 className="font-medium text-sm mb-3">Column Filters</h4>
                <ScrollArea className="max-h-64">
                  <div className="space-y-3">
                    {table.getAllColumns()
                      .filter((column) => column.getCanFilter())
                      .map((column) => (
                        <div key={column.id} className="space-y-2">
                          <label className="text-sm font-medium capitalize">
                            {column.id}
                          </label>
                          <Input
                            placeholder={`Filter ${column.id}...`}
                            value={(column.getFilterValue() as string) ?? ''}
                            onChange={(event) =>
                              column.setFilterValue(event.target.value)
                            }
                            className="h-8"
                          />
                        </div>
                      ))}
                  </div>
                </ScrollArea>
                {columnFilters.length > 0 && (
                  <>
                    <Separator className="my-3" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setColumnFilters([])}
                      className="w-full h-8 text-xs"
                    >
                      Clear all filters
                    </Button>
                  </>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Column Visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 border-border/50 hover:bg-muted/50"
              >
                <Columns className="h-4 w-4 mr-2" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Density Toggle */}
          {onDensityChange && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 border-border/50 hover:bg-muted/50"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Density
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuCheckboxItem
                  checked={density === 'comfortable'}
                  onCheckedChange={() => onDensityChange('comfortable')}
                >
                  Comfortable
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={density === 'compact'}
                  onCheckedChange={() => onDensityChange('compact')}
                >
                  Compact
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Export Action */}
          {exportAction && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportAction.onClick(data)}
              className="h-9 border-border/50 hover:bg-muted/50"
            >
              <Download className="h-4 w-4 mr-2" />
              {exportAction.label || 'Export'}
            </Button>
          )}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {hasSelection && bulkActions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 backdrop-blur-sm p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="font-medium">
                {selectedRows.length} selected
              </Badge>
              <span className="text-sm text-muted-foreground">
                {selectedRows.length === 1 ? 'item' : 'items'} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              {bulkActions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'default'}
                  size="sm"
                  onClick={() => action.onClick(selectedRows.map(row => row.original))}
                  className="h-8"
                >
                  {action.icon && <action.icon className="h-4 w-4 mr-2" />}
                  {action.label}
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table Container */}
      <div className="rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm shadow-sm overflow-hidden">
        <ScrollArea className="w-full">
          <table className="w-full">
            {/* Sticky Header */}
            <thead className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border/50 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const isSorted = header.column.getIsSorted();

                    return (
                      <th
                        key={header.id}
                        className={cn(
                          'text-left align-middle font-medium text-muted-foreground border-r border-border/30 last:border-r-0',
                          densityClasses.header,
                          canSort && 'cursor-pointer select-none hover:bg-muted/30 transition-colors'
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-2">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                          {canSort && (
                            <div className="flex flex-col">
                              <ChevronUp
                                className={cn(
                                  'h-3 w-3',
                                  isSorted === 'asc' ? 'text-foreground' : 'text-muted-foreground/50'
                                )}
                              />
                              <ChevronDown
                                className={cn(
                                  'h-3 w-3 -mt-1',
                                  isSorted === 'desc' ? 'text-foreground' : 'text-muted-foreground/50'
                                )}
                              />
                            </div>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>

            {/* Table Body */}
            <tbody>
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.tr
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan={columns.length} className="h-32">
                      <div className="flex items-center justify-center gap-3 py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Loading data...</span>
                      </div>
                    </td>
                  </motion.tr>
                ) : error ? (
                  <motion.tr
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan={columns.length} className="h-32">
                      <div className="flex flex-col items-center justify-center gap-3 py-8">
                        <AlertCircle className="h-12 w-12 text-destructive/50" />
                        <div className="text-center">
                          <h3 className="font-medium text-sm mb-1">Failed to load data</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            {error.message || 'Something went wrong while loading the data.'}
                          </p>
                          {onRetry && (
                            <Button variant="outline" size="sm" onClick={onRetry}>
                              Try again
                            </Button>
                          )}
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row, index) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.02 }}
                      data-state={row.getIsSelected() && 'selected'}
                      className={cn(
                        'border-b border-border/30 transition-all duration-200 hover:bg-muted/30',
                        onRowClick && 'cursor-pointer',
                        row.getIsSelected() && 'bg-primary/5 border-primary/20'
                      )}
                      onClick={() => onRowClick?.(row.original)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className={cn(
                            'align-middle border-r border-border/20 last:border-r-0',
                            densityClasses.cell
                          )}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </motion.tr>
                  ))
                ) : (
                  <motion.tr
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan={columns.length} className="h-32">
                      <div className="flex flex-col items-center justify-center gap-4 py-8">
                        {emptyState.icon}
                        <div className="text-center">
                          <h3 className="font-medium text-sm mb-1">{emptyState.title}</h3>
                          {emptyState.description && (
                            <p className="text-sm text-muted-foreground">
                              {emptyState.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </ScrollArea>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{' '}
            of {table.getFilteredRowModel().rows.length} results
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={table.getState().pagination.pageSize.toString()}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="w-20 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8 px-3"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-8 px-3"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}