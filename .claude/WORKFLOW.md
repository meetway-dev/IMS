# Development Workflow Checklist

## Before Starting Work

- [ ] Pull latest: `git pull origin main`
- [ ] Install deps: `npm run setup` (first time) or `npm install` in workspaces
- [ ] Run dev servers: `npm run app`
- [ ] Check DB is fresh: `npm run db:reset` if needed
- [ ] Verify no type errors: `cd frontend && npm run type-check`

---

## Feature Development Cycle

### 1. Plan & Design
- [ ] Sketch UI mockup (if frontend)
- [ ] Design DB schema (if backend)
- [ ] Define API contract (endpoints, request/response)
- [ ] Identify reusable types for shared library
- [ ] List acceptance criteria

### 2. Backend Development (if applicable)
```bash
cd api
# Update schema
nano prisma/schema.prisma

# Generate migration
npm run db:generate

# Test migration
npm run db:push

# Write feature
# - Module (controller, service, repository)
# - Dto (request/response validation)
# - Service (business logic)
# - Tests (unit + integration)

npm run lint
npm run test
```

### 3. Shared Types (if applicable)
```bash
cd shared
# Add types
nano src/index.ts

npm run build
# Auto-synced to other workspaces (file: path)
```

### 4. Frontend Development (if applicable)
```bash
cd frontend
# Create page or component
mkdir -p src/app/feature-name

# Use template from existing similar feature
# - Leverage existing patterns (hooks, forms, tables)
# - Use TanStack Query for data fetching
# - Use Zustand for client state if needed

npm run lint
npm run type-check
npm run dev
# Test in browser
```

### 5. Integration Testing
```bash
# Start both servers in parallel
npm run app

# In another terminal:
cd api
npm run test:e2e
```

### 6. Code Review Checklist
- [ ] No `console.log` in production code
- [ ] No `any` types used
- [ ] Comments only explain WHY, not WHAT
- [ ] Tests pass: `npm run test`
- [ ] Linting passes: `npm run lint`
- [ ] No dead code
- [ ] Database migrations tested
- [ ] API documented in Swagger (if backend)
- [ ] Mobile responsive (if frontend)
- [ ] Performance acceptable (Lighthouse 90+)

---

## Debugging Common Issues

### Frontend Issues

**Page won't load**
```bash
# Check server running
npm run dev:frontend

# Clear cache
rm -rf .next
npm run dev:frontend

# Check types
npm run type-check

# Check browser console for errors
```

**Form not submitting**
```typescript
// Check react-hook-form setup
// - useForm() initialized correctly
// - Field registered or Controller wrapped
// - onSubmit handler defined
// - Yup/validation schema correct
```

**API calls 404/CORS error**
```bash
# Ensure API server running
npm run dev:api

# Check API base URL in env
# Check endpoint exists in backend
# Check CORS enabled in main.ts
```

### Backend Issues

**Database connection error**
```bash
# Check .env DATABASE_URL
# Verify Postgres running
# Run migration: npm run db:push
# Regenerate Prisma client: npm run db:generate
```

**Type errors in IDE**
```bash
npm run db:generate
npm run build:shared
npm run type-check
```

**Port already in use (3000 for API)**
```bash
# Find and kill process
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

## Commit & Push Workflow

### Before Committing
```bash
# Ensure no uncommitted changes in other files
git status

# Lint & format
npm run lint

# Type check
npm run type-check

# Run tests
npm run test

# Verify build
npm run build
```

### Commit Message Format
```
<type>: <subject>

<optional body explaining why>

<optional issue/PR reference>
```

Types: `feat` | `fix` | `refactor` | `perf` | `test` | `docs` | `chore`

Examples:
```
feat: add user role management API

fix: prevent N+1 query in user list endpoint

perf: optimize dashboard table rendering with React.memo

docs: update API authentication section
```

### Push & PR
```bash
git push origin feature-branch
# Create PR on GitHub
# - Title: same as commit subject
# - Description: what changed and why
# - Screenshots: if UI change
```

---

## Local vs Production Differences

| Aspect | Local | Production |
|--------|-------|------------|
| **Database** | Docker postgres | Managed cloud DB |
| **Env vars** | .env (git-ignored) | Secrets manager |
| **API URL** | http://localhost:3000 | https://api.domain.com |
| **Logging** | Console (pino-pretty) | Structured JSON (pino) |
| **Node env** | development | production |
| **Caching** | Disabled | Enabled |
| **Error handling** | Verbose errors | Safe generic errors |

---

## Performance Checkpoints

**During Development**
- [ ] No console warnings on page load
- [ ] Page interactive < 3 seconds
- [ ] No layout shifts (CLS)
- [ ] Database queries logged & analyzed

**Before PR**
- [ ] Lighthouse 90+
- [ ] No N+1 queries in logs
- [ ] React DevTools shows no unnecessary re-renders
- [ ] Bundle size increased < 50KB

**Before Deploy**
- [ ] All tests passing
- [ ] Performance budget met
- [ ] Monitoring dashboards set up
- [ ] Rollback plan documented

---

## Reference Commands

```bash
# Dev
npm run app                    # All servers
npm run dev:api               # API only
npm run dev:frontend          # Frontend only

# Build
npm run build                 # All workspaces
npm run build:shared          # Shared lib only

# Database
npm run db:push              # Apply schema changes
npm run db:migrate           # Run migrations
npm run db:seed              # Populate seed data
npm run db:reset             # ⚠️  Drop & recreate (dev only)

# Testing
npm run test                 # Jest tests
npm run test:cov            # Coverage report
npm run test:e2e            # End-to-end tests

# Quality
npm run lint                # ESLint + fix
npm run type-check         # TypeScript check

# Docker
npm run docker:up          # Start containers
npm run docker:down        # Stop containers
npm run docker:build       # Rebuild images
```

---

## Weekly Maintenance

- [ ] Run `npm outdated` to check for updates
- [ ] Review logs for errors
- [ ] Check database disk usage
- [ ] Backup production database
- [ ] Review Lighthouse scores
- [ ] Clean up old branches: `git branch -D old-branch`
- [ ] Update security patches
