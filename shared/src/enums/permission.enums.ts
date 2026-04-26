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

  // Product Types
  PRODUCT_TYPES_READ = 'product-types.read',
  PRODUCT_TYPES_WRITE = 'product-types.write',
  PRODUCT_TYPES_DELETE = 'product-types.delete',

  // Units of Measure
  UNIT_OF_MEASURES_READ = 'unit-of-measures.read',
  UNIT_OF_MEASURES_WRITE = 'unit-of-measures.write',
  UNIT_OF_MEASURES_DELETE = 'unit-of-measures.delete',

  // Suppliers
  SUPPLIERS_READ = 'suppliers.read',
  SUPPLIERS_WRITE = 'suppliers.write',
  SUPPLIERS_DELETE = 'suppliers.delete',

  // Inventory
  INVENTORY_READ = 'inventory.read',
  INVENTORY_WRITE = 'inventory.write',
  INVENTORY_DELETE = 'inventory.delete',
  INVENTORY_ADJUST = 'inventory.adjust',

  // Warehouses
  WAREHOUSES_READ = 'warehouses.read',
  WAREHOUSES_WRITE = 'warehouses.write',
  WAREHOUSES_DELETE = 'warehouses.delete',

  // Purchase Orders
  PURCHASE_ORDERS_READ = 'purchase-orders.read',
  PURCHASE_ORDERS_WRITE = 'purchase-orders.write',
  PURCHASE_ORDERS_DELETE = 'purchase-orders.delete',
  PURCHASE_ORDERS_APPROVE = 'purchase-orders.approve',

  // Goods Receipts
  GOODS_RECEIPTS_READ = 'goods-receipts.read',
  GOODS_RECEIPTS_WRITE = 'goods-receipts.write',
  GOODS_RECEIPTS_DELETE = 'goods-receipts.delete',

  // Orders
  ORDERS_READ = 'orders.read',
  ORDERS_WRITE = 'orders.write',
  ORDERS_DELETE = 'orders.delete',
  ORDERS_APPROVE = 'orders.approve',

  // Customers
  CUSTOMERS_READ = 'customers.read',
  CUSTOMERS_WRITE = 'customers.write',
  CUSTOMERS_DELETE = 'customers.delete',

  // Invoices
  INVOICES_READ = 'invoices.read',
  INVOICES_WRITE = 'invoices.write',
  INVOICES_DELETE = 'invoices.delete',

  // Users
  USERS_READ = 'users.read',
  USERS_WRITE = 'users.write',
  USERS_DELETE = 'users.delete',

  // Roles
  ROLES_READ = 'roles.read',
  ROLES_WRITE = 'roles.write',
  ROLES_DELETE = 'roles.delete',

  // Permissions
  PERMISSIONS_READ = 'permissions.read',
  PERMISSIONS_WRITE = 'permissions.write',
  PERMISSIONS_DELETE = 'permissions.delete',

  // Companies
  COMPANIES_READ = 'companies.read',
  COMPANIES_WRITE = 'companies.write',
  COMPANIES_DELETE = 'companies.delete',

  // Audit
  AUDIT_READ = 'audit.read',

  // Analytics
  ANALYTICS_READ = 'analytics.read',

  // Reports
  REPORTS_READ = 'reports.read',
  REPORTS_WRITE = 'reports.write',
  REPORTS_DELETE = 'reports.delete',

  // Settings
  SETTINGS_READ = 'settings.read',
  SETTINGS_WRITE = 'settings.write',

  // Integrations
  INTEGRATIONS_READ = 'integrations.read',
  INTEGRATIONS_WRITE = 'integrations.write',

  // Admin
  ADMIN = 'admin',
}

// ---------------------------------------------------------------------------
// Roles
// ---------------------------------------------------------------------------

export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  WAREHOUSE_MANAGER = 'WAREHOUSE_MANAGER',
  INVENTORY_CONTROLLER = 'INVENTORY_CONTROLLER',
  PURCHASING_OFFICER = 'PURCHASING_OFFICER',
  SALES_REPRESENTATIVE = 'SALES_REPRESENTATIVE',
  STAFF = 'STAFF',
  VIEWER = 'VIEWER',
}

// ---------------------------------------------------------------------------
// Role -> Permission mapping
// ---------------------------------------------------------------------------

