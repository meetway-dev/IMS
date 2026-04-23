/**
 * Component Library Main Export
 * 
 * This file exports all components from the Atomic Design structure.
 * Use specific imports for better tree-shaking.
 * 
 * @example
 * ```tsx
 * // Import specific component
 * import { Button } from '@/components/atoms/Button';
 * 
 * // Import multiple components
 * import { Button, Input } from '@/components/atoms';
 * 
 * // Import from main library (less optimal for tree-shaking)
 * import { Button } from '@/components';
 * ```
 */

// Atoms - Basic UI elements
export { Button, type ButtonProps, buttonVariants } from './atoms/Button';
export { Input, type InputProps, inputVariants } from './atoms/Input';

// Molecules - Simple combinations
export { SearchBar, type SearchBarProps } from './molecules/SearchBar';

// Organisms - Complex components
export { DataTable, type DataTableProps, type Column, type PaginationProps } from './organisms/DataTable';

// Note: Feature-specific components should be imported directly from their feature directories
// Example: import { InventoryDashboard } from '@/components/features/inventory';

/**
 * Level-specific barrel exports
 * These are re-exported here for convenience but should be used with caution
 * as they can increase bundle size.
 */
export * as Atoms from './atoms';
export * as Molecules from './molecules';
export * as Organisms from './organisms';
export * as Templates from './templates';

/**
 * @deprecated Legacy UI components - Use Atomic Design structure instead
 * These exports will be removed in version 2.0.0
 */
if (process.env.NODE_ENV === 'development') {
  console.warn(
    'DEPRECATED: Importing from "@/components" includes legacy exports. ' +
    'Use specific imports from "@/components/atoms/*", "@/components/molecules/*", etc. ' +
    'This will be removed in v2.0.0.'
  );
}