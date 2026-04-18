// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/signup',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  // Products
  PRODUCTS: {
    LIST: '/products',
    DETAIL: (id: string) => `/products/${id}`,
    CREATE: '/products',
    UPDATE: (id: string) => `/products/${id}`,
    DELETE: (id: string) => `/products/${id}`,
  },
  // Categories
  CATEGORIES: {
    LIST: '/categories',
    DETAIL: (id: string) => `/categories/${id}`,
    CREATE: '/categories',
    UPDATE: (id: string) => `/categories/${id}`,
    DELETE: (id: string) => `/categories/${id}`,
    TREE: '/categories/tree',
  },
  // Inventory
  INVENTORY: {
    LIST: '/inventory/items',
    DETAIL: (id: string) => `/inventory/items/${id}`,
    CREATE: '/inventory/items',
    UPDATE: (id: string) => `/inventory/items/${id}`,
    DELETE: (id: string) => `/inventory/items/${id}`,
    TRANSACTIONS: '/inventory/transactions',
    ADJUST: '/inventory/adjustments',
  },
  // Orders
  ORDERS: {
    LIST: '/orders',
    DETAIL: (id: string) => `/orders/${id}`,
    CREATE: '/orders',
    UPDATE: (id: string) => `/orders/${id}`,
    DELETE: (id: string) => `/orders/${id}`,
  },
  // Users
  USERS: {
    LIST: '/users',
    DETAIL: (id: string) => `/users/${id}`,
    CREATE: '/users',
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
  },
  // Roles
  ROLES: {
    LIST: '/roles',
    DETAIL: (id: string) => `/roles/${id}`,
    CREATE: '/roles',
    UPDATE: (id: string) => `/roles/${id}`,
    DELETE: (id: string) => `/roles/${id}`,
    ASSIGN_PERMISSIONS: (id: string) => `/roles/${id}/permissions`,
    CLONE: (id: string) => `/roles/${id}/clone`,
  },
  // Permissions
  PERMISSIONS: {
    LIST: '/permissions',
    DETAIL: (id: string) => `/permissions/${id}`,
    CREATE: '/permissions',
    UPDATE: (id: string) => `/permissions/${id}`,
    DELETE: (id: string) => `/permissions/${id}`,
    BY_MODULE: (module: string) => `/permissions/module/${module}`,
  },
  // Companies
  COMPANIES: {
    LIST: '/companies',
    DETAIL: (id: string) => `/companies/${id}`,
    CREATE: '/companies',
    UPDATE: (id: string) => `/companies/${id}`,
    DELETE: (id: string) => `/companies/${id}`,
  },
  // Suppliers
  SUPPLIERS: {
    LIST: '/suppliers',
    DETAIL: (id: string) => `/suppliers/${id}`,
    CREATE: '/suppliers',
    UPDATE: (id: string) => `/suppliers/${id}`,
    DELETE: (id: string) => `/suppliers/${id}`,
  },
  // Audit
  AUDIT: {
    LIST: '/audit-logs',
    DETAIL: (id: string) => `/audit-logs/${id}`,
  },
  // Health
  HEALTH: '/health',
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  THEME: 'theme',
  SIDEBAR_STATE: 'sidebar_state',
} as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Roles
export const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  STAFF: 'STAFF',
} as const;

// Order Status
export const ORDER_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

// Inventory Transaction Types
export const TRANSACTION_TYPES = {
  IN: 'IN',
  OUT: 'OUT',
  ADJUSTMENT: 'ADJUSTMENT',
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy HH:mm',
  INPUT: 'yyyy-MM-dd',
  INPUT_WITH_TIME: "yyyy-MM-dd'T'HH:mm",
} as const;

// Currency
export const CURRENCY = {
  CODE: 'PKR',
  SYMBOL: '₨',
  LOCALE: 'en-PK',
} as const;

// App Constants
export const APP_NAME = 'IMS';
export const APP_VERSION = '1.0.0';

// Toast Duration
export const TOAST_DURATION = 3000;

// Debounce Time
export const DEBOUNCE_TIME = 500;
