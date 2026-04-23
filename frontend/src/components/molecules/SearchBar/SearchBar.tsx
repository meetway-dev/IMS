/**
 * SearchBar Component - Molecule Level
 * 
 * A search input component with debounced search, clear button, and loading states.
 * This component combines multiple atoms (Input, Button, Icon) to create a functional search interface.
 * 
 * @component
 * @example
 * ```tsx
 * <SearchBar
 *   placeholder="Search users..."
 *   onSearch={handleSearch}
 *   debounceMs={300}
 *   loading={isSearching}
 * />
 * ```
 */

import * as React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/atoms/Button/Button';

export interface SearchBarProps {
  /** Placeholder text for the search input */
  placeholder?: string;
  /** Current search value (controlled component) */
  value?: string;
  /** Initial search value (uncontrolled component) */
  defaultValue?: string;
  /** Callback when search value changes (debounced) */
  onSearch?: (value: string) => void;
  /** Callback when search value changes immediately */
  onChange?: (value: string) => void;
  /** Debounce delay in milliseconds */
  debounceMs?: number;
  /** Show loading spinner */
  loading?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Disable the search input */
  disabled?: boolean;
  /** Minimum characters before triggering search */
  minLength?: number;
  /** Auto-focus the input on mount */
  autoFocus?: boolean;
}

/**
 * SearchBar component - A debounced search input with clear functionality.
 * 
 * Features:
 * - Debounced search to prevent excessive API calls
 * - Clear button to reset search
 * - Loading state indicator
 * - Controlled and uncontrolled modes
 * - Minimum character validation
 * - Accessibility compliant with proper ARIA labels
 */
const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      placeholder = 'Search...',
      value: controlledValue,
      defaultValue,
      onSearch,
      onChange,
      debounceMs = 300,
      loading = false,
      className,
      disabled = false,
      minLength = 0,
      autoFocus = false,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue || '');
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : internalValue;

    // Debounce the search callback
    const debouncedSearch = useDebounce((searchValue: string) => {
      if (onSearch && searchValue.length >= minLength) {
        onSearch(searchValue);
      }
    }, debounceMs);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      
      // Update internal state if uncontrolled
      if (!isControlled) {
        setInternalValue(newValue);
      }
      
      // Call immediate onChange if provided
      if (onChange) {
        onChange(newValue);
      }
      
      // Trigger debounced search
      debouncedSearch(newValue);
    };

    const handleClear = () => {
      const newValue = '';
      
      if (!isControlled) {
        setInternalValue(newValue);
      }
      
      if (onChange) {
        onChange(newValue);
      }
      
      if (onSearch) {
        onSearch(newValue);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        handleClear();
      }
    };

    return (
      <div className={cn('relative w-full max-w-md', className)}>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          
          <Input
            ref={ref}
            type="search"
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled || loading}
            autoFocus={autoFocus}
            className="pl-10 pr-10"
            aria-label={placeholder}
            aria-busy={loading}
            {...props}
          />
          
          {value && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2"
              onClick={handleClear}
              disabled={disabled || loading}
              aria-label="Clear search"
              type="button"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
        </div>
        
        {loading && (
          <div
            className="absolute right-3 top-1/2 -translate-y-1/2"
            role="status"
            aria-label="Searching"
          >
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
        
        {minLength > 0 && value.length > 0 && value.length < minLength && (
          <p className="mt-1 text-xs text-muted-foreground">
            Type at least {minLength} character{minLength > 1 ? 's' : ''} to search
          </p>
        )}
      </div>
    );
  }
);

SearchBar.displayName = 'SearchBar';

export { SearchBar };