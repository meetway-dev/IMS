/**
 * Services barrel export.
 *
 * Import all API services from this single entry point:
 *
 * ```ts
 * import { authService, productService } from '@/services';
 * ```
 *
 * @module services
 */

// Base
export { CrudServiceBase } from './base/crud.service.base';

// Feature services
export { authService } from './auth.service';
export { userService } from './user.service';
export { roleService, permissionService } from './role-permission.service';
export { companyService } from './company.service';
export { categoryService } from './category.service';
export { productService } from './product.service';
export { supplierService } from './supplier.service';
export { inventoryService } from './inventory.service';
export { orderService } from './order.service';
export { dashboardService } from './dashboard.service';
export { auditService } from './audit.service';
export { warehouseService } from './warehouse.service';
export { purchaseOrderService } from './purchase-order.service';
export { stockLevelService } from './stock-level.service';
