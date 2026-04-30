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
import { Skeleton } from '@/components/ui/skeleton';
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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  /** Server-side search callback. When provided, search is handled server-side
   *  (debouncing is the caller's responsibility). When omitted, falls back to
   *  client-side column filtering. */
  onSearchChange?: (value: string) => void;
  /** Current search value for controlled server-side search input */
  searchValue?: string;
  /** Total count of records for server-side pagination display */
  totalCount?: number;
  /** Server-side pagination: current page (1-indexed) */
  currentPage?: number;
  /** Server-side pagination: page size (items per page) */
  pageSize?: number;
  /** Server-side pagination: callback when page changes */
  onPageChange?: (page: number) => void;
  /** Server-side pagination: callback when page size changes */
  onPageSizeChange?: (pageSize: number) => void;
  /** Server-side sorting: callback when sorting changes */
  onSortChange?: (sortBy: string | null, sortOrder: 'asc' | 'desc' | null) => void;
  /** Current sort field for controlled server-side sorting */
  sortBy?: string | null;
  /** Current sort order for controlled server-side sorting */
  sortOrder?: 'asc' | 'desc' | null;
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
    enableCsvExport?: boolean;
  };
  density?: 'compact' | 'comfortable';
  onDensityChange?: (density: 'compact' | 'comfortable') => void;
  className?: string;
  filters?: Array<{
    column: string;
    label: string;
    options: Array<{ label: string; value: string }>;
  }>;
  enableSelection?: boolean;
  enableBulkActions?: boolean;
  pagination?: {
    pageSize?: number;
    pageSizeOptions?: number[];
  };
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = 'Search...',
  onSearchChange,
  searchValue: controlledSearchValue,
  totalCount,
  currentPage = 1,
  pageSize = 20,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  sortBy: controlledSortBy,
  sortOrder: controlledSortOrder,
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
  filters = [],
  enableSelection = false,
  enableBulkActions = false,
  pagination = {
    pageSize: 10,
    pageSizeOptions: [10, 20, 30, 40, 50],
  },
}: DataTableProps<TData, TValue>) {
  const isServerSideSearch = !!onSearchChange;
  const isServerSideSort = !!onSortChange;
  
  // Handle sorting state
  const [internalSorting, setInternalSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [internalSearchValue, setInternalSearchValue] = React.useState('');
  const [isFiltersOpen, setIsFiltersOpen] = React.useState(false);

  // Use controlled search value for server-side, internal for client-side
  const searchValue = isServerSideSearch
    ? (controlledSearchValue ?? '')
    : internalSearchValue;
  const setSearchValue = isServerSideSearch
    ? (value: string) => onSearchChange!(value)
    : setInternalSearchValue;

  // Use controlled sorting for server-side, internal for client-side
  const sorting = isServerSideSort
    ? (controlledSortBy && controlledSortOrder
        ? [{ id: controlledSortBy, desc: controlledSortOrder === 'desc' }]
        : [])
    : internalSorting;

  const handleSortingChange = React.useCallback(
    (updaterOrValue: React.SetStateAction<SortingState>) => {
      const newSorting =
        typeof updaterOrValue === 'function'
          ? updaterOrValue(sorting)
          : updaterOrValue;

      if (isServerSideSort && onSortChange) {
        if (newSorting.length > 0) {
          const sort = newSorting[0];
          onSortChange(sort.id, sort.desc ? 'desc' : 'asc');
        } else {
          onSortChange(null, null);
        }
      } else {
        setInternalSorting(newSorting);
      }
    },
    [isServerSideSort, onSortChange, sorting],
  );

  const table = useReactTable({
    data,
    columns,
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    // Skip client-side pagination when server-side search is active
    getPaginationRowModel: isServerSideSearch ? undefined : getPaginationRowModel(),
    getSortedRowModel: isServerSideSort ? undefined : getSortedRowModel(),
    // Skip client-side filtering when server-side search is active
    getFilteredRowModel: isServerSideSearch ? undefined : getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: enableSelection ? setRowSelection : undefined,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection: enableSelection ? rowSelection : {},
    },
    ...(isServerSideSearch
      ? {}
      : {
          initialState: {
            pagination: {
              pageSize: pagination.pageSize || 10,
            },
          },
        }),
  });

  // Client-side debounced search (only when NOT using server-side search)
  React.useEffect(() => {
    if (isServerSideSearch) return;
    const timer = setTimeout(() => {
      if (searchKey) {
        table.getColumn(searchKey)?.setFilterValue(internalSearchValue);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [internalSearchValue, searchKey, table, isServerSideSearch]);

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const hasSelection = selectedRows.length > 0;
  const hasActiveFilters = columnFilters.length > 0 || searchValue.length > 0;

  const clearFilters = () => {
    setSearchValue('');
    setColumnFilters([]);
    if (!isServerSideSearch) {
      table.resetColumnFilters();
    }
  };

  const getDensityClasses = () => {
    switch (density) {
      case 'compact':
        return {
          header: 'h-9 px-3 text-xs',
          cell: 'px-3 py-2 text-sm',
          row: '',
        };
      case 'comfortable':
      default:
        return {
          header: 'h-11 px-4 text-xs',
          cell: 'px-4 py-3 text-sm',
          row: '',
        };
    }
  };

  const densityClasses = getDensityClasses();

  // CSV Export function
  const exportToCsv = () => {
    const exportRows = hasSelection ? selectedRows.map(row => row.original) : data;
    
    if (exportRows.length === 0) return;
    
    // Get headers from first row
    const firstRow = exportRows[0] as Record<string, any>;
    const headers = Object.keys(firstRow).filter(key =>
      typeof firstRow[key] !== 'object' && firstRow[key] !== null
    );
    
    const rows = exportRows.map(row => {
      const rowData = row as Record<string, any>;
      return headers.map(header => {
        const value = rowData[header];
        // Handle CSV escaping
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value?.toString() || '';
      }).join(',');
    });
    
    const csvContent = [
      headers.join(','),
      ...rows
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Handle filter change for custom filters
  const [activeFilters, setActiveFilters] = React.useState<Record<string, string>>({});

  const handleFilterChange = (column: string, value: string) => {
    if (value === 'all') {
      const newFilters = { ...activeFilters };
      delete newFilters[column];
      setActiveFilters(newFilters);
      table.getColumn(column)?.setFilterValue(undefined);
    } else {
      setActiveFilters(prev => ({ ...prev, [column]: value }));
      table.getColumn(column)?.setFilterValue(value);
    }
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    setColumnFilters([]);
    setSearchValue('');
    table.resetColumnFilters();
  };

  const hasActiveCustomFilters = Object.keys(activeFilters).length > 0;

  // Find actions column index for sticky positioning
  const actionsColumnIndex = columns.findIndex(col => col.id === 'actions' || (col as any).accessorKey === 'actions');
  const hasActionsColumn = actionsColumnIndex !== -1;

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-9 h-9 bg-muted/50 border-0 focus-visible:ring-1"
            />
            {searchValue && (
              <Button
                variant="ghost"
                size="icon-sm"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-6 w-6"
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
                <Badge variant="muted" className="text-xs">
                  {columnFilters.length + (searchValue ? 1 : 0)} active
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2">
          {/* Enhanced Filter System */}
          {filters.length > 0 && (
            <div className="flex items-center gap-2">
              {/* Quick Filters - Show first 2 filters inline */}
              {filters.slice(0, 2).map((filter) => (
                <div key={filter.column} className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {filter.label}:
                  </span>
                  <Select
                    value={activeFilters[filter.column] || 'all'}
                    onValueChange={(value) => handleFilterChange(filter.column, value)}
                  >
                    <SelectTrigger className="w-32 h-8 text-xs">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {filter.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}

              {/* More Filters Dropdown for additional filters */}
              {filters.length > 2 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8">
                      <Filter className="h-3.5 w-3.5 mr-1.5" />
                      More
                      {Object.keys(activeFilters).length > 2 && (
                        <Badge variant="secondary" className="ml-1.5 h-4 w-4 p-0 text-[10px]">
                          {Object.keys(activeFilters).length - 2}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="text-xs">Additional Filters</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {filters.slice(2).map((filter) => (
                      <div key={filter.column} className="p-2">
                        <label className="text-xs font-medium mb-1.5 block">
                          {filter.label}
                        </label>
                        <Select
                          value={activeFilters[filter.column] || 'all'}
                          onValueChange={(value) => handleFilterChange(filter.column, value)}
                        >
                          <SelectTrigger className="w-full h-7 text-xs">
                            <SelectValue placeholder="All" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            {filter.options.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}

          {/* Advanced Filters Button */}
          <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8"
              >
                <Settings className="h-3.5 w-3.5 mr-1.5" />
                Advanced
                {(columnFilters.length > 0 || hasActiveCustomFilters) && (
                  <Badge variant="muted" className="ml-1.5 h-4 w-4 p-0 text-[10px] flex items-center justify-center">
                    {columnFilters.length + Object.keys(activeFilters).length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0" align="end">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium">Advanced Filters</h4>
                  {(columnFilters.length > 0 || hasActiveCustomFilters) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="h-7 text-xs"
                    >
                      Clear All
                    </Button>
                  )}
                </div>
                
                {/* Column Filters */}
                <div className="space-y-4">
                  <div>
                    <h5 className="text-xs font-medium text-muted-foreground mb-2">Column Filters</h5>
                    <div className="space-y-2">
                      {table.getAllColumns()
                        .filter((column) => column.getCanFilter())
                        .map((column) => (
                          <div key={column.id} className="space-y-1">
                            <label className="text-xs font-medium">
                              {column.id.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </label>
                            <Input
                              placeholder={`Search ${column.id}...`}
                              value={(column.getFilterValue() as string) ?? ''}
                              onChange={(event) =>
                                column.setFilterValue(event.target.value)
                              }
                              className="h-7 text-xs"
                            />
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Custom Filters */}
                  {filters.length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium text-muted-foreground mb-2">Custom Filters</h5>
                      <div className="space-y-2">
                        {filters.map((filter) => (
                          <div key={filter.column} className="space-y-1">
                            <label className="text-xs font-medium">{filter.label}</label>
                            <Select
                              value={activeFilters[filter.column] || 'all'}
                              onValueChange={(value) => handleFilterChange(filter.column, value)}
                            >
                              <SelectTrigger className="w-full h-7 text-xs">
                                <SelectValue placeholder="All" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                {filter.options.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Column Visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8"
              >
                <Columns className="h-3.5 w-3.5 mr-1.5" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs">Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize text-xs"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Export Action */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (exportAction?.onClick) {
                const exportData = hasSelection ? selectedRows.map(row => row.original) : data;
                exportAction.onClick(exportData);
              } else {
                exportToCsv();
              }
            }}
            className="h-8"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            {exportAction?.label || 'Export'}
          </Button>
        </div>
      </div>

      {/* Active filters display - Enhanced */}
      {(hasActiveCustomFilters || columnFilters.length > 0 || searchValue) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="flex flex-wrap items-center gap-2 p-3 rounded-lg border bg-muted/30"
        >
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium">Active Filters:</span>
          </div>
          
          {/* Search filter */}
          {searchValue && (
            <Badge variant="outline" className="gap-1 pl-2 pr-1 py-1">
              <Search className="h-3 w-3" />
              <span className="text-xs">"{searchValue}"</span>
              <button
                onClick={() => setSearchValue('')}
                className="ml-1 hover:text-destructive rounded-full h-4 w-4 flex items-center justify-center"
              >
                ×
              </button>
            </Badge>
          )}

          {/* Custom filters */}
          {Object.entries(activeFilters).map(([column, value]) => {
            const filter = filters.find(f => f.column === column);
            const option = filter?.options.find(o => o.value === value);
            return (
              <Badge key={column} variant="secondary" className="gap-1 pl-2 pr-1 py-1">
                <span className="text-xs font-medium">{filter?.label}:</span>
                <span className="text-xs">{option?.label || value}</span>
                <button
                  onClick={() => handleFilterChange(column, 'all')}
                  className="ml-1 hover:text-destructive rounded-full h-4 w-4 flex items-center justify-center"
                >
                  ×
                </button>
              </Badge>
            );
          })}

          {/* Column filters */}
          {columnFilters.map((filter) => (
            <Badge key={filter.id} variant="outline" className="gap-1 pl-2 pr-1 py-1">
              <span className="text-xs font-medium">
                {filter.id?.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
              </span>
              <span className="text-xs">"{String(filter.value)}"</span>
              <button
                onClick={() => {
                  const newFilters = columnFilters.filter(f => f.id !== filter.id);
                  setColumnFilters(newFilters);
                }}
                className="ml-1 hover:text-destructive rounded-full h-4 w-4 flex items-center justify-center"
              >
                ×
              </button>
            </Badge>
          ))}

          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-7 px-2 text-xs ml-auto"
          >
            Clear All
          </Button>
        </motion.div>
      )}

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {hasSelection && bulkActions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-3"
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
      <div className="rounded-xl border shadow-soft overflow-hidden relative">
        {/* Scroll shadow indicator for sticky column */}
        <div className="pointer-events-none absolute inset-y-0 right-0 z-30 w-px bg-gradient-to-l from-border to-transparent" />
        <ScrollArea className="w-full scrollbar-thin">
          <table className="w-full" style={{ minWidth: 'max-content' }}>
            {/* Header */}
            <thead className="bg-muted/30 border-b">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const isSorted = header.column.getIsSorted();

                    // Check if this is the actions column
                    const isActionsColumn = header.column.id === 'actions';

                    return (
                      <th
                        key={header.id}
                        className={cn(
                          'text-left align-middle font-medium text-muted-foreground uppercase tracking-wider',
                          densityClasses.header,
                          canSort && 'cursor-pointer select-none hover:bg-muted/50 transition-colors',
                          isActionsColumn && 'sticky right-0 z-20 bg-muted/30 backdrop-blur-sm box-border',
                          isActionsColumn && 'before:absolute before:left-0 before:inset-y-0 before:w-px before:-ml-px before:bg-border/50'
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-1.5">
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
                                  isSorted === 'asc' ? 'text-foreground' : 'text-muted-foreground/40'
                                )}
                              />
                              <ChevronDown
                                className={cn(
                                  'h-3 w-3 -mt-0.5',
                                  isSorted === 'desc' ? 'text-foreground' : 'text-muted-foreground/40'
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

            {/* Body */}
            <tbody>
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.tr
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan={columns.length} className="p-0">
                      <div className="space-y-0">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-border/30 last:border-0">
                            {Array.from({ length: Math.min(columns.length, 4) }).map((_, j) => (
                              <Skeleton key={j} className="h-4 flex-1" />
                            ))}
                          </div>
                        ))}
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
                    <td colSpan={columns.length} className="h-40">
                      <div className="flex flex-col items-center justify-center gap-3 py-8">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                          <AlertCircle className="h-6 w-6 text-destructive" />
                        </div>
                        <div className="text-center">
                          <p className="font-medium text-sm">Failed to load data</p>
                          <p className="text-sm text-muted-foreground mt-1 mb-3">
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
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: index * 0.02, duration: 0.15 }}
                      data-state={row.getIsSelected() && 'selected'}
                      className={cn(
                        'border-b border-border/40 transition-colors hover:bg-muted/40',
                        onRowClick && 'cursor-pointer',
                        row.getIsSelected() && 'bg-primary/5'
                      )}
                      onClick={() => onRowClick?.(row.original)}
                    >
                      {row.getVisibleCells().map((cell) => {
                        const isActionsColumn = cell.column.id === 'actions';
                        return (
                          <td
                            key={cell.id}
                            className={cn(
                              'align-middle',
                              densityClasses.cell,
                              isActionsColumn && 'sticky right-0 z-20 bg-background backdrop-blur-sm box-border',
                              isActionsColumn && 'before:absolute before:left-0 before:inset-y-0 before:w-px before:-ml-px before:bg-border/50'
                            )}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        );
                      })}
                    </motion.tr>
                  ))
                ) : (
                  <motion.tr
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan={columns.length} className="h-40">
                      <div className="flex flex-col items-center justify-center gap-3 py-8">
                        {emptyState.icon}
                        <div className="text-center">
                          <p className="font-medium text-sm">{emptyState.title}</p>
                          {emptyState.description && (
                            <p className="text-sm text-muted-foreground mt-1">
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
        <div className="text-sm text-muted-foreground">
          {isServerSideSearch
            ? `${totalCount ?? data.length} result${(totalCount ?? data.length) !== 1 ? 's' : ''}`
            : `${table.getFilteredRowModel().rows.length} result${table.getFilteredRowModel().rows.length !== 1 ? 's' : ''}`
          }
        </div>

        {/* Client-side pagination */}
        {!isServerSideSearch && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-muted-foreground">Rows</span>
              <Select
                value={table.getState().pagination.pageSize.toString()}
                onValueChange={(value) => table.setPageSize(Number(value))}
              >
                <SelectTrigger className="w-16 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(pagination.pageSizeOptions || [10, 20, 30, 40, 50]).map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
              </span>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Server-side pagination */}
        {isServerSideSearch && (onPageChange || onPageSizeChange) && (
          <div className="flex items-center gap-3">
            {onPageSizeChange && (
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-muted-foreground">Rows</span>
                <Select
                  value={pageSize.toString()}
                  onValueChange={(value) => onPageSizeChange(Number(value))}
                >
                  <SelectTrigger className="w-16 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(pagination.pageSizeOptions || [10, 20, 30, 50]).map((size) => (
                      <SelectItem key={size} value={size.toString()}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {onPageChange && totalCount && (
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground px-2">
                  {currentPage} / {Math.max(1, Math.ceil(totalCount / pageSize))}
                </span>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage >= Math.ceil(totalCount / pageSize)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
