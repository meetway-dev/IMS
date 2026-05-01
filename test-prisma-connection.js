const { PrismaClient } = require('@prisma/client');

async function test() {
  console.log('Testing Prisma connection...');
  
  // Create Prisma client with explicit DATABASE_URL
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'postgresql://ims:ims@localhost:5432/ims?schema=public'
      }
    }
  });

  try {
    // Try to connect
    await prisma.$connect();
    console.log('✅ Prisma connected successfully!');
    
    // Try a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query result:', result);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Prisma connection error:', error.message);
    console.error('Full error:', error);
  }
}

test();