'use client';

import * as React from 'react';
import { useState } from 'react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  MoreHorizontal,
  RefreshCw,
  Search,
  Settings,
  Download,
  Eye,
  EyeOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdvancedDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchPlaceholder?: string;
  searchColumn?: string;
  enableSelection?: boolean;
  enableBulkActions?: boolean;
  bulkActions?: Array<{
    label: string;
    action: (selectedRows: TData[]) => void;
    icon?: React.ReactNode;
  }>;
  onRowClick?: (row: TData) => void;
  isLoading?: boolean;
  pagination?: {
    pageSize?: number;
    pageSizeOptions?: number[];
  };
  filters?: Array<{
    column: string;
    label: string;
    options: Array<{ label: string; value: string }>;
  }>;
}

export function AdvancedDataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = 'Search...',
  searchColumn = 'name',
  enableSelection = false,
  enableBulkActions = false,
  bulkActions = [],
  onRowClick,
  isLoading = false,
  pagination = {
    pageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
  },
  filters = [],
}: AdvancedDataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: pagination.pageSize || 10,
      },
    },
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows.map(row => row.original);
  const hasSelectedRows = selectedRows.length > 0;

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
    setGlobalFilter('');
  };

  const exportData = () => {
    const exportRows = hasSelectedRows ? selectedRows : data;
    
    // Safely convert rows to CSV
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
    a.download = `inventory-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-10 w-full sm:w-[300px]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Filters dropdown */}
          {filters.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {Object.keys(activeFilters).length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {Object.keys(activeFilters).length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {filters.map((filter) => (
                  <div key={filter.column} className="p-2">
                    <label className="text-sm font-medium mb-2 block">
                      {filter.label}
                    </label>
                    <Select
                      value={activeFilters[filter.column] || 'all'}
                      onValueChange={(value) => handleFilterChange(filter.column, value)}
                    >
                      <SelectTrigger className="w-full">
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
                {Object.keys(activeFilters).length > 0 && (
                  <div className="p-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="w-full justify-center"
                    >
                      Clear All Filters
                    </Button>
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Column visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== 'undefined' && column.getCanHide()
                )
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
                      {column.id.replace(/_/g, ' ')}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Export button */}
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          {/* Refresh button */}
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Active filters display */}
      {Object.keys(activeFilters).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(activeFilters).map(([column, value]) => {
            const filter = filters.find(f => f.column === column);
            const option = filter?.options.find(o => o.value === value);
            return (
              <Badge key={column} variant="secondary" className="gap-1">
                {filter?.label}: {option?.label || value}
                <button
                  onClick={() => handleFilterChange(column, 'all')}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            );
          })}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-6 px-2 text-xs"
          >
            Clear All
          </Button>
        </div>
      )}

      {/* Bulk actions toolbar */}
      {enableBulkActions && hasSelectedRows && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">
                  {selectedRows.length} item{selectedRows.length !== 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center gap-2">
                  {bulkActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => action.action(selectedRows)}
                    >
                      {action.icon}
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => table.toggleAllRowsSelected(false)}
              >
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center">
                    <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                    Loading data...
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={cn(
                    onRowClick && 'cursor-pointer hover:bg-muted/50',
                    row.getIsSelected() && 'bg-muted/30'
                  )}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Search className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">No results found.</p>
                    {Object.keys(activeFilters).length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAllFilters}
                      >
                        Clear filters
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex-1 text-sm text-muted-foreground">
          {hasSelectedRows ? (
            <>
              {selectedRows.length} of {data.length} row{data.length !== 1 ? 's' : ''} selected.
            </>
          ) : (
            <>
              Page {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
            </>
          )}
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {pagination.pageSizeOptions?.map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}