import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Require the authenticated user to hold **all** of the listed
 * permission keys (resolved from the database at request time).
 *
 * @example
 * ```ts
 * @Permissions('products.read')
 * @Get()
 * listProducts() { ... }
 * ```
 */
export const Permissions = (...keys: string[]) =>
  SetMetadata(PERMISSIONS_KEY, keys);
