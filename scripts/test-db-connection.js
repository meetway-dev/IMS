// ============================================
// Database Connection Tester
// Tests PostgreSQL connectivity before migrations
// Run: npm run db:test-connection
// ============================================

const fs = require('fs');
const path = require('path');

// Load .env
function loadEnv() {
  const content = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf-8');
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [key, value] = trimmed.split('=');
    if (key) process.env[key] = value;
  });
}

loadEnv();

const { Client } = require('pg');

async function testConnection() {
  const dbUrl = process.env.DATABASE_URL;
  
  console.log('\n🔍 Testing PostgreSQL connection...\n');
  console.log(`📍 Connection URL: ${dbUrl.replace(/:[^@]*@/, ':***@')}\n`);
  
  const client = new Client({
    connectionString: dbUrl,
  });
  
  try {
    console.log('⏳ Connecting...');
    await client.connect();
    console.log('✅ Connected successfully!\n');
    
    // Get server info
    const result = await client.query('SELECT version();');
    console.log('📦 PostgreSQL Version:');
    console.log(`   ${result.rows[0].version.split(',')[0]}\n`);
    
    // Check if database exists
    const dbName = process.env.POSTGRES_DB;
    const dbCheck = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );
    
    if (dbCheck.rowCount > 0) {
      console.log(`✅ Database '${dbName}' exists\n`);
    } else {
      console.log(`❌ Database '${dbName}' NOT FOUND\n`);
      console.log(`   Fix: createdb -U ims -h localhost ${dbName}\n`);
    }
    
    await client.end();
    return true;
  } catch (error) {
    console.error('❌ Connection failed!\n');
    console.error(`Error: ${error.message}\n`);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('🔧 PostgreSQL is not running');
      console.error('   Start it with:');
      console.error('   Windows: Services > postgresql-x64-15 > Start');
      console.error('   macOS: brew services start postgresql@15');
      console.error('   Linux: sudo systemctl start postgresql\n');
    } else if (error.code === '28P01') {
      console.error('🔧 Authentication failed (wrong password?)');
      console.error('   Check POSTGRES_USER and POSTGRES_PASSWORD in .env\n');
    } else if (error.code === '3D000') {
      console.error('🔧 Database does not exist');
      console.error(`   Create it with: createdb -U ims -h localhost ${process.env.POSTGRES_DB}\n`);
    }
    
    return false;
  }
}

testConnection().then((success) => {
  process.exit(success ? 0 : 1);
});
