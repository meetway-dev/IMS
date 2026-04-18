// User & Auth Types
export interface User {
  id: string;
  email: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  isDefault: boolean;
  priority: number;
  parentRoleId?: string;
  parentRole?: Role;
  childRoles?: Role[];
  permissions?: Permission[];
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  key: string;
  name: string;
  description?: string;
  type: 'API' | 'UI' | 'DATA';
  effect: 'ALLOW' | 'DENY';
  module: string;
  resource?: string;
  action?: string;
  scope?: string;
  isSystem: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'ADMIN' | 'MANAGER' | 'STAFF';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  refreshTokenId: string;
  sessionId: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
  code?: string;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  searchFields?: string;
  lowStock?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Product Types
export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  description?: string;
  categoryId: string;
  price: number;
  cost: number;
  unit: string;
  minStockLevel: number;
  stock?: number;
  isActive: boolean;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  category?: Category;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  children?: Category[];
  parent?: Category;
}

// Supplier Types
export interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Inventory Types
export interface Inventory {
  id: string;
  productId: string;
  quantity: number;
  location?: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  product?: Product;
}

export interface InventoryTransaction {
  id: string;
  productId: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  reason?: string;
  userId: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  product?: Product;
  user?: User;
}

// Order Types
export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  status: OrderStatus;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  notes?: string;
  userId: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  total: number;
  product?: Product;
}

// Company Types
export interface Company {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

// Form Types
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  searchFields?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams extends PaginationParams {
  [key: string]: any;
}
