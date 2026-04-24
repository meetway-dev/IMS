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
  categoryId: string;
  typeId: string;
  unitId: string;
  price: number;
  cost: number;
  unit: string; // Display name from UnitOfMeasure relation
  type: string; // Display name from ProductType relation
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

// ─── Warehouse Types ──────────────────────────────────────────────────────

export type WarehouseType = 'MAIN' | 'DISTRIBUTION' | 'RETAIL' | 'COLD_STORAGE' | 'BONDED';

export interface Warehouse {
  id: string;
  name: string;
  code?: string;
  type: WarehouseType;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  managerId?: string;
  isActive: boolean;
  capacity?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  manager?: {
    id: string;
    name: string;
    email: string;
  };
  locations?: WarehouseLocation[];
  _count?: {
    locations: number;
    stockLevels: number;
  };
}

export interface WarehouseStatistics {
  totalLocations: number;
  activeLocations: number;
  totalStockLevels: number;
  totalQuantity: number;
  totalReserved: number;
  availableQuantity: number;
  lowStockItems: number;
  capacityUtilization: number;
  locationTypeBreakdown: Record<string, number>;
}

export interface CreateWarehouseData {
  name: string;
  code?: string;
  type?: WarehouseType;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  managerId?: string;
  isActive?: boolean;
  capacity?: number;
  notes?: string;
}

export interface UpdateWarehouseData extends Partial<CreateWarehouseData> {}

export interface WarehouseListParams extends PaginationParams {
  type?: WarehouseType;
  isActive?: boolean;
}

// ─── Location Types ───────────────────────────────────────────────────────

export type LocationType = 'SHELF' | 'BIN' | 'PALLET' | 'RACK' | 'FLOOR' | 'COLD_ROOM';

export interface WarehouseLocation {
  id: string;
  warehouseId: string;
  name: string;
  code: string;
  type: LocationType;
  aisle?: string;
  row?: string;
  section?: string;
  level?: string;
  position?: string;
  capacity?: number;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  warehouse?: Warehouse;
  stockLevels?: StockLevel[];
  _count?: {
    stockLevels: number;
  };
}

export interface CreateLocationData {
  name: string;
  code: string;
  type?: LocationType;
  aisle?: string;
  row?: string;
  section?: string;
  level?: string;
  position?: string;
  capacity?: number;
  isActive?: boolean;
  notes?: string;
}

export interface UpdateLocationData extends Partial<CreateLocationData> {}

// ─── Stock Level Types ────────────────────────────────────────────────────

export interface StockLevel {
  id: string;
  inventoryItemId: string;
  warehouseId: string;
  locationId?: string;
  quantity: number;
  reserved: number;
  minQuantity: number;
  maxQuantity?: number;
  reorderPoint?: number;
  lastCountedAt?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  inventoryItem?: Inventory;
  warehouse?: Warehouse;
  location?: WarehouseLocation;
}

export interface StockLevelListParams extends PaginationParams {
  warehouseId?: string;
  locationId?: string;
  lowStock?: boolean;
}

// ─── Purchase Order Types ─────────────────────────────────────────────────

export type PurchaseOrderStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'PARTIALLY_RECEIVED'
  | 'COMPLETED'
  | 'CANCELLED';

export type PurchaseOrderItemStatus =
  | 'PENDING'
  | 'PARTIALLY_RECEIVED'
  | 'RECEIVED'
  | 'CANCELLED';

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  warehouseId: string;
  status: PurchaseOrderStatus;
  expectedDeliveryDate?: string;
  totalAmount: number;
  notes?: string;
  createdByUserId?: string;
  approvedByUserId?: string;
  approvedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  createdByUser?: {
    id: string;
    name: string;
    email: string;
  };
  approvedByUser?: {
    id: string;
    name: string;
    email: string;
  };
  supplier?: Supplier;
  warehouse?: Warehouse;
  items?: PurchaseOrderItem[];
  receipts?: GoodsReceiptNote[];
}

export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  status: PurchaseOrderItemStatus;
  receivedQuantity: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  variant?: ProductVariant;
}

export interface ProductVariant {
  id: string;
  productId: string;
  size?: string;
  color?: string;
  material?: string;
  sku?: string;
  barcode?: string;
  product?: Product;
}

export interface CreatePurchaseOrderData {
  supplierId: string;
  warehouseId: string;
  expectedDeliveryDate?: string;
  notes?: string;
  items: CreatePurchaseOrderItemData[];
}

export interface CreatePurchaseOrderItemData {
  variantId: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

export interface PurchaseOrderListParams extends PaginationParams {
  status?: PurchaseOrderStatus;
  supplierId?: string;
  warehouseId?: string;
}

// ─── Goods Receipt Note Types ─────────────────────────────────────────────

export type GoodsReceiptStatus = 'DRAFT' | 'COMPLETED' | 'CANCELLED';

export interface GoodsReceiptNote {
  id: string;
  grnNumber: string;
  purchaseOrderId: string;
  warehouseId: string;
  status: GoodsReceiptStatus;
  receiptDate: string;
  notes?: string;
  createdByUserId?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  createdByUser?: {
    id: string;
    name: string;
    email: string;
  };
  purchaseOrder?: PurchaseOrder;
  warehouse?: Warehouse;
  items?: GoodsReceiptItem[];
}

export interface GoodsReceiptItem {
  id: string;
  goodsReceiptNoteId: string;
  purchaseOrderItemId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  batchNumber?: string;
  expiryDate?: string;
  notes?: string;
  createdAt: string;
  purchaseOrderItem?: PurchaseOrderItem;
}

export interface CreateGoodsReceiptData {
  purchaseOrderId: string;
  warehouseId: string;
  receiptDate?: string;
  notes?: string;
  items: CreateGoodsReceiptItemData[];
}

export interface CreateGoodsReceiptItemData {
  purchaseOrderItemId: string;
  quantity: number;
  batchNumber?: string;
  expiryDate?: string;
  notes?: string;
}
