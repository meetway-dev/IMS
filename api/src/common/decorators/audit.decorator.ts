// Audit Logging Decorator

import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { AuditInterceptor } from '../interceptors/audit.interceptor';

/**
 * Decorator to automatically log method execution to audit log
 * 
 * @param action - The action being performed (e.g., 'create', 'update', 'delete')
 * @param entityType - The type of entity being acted upon (e.g., 'Product', 'Supplier')
 * @param extractEntityId - Function to extract entity ID from method result or arguments
 */
export function AuditLog(
  action: string,
  entityType?: string,
  extractEntityId?: (result: any, args: any[]) => string | undefined
) {
  return applyDecorators(
    UseInterceptors(new AuditInterceptor(action, entityType, extractEntityId))
  );
}

/**
 * Convenience decorators for common CRUD operations
 */
export function AuditCreate(entityType: string) {
  return AuditLog('create', entityType, (result) => result?.id);
}

export function AuditUpdate(entityType: string) {
  return AuditLog('update', entityType, (_, args) => args[0]); // First argument is usually ID
}

export function AuditDelete(entityType: string) {
  return AuditLog('delete', entityType, (_, args) => args[0]); // First argument is usually ID
}

export function AuditRead(entityType: string) {
  return AuditLog('read', entityType);
}