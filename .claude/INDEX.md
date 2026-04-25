# 📚 Claude Code Documentation Index

> Complete setup for scalable, clean, and performant IMS development

## 🎯 Start Here

**New to this project?** Start with [`README.md`](README.md) for the complete overview.

**In a hurry?** Use [`QUICK_REF.md`](QUICK_REF.md) for commands, patterns, and debugging.

---

## 📖 Documentation Files

### Core Documentation

1. **[README.md](README.md)** - 📍 START HERE
   - What was created for you
   - How to use the setup
   - Quick reference table
   - Pro tips & common pitfalls

2. **[CLAUDE.md](CLAUDE.md)** - Project Blueprint
   - Complete project overview
   - Tech stack details
   - Workspace organization
   - Commands & workflows
   - Performance best practices
   - When to use Claude Code

3. **[QUICK_REF.md](QUICK_REF.md)** - Cheat Sheet
   - Essential npm commands
   - Code patterns (NestJS, Next.js, Prisma)
   - File locations
   - Git workflow
   - Debugging tips
   - Performance checklist

### Development Guides

4. **[WORKFLOW.md](WORKFLOW.md)** - Development Cycle
   - Pre-work checklist
   - Feature development steps
   - Backend → Shared → Frontend flow
   - Code review checklist
   - Debugging common issues
   - Commit workflow
   - Weekly maintenance

5. **[STYLE_GUIDE.md](STYLE_GUIDE.md)** - Code Standards
   - Backend patterns (NestJS, Prisma, services)
   - Frontend patterns (React, Next.js, forms)
   - Shared library structure
   - Naming conventions
   - Comment guidelines
   - Testing patterns
   - Pre-commit checklist

6. **[PERFORMANCE.md](PERFORMANCE.md)** - Optimization
   - Frontend optimization (components, bundle, rendering)
   - Backend optimization (queries, caching, requests)
   - Monitoring & profiling
   - Lighthouse targets
   - Production checklist

### Architecture & Decisions

7. **[ADRs.md](ADRs.md)** - Architecture Decisions
   - 10 recorded decisions
   - Monorepo structure
   - Frontend: Server Components
   - Backend: NestJS architecture
   - Database: Prisma ORM
   - State: Zustand + TanStack Query
   - Auth: JWT + OAuth2
   - UI: Tailwind + shadcn/ui
   - Testing: Jest strategy
   - Logging: Pino
   - Future: tRPC, Bun, SWC

### Agent Setup

8. **[agents.md](agents.md)** - Specialized Agents
   - 6 specialized agent prompts
   - Backend API Specialist
   - Frontend UI Developer
   - DevOps & Infrastructure
   - Performance Engineer
   - QA & Testing Specialist
   - Type Safety Guardian
   - Usage examples & agent coordination

### Configuration

9. **[settings.json](settings.json)** - Cloud Configuration
   - Model: Claude Opus 4.7
   - Token limits: 4000
   - Context settings
   - Permission allowlist

10. **[settings.local.json](settings.local.json)** - Local Overrides
    - Extended bash permissions
    - Local development settings
    - Debugging tools enabled

---

## 🚀 Quick Start

### First Time Setup
```bash
# 1. Read the overview
cat .claude/README.md

# 2. Check quick reference
cat .claude/QUICK_REF.md

# 3. Start development
npm run app
```

### Using Agents
```bash
# Read agent descriptions
cat .claude/agents.md

# Start backend work with agent
/loop agent=backend
[your-prompt-here]

# Start frontend work
/loop agent=frontend
[your-prompt-here]
```

### Reference During Development
- **Code question?** → `STYLE_GUIDE.md`
- **Command forgotten?** → `QUICK_REF.md`
- **Debugging issue?** → `WORKFLOW.md`
- **Performance concern?** → `PERFORMANCE.md`
- **Architecture decision?** → `ADRs.md`

---

## 📊 Stack Overview

```
Frontend:     Next.js 16 + React 19 + shadcn/ui + Zustand
Backend:      NestJS 11 + Prisma 7.7 + PostgreSQL
Shared:       TypeScript types (tree-shakeable)
DevTools:     ESLint, Prettier, Jest, Docker
```

**Full details** → [`CLAUDE.md`](CLAUDE.md)

---

## 🎯 Common Tasks

### Build a New API Endpoint
1. Read: [`agents.md`](agents.md) → Backend API Specialist
2. Follow: [`WORKFLOW.md`](WORKFLOW.md) → Backend Development
3. Reference: [`STYLE_GUIDE.md`](STYLE_GUIDE.md) → NestJS patterns
4. Check: [`QUICK_REF.md`](QUICK_REF.md) → Prisma examples

### Build a Frontend Page
1. Read: [`agents.md`](agents.md) → Frontend UI Developer
2. Follow: [`WORKFLOW.md`](WORKFLOW.md) → Frontend Development
3. Reference: [`STYLE_GUIDE.md`](STYLE_GUIDE.md) → React patterns
4. Check: [`QUICK_REF.md`](QUICK_REF.md) → Next.js examples

### Optimize Performance
1. Read: [`PERFORMANCE.md`](PERFORMANCE.md)
2. Use: [`agents.md`](agents.md) → Performance Engineer
3. Reference: [`QUICK_REF.md`](QUICK_REF.md) → Checklist

