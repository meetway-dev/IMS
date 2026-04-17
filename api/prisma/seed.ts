import 'dotenv/config';
import argon2 from 'argon2';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, type Permission, ProductType, UnitOfMeasure, OrderStatus, InventoryTransactionType } from '@prisma/client';
import { Pool } from 'pg';

const prisma = new PrismaClient({
  adapter: new PrismaPg(new Pool({ connectionString: process.env.DATABASE_URL })),
});

// Password hash for test@123 (argon2id)
const TEST_PASSWORD_HASH = '$argon2id$v=19$m=65536,t=3,p=4$BvR1mKO6MDlTkM5vij1hJA$si2Cbk4n1oQl86e+DT4hqWKo4+uyCNcEqbVrQPuAugI';

// System roles (predefined, cannot be deleted)
const SYSTEM_ROLES = [
  { name: 'SUPER_ADMIN', description: 'Full system access', isSystem: true, isDefault: false },
  { name: 'ADMIN', description: 'Administrator with full access', isSystem: true, isDefault: false },
  { name: 'MANAGER', description: 'Manager with limited administrative access', isSystem: false, isDefault: false },
  { name: 'STAFF', description: 'Staff member with operational access', isSystem: false, isDefault: false },
  { name: 'USER', description: 'Regular user with basic access', isSystem: false, isDefault: true },
] as const;

