import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
/** Require the user to have at least one of these role names (e.g. Admin). */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