### Write Tests
1. Read: [`STYLE_GUIDE.md`](STYLE_GUIDE.md) → Testing section
2. Use: [`agents.md`](agents.md) → QA & Testing Specialist
3. Reference: [`QUICK_REF.md`](QUICK_REF.md) → Testing patterns

---

## 💻 File Structure

```
.claude/
├── README.md              ← Overview & quick links
├── CLAUDE.md              ← Project blueprint
├── QUICK_REF.md           ← Cheat sheet
├── WORKFLOW.md            ← Development cycle
├── STYLE_GUIDE.md         ← Code standards
├── PERFORMANCE.md         ← Optimization guide
├── ADRs.md                ← Architecture decisions
├── agents.md              ← Specialized agent prompts
├── settings.json          ← Cloud config (Opus 4.7)
├── settings.local.json    ← Local overrides
└── INDEX.md               ← This file
```

**Project structure** → [`CLAUDE.md`](CLAUDE.md#file-structure)

---

## 🤖 Using Claude Code Agents

### Start Loop with Agent
```bash
/loop agent=backend
Build user authentication...
```

### Available Agents
- `agent=backend` - NestJS + Prisma expert
- `agent=frontend` - Next.js + React expert
- `agent=devops` - Docker + infrastructure
- `agent=performance` - Profiling & optimization
- `agent=qa` - Testing specialist
- `agent=types` - TypeScript expert

**Full agent details** → [`agents.md`](agents.md)

---

## ⚡ Essential Commands

```bash
npm run app              # Start all (shared + API + frontend)
npm run lint             # ESLint + fix
npm run type-check       # TypeScript check
npm run test             # Jest tests
npm run db:push          # Apply DB changes
npm run build            # Build all workspaces
```

**Full command list** → [`QUICK_REF.md`](QUICK_REF.md#essential-commands)

---

## 📈 Performance Metrics

### Frontend Targets
- Lighthouse: **90+**
- LCP: **< 2.5s**
- FID: **< 100ms**
- CLS: **< 0.1**

### Backend Targets
- API response: **< 200ms** (p95)
- Database query: **< 50ms** (p95)
- Memory: **< 256MB** steady state
- Error rate: **< 0.1%**

**Optimization guide** → [`PERFORMANCE.md`](PERFORMANCE.md)

---

## ✅ Before Deploy

- [ ] All tests passing: `npm run test`
- [ ] Linting clean: `npm run lint`
- [ ] Types correct: `npm run type-check`
- [ ] Build succeeds: `npm run build`
- [ ] Lighthouse 90+
- [ ] No console errors/warnings
- [ ] Database indexes optimized
- [ ] Cache headers configured
- [ ] Monitoring dashboards ready

**Full checklist** → [`WORKFLOW.md`](WORKFLOW.md#performance-checkpoints)

---

## 🔍 Debugging

### Issue: API won't start
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
npm run dev:api
```

### Issue: Type errors
```bash
npm run db:generate
npm run build:shared
npm run type-check
```

### Issue: Database error
```bash
npm run db:push
npm run db:generate
```

**Full debugging guide** → [`WORKFLOW.md`](WORKFLOW.md#debugging-common-issues)

---

## 📚 Additional Resources

- **NestJS**: https://docs.nestjs.com
- **Prisma**: https://www.prisma.io/docs
- **Next.js**: https://nextjs.org/docs
- **React**: https://react.dev
- **shadcn/ui**: https://ui.shadcn.com

**More links** → [`QUICK_REF.md`](QUICK_REF.md#useful-links)

---

## 💡 Pro Tips

✅ **Do:**
- Type everything (never use `any`)
- Eager load database relations
- Use Server Components by default
- Test business logic thoroughly
- Follow existing code patterns

❌ **Don't:**
- Add `any` types
- Fetch in loops (N+1 queries)
- Mix Server + Client logic
- Over-engineer for hypotheticals
- Commit without testing

**Full tips** → [`README.md`](README.md#-pro-tips)

---

## 🎓 Learning Path

1. **Day 1**: Read `README.md` + `CLAUDE.md`
2. **Day 2**: Read `WORKFLOW.md` + `STYLE_GUIDE.md`
3. **Day 3**: Reference `agents.md` + pick an agent
4. **Day 4+**: Use `QUICK_REF.md` + `PERFORMANCE.md` as needed

---

## 🤝 Support

**Questions about:**
- **Project overview?** → [`CLAUDE.md`](CLAUDE.md)
- **Code patterns?** → [`STYLE_GUIDE.md`](STYLE_GUIDE.md)
- **Development cycle?** → [`WORKFLOW.md`](WORKFLOW.md)
- **Architecture?** → [`ADRs.md`](ADRs.md)
- **Quick answer?** → [`QUICK_REF.md`](QUICK_REF.md)

---

**Last Updated**: 2026-04-25  
**Version**: 1.0  
**Status**: ✅ Ready for production

---

### 📍 Quick Navigation

| Need | File |
|------|------|
| Overview | [`README.md`](README.md) |
| Cheat sheet | [`QUICK_REF.md`](QUICK_REF.md) |
| Project details | [`CLAUDE.md`](CLAUDE.md) |
| Development flow | [`WORKFLOW.md`](WORKFLOW.md) |
| Code patterns | [`STYLE_GUIDE.md`](STYLE_GUIDE.md) |
| Performance | [`PERFORMANCE.md`](PERFORMANCE.md) |
| Architecture | [`ADRs.md`](ADRs.md) |
| Agents | [`agents.md`](agents.md) |
