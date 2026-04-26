/**
 * Permission and role definitions.
 *
 * The `ROLE_PERMISSIONS` map is the single source of truth for which
 * actions each built-in role can perform. Custom roles/permissions
 * stored in the database extend (but do not replace) these defaults.
 *
 * @module permission.enums
 */

// ---------------------------------------------------------------------------
// Permissions
// ---------------------------------------------------------------------------

export enum Permission {
  // Products
  PRODUCTS_READ = 'products.read',
  PRODUCTS_WRITE = 'products.write',
  PRODUCTS_DELETE = 'products.delete',

  // Categories
  CATEGORIES_READ = 'categories.read',
  CATEGORIES_WRITE = 'categories.write',
  CATEGORIES_DELETE = 'categories.delete',

  // Suppliers
  SUPPLIERS_READ = 'suppliers.read',
  SUPPLIERS_WRITE = 'suppliers.write',
  SUPPLIERS_DELETE = 'suppliers.delete',

  // Inventory
  INVENTORY_READ = 'inventory.read',
  INVENTORY_WRITE = 'inventory.write',
  INVENTORY_DELETE = 'inventory.delete',
  INVENTORY_ADJUST = 'inventory.adjust',

  // Orders
  ORDERS_READ = 'orders.read',
  ORDERS_WRITE = 'orders.write',
  ORDERS_DELETE = 'orders.delete',
  ORDERS_APPROVE = 'orders.approve',

  // Users
  USERS_READ = 'users.read',
  USERS_WRITE = 'users.write',
  USERS_DELETE = 'users.delete',

  // Companies
  COMPANIES_READ = 'companies.read',
  COMPANIES_WRITE = 'companies.write',
  COMPANIES_DELETE = 'companies.delete',

  // Audit
  AUDIT_READ = 'audit.read',

  // Admin
  ADMIN = 'admin',
}

// ---------------------------------------------------------------------------
// Roles
// ---------------------------------------------------------------------------

export enum Role {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  STAFF = 'STAFF',
  VIEWER = 'VIEWER',
}

// ---------------------------------------------------------------------------
// Role -> Permission mapping
// ---------------------------------------------------------------------------

/** Default permissions granted to each built-in role. */
export const ROLE_PERMISSIONS: Readonly<Record<Role, Permission[]>> = {
  [Role.ADMIN]: Object.values(Permission),

  [Role.MANAGER]: [
    Permission.PRODUCTS_READ,
    Permission.PRODUCTS_WRITE,
    Permission.CATEGORIES_READ,
    Permission.CATEGORIES_WRITE,
    Permission.SUPPLIERS_READ,
    Permission.SUPPLIERS_WRITE,
    Permission.INVENTORY_READ,
    Permission.INVENTORY_WRITE,
    Permission.INVENTORY_ADJUST,
    Permission.ORDERS_READ,
    Permission.ORDERS_WRITE,
    Permission.ORDERS_APPROVE,
    Permission.USERS_READ,
    Permission.COMPANIES_READ,
    Permission.COMPANIES_WRITE,
    Permission.AUDIT_READ,
  ],

  [Role.STAFF]: [
    Permission.PRODUCTS_READ,
    Permission.CATEGORIES_READ,
    Permission.SUPPLIERS_READ,
    Permission.INVENTORY_READ,
    Permission.INVENTORY_ADJUST,
    Permission.ORDERS_READ,
    Permission.ORDERS_WRITE,
    Permission.COMPANIES_READ,
  ],

  [Role.VIEWER]: [
    Permission.PRODUCTS_READ,
    Permission.CATEGORIES_READ,
    Permission.SUPPLIERS_READ,
    Permission.INVENTORY_READ,
    Permission.ORDERS_READ,
    Permission.COMPANIES_READ,
  ],
};
