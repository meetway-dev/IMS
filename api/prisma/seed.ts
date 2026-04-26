import 'dotenv/config';
import argon2 from 'argon2';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  PrismaClient,
  OrderStatus,
  PurchaseOrderStatus,
  GoodsReceiptStatus,
  WarehouseType,
  LocationType,
  InventoryTransactionType,
  PermissionType,
  PermissionEffect,
  UserStatus,
} from '@prisma/client';
import { Pool } from 'pg';
import { faker } from '@faker-js/faker';

// Initialize Prisma with PostgreSQL adapter
const prisma = new PrismaClient({
  adapter: new PrismaPg(
    new Pool({ connectionString: process.env.DATABASE_URL }),
  ),
});

// ==================== SYSTEM ROLES ====================
export const SYSTEM_ROLES = [
  {
    name: 'SUPER_ADMIN',
    description: 'Full system access with all permissions',
    isSystem: true,
    isDefault: false,
    priority: 1000,
  },
  {
    name: 'ADMIN',
    description: 'Administrator with full operational access',
    isSystem: true,
    isDefault: false,
    priority: 900,
  },
  {
    name: 'WAREHOUSE_MANAGER',
    description: 'Manages warehouse operations, inventory, and staff',
    isSystem: false,
    isDefault: false,
    priority: 800,
  },
  {
    name: 'INVENTORY_CONTROLLER',
    description: 'Controls inventory levels, stock counts, and adjustments',
    isSystem: false,
    isDefault: false,
    priority: 700,
  },
  {
    name: 'PURCHASING_OFFICER',
    description: 'Handles purchase orders and supplier relationships',
    isSystem: false,
    isDefault: false,
    priority: 600,
  },
  {
    name: 'SALES_REPRESENTATIVE',
    description: 'Manages customer orders and sales operations',
    isSystem: false,
    isDefault: false,
    priority: 500,
  },
  {
    name: 'STAFF',
    description: 'General staff with basic operational access',
    isSystem: false,
    isDefault: false,
    priority: 400,
  },
  {
    name: 'VIEWER',
    description: 'Read-only access for reporting and monitoring',
    isSystem: false,
    isDefault: true,
    priority: 100,
  },
] as const;

