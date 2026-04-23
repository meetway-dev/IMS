/**
 * DataTable Component - Organism Level
 * 
 * A complex data table component with sorting, filtering, pagination, and selection.
 * This component combines multiple molecules and atoms to create a comprehensive data display.
 * 
 * @component
 * @example
 * ```tsx
 * <DataTable
 *   columns={columns}
 *   data={users}
 *   loading={isLoading}
 *   onRowClick={handleRowClick}
 *   pagination={{
 *     page: 1,
 *     pageSize: 10,
 *     total: 100,
 *     onPageChange: handlePageChange
 *   }}
 * />
 * ```
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { SearchBar } from '@/components/molecules/SearchBar/SearchBar';
import { Button } from '@/components/atoms/Button/Button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from 'lucide-react';

export interface Column<T> {
  /** Unique key for the column */
  key: string;
  /** Display header text */
  header: string;
  /** Function to render cell content */
  cell: (row: T, index: number) => React.ReactNode;
  /** Whether column is sortable */
  sortable?: boolean;
  /** Column width (CSS value) */
  width?: string;
  /** Column alignment */
  align?: 'left' | 'center' | 'right';
}

export interface PaginationProps {
  /** Current page number (1-indexed) */
  page: number;
  /** Number of items per page */
  pageSize: number;
  /** Total number of items */
  total: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Callback when page size changes */
  onPageSizeChange?: (pageSize: number) => void;
}

export interface DataTableProps<T> {
  /** Array of column definitions */
  columns: Column<T>[];
  /** Array of data rows */
  data: T[];
  /** Loading state */
  loading?: boolean;
  /** Error state */
  error?: string;
  /** Whether rows are selectable */
  selectable?: boolean;
  /** Selected row IDs */
  selectedRows?: string[];
  /** Callback when selection changes */
  onSelectionChange?: (selectedIds: string[]) => void;
  /** Function to get unique row ID */
  getRowId: (row: T) => string;
  /** Callback when row is clicked */
  onRowClick?: (row: T) => void;
  /** Current sort configuration */
  sort?: {
    column: string;
    direction: 'asc' | 'desc';
  };
  /** Callback when sort changes */
  onSortChange?: (column: string, direction: 'asc' | 'desc') => void;
  /** Pagination configuration */
  pagination?: PaginationProps;
  /** Search configuration */
  search?: {
    placeholder?: string;
    onSearch: (value: string) => void;
    debounceMs?: number;
  };
  /** Empty state component */
  emptyState?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show header */
  showHeader?: boolean;
  /** Whether to show footer */
  showFooter?: boolean;
}

/**
 * DataTable component - A comprehensive data table with advanced features.
 * 
 * Features:
 * - Sorting by column
 * - Row selection (single/multiple)
 * - Pagination with customizable page sizes
 * - Integrated search with debouncing
 * - Loading and error states
 * - Empty state handling
 * - Responsive design
 * - Accessibility compliant
 */
