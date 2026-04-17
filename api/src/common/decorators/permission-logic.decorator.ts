import { SetMetadata } from '@nestjs/common';

export const PERMISSION_LOGIC_KEY = 'permissionLogic';

export enum PermissionLogic {
  AND = 'AND', // User must have ALL specified permissions
  OR = 'OR', // User must have AT LEAST ONE of the specified permissions
  AT_LEAST_ONE = 'AT_LEAST_ONE', // Alias for OR
}

/**
 * Decorator to specify the logic for permission checking
 * @example
 * @PermissionLogic(PermissionLogic.OR)
 * @Permissions('users.read', 'users.write')
 */
export const PermissionLogicDecorator = (logic: PermissionLogic) =>
  SetMetadata(PERMISSION_LOGIC_KEY, logic);