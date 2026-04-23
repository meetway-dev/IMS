/**
 * Organisms Barrel Export
 * 
 * Export all organism-level components from the Atomic Design structure.
 * Organisms are complex UI components composed of molecules and/or atoms.
 * 
 * @example
 * ```tsx
 * import { DataTable } from '@/components/organisms';
 * ```
 */

export { DataTable, type DataTableProps, type Column, type PaginationProps } from './DataTable';

// Note: Additional organisms will be exported here as they are migrated
// export { Modal, type ModalProps } from './Modal';
// export { Form, type FormProps } from './Form';
// export { Sidebar, type SidebarProps } from './Sidebar';