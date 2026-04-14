import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';
/** Require the user to have all of these permission keys (from DB). */
export const Permissions = (...keys: string[]) => SetMetadata(PERMISSIONS_KEY, keys);