const DataTable = <T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  error,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  getRowId,
  onRowClick,
  sort,
  onSortChange,
  pagination,
  search,
  emptyState,
  className,
  showHeader = true,
  showFooter = true,
}: DataTableProps<T>) => {
  const [internalSelected, setInternalSelected] = React.useState<string[]>(selectedRows);
  const isControlled = selectedRows !== undefined && onSelectionChange !== undefined;

  // Sync internal state with controlled props
  React.useEffect(() => {
    if (isControlled) {
      setInternalSelected(selectedRows);
    }
  }, [selectedRows, isControlled]);

  const handleSelectAll = (checked: boolean) => {
    const allIds = data.map(getRowId);
    const newSelected = checked ? allIds : [];
    
    if (isControlled) {
      onSelectionChange?.(newSelected);
    } else {
      setInternalSelected(newSelected);
    }
  };

  const handleSelectRow = (rowId: string, checked: boolean) => {
    const newSelected = checked
      ? [...(isControlled ? selectedRows : internalSelected), rowId]
      : (isControlled ? selectedRows : internalSelected).filter(id => id !== rowId);
    
    if (isControlled) {
      onSelectionChange?.(newSelected);
    } else {
      setInternalSelected(newSelected);
    }
  };

  const handleSort = (columnKey: string) => {
    if (!onSortChange || !columns.find(col => col.key === columnKey)?.sortable) return;
    
    const newDirection = sort?.column === columnKey && sort.direction === 'asc' ? 'desc' : 'asc';
    onSortChange(columnKey, newDirection);
  };

  const currentSelected = isControlled ? selectedRows : internalSelected;
  const allSelected = data.length > 0 && currentSelected.length === data.length;
  const someSelected = currentSelected.length > 0 && !allSelected;

  // Calculate pagination info
  const startItem = pagination ? (pagination.page - 1) * pagination.pageSize + 1 : 1;
  const endItem = pagination
    ? Math.min(pagination.page * pagination.pageSize, pagination.total)
    : data.length;

  return (
    <div className={cn('flex flex-col space-y-4', className)}>
      {/* Search and Controls */}
      {(search || selectable) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {search && (
            <div className="w-full sm:w-auto">
              <SearchBar
                placeholder={search.placeholder || 'Search...'}
                onSearch={search.onSearch}
                debounceMs={search.debounceMs}
                loading={loading}
              />
            </div>
          )}
          
          {selectable && currentSelected.length > 0 && (
            <div className="text-sm text-muted-foreground">
              {currentSelected.length} item{currentSelected.length !== 1 ? 's' : ''} selected
            </div>
          )}
        </div>
      )}

      {/* Table Container */}
      <div className="rounded-md border overflow-hidden">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            {showHeader && (
              <thead className="bg-muted/50">
                <tr>
                  {selectable && (
                    <th className="w-12 px-4 py-3 text-left">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={(checked) => handleSelectAll(checked === true)}
                        aria-label="Select all rows"
                      />
                    </th>
                  )}
                  
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={cn(
                        'px-4 py-3 text-left text-sm font-medium text-foreground',
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right',
                        column.sortable && 'cursor-pointer hover:bg-muted/30'
                      )}
                      style={{ width: column.width }}
                      onClick={() => column.sortable && handleSort(column.key)}
                    >
                      <div className={cn(
                        'flex items-center gap-1',
                        column.align === 'center' && 'justify-center',
                        column.align === 'right' && 'justify-end'
                      )}>
                        {column.header}
                        {column.sortable && sort?.column === column.key && (
                          <span className="ml-1">
                            {sort.direction === 'asc' ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                  
                  {/* Actions column */}
                  <th className="w-12 px-4 py-3"></th>
                </tr>
              </thead>
            )}
            
            <tbody>
              {loading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`skeleton-${index}`} className="border-b">
                    {selectable && (
                      <td className="px-4 py-3">
                        <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td key={column.key} className="px-4 py-3">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="h-4 w-8 bg-muted rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : error ? (
                // Error state
                <tr>
                  <td
                    colSpan={columns.length + (selectable ? 1 : 0) + 1}
                    className="px-4 py-8 text-center"
                  >
                    <div className="text-destructive">
                      <p className="font-medium">Error loading data</p>
                      <p className="text-sm mt-1">{error}</p>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                // Empty state
                <tr>
                  <td
                    colSpan={columns.length + (selectable ? 1 : 0) + 1}
                    className="px-4 py-8 text-center"
                  >
                    {emptyState || (
                      <div className="text-muted-foreground">
                        <p className="font-medium">No data available</p>
                        <p className="text-sm mt-1">Try adjusting your search or filters</p>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                // Data rows
                data.map((row, rowIndex) => {
                  const rowId = getRowId(row);
                  const isSelected = currentSelected.includes(rowId);
                  
                  return (
                    <tr
                      key={rowId}
                      className={cn(
                        'border-b hover:bg-muted/30 transition-colors',
                        onRowClick && 'cursor-pointer',
                        isSelected && 'bg-primary/5'
                      )}
                      onClick={() => onRowClick?.(row)}
                    >
                      {selectable && (
                        <td className="px-4 py-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) =>
                              handleSelectRow(rowId, checked === true)
                            }
                            aria-label={`Select row ${rowIndex + 1}`}
                          />
                        </td>
                      )}
                      
                      {columns.map((column) => (
                        <td
                          key={`${rowId}-${column.key}`}
                          className={cn(
                            'px-4 py-3 text-sm',
                            column.align === 'center' && 'text-center',
                            column.align === 'right' && 'text-right'
                          )}
                        >
                          {column.cell(row, rowIndex)}
                        </td>
                      ))}
                      
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label="Row actions"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with Pagination */}
        {showFooter && pagination && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 py-3 border-t bg-muted/20">
            <div className="text-sm text-muted-foreground">
              Showing {startItem} to {endItem} of {pagination.total} entries
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.page - 1)}
                disabled={pagination.page <= 1 || loading}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, Math.ceil(pagination.total / pagination.pageSize)) })
                  .map((_, index) => {
                    const pageNumber = index + 1;
                    return (
                      <Button
                        key={pageNumber}
                        variant={pagination.page === pageNumber ? 'primary' : 'outline'}
                        size="sm"
                        className="h-8 w-8"
                        onClick={() => pagination.onPageChange(pageNumber)}
                        disabled={loading}
                        aria-label={`Page ${pageNumber}`}
                        aria-current={pagination.page === pageNumber ? 'page' : undefined}
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.page + 1)}
                disabled={
                  pagination.page >= Math.ceil(pagination.total / pagination.pageSize) || loading
                }
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

DataTable.displayName = 'DataTable';

export { DataTable };