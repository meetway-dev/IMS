# Architecture Decision Records (ADRs)

## ADR-1: Monorepo Structure with Workspaces

**Status**: Accepted  
**Date**: 2024

### Decision
Use npm workspaces to organize shared types, backend, and frontend in one repository.

### Rationale
- Single source of truth for shared types
- Easier refactoring across boundaries
- Coordinated versioning
- Simplified CI/CD

### Consequences
- ✅ Type safety across monorepo
- ✅ Faster local development
- ⚠️ Larger `node_modules` disk usage (mitigated by workspace deduping)
- ⚠️ Deployment requires coordinated builds

---

## ADR-2: Frontend: Next.js + Server Components

**Status**: Accepted

### Decision
Use Next.js 16+ App Router with Server Components by default, Client Components only where needed.

### Rationale
- Reduced JavaScript sent to browser
- Better SEO (server-side rendering)
- Simplified state management
- Built-in optimizations (image, font, script)

### Consequences
- ✅ Faster page loads (LCP)
- ✅ Smaller bundles
- ⚠️ Limited hooks (can't use Zustand in server components)
- ⚠️ Learning curve for SSR patterns

---

## ADR-3: Backend: NestJS with Service/Repository Pattern

**Status**: Accepted

### Decision
Organize NestJS modules with clear separation: Controllers (HTTP) → Services (Business) → Repositories (Data).

### Rationale
- Testable business logic
- Easy to mock dependencies
- Clear responsibilities
- Scalable module structure

### Consequences
- ✅ Type-safe dependency injection
- ✅ Easy to test in isolation
- ⚠️ More boilerplate than simple Express
- ⚠️ Learning curve for NestJS concepts

---

## ADR-4: Database: Prisma ORM

**Status**: Accepted

### Decision
Use Prisma 7.x for type-safe database access and migrations.

### Rationale
- Type-safe queries (no string SQL)
- Auto-generated migrations
- Developer experience (schema.prisma is clear)
- Built-in PostgreSQL adapter for connection pooling

### Consequences
- ✅ Catches bugs at compile-time
- ✅ Easy migrations
- ⚠️ Vendor lock-in to Prisma
- ⚠️ Complex queries can be verbose

---

## ADR-5: State Management: Zustand (Frontend) + React Context (Shared)

**Status**: Accepted

### Decision
Use Zustand for client state (forms, filters), React Context for auth state, TanStack Query for server state.

### Rationale
- Zustand: minimal, composable, great DevX
- React Query: solves caching, invalidation, sync
- No Redux boilerplate

### Consequences
- ✅ Less boilerplate
- ✅ Easier refactoring
- ⚠️ Requires discipline to keep Zustand stores small
- ⚠️ TanStack Query has learning curve

---

## ADR-6: Authentication: JWT + OAuth2 (Google)

**Status**: Accepted

### Decision
Implement dual auth: JWT tokens for API (issued on login), OAuth2 Google for third-party logins.

### Rationale
- JWT: stateless, scales horizontally
- OAuth2: offload auth complexity
- Passport.js: battle-tested middleware

### Consequences
- ✅ Stateless backend
- ✅ Secure token expiration
- ⚠️ Refresh token rotation required
- ⚠️ Logout is async (token revocation)

---

## ADR-7: Styling: Tailwind CSS + shadcn/ui

**Status**: Accepted

### Decision
Use Tailwind for utility classes, shadcn/ui for pre-built accessible components.

### Rationale
- Fast UI development
- Consistent design system
- Small bundle size (tree-shakeable)
- Accessibility built-in

### Consequences
- ✅ Rapid prototyping
- ✅ Consistent look & feel
- ⚠️ CSS is in JSX (not separated)
- ⚠️ Limited dark mode customization

---

## ADR-8: Testing Strategy: Jest + NestJS Testing + React Testing Library

**Status**: Accepted

### Decision
Unit tests for business logic (60%+), integration tests for critical flows (30%), E2E manual/smoke tests (10%).

### Rationale
- Jest: fast, built into CRA & NestJS
- NestJS utilities: easy mocking
- React Testing Library: tests user behavior, not implementation

### Consequences
- ✅ Faster feedback loop
- ✅ Fewer brittle tests
- ⚠️ Lower coverage than E2E
- ⚠️ Manual E2E still required for user flows

---

## ADR-9: Logging: Pino Structured Logging

**Status**: Accepted

### Decision
Use Pino for structured logging (JSON format in prod, pretty-printed in dev).

### Rationale
- Low overhead
- Structured logs (easy to parse/search)
- Integration with NestJS built-in
- Performant async logging

### Consequences
- ✅ Production-ready logging
- ✅ Easy to forward to log aggregators
- ⚠️ Requires parsing JSON logs locally
- ⚠️ Pino-pretty not available in prod

---

## ADR-10: Deployment: Docker + Container Orchestration (TBD)

**Status**: In Progress

### Decision
Containerize both backend and frontend, deploy to Kubernetes (or similar).

### Rationale
- Reproducible environments
- Easier scaling
- Cloud-native deployment

### Consequences
- ✅ Consistent prod/local
- ⚠️ Additional complexity
- ⚠️ Requires ops knowledge

---

## When to Challenge These Decisions

- **Performance**: If Lighthouse < 80 or API response > 500ms, revisit
- **Developer Experience**: If onboarding takes > 1 hour, revisit
- **Type Safety**: If runtime errors in prod, revisit
- **Maintenance**: If critical bugs take > 4 hours to debug, revisit

---

## Future Considerations

- [ ] Evaluate tRPC for type-safe APIs (vs REST + OpenAPI)
- [ ] Consider Tanstack Start for isomorphic full-stack
- [ ] Evaluate SWC for faster transpilation
- [ ] Consider Bun as Node.js alternative (when stable)
