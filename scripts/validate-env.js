// ============================================
// Environment Validation Script
// Ensures all required environment variables are set
// Run: node scripts/validate-env.js or npm run validate:env
// ============================================

// Load .env files manually (npm doesn't do this automatically)
const fs = require('fs');
const path = require('path');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    
    const [key, value] = trimmed.split('=');
    if (key && !process.env[key]) {
      process.env[key] = value;
    }
  });
}

// Load in priority order
const rootDir = path.resolve(__dirname, '..');
loadEnvFile(path.join(rootDir, '.env'));
loadEnvFile(path.join(rootDir, '.env.local'));

const requiredEnvVars = {
  development: [
    'NODE_ENV',
    'DATABASE_URL',
    'POSTGRES_USER',
    'POSTGRES_PASSWORD',
    'POSTGRES_DB',
    'API_PORT',
    'FRONTEND_PORT',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'CORS_ORIGIN',
    'NEXT_PUBLIC_API_URL',
  ],
};

const missingVars = [];
const envMode = process.env.NODE_ENV || 'development';
const requiredVars = requiredEnvVars[envMode] || requiredEnvVars.development;

console.log(`\n🔍 Validating environment variables for: ${envMode.toUpperCase()}\n`);

requiredVars.forEach((varName) => {
  if (!process.env[varName]) {
    missingVars.push(varName);
    console.log(`  ❌ ${varName} - MISSING`);
  } else {
    const value = varName.includes('SECRET') ? '***' : process.env[varName];
    console.log(`  ✅ ${varName} - ${value}`);
  }
});

if (missingVars.length > 0) {
  console.error(`\n❌ ERROR: Missing ${missingVars.length} environment variable(s):\n`);
  missingVars.forEach((v) => console.error(`   - ${v}`));
  console.error(`\n📋 Please set these variables in .env or .env.local\n`);
  process.exit(1);
} else {
  console.log(`\n✅ All required environment variables are set!\n`);
  process.exit(0);
}