// Default permissions following resource-action pattern
const PERMISSIONS = [
  // User management
  { key: 'users.create', name: 'Create Users', description: 'Create users', module: 'users', resource: 'User', action: 'create' },
  { key: 'users.read', name: 'Read Users', description: 'Read users', module: 'users', resource: 'User', action: 'read' },
  { key: 'users.update', name: 'Update Users', description: 'Update users', module: 'users', resource: 'User', action: 'update' },
  { key: 'users.delete', name: 'Delete Users', description: 'Delete users', module: 'users', resource: 'User', action: 'delete' },
  
  // Role management
  { key: 'roles.create', name: 'Create Roles', description: 'Create roles', module: 'roles', resource: 'Role', action: 'create' },
  { key: 'roles.read', name: 'Read Roles', description: 'Read roles', module: 'roles', resource: 'Role', action: 'read' },
  { key: 'roles.update', name: 'Update Roles', description: 'Update roles', module: 'roles', resource: 'Role', action: 'update' },
  { key: 'roles.delete', name: 'Delete Roles', description: 'Delete roles', module: 'roles', resource: 'Role', action: 'delete' },
  
  // Permission management
  { key: 'permissions.create', name: 'Create Permissions', description: 'Create permissions', module: 'permissions', resource: 'Permission', action: 'create' },
  { key: 'permissions.read', name: 'Read Permissions', description: 'Read permissions', module: 'permissions', resource: 'Permission', action: 'read' },
  { key: 'permissions.update', name: 'Update Permissions', description: 'Update permissions', module: 'permissions', resource: 'Permission', action: 'update' },
  { key: 'permissions.delete', name: 'Delete Permissions', description: 'Delete permissions', module: 'permissions', resource: 'Permission', action: 'delete' },
  { key: 'permissions.assign', name: 'Assign Permissions', description: 'Assign permissions', module: 'permissions', resource: 'Permission', action: 'assign' },
  
  // Products
  { key: 'products.create', name: 'Create Products', description: 'Create products', module: 'products', resource: 'Product', action: 'create' },
  { key: 'products.read', name: 'Read Products', description: 'Read products', module: 'products', resource: 'Product', action: 'read' },
  { key: 'products.update', name: 'Update Products', description: 'Update products', module: 'products', resource: 'Product', action: 'update' },
  { key: 'products.delete', name: 'Delete Products', description: 'Delete products', module: 'products', resource: 'Product', action: 'delete' },
  
  // Categories
  { key: 'categories.create', name: 'Create Categories', description: 'Create categories', module: 'categories', resource: 'Category', action: 'create' },
  { key: 'categories.read', name: 'Read Categories', description: 'Read categories', module: 'categories', resource: 'Category', action: 'read' },
  { key: 'categories.update', name: 'Update Categories', description: 'Update categories', module: 'categories', resource: 'Category', action: 'update' },
  { key: 'categories.delete', name: 'Delete Categories', description: 'Delete categories', module: 'categories', resource: 'Category', action: 'delete' },
  
  // Suppliers
  { key: 'suppliers.create', name: 'Create Suppliers', description: 'Create suppliers', module: 'suppliers', resource: 'Supplier', action: 'create' },
  { key: 'suppliers.read', name: 'Read Suppliers', description: 'Read suppliers', module: 'suppliers', resource: 'Supplier', action: 'read' },
  { key: 'suppliers.update', name: 'Update Suppliers', description: 'Update suppliers', module: 'suppliers', resource: 'Supplier', action: 'update' },
  { key: 'suppliers.delete', name: 'Delete Suppliers', description: 'Delete suppliers', module: 'suppliers', resource: 'Supplier', action: 'delete' },
  
  // Inventory
  { key: 'inventory.create', name: 'Create Inventory', description: 'Create inventory items', module: 'inventory', resource: 'Inventory', action: 'create' },
  { key: 'inventory.read', name: 'Read Inventory', description: 'Read inventory', module: 'inventory', resource: 'Inventory', action: 'read' },
  { key: 'inventory.update', name: 'Update Inventory', description: 'Update inventory', module: 'inventory', resource: 'Inventory', action: 'update' },
  { key: 'inventory.delete', name: 'Delete Inventory', description: 'Delete inventory', module: 'inventory', resource: 'Inventory', action: 'delete' },
  { key: 'inventory.adjust', name: 'Adjust Inventory', description: 'Adjust inventory quantities', module: 'inventory', resource: 'Inventory', action: 'adjust' },
  
  // Orders
  { key: 'orders.create', name: 'Create Orders', description: 'Create orders', module: 'orders', resource: 'Order', action: 'create' },
  { key: 'orders.read', name: 'Read Orders', description: 'Read orders', module: 'orders', resource: 'Order', action: 'read' },
  { key: 'orders.update', name: 'Update Orders', description: 'Update orders', module: 'orders', resource: 'Order', action: 'update' },
  { key: 'orders.delete', name: 'Delete Orders', description: 'Delete orders', module: 'orders', resource: 'Order', action: 'delete' },
  { key: 'orders.approve', name: 'Approve Orders', description: 'Approve orders', module: 'orders', resource: 'Order', action: 'approve' },
  
  // Companies
  { key: 'companies.create', name: 'Create Companies', description: 'Create companies', module: 'companies', resource: 'Company', action: 'create' },
  { key: 'companies.read', name: 'Read Companies', description: 'Read companies', module: 'companies', resource: 'Company', action: 'read' },
  { key: 'companies.update', name: 'Update Companies', description: 'Update companies', module: 'companies', resource: 'Company', action: 'update' },
  { key: 'companies.delete', name: 'Delete Companies', description: 'Delete companies', module: 'companies', resource: 'Company', action: 'delete' },
  
  // Audit
  { key: 'audit.read', name: 'Read Audit Logs', description: 'Read audit logs', module: 'audit', resource: 'AuditLog', action: 'read' },
  
  // Dashboard/Page access
  { key: 'dashboard.view', name: 'View Dashboard', description: 'View dashboard', module: 'dashboard', resource: 'Dashboard', action: 'view' },
  { key: 'admin.panel.access', name: 'Access Admin Panel', description: 'Access admin panel', module: 'admin', resource: 'AdminPanel', action: 'access' },
] as const;

