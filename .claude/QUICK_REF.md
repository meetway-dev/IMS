# ⚡ Quick Reference Card

## Essential Commands

### Development
```bash
npm run app              # Start all 3 (shared + API + frontend)
npm run dev:api          # API only (http://localhost:3000)
npm run dev:frontend     # Frontend only (http://localhost:3000)
npm run dev:shared       # Shared lib watcher
```

### Database
```bash
npm run db:push          # Apply schema changes
npm run db:generate      # Regenerate Prisma client
npm run db:seed          # Seed with test data
npm run db:reset         # ⚠️ DESTRUCTIVE - full reset
```

### Quality
```bash
npm run lint             # ESLint + auto-fix
npm run type-check       # TypeScript type check (frontend)
npm run test             # Jest tests (backend)
npm run build            # Build all 3 workspaces
```

### Docker
```bash
npm run docker:up        # Start containers
npm run docker:down      # Stop containers
```

---

## NestJS API Pattern

```typescript
// 1. Create DTO (validation)
export class CreateUserDto {
  @IsEmail()
  email: string;
}

// 2. Repository (data access)
@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}
  create(data: CreateUserDto) { }
}

// 3. Service (business logic)
@Injectable()
export class UserService {
  constructor(private repo: UserRepository) {}
  create(dto: CreateUserDto) { }
}

// 4. Controller (HTTP)
@Controller('users')
export class UserController {
  constructor(private service: UserService) {}
  @Post()
  create(@Body() dto: CreateUserDto) { }
}

// 5. Module (wire it up)
@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
```

---

## Next.js Component Pattern

```typescript
// Server Component (default)
export default async function UserPage() {
  const user = await fetchUser(); // Server fetch
  return <ClientUserCard user={user} />; // Pass data to Client
}

// Client Component
'use client';
import { useQuery } from '@tanstack/react-query';

export function ClientUserCard({ user }: Props) {
  const [state, setState] = useState(user);
  return <div>{state}</div>;
}
```

---

## Prisma Query Pattern

```typescript
// ✅ Eager load (avoid N+1)
const user = await prisma.user.findUnique({
  where: { id: '123' },
  include: { profile: true, roles: true },
});

// ✅ Select only needed fields
const users = await prisma.user.findMany({
  select: { id: true, name: true },
  take: 10,
  skip: 0,
});

// ✅ Transaction for consistency
await prisma.$transaction(async (tx) => {
  await tx.user.create({ data });
  await tx.log.create({ data: logData });
});
```

---

## React Hook Form Pattern

```typescript
'use client';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

const schema = yup.object({
  email: yup.string().email().required(),
});

export function Form() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(async (data) => {
      await api.create(data);
    })}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
    </form>
  );
}
```

---

## TanStack Query Pattern

```typescript
'use client';
import { useQuery } from '@tanstack/react-query';

function Users() {
  const { data, isPending, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.users.list(),
    staleTime: 1000 * 60 * 5, // 5 min
  });

  if (isPending) return <Loading />;
  if (error) return <Error />;
  return <div>{data.map(u => <UserCard key={u.id} user={u} />)}</div>;
}
```

---

## Testing Pattern

### Backend (Jest)
```typescript
describe('UserService', () => {
  let service: UserService;
  let mockRepo: jest.Mocked<UserRepository>;

  beforeEach(async () => {
    mockRepo = createMock<UserRepository>();
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: mockRepo },
      ],
    }).compile();
    service = module.get(UserService);
  });

  it('should throw if not found', async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(service.getUser('1')).rejects.toThrow();
  });
});
```

### Frontend (React Testing Library)
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('UserForm', () => {
  it('submits when valid', async () => {
    const user = userEvent.setup();
    render(<UserForm onSubmit={mockSubmit} />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(mockSubmit).toHaveBeenCalled();
  });
});
```

---

## File Locations

```
ims/
├── .claude/                      # ← You are here
│   ├── README.md                 # Start here
│   ├── CLAUDE.md                 # Project overview
│   ├── agents.md                 # Agent prompts
│   ├── settings.json             # Cloud config
│   ├── settings.local.json       # Local overrides
│   ├── PERFORMANCE.md            # Optimization
│   ├── WORKFLOW.md               # Development cycle
│   ├── ADRs.md                   # Architecture decisions
│   ├── STYLE_GUIDE.md            # Code patterns
│   └── README.md                 # This file
├── shared/src/                   # Shared types
├── api/src/                      # NestJS backend
│   ├── modules/                  # Feature modules
│   ├── common/                   # Guards, filters
│   └── prisma/                   # Schema + migrations
└── frontend/src/                 # Next.js app
    ├── app/                      # App router
    └── components/               # Reusable UI
```

---

## Git Workflow

```bash
# Start feature
git checkout -b feature/user-roles

# Develop & commit
git add .
git commit -m "feat: add user role management

- Create role CRUD endpoints
- Add role assignment service
- Implement role-based access control"

# Push & create PR
git push origin feature/user-roles

# After merge
git checkout main
git pull origin main
```

---

## Debugging

### API not starting
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
npm run dev:api
```

### Type errors
```bash
npm run type-check
npm run db:generate
npm run build:shared
```

### Database issues
```bash
npm run db:push
npm run db:generate
npm run db:reset  # Last resort
```

### Port conflicts
```bash
lsof -i :3000
kill -9 <PID>
```

---

## Performance Checklist

Before deploy:
- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] `npm run type-check` passes
- [ ] `npm run test` passes (backend)
- [ ] Lighthouse 90+
- [ ] No console errors/warnings
- [ ] Database queries optimized (no N+1)
- [ ] React DevTools shows no unnecessary re-renders

---

## Useful Links

- **NestJS Docs**: https://docs.nestjs.com
- **Prisma Docs**: https://www.prisma.io/docs
- **Next.js Docs**: https://nextjs.org/docs
- **React Docs**: https://react.dev
- **shadcn/ui**: https://ui.shadcn.com
- **TanStack Query**: https://tanstack.com/query
- **Tailwind CSS**: https://tailwindcss.com

---

## AI Agent Tips

### When using `/loop`

```
/loop agent=backend
Build user management API with:
- CRUD endpoints
- Role-based access control
- Unit tests with Jest
```

Start with a clear request, include:
- What you want (feature)
- How it should work (requirements)
- Tests needed
- Performance goals

### Response turnaround

- Simple fixes: < 1 min
- Feature with tests: 2-5 min
- Performance optimization: 5-10 min

If slower, check:
- Build process running (`npm run build:shared`)
- Database needs migration (`npm run db:push`)
- Large file context (clean up node_modules)

---

**Last Updated**: 2026-04-25  
**Tech Stack**: Next.js 16 + NestJS 11 + Prisma 7.7 + PostgreSQL
