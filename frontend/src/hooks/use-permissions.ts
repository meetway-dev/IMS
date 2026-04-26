'use client';

import { useMemo } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { Permission, Role, ROLE_PERMISSIONS } from '@ims/shared';

/**
 * Resolve the effective permission set for a user.
 *
 * Priority:
 * 1. If the user has an explicit `permissions` array (from API), use it.
 * 2. Otherwise, derive permissions from the user's roles via ROLE_PERMISSIONS.
 * 3. If the user has the ADMIN role or the `admin` permission, grant wildcard.
 */
function resolvePermissions(userRoles: string[], userPermissions?: string[]): string[] {
  // Super Admin and Admin roles get wildcard
  if (
    userRoles.includes(Role.SUPER_ADMIN) ||
    userRoles.includes(Role.ADMIN) ||
    userPermissions?.includes(Permission.ADMIN)
  ) {
    return ['*'];
  }

  // If API provides explicit permissions, use those
  if (userPermissions && userPermissions.length > 0) {
    return userPermissions;
  }

  // Derive from roles
  const derived = new Set<string>();
  for (const role of userRoles) {
    const perms = ROLE_PERMISSIONS[role as Role];
    if (perms) {
      perms.forEach((p) => derived.add(p));
    }
  }

  return Array.from(derived);
}

export interface UsePermissionsReturn {
  /** The resolved list of permission strings for the current user */
  permissions: string[];
  /** Check if the user has ALL of the specified permissions */
  hasPermission: (permission: string | string[]) => boolean;
  /** Check if the user has ANY of the specified permissions */
  hasAnyPermission: (permission: string | string[]) => boolean;
  /** Check if the user can read a module (e.g., 'products' → checks 'products.read') */
  canRead: (module: string) => boolean;
  /** Check if the user can write to a module (e.g., 'products' → checks 'products.write') */
  canWrite: (module: string) => boolean;
  /** Check if the user can delete in a module (e.g., 'products' → checks 'products.delete') */
  canDelete: (module: string) => boolean;
  /** Check if the user has the admin permission */
  isAdmin: boolean;
}

export function usePermissions(): UsePermissionsReturn {
  const { user } = useAuthStore();

  const permissions = useMemo(
    () => resolvePermissions(user?.roles || [], user?.permissions),
    [user?.roles, user?.permissions],
  );

  const isAdmin = useMemo(
    () => permissions.includes('*') || permissions.includes(Permission.ADMIN),
    [permissions],
  );

  const hasPermission = (perm: string | string[]): boolean => {
    if (isAdmin) return true;
    const required = Array.isArray(perm) ? perm : [perm];
    return required.every((p) => permissions.includes(p));
  };

  const hasAnyPermission = (perm: string | string[]): boolean => {
    if (isAdmin) return true;
    const required = Array.isArray(perm) ? perm : [perm];
    return required.some((p) => permissions.includes(p));
  };

  const canRead = (module: string): boolean => {
    if (isAdmin) return true;
    return permissions.includes(`${module}.read`);
  };

  const canWrite = (module: string): boolean => {
    if (isAdmin) return true;
    return permissions.includes(`${module}.write`);
  };

  const canDelete = (module: string): boolean => {
    if (isAdmin) return true;
    return permissions.includes(`${module}.delete`);
  };

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    canRead,
    canWrite,
    canDelete,
    isAdmin,
  };
}
