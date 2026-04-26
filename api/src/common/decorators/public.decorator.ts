import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Mark a controller or handler as publicly accessible.
 * Skips both the JWT auth guard and the RBAC guard.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
