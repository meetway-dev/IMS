/**
 * Domain entity interfaces shared across the stack.
 *
 * These are *presentation-layer* shapes -- the frontend and API
 * serializers both target these types. They intentionally omit
 * Prisma-specific details (Decimal, Json, etc.).
 *
 * @module entity.types
 */

// ---------------------------------------------------------------------------
// Base
// ---------------------------------------------------------------------------

/** Fields present on every soft-deletable entity. */
export interface BaseEntity {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt?: Date | string | null;
}

// ---------------------------------------------------------------------------
// Auth / Users
// ---------------------------------------------------------------------------

export interface User extends BaseEntity {
  email: string;
  name?: string;
  role: string;
  permissions?: string[];
}

// ---------------------------------------------------------------------------
// Catalogue
// ---------------------------------------------------------------------------

export interface Product extends BaseEntity {
  name: string;
  sku: string;
  barcode?: string;
  typeId: string;
  unitId: string;
  purchasePrice: string;
  salePrice: string;
  minStockAlert: number;
  categoryId?: string;
  companyId?: string;
  category?: Category;
  company?: Company;
  type?: ProductType;
  unit?: UnitOfMeasure;
  stockLevels?: StockLevel[];
  variants?: ProductVariant[];
}

export interface ProductVariant extends BaseEntity {
  productId: string;
  size?: string;
  color?: string;
  material?: string;
  sku?: string;
  barcode?: string;
  stockLevels?: StockLevel[];
  product?: Product;
}

export interface ProductType extends BaseEntity {
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
}

export interface UnitOfMeasure extends BaseEntity {
  name: string;
  abbreviation: string;
  description?: string;
  isActive: boolean;
}

export interface Category extends BaseEntity {
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  parent?: Category;
  children?: Category[];
}

// ---------------------------------------------------------------------------
// Suppliers
// ---------------------------------------------------------------------------

export interface Supplier extends BaseEntity {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
  notes?: string;
}

// ---------------------------------------------------------------------------
// Inventory
// ---------------------------------------------------------------------------

export interface StockLevel extends BaseEntity {
  productId?: string;
  variantId?: string;
  warehouseId: string;
  locationId?: string;
  quantity: number;
  reserved: number;
  available: number;
  minQuantity: number;
  maxQuantity?: number;
  reorderPoint?: number;
  lastCountedAt?: Date | string;
  product?: Product;
  variant?: ProductVariant;
  warehouse?: Warehouse;
  location?: Location;
  stockMovements?: StockMovement[];
  alerts?: StockAlert[];
}

export interface StockMovement extends BaseEntity {
  stockLevelId: string;
  type: StockMovementType;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  referenceType?: string;
  referenceId?: string;
  warehouseId: string;
  locationId?: string;
  productId?: string;
  variantId?: string;
  notes?: string;
  createdByUserId?: string;
  stockLevel?: StockLevel;
  warehouse?: Warehouse;
  location?: Location;
  product?: Product;
  variant?: ProductVariant;
  createdByUser?: User;
}

export interface StockAlert extends BaseEntity {
  stockLevelId: string;
  alertType: string;
  severity: string;
  message: string;
  status: AlertStatus;
  resolvedAt?: Date | string;
  resolvedByUserId?: string;
  stockLevel?: StockLevel;
  resolvedByUser?: User;
}

export type StockMovementType =
  | 'PURCHASE'
  | 'SALE'
  | 'ADJUSTMENT'
  | 'RETURN'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT'
  | 'DAMAGE'
  | 'EXPIRY';

export type AlertStatus = 'ACTIVE' | 'RESOLVED' | 'DISMISSED';

// ---------------------------------------------------------------------------
// Warehouse & Location
// ---------------------------------------------------------------------------

export interface Warehouse extends BaseEntity {
  name: string;
  code: string;
  type: WarehouseType;
  address?: string;
  contact?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  managerId?: string;
  manager?: User;
  locations?: Location[];
  stockLevels?: StockLevel[];
}

export interface Location extends BaseEntity {
  warehouseId: string;
  code: string;
  name: string;
  type: LocationType;
  aisle?: string;
  row?: string;
  section?: string;
  level?: string;
  position?: string;
  capacity?: number;
  isActive: boolean;
  notes?: string;
  warehouse?: Warehouse;
  stockLevels?: StockLevel[];
}

export type WarehouseType = 'MAIN' | 'DISTRIBUTION' | 'RETAIL' | 'COLD_STORAGE' | 'BONDED';
export type LocationType = 'SHELF' | 'BIN' | 'PALLET' | 'RACK' | 'FLOOR' | 'COLD_ROOM';

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export interface Order extends BaseEntity {
  orderNumber: string;
  status: OrderStatus;
  subtotal: string;
  discountTotal: string;
  taxTotal: string;
  total: string;
  notes?: string;
  createdByUserId?: string;
  items?: OrderItem[];
}

export type OrderStatus =
  | 'DRAFT'
  | 'CONFIRMED'
  | 'PAID'
  | 'CANCELLED'
  | 'REFUNDED';

export interface OrderItem extends BaseEntity {
  orderId: string;
  productId?: string;
  variantId?: string;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
  product?: Product;
  variant?: ProductVariant;
}

// ---------------------------------------------------------------------------
// Company
// ---------------------------------------------------------------------------

export interface Company extends BaseEntity {
  name: string;
  code?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  website?: string;
  description?: string;
  isActive: boolean;
}

// ---------------------------------------------------------------------------
// Audit
// ---------------------------------------------------------------------------

export interface AuditLog extends BaseEntity {
  actorUserId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  actor?: User;
}
