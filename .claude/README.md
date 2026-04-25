# 📋 Claude Code Setup Summary

## ✅ What I've Created

Your `.claude` folder now contains a complete setup for scalable, clean, and performant coding:

### 1. **CLAUDE.md** - Project Blueprint
- Complete project overview (tech stack, architecture)
- Workspace organization & commands
- Development workflow
- Performance best practices
- When to ask Claude Code

### 2. **agents.md** - Specialized Agent Prompts
Six specialized agents for different tasks:
- **Backend API Specialist**: NestJS + Prisma features
- **Frontend UI Developer**: Next.js + React pages
- **DevOps & Infrastructure**: Docker, deployments
- **Performance Engineer**: Profiling & optimization
- **QA & Testing Specialist**: Jest, E2E tests
- **Type Safety Guardian**: TypeScript expertise

*Use these prompts with `/loop` in Claude Code*

### 3. **settings.json** - Cloud Configuration
- Model: Claude Opus 4.7 (best quality)
- Optimized tokens & temperature
- 20 files max context (scalable)
- Auto-run permissions for dev tools

### 4. **settings.local.json** - Local Overrides
- Bash permissions for npm, git, debugging
- Port/process debugging tools enabled
- Exclude node_modules from context

### 5. **PERFORMANCE.md** - Optimization Guide
- Frontend optimization (React, components, bundle)
- Backend optimization (DB queries, caching)
- Lighthouse targets & metrics
- Profiling tools & techniques
- Pre-production checklist

### 6. **WORKFLOW.md** - Development Cycle
- Pre-work checklist
- Feature development steps (backend → frontend)
- Code review checklist
- Debugging common issues
- Commit workflow
- Weekly maintenance tasks

### 7. **ADRs.md** - Architecture Decisions
10 recorded decisions:
- Monorepo structure
- Next.js Server Components
- NestJS service/repository pattern
- Prisma ORM
- Zustand + TanStack Query state
- JWT + OAuth2 auth
- Tailwind + shadcn/ui styling
- Jest testing strategy
- Pino logging
- Future: tRPC, Bun, SWC

*Reference when making similar decisions*

### 8. **STYLE_GUIDE.md** - Code Standards
Backend patterns:
- Module structure (NestJS)
- Service & Repository pattern
- DTO validation
- Error handling
- Database queries (Prisma)
- Testing setup

Frontend patterns:
- Server vs Client components
- Form handling (react-hook-form)
- Data fetching (TanStack Query)
- State (Zustand)
- shadcn/ui components
- Tables (TanStack Table)

Shared library, naming conventions, comments, testing

---

## 🚀 How to Use

### Start a Development Session
```bash
# Open Claude Code in this folder
claude code .

# Or use loop for recurring work
/loop agent=backend
Build user authentication API...
```

### Use Specialized Agents
Copy prompts from `agents.md`:

**Backend work:**
```
/loop your-prompt

You are a NestJS + Prisma expert. Focus on:
- Module-based architecture
- Type-safe queries with Prisma
- Comprehensive error handling
- Swagger documentation
```

**Frontend work:**
```
/loop your-prompt

You are a Next.js 16 + React 19 expert. Focus on:
- Server components by default
- TanStack Query for server state
- Zustand for client state
- shadcn/ui patterns
```

### Check Performance
Reference `PERFORMANCE.md` for:
- Browser DevTools workflow
- Node profiling commands
- Query optimization patterns
- Caching strategies

### Review Code Standards
Check `STYLE_GUIDE.md` for:
- Module structure
- Service/Repository pattern
- Component patterns
- Form handling
- Pre-commit checklist

### Follow Workflow
Use `WORKFLOW.md` for:
- Feature development cycle
- Debugging checklist
- Commit message format
- Database operation commands
- Performance checkpoints

---

## 📊 Project Tech Stack Summary

```
Frontend
├── Next.js 16.2
├── React 19
├── TypeScript 6.0
├── Radix UI + shadcn/ui
├── TanStack Query 5.62 (server state)
├── TanStack Table 8.20 (tables)
├── Zustand 5.0 (client state)
├── React Hook Form 7.54
└── Tailwind CSS 3.4

Backend
├── NestJS 11.0
├── Prisma 7.7 (ORM)
├── PostgreSQL
├── Passport (JWT + OAuth2 Google)
├── Jest 30.0 (testing)
├── Swagger/OpenAPI
├── Pino (logging)
└── Helmet (security)

Shared
├── TypeScript 5.9
└── No runtime dependencies (tree-shakeable)

DevTools
├── ESLint 9+
├── Prettier 3.4
├── Docker Compose
└── npm workspaces
```

---

## 🎯 Key Performance Metrics

### Frontend Targets
- Lighthouse: 90+
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

### Backend Targets
- API response: < 200ms (p95)
- Database query: < 50ms (p95)
- Memory: < 256MB steady state
- Error rate: < 0.1%

---

## 📝 Next Steps

1. **Review** `CLAUDE.md` to understand the architecture
2. **Reference** `agents.md` when starting new tasks
3. **Check** `WORKFLOW.md` for development cycle
4. **Follow** `STYLE_GUIDE.md` for code patterns
5. **Optimize** using `PERFORMANCE.md` checklists
6. **Review decisions** in `ADRs.md` before major changes

---

## 💡 Pro Tips

- **Type safety first**: Never use `any`, leverage Prisma types
- **Server components by default**: Use Client components sparingly
- **Eager load relations**: Avoid N+1 queries with Prisma `include`
- **Cache strategically**: Use TanStack Query defaults (5min stale)
- **Commit often**: Small, focused commits with clear messages
- **Profile before optimizing**: Use DevTools, not assumptions
- **Test business logic**: Jest for services, React Testing Library for components

---

## ⚠️ Common Pitfalls

❌ **Don't:**
- Use `any` types
- Fetch in loops (N+1)
- Add comments that describe what code does
- Over-engineer for hypothetical features
- Mix Server + Client component logic
- Ignore TypeScript errors
- Commit without running tests

✅ **Do:**
- Use strict TypeScript mode
- Eager load database relations
- Comment only the WHY
- KISS (Keep It Simple, Stupid)
- Use Server Components as default
- Fix type errors immediately
- Test before committing

---

## 📚 Files Quick Reference

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Start here - project overview & commands |
| `agents.md` | Specialized prompts for different roles |
| `settings.json` | Cloud model & token settings |
| `settings.local.json` | Local development settings |
| `PERFORMANCE.md` | Optimization strategies & metrics |
| `WORKFLOW.md` | Feature development cycle |
| `ADRs.md` | Architecture decision history |
| `STYLE_GUIDE.md` | Code patterns & standards |

---

## 🤝 Support

For questions or issues:
- Check `CLAUDE.md` for project overview
- Search `STYLE_GUIDE.md` for code patterns
- Review `WORKFLOW.md` for development process
- Reference `ADRs.md` for architectural context
- Use `/help` for Claude Code features

Last updated: 2026-04-25
