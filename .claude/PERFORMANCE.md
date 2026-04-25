# Performance Optimization Guide

## Frontend Performance

### 1. Component Optimization
```typescript
// ✅ Use React.memo for expensive renders
const UserCard = memo(({ user }: Props) => {
  return <div>{user.name}</div>;
}, (prev, next) => prev.user.id === next.user.id);

// ✅ Leverage TanStack Query's caching
const { data: users } = useQuery({
  queryKey: ['users', page],
  queryFn: fetchUsers,
  staleTime: 1000 * 60 * 5, // 5 min
});

// ❌ Avoid inline objects/arrays as deps
const [state, setState] = useState();

// ✅ Use useCallback to memoize handlers
const handleClick = useCallback(() => {
  // handler
}, []);
```

### 2. Bundle Size
- Analyze: `next/bundle-analyzer`
- Remove unused dependencies: `npm list` 
- Lazy load routes: `dynamic(() => import('...'))`
- Tree-shake unused code

### 3. Rendering Optimization
- Use `suppressHydrationWarning` on client-only components
- Prefer Server Components (default in App Router)
- Use `React.lazy()` for route splitting
- Batch updates with Zustand actions

### 4. Lighthouse Targets
- **LCP**: < 2.5s (server render critical CSS)
- **FID**: < 100ms (defer non-critical JS)
- **CLS**: < 0.1 (reserve space for images)

---

## Backend Performance

### 1. Database Optimization
```typescript
// ✅ Eager load relations (avoid N+1)
const users = await prisma.user.findMany({
  include: { profile: true, roles: true }, // Loaded in 1 query
});

// ✅ Use select to fetch only needed fields
const userNames = await prisma.user.findMany({
  select: { id: true, name: true }, // Exclude heavy fields
});

// ✅ Paginate for large datasets
const { skip, take } = getPaginationParams(page, pageSize);
const users = await prisma.user.findMany({ skip, take });

// ❌ Avoid fetching all then filtering
const allUsers = await prisma.user.findMany();
const filtered = allUsers.filter(u => u.active); // Wrong!

// ✅ Filter at query level
const filtered = await prisma.user.findMany({
  where: { active: true },
});
```

### 2. Query Optimization
- Use indexes on frequently queried fields
- Monitor slow queries with Pino logging
- Connection pooling via `@prisma/adapter-pg`
- Enable query optimization in Prisma logs

### 3. Caching Strategy
```typescript
// ✅ Cache with NestJS built-in decorators
@Controller('users')
@UseInterceptors(CacheInterceptor)
export class UserController {
  @Get(':id')
  @CacheTTL(300) // 5 min cache
  getUser(@Param('id') id: string) { }
}
```

### 4. Request/Response
- Compress responses: `compression()` middleware
- Throttle endpoints: `@Throttle(3, 60)` per 60s
- Use HTTP caching headers
- Gzip JSON responses

---

## Shared Library Performance

### 1. Compilation
```bash
# Build once, use everywhere
npm run build:shared

# Tree-shaking friendly exports
export { UserType }; // ✅ Named exports
export default User; // ❌ Avoid default
```

### 2. Keep Lightweight
- No runtime dependencies
- Pure TypeScript/types
- Minimal utilities (only shared)
- Single responsibility per file

---

## Monitoring & Profiling

### 1. Frontend (Chrome DevTools)
- **Performance tab**: Identify slow interactions
- **Lighthouse**: Generate reports
- **React DevTools Profiler**: Measure component renders

### 2. Backend (Node Inspector)
```bash
node --inspect-brk dist/main.js
# Open chrome://inspect
```
- CPU profiling
- Memory heap snapshots
- Async stack traces

### 3. Logging (Pino)
```typescript
// Structured logging for performance
logger.info({
  msg: 'Query executed',
  duration: Date.now() - start,
  query: 'SELECT * FROM users',
});
```

---

## Checklist Before Production

- [ ] Run Lighthouse audit (90+ score)
- [ ] Check bundle size (`npm run build && npm analyze`)
- [ ] Profile backend with Node inspector
- [ ] Test with slow network (Chrome DevTools throttling)
- [ ] Verify database indexes on hot queries
- [ ] Enable caching headers (Cache-Control)
- [ ] Test pagination on large datasets
- [ ] Monitor error rates for 1 hour
- [ ] Check memory leaks (long-running backend)
- [ ] Verify lazy-loaded code splits work