// ==================== PERMISSIONS ====================
export const PERMISSIONS = [
  // ===== USER MANAGEMENT =====
  {
    key: 'users.create',
    name: 'Create Users',
    description: 'Create new user accounts',
    module: 'users',
    resource: 'User',
    action: 'create',
    type: PermissionType.CRUD,
    effect: PermissionEffect.ALLOW,
  },
  {
    key: 'users.read',
    name: 'Read Users',
    description: 'View user profiles and lists',
    module: 'users',
    resource: 'User',
    action: 'read',
    type: PermissionType.CRUD,
    effect: PermissionEffect.ALLOW,
  },
  {
    key: 'users.update',
    name: 'Update Users',
    description: 'Edit user information and status',
    module: 'users',
    resource: 'User',
    action: 'update',
    type: PermissionType.CRUD,
    effect: PermissionEffect.ALLOW,
  },
  {
    key: 'users.delete',
    name: 'Delete Users',
    description: 'Delete or archive user accounts',
    module: 'users',
    resource: 'User',
    action: 'delete',
    type: PermissionType.CRUD,
    effect: PermissionEffect.ALLOW,
  },
  {
    key: 'users.manage_roles',
    name: 'Manage User Roles',
    description: 'Assign or revoke roles from users',
    module: 'users',
    resource: 'User',
    action: 'manage_roles',
    type: PermissionType.ACTION,
    effect: PermissionEffect.ALLOW,
  },

  // ===== ROLE MANAGEMENT =====
  {
    key: 'roles.create',
    name: 'Create Roles',
    description: 'Create new system roles',
    module: 'roles',
    resource: 'Role',
    action: 'create',
    type: PermissionType.CRUD,
    effect: PermissionEffect.ALLOW,
  },
  {
    key: 'roles.read',
    name: 'Read Roles',
    description: 'View role definitions and permissions',
    module: 'roles',
    resource: 'Role',
    action: 'read',
    type: PermissionType.CRUD,
    effect: PermissionEffect.ALLOW,
  },
  {
    key: 'roles.update',
    name: 'Update Roles',
    description: 'Edit role properties and permissions',
    module: 'roles',
    resource: 'Role',
    action: 'update',
    type: PermissionType.CRUD,
    effect: PermissionEffect.ALLOW,
  },
  {
    key: 'roles.delete',
    name: 'Delete Roles',
    description: 'Delete or archive roles',
    module: 'roles',
    resource: 'Role',
    action: 'delete',
    type: PermissionType.CRUD,
    effect: PermissionEffect.ALLOW,
  },

  // ===== PERMISSION MANAGEMENT =====
  {
    key: 'permissions.read',
    name: 'Read Permissions',
    description: 'View system permissions',
    module: 'permissions',
    resource: 'Permission',
    action: 'read',
    type: PermissionType.CRUD,
    effect: PermissionEffect.ALLOW,
  },
  {
    key: 'permissions.manage',
    name: 'Manage Permissions',
    description: 'Assign permissions to roles',
    module: 'permissions',
    resource: 'Permission',
    action: 'manage',
    type: PermissionType.ACTION,
    effect: PermissionEffect.ALLOW,
  },

  // ===== PRODUCT MANAGEMENT =====
  {
    key: 'products.create',
    name: 'Create Products',
    description: 'Create new product entries',
    module: 'products',
    resource: 'Product',
    action: 'create',
    type: PermissionType.CRUD,
    effect: PermissionEffect.ALLOW,
  },
  {
    key: 'products.read',
    name: 'Read Products',
    description: 'View product catalog',
    module: 'products',
    resource: 'Product',
    action: 'read',
    type: PermissionType.CRUD,
    effect: PermissionEffect.ALLOW,
  },
  {
    key: 'products.update',
    name: 'Update Products',
    description: 'Edit product information',
    module: 'products',
    resource: 'Product',
    action: 'update',
    type: PermissionType.CRUD,
    effect: PermissionEffect.ALLOW,
  },
  {
    key: 'products.delete',
    name: 'Delete Products',
    description: 'Delete or archive products',
    module: 'products',
    resource: 'Product',
    action: 'delete',
    type: PermissionType.CRUD,
    effect: PermissionEffect.ALLOW,
  },

  // ===== INVENTORY MANAGEMENT =====
  {
    key: 'inventory.create',
    name: 'Create Inventory',
    description: 'Create inventory items',
    module: 'inventory',
    resource: 'Inventory',
    action: 'create',
    type: PermissionType.CRUD,
    effect: PermissionEffect.ALLOW,
  },
  {
    key: 'inventory.read',
    name: 'Read Inventory',
    description: 'View inventory levels and status',
    module: 'inventory',
    resource: 'Inventory',
    action: 'read',
    type: PermissionType.CRUD,
    effect: PermissionEffect.ALLOW,
  },
  {
    key: 'inventory.update',
    name: 'Update Inventory',
    description: 'Edit inventory information',
    module: 'inventory',
    resource: 'Inventory',
    action: 'update',
    type: PermissionType.CRUD,
    effect: PermissionEffect.ALLOW,
  },
  {
    key: 'inventory.adjust',
    name: 'Adjust Inventory',
    description: 'Adjust stock quantities',
    module: 'inventory',
    resource: 'Inventory',
    action: 'adjust',
    type: PermissionType.ACTION,
    effect: PermissionEffect.ALLOW,
  },
  {
    key: 'inventory.transfer',
    name: 'Transfer Inventory',
    description: 'Transfer stock between warehouses',
    module: 'inventory',
    resource: 'Inventory',
    action: 'transfer',
    type: PermissionType.ACTION,
    effect: PermissionEffect.ALLOW,
  },

  // ===== WAREHOUSE MANAGEMENT =====
  {
    key: 'warehouses.create',
    name: 'Create Warehouses',
    description: 'Create new warehouse locations',
    module: 'warehouses',
    resource: 'Warehouse',
    action: 'create',
    type: PermissionType.CRUD,
    effect: PermissionEffect.ALLOW,
  },
  {
    key: 'warehouses.read',
    name: 'Read Warehouses',
    description: 'View warehouse information',
    module: 'warehouses',
    resource: 'Warehouse',
    action: 'read',
    type: PermissionType.CRUD,
    effect: PermissionEffect.ALLOW,
  },
  {
    key: 'warehouses.update',
    name: 'Update Warehouses',
    description: 'Edit warehouse details',
    module: 'warehouses',
    resource: 'Warehouse',
    action: 'update',
    type: PermissionType.CRUD,
    effect: PermissionEffect.ALLOW,
  },
  {
    key: 'warehouses.delete',
    name: 'Delete Warehouses',
    description: 'Delete or archive warehouses',
    module: 'warehouses',
    resource: 'Warehouse',
    action: 'delete',
    type: PermissionType.CRUD,
    effect: PermissionEffect.ALLOW,
  },

  // ===== PURCHASE ORDER MANAGEMENT =====
  {
    key: 'purchase_orders.create',
    name: 'Create Purchase Orders',
    description: 'Create new purchase orders',
    module: 'purchase_orders',
    resource: 'PurchaseOrder',
    action: 'create',
    type: PermissionType.CRUD,
    effect: PermissionEffect.ALLOW,
  },
  {
    key: 'purchase_orders.read',
    name: 'Read Purchase Orders',
    description: 'View purchase orders',
    module: 'purchase_orders',
    resource: 'PurchaseOrder',
    action: 'read',
    type: PermissionType.CRUD,
    effect: PermissionEffect.ALLOW,
  },
  {
    key: 'purchase_orders.update',
    name: 'Update Purchase Orders',
    description: 'Edit purchase orders',
    module: 'purchase_orders',
    resource: 'PurchaseOrder',
    action: 'update',
    type: PermissionType.CRUD,
    effect: PermissionEffect.ALLOW,
  },
  {
    key: 'purchase_orders.approve',
    name: 'Approve Purchase Orders',
    description: 'Approve or reject purchase orders',
    module: 'purchase_orders',
    resource: 'PurchaseOrder',
    action: 'approve',
    type: PermissionType.ACTION,
    effect: PermissionEffect.ALLOW,
  },
  {
    key: 'purchase_orders.receive',
    name: 'Receive Purchase Orders',
    description: 'Receive goods against purchase orders',
    module: 'purchase_orders',
    resource: 'PurchaseOrder',
    action: 'receive',
    type: PermissionType.ACTION,
    effect: PermissionEffect.ALLOW,
  },

  // ===== ORDER MANAGEMENT =====
  {
    key: 'orders.create',
    name: 'Create Orders',
    description: 'Create new sales orders',
    module: 'orders',
    resource: 'Order',
    action: 'create',
    type: PermissionType.CRUD,
    effect: PermissionEffect.ALLOW,
  },
  {
    key: 'orders.read',
    name: 'Read Orders',
    description: 'View sales orders',
    module: 'orders',
    resource: 'Order',
    action: 'read',
    type: PermissionType.CRUD,
    effect: PermissionEffect.ALLOW,
  },
  {
    key: 'orders.update',
    name: 'Update Orders',
    description: 'Edit sales orders',
    module: 'orders',
    resource: 'Order',
    action: 'update',
    type: PermissionType.CRUD,
    effect: PermissionEffect.ALLOW,
  },
  {
    key: 'orders.approve',
    name: 'Approve Orders',
    description: 'Approve or reject sales orders',
    module: 'orders',
    resource: 'Order',
    action: 'approve',
    type: PermissionType.ACTION,
    effect: PermissionEffect.ALLOW,
  },
  {
    key: 'orders.fulfill',
    name: 'Fulfill Orders',
    description: 'Process order fulfillment',
    module: 'orders',
    resource: 'Order',
    action: 'fulfill',
    type: PermissionType.ACTION,
    effect: PermissionEffect.ALLOW,
  },

  // ===== SUPPLIER MANAGEMENT =====
  {
    key: 'suppliers.create',
    name: 'Create Suppliers',
    description: 'Create new supplier records',
    module: 'suppliers',
    resource: 'Supplier',
    action: 'create',
    type: PermissionType.CRUD,
    effect: PermissionEffect.ALLOW,
  },
  {
    key: 'suppliers.read',
    name: 'Read Suppliers',
    description: 'View supplier information',
    module: 'suppliers',
    resource: 'Supplier',
    action: 'read',
    type: PermissionType.CRUD,
    effect: PermissionEffect.ALLOW,
  },
  {
    key: 'suppliers.update',
    name: 'Update Suppliers',
    description: 'Edit supplier details',
    module: 'suppliers',
    resource: 'Supplier',
    action: 'update',
    type: PermissionType.CRUD,
    effect: PermissionEffect.ALLOW,
  },
  {
    key: 'suppliers.delete',
    name: 'Delete Suppliers',
    description: 'Delete or archive suppliers',
    module: 'suppliers',
    resource: 'Supplier',
    action: 'delete',
    type: PermissionType.CRUD,
    effect: PermissionEffect.ALLOW,
  },

  // ===== CATEGORY MANAGEMENT =====
  {
    key: 'categories.create',
    name: 'Create Categories',
    description: 'Create new product categories',
    module: 'categories',
    resource: 'Category',
    action: 'create',
    type: PermissionType.CRUD,
    effect: PermissionEffect.ALLOW,
  },
  {
    key: 'categories.read',
    name: 'Read Categories',
    description: 'View product categories',
    module: 'categories',
    resource: 'Category',
    action: 'read',
    type: PermissionType.CRUD,
    effect: PermissionEffect.ALLOW,
  },
  {
    key: 'categories.update',
    name: 'Update Categories',
    description: 'Edit category information',
    module: 'categories',
    resource: 'Category',
    action: 'update',
    type: PermissionType.CRUD,
    effect: PermissionEffect.ALLOW,
  },
  {
    key: 'categories.delete',
    name: 'Delete Categories',
    description: 'Delete or archive categories',
    module: 'categories',
    resource: 'Category',
    action: 'delete',
    type: PermissionType.CRUD,
    effect: PermissionEffect.ALLOW,
  },

  // ===== COMPANY MANAGEMENT =====
  {
    key: 'companies.create',
    name: 'Create Companies',
    description: 'Create new company records',
    module: 'companies',
    resource: 'Company',
    action: 'create',
    type: PermissionType.CRUD,
    effect: PermissionEffect.ALLOW,
  },
  {
    key: 'companies.read',
    name: 'Read Companies',
    description: 'View company information',
    module: 'companies',
    resource: 'Company',
    action: 'read',
    type: PermissionType.CRUD,
    effect: PermissionEffect.ALLOW,
  },
  {
    key: 'companies.update',
    name: 'Update Companies',
    description: 'Edit company details',
    module: 'companies',
    resource: 'Company',
    action: 'update',
    type: PermissionType.CRUD,
    effect: PermissionEffect.ALLOW,
  },
  {
    key: 'companies.delete',
    name: 'Delete Companies',
    description: 'Delete or archive companies',
    module: 'companies',
    resource: 'Company',
    action: 'delete',
    type: PermissionType.CRUD,
    effect: PermissionEffect.ALLOW,
  },

  // ===== AUDIT & REPORTS =====
  {
    key: 'audit.read',
    name: 'Read Audit Logs',
    description: 'View system audit logs',
    module: 'audit',
    resource: 'AuditLog',
    action: 'read',
    type: PermissionType.CRUD,
    effect: PermissionEffect.ALLOW,
  },
  {
    key: 'reports.view',
    name: 'View Reports',
    description: 'Access reporting dashboard',
    module: 'reports',
    resource: 'Report',
    action: 'view',
    type: PermissionType.PAGE,
    effect: PermissionEffect.ALLOW,
  },

  // ===== DASHBOARD ACCESS =====
  {
    key: 'dashboard.view',
    name: 'View Dashboard',
    description: 'Access main dashboard',
    module: 'dashboard',
    resource: 'Dashboard',
    action: 'view',
    type: PermissionType.PAGE,
    effect: PermissionEffect.ALLOW,
  },
  {
    key: 'admin.panel.access',
    name: 'Access Admin Panel',
    description: 'Access administrative panel',
    module: 'admin',
    resource: 'AdminPanel',
    action: 'access',
    type: PermissionType.PAGE,
    effect: PermissionEffect.ALLOW,
  },
] as const;

