/**
 * Global Hooks Barrel Export
 *
 * Export all global reusable hooks for centralized imports.
 *
 * @example
 * ```tsx
 * import { useLogin, useDebounce, useModal } from '@/lib/hooks';
 * ```
 */

// Re-export hooks from the root hooks directory (temporary during migration)
export { useApiQuery } from '@/hooks/use-api-query';
export { useLogin, useRegister, useLogout, useProfile } from '@/hooks/use-auth';
export { useDebounce } from '@/hooks/use-debounce';
export { useModal } from '@/hooks/use-modal';

// Note: Feature-specific hooks should be imported directly from their feature directories
// e.g., import { useInventoryQuery } from '@/hooks/inventory/use-inventory-query';