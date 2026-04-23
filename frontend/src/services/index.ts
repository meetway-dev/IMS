/**
 * Services Barrel Export
 *
 * Export all API service modules for centralized imports.
 *
 * @example
 * ```tsx
 * import { authService, userService } from '@/services';
 * ```
 */

// Base services
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