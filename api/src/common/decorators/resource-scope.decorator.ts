import { SetMetadata } from '@nestjs/common';

export const RESOURCE_SCOPE_KEY = 'resourceScope';

export interface ResourceScope {
  type: 'OWN' | 'TEAM' | 'ALL';
  paramName?: string; // Name of the parameter containing resource ID
  userIdField?: string; // Field name in request body containing user ID
}

/**
 * Decorator to specify resource scope for permission checking
 * @example
 * @ResourceScope({ type: 'OWN', paramName: 'userId' })
 * @Permissions('users.update.own')
 */
export const ResourceScope = (scope: ResourceScope) =>
  SetMetadata(RESOURCE_SCOPE_KEY, scope);