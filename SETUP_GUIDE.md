# IMS - Environment & Database Setup Guide

## Architecture & Philosophy

This project uses **environment-specific configurations** for maximum scalability and safety:

- **`.env`** - Default local development (committed, safe)
- **`.env.development`** - Explicit dev environment (committed)
- **`.env.docker`** - Docker Compose environment (committed)
- **`.env.local`** - Personal overrides (NOT committed, in .gitignore)

## Prerequisites

### Required
- **Node.js 20+** - [Download](https://nodejs.org/)
- **npm 9+** - Comes with Node.js
- **PostgreSQL 13+** - Running on `localhost:5432`

### Optional
- Docker & Docker Compose (for containerized setup)

## Quick Start (3 minutes)

### 1. Install PostgreSQL

**Windows:**
```bash
# Download from: https://www.postgresql.org/download/windows/
# During installation, set password to: ims
# Keep default port: 5432
```

**macOS (Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux (Ubuntu):**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Database & User

```bash
# Connect to PostgreSQL
psql -U postgres

# Inside psql prompt:
CREATE USER ims WITH PASSWORD 'ims' CREATEDB;
CREATE DATABASE ims OWNER ims;
\q
```

### 3. Verify Connection

```bash
# Test database connection
psql -U ims -d ims -h localhost
# Type: \q to exit
```

### 4. Setup IMS

**Option A: Automated (Recommended)**
```bash
npm run setup:local
```

**Option B: Manual**
```bash
# 1. Install dependencies
npm install

# 2. Validate environment
npm run validate:env

# 3. Setup database
npm run db:setup

# 4. Start development
npm run dev
```

## Troubleshooting

### ❌ Error: "Authentication failed against database server"

**Root Cause:** PostgreSQL credentials are wrong or database doesn't exist.

**Solution:**
```bash
# 1. Verify PostgreSQL is running
psql -U postgres  # Should connect

# 2. Verify user & database exist
psql -U ims -d ims -h localhost

# 3. If not, create them:
psql -U postgres
CREATE USER ims WITH PASSWORD 'ims' CREATEDB;
CREATE DATABASE ims OWNER ims;
\q

# 4. Verify .env has correct DATABASE_URL:
cat .env | grep DATABASE_URL
# Should be: DATABASE_URL=postgresql://ims:ims@localhost:5432/ims?schema=public&sslmode=disable

# 5. Clear Prisma cache and retry
npm run db:generate
npm run db:setup
```

### ❌ Error: "Can't connect to server on 'localhost' (127.0.0.1):5432"

**Root Cause:** PostgreSQL not running.

**Solution:**
```bash
# Windows - Start PostgreSQL service
# Settings > Services > Find "postgresql-x64-15" > Start

# macOS
brew services start postgresql@15

# Linux
sudo systemctl start postgresql

# Verify it's running
psql -U postgres
```

### ❌ Error: "database "ims" does not exist"

**Solution:**
```bash
# Create the database
createdb -U ims -h localhost ims

# Or via psql
psql -U postgres
CREATE DATABASE ims OWNER ims;
\q
```

### ❌ npm run dev fails with TypeScript errors

**Solution:**
```bash
# Clear all caches and rebuild
npm run clean:all
npm install
npm run build
npm run dev
```

## Environment Variables Explained

### Database Configuration
```env
DATABASE_URL=postgresql://user:pass@host:port/database?schema=public&sslmode=disable
```
- For local dev: `host=localhost`, `sslmode=disable`
- For Docker: `host=db`, standard PostgreSQL service
- For production: `host=your-db-server`, `sslmode=require`

### JWT Secrets
```env
JWT_ACCESS_SECRET=dev-secret-change-in-production
JWT_REFRESH_SECRET=dev-secret-change-in-production
```

**Production:** Generate with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Development Workflow

### Start Development
```bash
npm run dev
```
Starts all three workspaces simultaneously:
- API: http://localhost:8080
- Frontend: http://localhost:3001
- Shared library: Watch mode

### Run Only Specific Workspace
```bash
npm run dev:api        # NestJS backend
npm run dev:frontend   # Next.js frontend
npm run dev:shared     # TypeScript library (watch)
```

### Database Operations
```bash
npm run db:generate    # Generate Prisma client
npm run db:migrate     # Run pending migrations
npm run db:seed        # Populate seed data
npm run db:reset       # ⚠️  Drop & recreate entire database
npm run db:setup       # Generate + Migrate + Seed (full setup)
```

## Using .env.local for Personal Overrides

Create `.env.local` to override variables (this file is NOT committed):

```bash
# .env.local
DATABASE_URL=postgresql://myuser:mypass@localhost:5432/mydb?schema=public
JWT_ACCESS_SECRET=my-personal-secret-123456789
LOG_LEVEL=trace
```

Priority order (highest to lowest):
1. `.env.local` (personal, not committed)
2. `.env.development` (explicit dev settings, committed)
3. `.env` (defaults, committed)

## Docker Setup

If you prefer containerized PostgreSQL:

```bash
# Copy Docker environment
cp .env.docker .env

# Start PostgreSQL in Docker
docker compose up -d postgres

# Setup database
npm run db:setup

# Start all services (API, Frontend, PostgreSQL)
docker compose up
```

## Production Deployment

Before deploying:

1. **Generate secure secrets:**
   ```bash
   node -e "console.log('JWT_ACCESS_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Set environment variables** on your server/cloud platform

3. **Use production DATABASE_URL** with:
   - Real database host
   - `sslmode=require` for secure connection
   - Strong database password

4. **Deploy:** Follow CI/CD pipeline configuration

## Architecture Decisions

### Why Multiple .env Files?

**Problem:** Single `.env` file doesn't scale across environments.
**Solution:** Environment-specific files with priority order.
**Benefit:** Team consistency + personal flexibility

### Why Validation Script?

**Problem:** Missing env vars cause cryptic runtime errors.
**Solution:** Validate before app starts.
**Benefit:** Fast failure, clear error messages

### Why npm Scripts Over Shell?

**Problem:** Shell scripts don't work consistently on Windows.
**Solution:** PowerShell scripts + Node scripts.
**Benefit:** Cross-platform compatibility

## Support

For issues:

1. Check this guide's Troubleshooting section
2. Verify prerequisites are installed
3. Run: `npm run validate:env`
4. Check logs: `cat .next/logs/* 2>/dev/null` (frontend) or `pm2 logs api` (api)
5. Ask in team chat with error message + `npm run validate:env` output
