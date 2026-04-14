import 'dotenv/config';
import argon2 from 'argon2';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, type Permission } from '@prisma/client';
import { Pool } from 'pg';

const prisma = new PrismaClient({
  adapter: new PrismaPg(new Pool({ connectionString: process.env.DATABASE_URL })),
});

const ROLE_KEYS = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  STAFF: 'Staff',
} as const;

const PERMISSIONS = [
  // Auth/User management
  { key: 'users.read', description: 'Read users' },
  { key: 'users.write', description: 'Create/update users' },
  { key: 'roles.read', description: 'Read roles' },
  { key: 'roles.write', description: 'Create/update roles' },

  // Catalog
  { key: 'products.read', description: 'Read products' },
  { key: 'products.write', description: 'Create/update products' },
  { key: 'categories.read', description: 'Read categories' },
  { key: 'categories.write', description: 'Create/update categories' },
  { key: 'companies.read', description: 'Read companies' },
  { key: 'companies.write', description: 'Create/update companies' },

  // Inventory
  { key: 'inventory.read', description: 'Read inventory' },
  { key: 'inventory.write', description: 'Adjust inventory' },

  // Orders
  { key: 'orders.read', description: 'Read orders' },
  { key: 'orders.write', description: 'Create/update orders' },

  // Audit
  { key: 'audit.read', description: 'Read audit logs' },
] as const;

async function main() {
  // Permissions
  await prisma.permission.createMany({
    data: [...PERMISSIONS],
    skipDuplicates: true,
  });

  // Roles
  for (const name of Object.values(ROLE_KEYS)) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const [adminRole, managerRole, staffRole] = await Promise.all([
    prisma.role.findUniqueOrThrow({ where: { name: ROLE_KEYS.ADMIN } }),
    prisma.role.findUniqueOrThrow({ where: { name: ROLE_KEYS.MANAGER } }),
    prisma.role.findUniqueOrThrow({ where: { name: ROLE_KEYS.STAFF } }),
  ]);

  const allPermissions: Permission[] = await prisma.permission.findMany({
    where: { deletedAt: null },
  });

  // Admin gets everything
  await prisma.rolePermission.createMany({
    data: allPermissions.map((p: Permission) => ({
      roleId: adminRole.id,
      permissionId: p.id,
    })),
    skipDuplicates: true,
  });

  // Manager gets most, but not role/user writes by default
  const managerPermKeys = new Set([
    'products.read',
    'products.write',
    'categories.read',
    'categories.write',
    'companies.read',
    'companies.write',
    'inventory.read',
    'inventory.write',
    'orders.read',
    'orders.write',
    'users.read',
    'audit.read',
  ]);
  await prisma.rolePermission.createMany({
    data: allPermissions
      .filter((p: Permission) => managerPermKeys.has(p.key))
      .map((p: Permission) => ({ roleId: managerRole.id, permissionId: p.id })),
    skipDuplicates: true,
  });

  // Staff mostly read + orders write
  const staffPermKeys = new Set([
    'products.read',
    'categories.read',
    'companies.read',
    'inventory.read',
    'orders.read',
    'orders.write',
  ]);
  await prisma.rolePermission.createMany({
    data: allPermissions
      .filter((p: Permission) => staffPermKeys.has(p.key))
      .map((p: Permission) => ({ roleId: staffRole.id, permissionId: p.id })),
    skipDuplicates: true,
  });

  // Admin user
  const adminEmail = 'admin@ims.local';
  const adminPassword = 'Admin@123456';
  const passwordHash = await argon2.hash(adminPassword);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash, isEmailVerified: true, status: 'ACTIVE' },
    create: {
      email: adminEmail,
      passwordHash,
      name: 'IMS Admin',
      isEmailVerified: true,
      status: 'ACTIVE',
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
    update: {},
    create: { userId: adminUser.id, roleId: adminRole.id },
  });

  // Sample catalog
  const [c1, c2] = await Promise.all([
    prisma.company.upsert({
      where: { name: 'Generic Sanitary Co.' },
      update: {},
      create: { name: 'Generic Sanitary Co.', code: 'GSC' },
    }),
    prisma.company.upsert({
      where: { name: 'Generic Electrical Co.' },
      update: {},
      create: { name: 'Generic Electrical Co.', code: 'GEC' },
    }),
  ]);

  const catSanitary =
    (await prisma.category.findFirst({
      where: { parentId: null, slug: 'sanitary', deletedAt: null },
    })) ??
    (await prisma.category.create({
      data: { name: 'Sanitary', slug: 'sanitary' },
    }));
  const catElectrical =
    (await prisma.category.findFirst({
      where: { parentId: null, slug: 'electrical', deletedAt: null },
    })) ??
    (await prisma.category.create({
      data: { name: 'Electrical', slug: 'electrical' },
    }));

  const product = await prisma.product.upsert({
    where: { sku: 'PVC-PIPE-001' },
    update: {},
    create: {
      name: 'PVC Pipe',
      sku: 'PVC-PIPE-001',
      type: 'SANITARY',
      unit: 'METER',
      purchasePrice: '50.00',
      salePrice: '75.00',
      minStockAlert: 20,
      categoryId: catSanitary.id,
      companyId: c1.id,
    },
  });

  await prisma.inventoryItem.upsert({
    where: { productId: product.id },
    update: { stockQuantity: 100 },
    create: { productId: product.id, stockQuantity: 100 },
  });

  // eslint-disable-next-line no-console
  console.log('Seed complete.');
  // eslint-disable-next-line no-console
  console.log(`Admin: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

