# IMS (Inventory Management System) - Claude Code Guide

## Project Overview
Monorepo with 3 workspaces: shared types library, NestJS backend, Next.js frontend.

### Tech Stack
- **Frontend**: Next.js 16.2, React 19, TypeScript, Radix UI, TanStack Query/Table, Zustand, Tailwind CSS
- **Backend**: NestJS 11, Prisma 7.7, PostgreSQL, JWT/OAuth Google, Passport, Swagger
- **Shared**: TypeScript types & utilities
- **DB**: PostgreSQL with Prisma ORM & migrations
- **DevTools**: ESLint, Prettier, Jest, NestJS CLI

### Architecture
- **Monorepo**: Root orchestrates all 3 packages
- **API**: REST + Swagger docs, JWT + OAuth2, DB seeding
- **Frontend**: App router, server components, shadcn/ui patterns
- **Shared**: Compiled TS library for type safety across monorepo

## Workspace Commands
```bash
npm run app              # Dev all 3 (shared watch + API + frontend)
npm run build           # Build all workspaces
npm run db:*           # DB operations (push/migrate/seed/reset)
npm run dev:*          # Dev each workspace
npm run docker:*       # Container ops
```

## Development Workflow

### Setup New Features
1. **Update shared types** if needed: `npm run dev:shared`
2. **API feature**: NestJS module + Prisma schema update → `npm run db:push`
3. **Frontend**: Next.js page/component + API integration
4. **Parallel dev**: `npm run app` runs all watchers

### Code Quality
- **Linting**: `cd api && npm run lint`, `cd frontend && npm run lint`
- **Type checking**: `cd frontend && npm run type-check`
- **Tests**: `cd api && npm run test` (Jest + NestJS testing)
- **E2E**: `cd api && npm run test:e2e`

## Performance Best Practices

### Frontend
- Use React.memo for expensive components
- Leverage TanStack Query for server state (stale-while-revalidate)
- Zustand for client state (minimal, composable)
- Server components by default, Client components for interactivity
- Lazy load routes with Next.js dynamic imports
- CSS: Tailwind classes, animate only necessary properties

### Backend
- Prisma caching via adapter-pg
- Throttling + Helmet for security
- Pino logging (structured, performant)
- JWT short-lived tokens + refresh pattern
- Query optimization: eager load relations, pagination
- Health checks via Terminus

### Shared
- Tree-shakeable exports
- No runtime dependencies
- Compile via TypeScript only

## Guidelines

### What to Do
- ✅ Keep responses under 150 lines unless asked
- ✅ Direct code, minimal comments (only WHY, not WHAT)
- ✅ Use patterns already in codebase
- ✅ Prioritize clean architecture: controllers → services → repositories
- ✅ Type everything (no `any`)
- ✅ Test critical business logic (auth, payments, DB)

### What NOT to Do
- ❌ Don't over-engineer for hypotheticals
- ❌ Don't add comments that describe what the code does
- ❌ Don't mix concerns (controllers handle HTTP, services handle business)
- ❌ Don't ignore TypeScript errors
- ❌ Don't leave console.logs in production code

## File Structure
```
ims/
├── shared/          # @ims/shared types & utils
│   └── src/
├── api/             # NestJS backend
│   ├── src/
│   │   ├── auth/    # JWT + OAuth
│   │   ├── modules/ # Feature modules
│   │   └── common/  # Guards, interceptors, filters
│   └── prisma/      # Schema + migrations
├── frontend/        # Next.js app
│   ├── src/app/
│   │   ├── dashboard/
│   │   └── components/
│   └── public/
└── .claude/         # This guide + configs
```

## Debugging Tips
- **API not starting**: Check port 3000 isn't in use: `netstat -ano | find ":3000"`
- **DB connection**: Verify `.env` DATABASE_URL, run `npm run db:generate`
- **Type errors**: Run `npm run type-check` in frontend, check Prisma types
- **Hot reload failing**: Clear `.next` or `dist` folders
- **OAuth issues**: Check Google OAuth credentials in `.env`

## When to Ask Claude Code
- ❓ Quick fixes & refactors
- ❓ New features + tests
- ❓ Performance bottlenecks
- ❓ Type safety improvements
- ❌ Production deployment decisions
- ❌ Architecture overhauls without planning
