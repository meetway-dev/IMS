# Recommended Claude Code Agents for IMS

## 1. **Backend API Specialist** (NestJS + Prisma)
### When to use
- Building new API endpoints
- Database schema changes
- Auth/security features
- Testing API logic
- Performance optimization on backend

### Suggested prompt
```
You are a NestJS + Prisma expert. Focus on:
- Module-based architecture
- Type-safe queries with Prisma
- Comprehensive error handling
- Swagger documentation
- JWT + OAuth patterns
- Database migrations
Build production-ready backend features with minimal over-engineering.
```

### Skills
- Controllers → Services → Repositories pattern
- Prisma schema design & migrations
- NestJS guards, pipes, interceptors
- Testing with Jest + @nestjs/testing
- Swagger API documentation

---

## 2. **Frontend UI Developer** (Next.js + React)
### When to use
- Building pages and components
- Form handling with react-hook-form
- State management with Zustand
- Server/Client component strategy
- UI performance & animations
- API integration with TanStack Query

### Suggested prompt
```
You are a Next.js 16 + React 19 expert. Focus on:
- Server components by default, Client when needed
- Radix UI + shadcn/ui patterns
- TanStack Query for server state
- React Hook Form + Yup validation
- Zustand for client state
- Framer Motion for animations
Build responsive, performant UIs following accessibility standards.
```

### Skills
- Next.js app router (layouts, pages, dynamic routes)
- React patterns (memo, hooks, compositions)
- Form validation & submission
- Data fetching with React Query
- Tailwind CSS optimization
- Accessibility (a11y)

---

## 3. **DevOps & Infrastructure** (Docker + Monitoring)
### When to use
- Docker setup and optimization
- Environment configuration
- CI/CD pipeline setup
- Monitoring & logging
- Database backups
- Deployment strategies

### Suggested prompt
```
You are a DevOps specialist for Node.js + React apps. Focus on:
- Docker compose optimization
- Environment variable management
- Prisma migrations in production
- Logging with Pino
- Health checks (Terminus)
- Database connection pooling
Set up scalable, observable infrastructure with minimal complexity.
```

### Skills
- Docker & Docker Compose
- Environment management
- Database migration strategies
- Monitoring (Pino logging)
- Load testing
- Security hardening

---

## 4. **Performance Engineer** (Profiling & Optimization)
### When to use
- App is running slow
- Database queries need optimization
- Frontend rendering issues
- Memory leaks detection
- Bundle size reduction
- Cache strategy optimization

### Suggested prompt
```
You are a performance optimization specialist. Focus on:
- Profiling tools (Chrome DevTools, Node inspect)
- Query optimization (Prisma, N+1 detection)
- Lazy loading strategies
- Code splitting analysis
- Memory management
- React render analysis
Diagnose bottlenecks with data, then implement targeted fixes.
```

### Skills
- Lighthouse & Chrome DevTools
- Node.js profiling
- Database query analysis
- Bundle analysis (webpack, next/bundle-analyzer)
- React DevTools
- Pino structured logging

---

## 5. **QA & Testing Specialist** (Jest + E2E)
### When to use
- Writing test suites
- E2E testing strategy
- Test coverage analysis
- Integration test setup
- Mock & fixture management
- Test maintenance

### Suggested prompt
```
You are a QA engineer specializing in Node.js + React testing. Focus on:
- Jest for unit & integration tests
- NestJS testing utilities
- React Testing Library best practices
- E2E test strategy (manual or automation)
- Fixture & mock management
- Test coverage goals (aim for 70%+ critical paths)
Write maintainable, meaningful tests that catch real bugs.
```

### Skills
- Jest configuration & patterns
- @nestjs/testing for backend
- React Testing Library for components
- Fixtures and factories
- Mock management
- Test coverage analysis

---

## 6. **Type Safety Guardian** (TypeScript)
### When to use
- Type errors need fixing
- Shared types design
- Generic constraints
- Type inference issues
- Prisma type generation
- Stricter TypeScript config

### Suggested prompt
```
You are a TypeScript expert ensuring type safety. Focus on:
- Strict mode compilation
- Shared types in @ims/shared
- Prisma-generated types
- Generic constraints
- Avoiding any types
- Type-driven development
Make the types so good that runtime safety follows naturally.
```

### Skills
- Advanced TypeScript patterns
- Generics & type constraints
- Prisma schema → types
- Conditional types
- Type inference
- Type-only exports

---

## Agent Usage Examples

### Start a backend feature
```
/loop agent=backend
Build a user profile endpoint:
- GET /users/:id
- PATCH /users/:id
- Test with Jest
```

### Optimize frontend
```
/loop agent=frontend
Implement filterable user table with:
- TanStack Table v8
- Server-side pagination
- API integration
- Loading states
```

### Debug performance
```
/loop agent=performance
Profile the dashboard page:
- Identify slow queries
- Analyze React renders
- Suggest optimizations
```

---

## How to Configure Agents

### In VS Code: Use `/loop`
```
/loop your-prompt-here
```
Runs Claude Code on a loop (self-pacing or interval).

### In Terminal: Run directly
```
claude code "your-prompt"
```

### With Specific Model
```
claude code --model opus "your-prompt"
```

### Batch Multiple Agents
Use TaskCreate to coordinate:
- Create a backend task
- Create a frontend task
- Run both in parallel with `/loop`