// ==================== TEST USERS ====================
export const TEST_USERS = [
  {
    email: 'superadmin@test.com',
    name: 'Super Admin',
    roles: ['SUPER_ADMIN'],
  },
  {
    email: 'admin@test.com',
    name: 'Admin User',
    roles: ['ADMIN'],
  },
  {
    email: 'user@test.com',
    name: 'Regular User',
    roles: ['VIEWER'],
  },
  {
    email: 'staff@test.com',
    name: 'Staff User',
    roles: ['STAFF'],
  },
] as const;

// Password hash for test users (argon2id) - "test@123"
export const TEST_PASSWORD_HASH =
  '$argon2id$v=19$m=65536,t=3,p=4$uHk8StAwDETcOSFpjUzZ4Q$jGmbEIa7KNQD2iDWD819GSVZWlspMKuIQkL765tY8+I';

// ==================== SEEDING FUNCTION ====================
async function main() {
  console.log('🌱 Starting database seeding...');

  // Create roles
  console.log('📝 Creating roles...');
  const createdRoles = new Map<string, any>();

  for (const roleData of SYSTEM_ROLES) {
    const role = await prisma.role.upsert({
      where: { name: roleData.name },
      update: roleData,
      create: roleData,
    });
    createdRoles.set(role.name, role);
    console.log(`  ✓ Created role: ${role.name}`);
  }

  // Create permissions
  console.log('🔐 Creating permissions...');
  const createdPermissions = new Map<string, any>();

  for (const permissionData of PERMISSIONS) {
    const permission = await prisma.permission.upsert({
      where: { key: permissionData.key },
      update: permissionData,
      create: permissionData,
    });
    createdPermissions.set(permission.key, permission);
  }
  console.log(`  ✓ Created ${PERMISSIONS.length} permissions`);

  // Assign permissions to roles
  console.log('🔗 Assigning permissions to roles...');

  // SUPER_ADMIN gets all permissions
  const superAdminRole = createdRoles.get('SUPER_ADMIN');
  if (superAdminRole) {
    for (const permission of createdPermissions.values()) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: superAdminRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: superAdminRole.id,
          permissionId: permission.id,
        },
      });
    }
    console.log(`  ✓ Assigned all permissions to SUPER_ADMIN`);
  }

  // ADMIN gets all permissions
  const adminRole = createdRoles.get('ADMIN');
  if (adminRole) {
    for (const permission of createdPermissions.values()) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      });
    }
    console.log(`  ✓ Assigned all permissions to ADMIN`);
  }

  // STAFF gets basic permissions (you can customize this)
  const staffRole = createdRoles.get('STAFF');
  if (staffRole) {
    const staffPermissions = [
      'dashboard.view',
      'users.read',
      'products.read',
      'categories.read',
      'inventory.read',
      'orders.read',
      'suppliers.read',
    ];

    for (const permKey of staffPermissions) {
      const permission = createdPermissions.get(permKey);
      if (permission) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: staffRole.id,
              permissionId: permission.id,
            },
          },
          update: {},
          create: {
            roleId: staffRole.id,
            permissionId: permission.id,
          },
        });
      }
    }
    console.log(`  ✓ Assigned basic permissions to STAFF`);
  }

  // VIEWER gets read-only permissions
  const viewerRole = createdRoles.get('VIEWER');
  if (viewerRole) {
    const viewerPermissions = [
      'dashboard.view',
      'users.read',
      'products.read',
      'categories.read',
      'inventory.read',
      'orders.read',
      'suppliers.read',
      'companies.read',
      'audit.read',
      'reports.view',
    ];

    for (const permKey of viewerPermissions) {
      const permission = createdPermissions.get(permKey);
      if (permission) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: viewerRole.id,
              permissionId: permission.id,
            },
          },
          update: {},
          create: {
            roleId: viewerRole.id,
            permissionId: permission.id,
          },
        });
      }
    }
    console.log(`  ✓ Assigned read-only permissions to VIEWER`);
  }

  // Create test users
  console.log('👤 Creating test users...');
  for (const userData of TEST_USERS) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        name: userData.name,
        passwordHash: TEST_PASSWORD_HASH,
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
      },
      create: {
        email: userData.email,
        name: userData.name,
        passwordHash: TEST_PASSWORD_HASH,
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
      },
    });

    // Assign roles to user
    for (const roleName of userData.roles) {
      const role = createdRoles.get(roleName);
      if (role) {
        await prisma.userRole.upsert({
          where: {
            userId_roleId: {
              userId: user.id,
              roleId: role.id,
            },
          },
          update: {},
          create: {
            userId: user.id,
            roleId: role.id,
          },
        });
      }
    }

    console.log(`  ✓ Created user: ${user.email} with roles: ${userData.roles.join(', ')}`);
  }

  console.log('✅ Database seeding completed successfully!');
}

// ==================== EXECUTION ====================
main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
