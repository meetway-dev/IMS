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
  inventory?: InventoryItem;
  variants?: ProductVariant[];
}

export interface ProductVariant extends BaseEntity {
  productId: string;
  size?: string;
  color?: string;
  material?: string;
  sku?: string;
  barcode?: string;
  inventory?: InventoryItem;
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

export interface InventoryItem extends BaseEntity {
  productId?: string;
  variantId?: string;
  stockQuantity: number;
  product?: Product;
  variant?: ProductVariant;
}

export interface InventoryTransaction extends BaseEntity {
  inventoryItemId: string;
  type: 'SALE' | 'RETURN' | 'ADJUSTMENT' | 'PURCHASE';
  quantityDelta: number;
  reference?: string;
  note?: string;
  createdByUserId?: string;
  inventoryItem?: InventoryItem;
}

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
