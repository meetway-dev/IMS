// Prisma configuration with robust environment variable loading
import { defineConfig } from 'prisma/config';

// Load environment variables from .env or .env.local files
function loadEnvFile() {
  try {
    const fs = require('fs');
    const path = require('path');

    // Try .env.local first
    let envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      parseEnvContent(content);
    }

    // Fallback to .env
    envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath) && !process.env['DATABASE_URL']) {
      const content = fs.readFileSync(envPath, 'utf8');
      parseEnvContent(content);
    }
  } catch (error: any) {
    // fs may not be available, but that's unlikely in Node.js
    console.warn('Could not load .env files:', error?.message || String(error));
  }
}

function parseEnvContent(content: string) {
  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith('#')) continue;

    const equalsIndex = trimmed.indexOf('=');
    if (equalsIndex === -1) continue;

    const key = trimmed.substring(0, equalsIndex).trim();
    const value = trimmed.substring(equalsIndex + 1).trim();

    // Remove quotes if present
    const unquotedValue = value.replace(/^["']|["']$/g, '');

    // Only set if not already defined
    if (!process.env[key]) {
      process.env[key] = unquotedValue;
    }
  }
}

// Load environment variables
loadEnvFile();

const databaseUrl = process.env['DATABASE_URL'];
if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL environment variable is required. Check your .env.local or .env file.',
  );
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'node dist/prisma/seed.js',
  },
  datasource: {
    url: databaseUrl,
  },
});