/** Default permissions granted to each built-in role. */
export const ROLE_PERMISSIONS: Readonly<Record<Role, Permission[]>> = {
  [Role.SUPER_ADMIN]: Object.values(Permission),
  [Role.ADMIN]: Object.values(Permission),

  [Role.WAREHOUSE_MANAGER]: [
    Permission.PRODUCTS_READ,
    Permission.PRODUCTS_WRITE,
    Permission.CATEGORIES_READ,
    Permission.CATEGORIES_WRITE,
    Permission.PRODUCT_TYPES_READ,
    Permission.PRODUCT_TYPES_WRITE,
    Permission.UNIT_OF_MEASURES_READ,
    Permission.UNIT_OF_MEASURES_WRITE,
    Permission.INVENTORY_READ,
    Permission.INVENTORY_WRITE,
    Permission.INVENTORY_ADJUST,
    Permission.WAREHOUSES_READ,
    Permission.WAREHOUSES_WRITE,
    Permission.PURCHASE_ORDERS_READ,
    Permission.PURCHASE_ORDERS_WRITE,
    Permission.GOODS_RECEIPTS_READ,
    Permission.GOODS_RECEIPTS_WRITE,
    Permission.ORDERS_READ,
    Permission.ORDERS_WRITE,
    Permission.CUSTOMERS_READ,
    Permission.AUDIT_READ,
    Permission.REPORTS_READ,
  ],

  [Role.INVENTORY_CONTROLLER]: [
    Permission.PRODUCTS_READ,
    Permission.CATEGORIES_READ,
    Permission.PRODUCT_TYPES_READ,
    Permission.UNIT_OF_MEASURES_READ,
    Permission.INVENTORY_READ,
    Permission.INVENTORY_WRITE,
    Permission.INVENTORY_ADJUST,
    Permission.WAREHOUSES_READ,
    Permission.PURCHASE_ORDERS_READ,
    Permission.GOODS_RECEIPTS_READ,
    Permission.AUDIT_READ,
    Permission.REPORTS_READ,
  ],

  [Role.PURCHASING_OFFICER]: [
    Permission.PRODUCTS_READ,
    Permission.CATEGORIES_READ,
    Permission.PRODUCT_TYPES_READ,
    Permission.UNIT_OF_MEASURES_READ,
    Permission.SUPPLIERS_READ,
    Permission.SUPPLIERS_WRITE,
    Permission.PURCHASE_ORDERS_READ,
    Permission.PURCHASE_ORDERS_WRITE,
    Permission.PURCHASE_ORDERS_APPROVE,
    Permission.GOODS_RECEIPTS_READ,
    Permission.GOODS_RECEIPTS_WRITE,
    Permission.AUDIT_READ,
    Permission.REPORTS_READ,
  ],

  [Role.SALES_REPRESENTATIVE]: [
    Permission.PRODUCTS_READ,
    Permission.CATEGORIES_READ,
    Permission.PRODUCT_TYPES_READ,
    Permission.UNIT_OF_MEASURES_READ,
    Permission.ORDERS_READ,
    Permission.ORDERS_WRITE,
    Permission.ORDERS_APPROVE,
    Permission.CUSTOMERS_READ,
    Permission.CUSTOMERS_WRITE,
    Permission.INVOICES_READ,
    Permission.INVOICES_WRITE,
    Permission.AUDIT_READ,
    Permission.REPORTS_READ,
  ],

  [Role.STAFF]: [
    Permission.PRODUCTS_READ,
    Permission.CATEGORIES_READ,
    Permission.PRODUCT_TYPES_READ,
    Permission.UNIT_OF_MEASURES_READ,
    Permission.SUPPLIERS_READ,
    Permission.INVENTORY_READ,
    Permission.INVENTORY_ADJUST,
    Permission.WAREHOUSES_READ,
    Permission.PURCHASE_ORDERS_READ,
    Permission.GOODS_RECEIPTS_READ,
    Permission.ORDERS_READ,
    Permission.ORDERS_WRITE,
    Permission.CUSTOMERS_READ,
    Permission.INVOICES_READ,
    Permission.COMPANIES_READ,
    Permission.AUDIT_READ,
    Permission.REPORTS_READ,
  ],

  [Role.VIEWER]: [
    Permission.PRODUCTS_READ,
    Permission.CATEGORIES_READ,
    Permission.PRODUCT_TYPES_READ,
    Permission.UNIT_OF_MEASURES_READ,
    Permission.SUPPLIERS_READ,
    Permission.INVENTORY_READ,
    Permission.WAREHOUSES_READ,
    Permission.PURCHASE_ORDERS_READ,
    Permission.GOODS_RECEIPTS_READ,
    Permission.ORDERS_READ,
    Permission.CUSTOMERS_READ,
    Permission.INVOICES_READ,
    Permission.COMPANIES_READ,
    Permission.AUDIT_READ,
    Permission.REPORTS_READ,
  ],
};
