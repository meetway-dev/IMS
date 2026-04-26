// Entity Types

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface User extends BaseEntity {
  email: string;
  name?: string;
  role: string;
  permissions?: string[];
}

export interface Product extends BaseEntity {
  name: string;
  sku: string;
  type: 'SANITARY' | 'ELECTRICAL';
  unit: string;
  purchasePrice: string;
  salePrice: string;
  minStockAlert: number;
  categoryId?: string;
  companyId?: string;
  category?: Category;
  company?: Company;
  inventory?: Inventory;
  variants?: ProductVariant[];
}

export interface ProductVariant extends BaseEntity {
  productId: string;
  size?: string;
  color?: string;
  sku: string;
  purchasePrice?: string;
  salePrice?: string;
  inventory?: Inventory;
}

export interface Category extends BaseEntity {
  name: string;
  slug: string;
  parentId?: string | null;
  parent?: Category;
  children?: Category[];
}

export interface Supplier extends BaseEntity {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
  notes?: string;
}

export interface Inventory extends BaseEntity {
  productId?: string;
  variantId?: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  product?: Product;
  variant?: ProductVariant;
  lowStock?: boolean;
}

export interface InventoryTransaction extends BaseEntity {
  inventoryId: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  reason?: string;
  referenceId?: string;
  referenceType?: string;
  inventory?: Inventory;
}

export interface Order extends BaseEntity {
  orderNumber: string;
  customerId?: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  totalAmount: string;
  notes?: string;
  items?: OrderItem[];
}

export interface OrderItem extends BaseEntity {
  orderId: string;
  productId?: string;
  variantId?: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  product?: Product;
  variant?: ProductVariant;
}

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

export interface AuditLog extends BaseEntity {
  actorUserId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, any>;
  ip?: string;
  userAgent?: string;
  actor?: User;
}
