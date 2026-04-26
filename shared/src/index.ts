/**
 * @ims/shared -- barrel export
 *
 * Re-exports every public type, constant, enum, and utility so
 * consumers can import from a single entry point:
 *
 * ```ts
 * import { ApiResponse, Permission, formatCurrency } from '@ims/shared';
 * ```
 */

// Types
export * from './types/api.types';
export * from './types/entity.types';
export * from './types/auth.types';
export * from './types/pagination.types';

// Constants
export * from './constants/api.constants';

// Enums
export * from './enums/error.enums';
export * from './enums/permission.enums';

// Utils
export * from './utils/validation.utils';
export * from './utils/format.utils';
