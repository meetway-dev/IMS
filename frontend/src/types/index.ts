// User & Auth Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'ADMIN' | 'MANAGER' | 'STAFF';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
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

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
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
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams extends PaginationParams {
  [key: string]: any;
}