// Role-Permission mappings
const ROLE_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: ['*'], // Wildcard for all permissions
  ADMIN: [
    'users.create', 'users.read', 'users.update', 'users.delete',
    'roles.create', 'roles.read', 'roles.update', 'roles.delete',
    'permissions.read', 'permissions.assign',
    'products.create', 'products.read', 'products.update', 'products.delete',
    'categories.create', 'categories.read', 'categories.update', 'categories.delete',
    'suppliers.create', 'suppliers.read', 'suppliers.update', 'suppliers.delete',
    'inventory.create', 'inventory.read', 'inventory.update', 'inventory.delete', 'inventory.adjust',
    'orders.create', 'orders.read', 'orders.update', 'orders.delete', 'orders.approve',
    'companies.create', 'companies.read', 'companies.update', 'companies.delete',
    'audit.read',
    'dashboard.view', 'admin.panel.access',
  ],
  MANAGER: [
    'users.read',
    'products.create', 'products.read', 'products.update',
    'categories.create', 'categories.read', 'categories.update',
    'suppliers.create', 'suppliers.read', 'suppliers.update',
    'inventory.create', 'inventory.read', 'inventory.update', 'inventory.adjust',
    'orders.create', 'orders.read', 'orders.update', 'orders.approve',
    'companies.create', 'companies.read', 'companies.update',
    'audit.read',
    'dashboard.view',
  ],
  STAFF: [
    'products.read',
    'categories.read',
    'suppliers.read',
    'inventory.read', 'inventory.adjust',
    'orders.create', 'orders.read', 'orders.update',
    'companies.read',
    'dashboard.view',
  ],
  USER: [
    'products.read',
    'categories.read',
    'suppliers.read',
    'inventory.read',
    'orders.read',
    'companies.read',
    'dashboard.view',
  ],
};

async function main() {
  console.log('🌱 Seeding database with enhanced RBAC system...');

  // 1. Create permissions
  console.log('Creating permissions...');
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key: perm.key },
      update: {
        name: perm.name,
        description: perm.description,
        module: perm.module,
        resource: perm.resource,
        action: perm.action,
      },
      create: {
        key: perm.key,
        name: perm.name,
        description: perm.description,
        module: perm.module,
        resource: perm.resource,
        action: perm.action,
      },
    });
  }

  // 2. Create system roles
  console.log('Creating system roles...');
  for (const roleData of SYSTEM_ROLES) {
    await prisma.role.upsert({
      where: { name: roleData.name },
      update: {
        description: roleData.description,
        isSystem: roleData.isSystem,
        isDefault: roleData.isDefault,
      },
      create: roleData,
    });
  }

  // 3. Assign permissions to roles
  console.log('Assigning permissions to roles...');
  const allPermissions = await prisma.permission.findMany();
  const permissionMap = new Map(allPermissions.map(p => [p.key, p.id]));

  for (const [roleName, permissionKeys] of Object.entries(ROLE_PERMISSIONS)) {
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) {
      console.warn(`Role ${roleName} not found, skipping permission assignment`);
      continue;
    }

    // Clear existing permissions
    await prisma.rolePermission.deleteMany({
      where: { roleId: role.id },
    });

    if (permissionKeys.includes('*')) {
      // SUPER_ADMIN gets all permissions
      await prisma.rolePermission.createMany({
        data: allPermissions.map(p => ({
          roleId: role.id,
          permissionId: p.id,
        })),
        skipDuplicates: true,
      });
      console.log(`Assigned ALL permissions to ${roleName}`);
    } else {
      // Assign specific permissions
      const rolePermissionData = permissionKeys
        .map(key => {
          const permId = permissionMap.get(key);
          if (!permId) {
            console.warn(`Permission ${key} not found, skipping`);
            return null;
          }
          return {
            roleId: role.id,
            permissionId: permId,
          };
        })
        .filter(Boolean);

      if (rolePermissionData.length > 0) {
        await prisma.rolePermission.createMany({
          data: rolePermissionData as any[],
          skipDuplicates: true,
        });
        console.log(`Assigned ${rolePermissionData.length} permissions to ${roleName}`);
      }
    }
  }

  // 4. Create super admin user if not exists
  console.log('Creating super admin user...');
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@example.com';
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'Admin123!';

  const existingSuperAdmin = await prisma.user.findFirst({
    where: { email: superAdminEmail, deletedAt: null },
  });

  if (!existingSuperAdmin) {
    const passwordHash = await argon2.hash(superAdminPassword);
    const superAdmin = await prisma.user.create({
      data: {
        email: superAdminEmail,
        passwordHash,
        name: 'Super Admin',
        status: 'ACTIVE',
        isEmailVerified: true,
      },
    });

    // Assign SUPER_ADMIN role
    const superAdminRole = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } });
    if (superAdminRole) {
      await prisma.userRole.create({
        data: {
          userId: superAdmin.id,
          roleId: superAdminRole.id,
        },
      });
      console.log(`✅ Super admin user created: ${superAdminEmail}`);
    }
  } else {
    console.log(`Super admin user already exists: ${superAdminEmail}`);
  }

  // 5. Create additional test users for each role
  console.log('Creating additional test users...');
  const testUsers = [
    { email: 'admin@test.com', name: 'Admin User', roleName: 'ADMIN' },
    { email: 'manager@test.com', name: 'Manager User', roleName: 'MANAGER' },
    { email: 'staff@test.com', name: 'Staff User', roleName: 'STAFF' },
    { email: 'user@test.com', name: 'Regular User', roleName: 'USER' },
  ];

  for (const userData of testUsers) {
    const existingUser = await prisma.user.findFirst({
      where: { email: userData.email, deletedAt: null },
    });

    if (!existingUser) {
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          passwordHash: TEST_PASSWORD_HASH,
          name: userData.name,
          status: 'ACTIVE',
          isEmailVerified: true,
        },
      });

      const role = await prisma.role.findUnique({ where: { name: userData.roleName } });
      if (role) {
        await prisma.userRole.create({
          data: {
            userId: user.id,
            roleId: role.id,
          },
        });
        console.log(`✅ Created ${userData.roleName} user: ${userData.email}`);
      }
    } else {
      console.log(`User already exists: ${userData.email}`);
    }
  }

  // 6. Seed core data (companies, categories, suppliers, products, inventory, orders)
  console.log('Seeding core data...');

  // Get super admin user for createdBy references
  const superAdmin = await prisma.user.findFirst({
    where: { email: superAdminEmail, deletedAt: null },
  });
  const createdByUserId = superAdmin!.id;

  // Companies
  console.log('Creating companies...');
  const companies = [
    { name: 'Acme Corp', code: 'ACME' },
    { name: 'Globex Inc', code: 'GLBX' },
  ];
  const createdCompanies = [];
  for (const companyData of companies) {
    const company = await prisma.company.upsert({
      where: { name: companyData.name },
      update: {},
      create: companyData,
    });
    createdCompanies.push(company);
    console.log(`✅ Created company: ${company.name}`);
  }

  // Categories
  console.log('Creating categories...');
  // Delete existing categories to avoid duplicates (cascading will delete related products? Not yet)
  await prisma.category.deleteMany({});
  const categories = [
    { name: 'Sanitary', slug: 'sanitary' },
    { name: 'Electrical', slug: 'electrical' },
    { name: 'Plumbing', slug: 'plumbing' },
  ];
  const createdCategories = [];
  for (const categoryData of categories) {
    const category = await prisma.category.create({
      data: categoryData,
    });
    createdCategories.push(category);
    console.log(`✅ Created category: ${category.name}`);
  }

  // Suppliers
  console.log('Creating suppliers...');
  const suppliers = [
    { name: 'Supplier One', email: 'supplier1@test.com', phone: '+1234567890', address: '123 Main St' },
    { name: 'Supplier Two', email: 'supplier2@test.com', phone: '+0987654321', address: '456 Oak Ave' },
    { name: 'Supplier Three', email: 'supplier3@test.com', phone: '+1112223333', address: '789 Pine Rd' },
    { name: 'Supplier Four', email: 'supplier4@test.com', phone: '+4445556666', address: '321 Elm Blvd' },
    { name: 'Supplier Five', email: 'supplier5@test.com', phone: '+7778889999', address: '654 Maple Ln' },
  ];
  const createdSuppliers = [];
  for (const supplierData of suppliers) {
    const supplier = await prisma.supplier.upsert({
      where: { email: supplierData.email },
      update: {},
      create: supplierData,
    });
    createdSuppliers.push(supplier);
    console.log(`✅ Created supplier: ${supplier.name}`);
  }

  // Products
  console.log('Creating products...');
  const products = [
    { name: 'Toilet Paper', sku: 'TP001', barcode: '123456789012', type: ProductType.SANITARY, unit: UnitOfMeasure.PIECE, purchasePrice: 5.99, salePrice: 9.99, minStockAlert: 10, categoryId: createdCategories[0].id, companyId: createdCompanies[0].id },
    { name: 'Hand Soap', sku: 'HS002', barcode: '123456789013', type: ProductType.SANITARY, unit: UnitOfMeasure.PIECE, purchasePrice: 2.50, salePrice: 4.99, minStockAlert: 20, categoryId: createdCategories[0].id, companyId: createdCompanies[0].id },
    { name: 'Light Bulb', sku: 'LB003', barcode: '123456789014', type: ProductType.ELECTRICAL, unit: UnitOfMeasure.PIECE, purchasePrice: 1.99, salePrice: 3.99, minStockAlert: 30, categoryId: createdCategories[1].id, companyId: createdCompanies[1].id },
    { name: 'Extension Cord', sku: 'EC004', barcode: '123456789015', type: ProductType.ELECTRICAL, unit: UnitOfMeasure.METER, purchasePrice: 8.00, salePrice: 15.00, minStockAlert: 5, categoryId: createdCategories[1].id, companyId: createdCompanies[1].id },
    { name: 'Pipe Fitting', sku: 'PF005', barcode: '123456789016', type: ProductType.SANITARY, unit: UnitOfMeasure.PIECE, purchasePrice: 3.25, salePrice: 6.50, minStockAlert: 15, categoryId: createdCategories[2].id, companyId: createdCompanies[0].id },
    { name: 'Faucet', sku: 'FC006', barcode: '123456789017', type: ProductType.SANITARY, unit: UnitOfMeasure.PIECE, purchasePrice: 12.00, salePrice: 24.99, minStockAlert: 8, categoryId: createdCategories[2].id, companyId: createdCompanies[1].id },
    { name: 'Wire Roll', sku: 'WR007', barcode: '123456789018', type: ProductType.ELECTRICAL, unit: UnitOfMeasure.METER, purchasePrice: 4.75, salePrice: 9.50, minStockAlert: 12, categoryId: createdCategories[1].id, companyId: createdCompanies[0].id },
    { name: 'Disinfectant Spray', sku: 'DS008', barcode: '123456789019', type: ProductType.SANITARY, unit: UnitOfMeasure.BOX, purchasePrice: 7.80, salePrice: 14.99, minStockAlert: 6, categoryId: createdCategories[0].id, companyId: createdCompanies[1].id },
    { name: 'Circuit Breaker', sku: 'CB009', barcode: '123456789020', type: ProductType.ELECTRICAL, unit: UnitOfMeasure.PIECE, purchasePrice: 18.50, salePrice: 35.00, minStockAlert: 4, categoryId: createdCategories[1].id, companyId: createdCompanies[0].id },
    { name: 'Plunger', sku: 'PL010', barcode: '123456789021', type: ProductType.SANITARY, unit: UnitOfMeasure.PIECE, purchasePrice: 3.99, salePrice: 7.99, minStockAlert: 25, categoryId: createdCategories[2].id, companyId: createdCompanies[1].id },
  ];
  const createdProducts = [];
  for (const productData of products) {
    const product = await prisma.product.upsert({
      where: { sku: productData.sku },
      update: {},
      create: {
        ...productData,
        purchasePrice: productData.purchasePrice.toString(),
        salePrice: productData.salePrice.toString(),
      },
    });
    createdProducts.push(product);
    console.log(`✅ Created product: ${product.name}`);
  }

  // Product variants (optional)
  console.log('Creating product variants...');
  const variants = [
    { productId: createdProducts[0].id, size: 'Large', color: 'White', sku: 'TP001-L', barcode: '123456789022' },
    { productId: createdProducts[0].id, size: 'Small', color: 'White', sku: 'TP001-S', barcode: '123456789023' },
    { productId: createdProducts[2].id, size: '60W', color: 'Warm White', sku: 'LB003-60W', barcode: '123456789024' },
    { productId: createdProducts[2].id, size: '100W', color: 'Cool White', sku: 'LB003-100W', barcode: '123456789025' },
  ];
  const createdVariants = [];
  for (const variantData of variants) {
    const variant = await prisma.productVariant.upsert({
      where: { sku: variantData.sku },
      update: {},
      create: variantData,
    });
    createdVariants.push(variant);
    console.log(`✅ Created variant: ${variant.sku}`);
  }

  // Inventory items for products and variants
  console.log('Creating inventory items...');
  const inventoryItems = [];
  for (const product of createdProducts) {
    const inventory = await prisma.inventoryItem.upsert({
      where: { productId: product.id },
      update: {},
      create: {
        productId: product.id,
        stockQuantity: 100,
        reservedQuantity: 0,
      },
    });
    inventoryItems.push(inventory);
    console.log(`✅ Created inventory for product: ${product.name}`);
  }
  for (const variant of createdVariants) {
    const inventory = await prisma.inventoryItem.upsert({
      where: { variantId: variant.id },
      update: {},
      create: {
        variantId: variant.id,
        stockQuantity: 50,
        reservedQuantity: 0,
      },
    });
    inventoryItems.push(inventory);
    console.log(`✅ Created inventory for variant: ${variant.sku}`);
  }

  // Inventory transactions (initial stock)
  console.log('Creating inventory transactions...');
  for (const item of inventoryItems) {
    await prisma.inventoryTransaction.create({
      data: {
        inventoryItemId: item.id,
        type: 'PURCHASE',
        quantityDelta: item.stockQuantity,
        reference: 'INITIAL_STOCK',
        note: 'Initial stock seeding',
        createdByUserId,
      },
    });
  }
  console.log(`✅ Created ${inventoryItems.length} inventory transactions`);

  // Orders
  console.log('Creating orders...');
  const orders = [
    { orderNumber: 'ORD-001', status: OrderStatus.CONFIRMED, subtotal: 45.97, discountTotal: 0, taxTotal: 4.60, total: 50.57 },
    { orderNumber: 'ORD-002', status: OrderStatus.DRAFT, subtotal: 120.50, discountTotal: 10.00, taxTotal: 11.05, total: 121.55 },
    { orderNumber: 'ORD-003', status: OrderStatus.PAID, subtotal: 89.99, discountTotal: 5.00, taxTotal: 8.50, total: 93.49 },
    { orderNumber: 'ORD-004', status: OrderStatus.CANCELLED, subtotal: 30.00, discountTotal: 0, taxTotal: 3.00, total: 33.00 },
    { orderNumber: 'ORD-005', status: OrderStatus.CONFIRMED, subtotal: 200.00, discountTotal: 20.00, taxTotal: 18.00, total: 198.00 },
  ];
  const createdOrders = [];
  for (const orderData of orders) {
    const order = await prisma.order.upsert({
      where: { orderNumber: orderData.orderNumber },
      update: {},
      create: {
        ...orderData,
        subtotal: orderData.subtotal.toString(),
        discountTotal: orderData.discountTotal.toString(),
        taxTotal: orderData.taxTotal.toString(),
        total: orderData.total.toString(),
        createdByUserId,
      },
    });
    createdOrders.push(order);
    console.log(`✅ Created order: ${order.orderNumber}`);
  }

  // Order items
  console.log('Creating order items...');
  const orderItemsData = [
    { orderId: createdOrders[0].id, productId: createdProducts[0].id, quantity: 5, unitPrice: 9.99, lineTotal: 49.95 },
    { orderId: createdOrders[0].id, productId: createdProducts[1].id, quantity: 2, unitPrice: 4.99, lineTotal: 9.98 },
    { orderId: createdOrders[1].id, productId: createdProducts[2].id, quantity: 10, unitPrice: 3.99, lineTotal: 39.90 },
    { orderId: createdOrders[1].id, productId: createdProducts[3].id, quantity: 3, unitPrice: 15.00, lineTotal: 45.00 },
    { orderId: createdOrders[2].id, productId: createdProducts[4].id, quantity: 7, unitPrice: 6.50, lineTotal: 45.50 },
    { orderId: createdOrders[3].id, productId: createdProducts[5].id, quantity: 1, unitPrice: 24.99, lineTotal: 24.99 },
    { orderId: createdOrders[4].id, productId: createdProducts[6].id, quantity: 15, unitPrice: 9.50, lineTotal: 142.50 },
  ];
  for (const itemData of orderItemsData) {
    await prisma.orderItem.create({
      data: {
        ...itemData,
        unitPrice: itemData.unitPrice.toString(),
        lineTotal: itemData.lineTotal.toString(),
      },
    });
  }
  console.log(`✅ Created ${orderItemsData.length} order items`);

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
