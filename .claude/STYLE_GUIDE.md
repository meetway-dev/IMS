# Code Style & Best Practices

## Backend (NestJS + Prisma)

### Module Structure
```typescript
// user.module.ts - Single responsibility
@Module({
  imports: [/* other modules */],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
```

### Service & Repository Pattern
```typescript
// user.repository.ts - Data access only
@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(data: CreateUserDto) {
    return this.prisma.user.create({ data });
  }
}

// user.service.ts - Business logic
@Injectable()
export class UserService {
  constructor(private repo: UserRepository) {}

  async getUser(id: string) {
    const user = await this.repo.findById(id);
    if (!user) throw new NotFoundException();
    return user;
  }
}

// user.controller.ts - HTTP handler
@Controller('users')
export class UserController {
  constructor(private service: UserService) {}

  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.service.getUser(id);
  }
}
```

### DTO Validation
```typescript
// create-user.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  name: string;
}

// Controller automatically validates
@Post()
create(@Body() dto: CreateUserDto) {
  // dto is guaranteed valid
  return this.service.create(dto);
}
```

### Error Handling
```typescript
// ✅ Use NestJS exceptions
throw new BadRequestException('Invalid input');
throw new NotFoundException('User not found');
throw new UnauthorizedException('Invalid credentials');

// Custom exceptions
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Handle and log
  }
}
```

### Database Queries
```typescript
// ✅ Eager load relations
const user = await prisma.user.findUnique({
  where: { id },
  include: { profile: true, roles: true },
});

// ✅ Use select for performance
const users = await prisma.user.findMany({
  select: { id: true, name: true, email: true },
  take: 10,
  skip: 0,
});

// ❌ Avoid N+1
// Don't do: const users = await prisma.user.findMany();
//           for (const user of users) user.profile = await prisma.profile.findUnique(...);

// ✅ Transactions for consistency
await prisma.$transaction(async (tx) => {
  await tx.user.create({ data: userData });
  await tx.auditLog.create({ data: logData });
});
```

### Testing
```typescript
// user.service.spec.ts
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

  it('should throw if user not found', async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(service.getUser('1')).rejects.toThrow(NotFoundException);
  });
});
```

---

## Frontend (Next.js + React)

### Server vs Client Components
```typescript
// ✅ Server Component (default)
// app/dashboard/page.tsx
export default async function Dashboard() {
  const data = await fetchData(); // Server-side fetch OK
  return <ClientDashboard data={data} />;
}

// ❌ Client Component (marked explicitly)
'use client'; // MUST be at top
import { useQuery } from '@tanstack/react-query';

export function ClientDashboard({ data }: Props) {
  const [state, setState] = useState(data);
  return <div>{state}</div>;
}
```

### Form Handling
```typescript
'use client';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object({
  email: yup.string().email().required(),
  name: yup.string().min(2).required(),
});

export function UserForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(async (data) => {
      await createUser(data);
    })}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Data Fetching
```typescript
'use client';
import { useQuery } from '@tanstack/react-query';

function UserList() {
  // ✅ Automatic caching, retry, stale-while-revalidate
  const { data: users, isPending, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.users.list(),
    staleTime: 1000 * 60 * 5, // 5 min
  });

  if (isPending) return <Loading />;
  if (error) return <Error error={error} />;
  return <div>{users.map(u => <UserCard key={u.id} user={u} />)}</div>;
}
```

### State Management
```typescript
// ✅ Zustand for client state
import { create } from 'zustand';

const useFilterStore = create((set) => ({
  filters: { status: 'active' },
  setFilters: (f) => set({ filters: f }),
}));

function Filters() {
  const { filters, setFilters } = useFilterStore();
  return (
    <select onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
      <option value="active">Active</option>
    </select>
  );
}
```

### Component Pattern (shadcn/ui)
```typescript
// ✅ Use existing components
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

export function UserDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open</Button>
      </DialogTrigger>
      <DialogContent>
        {/* Content */}
      </DialogContent>
    </Dialog>
  );
}
```

### Tables (TanStack Table v8)
```typescript
'use client';
import { useReactTable, getCoreRowModel } from '@tanstack/react-table';

export function UsersTable({ data }: Props) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <table>
      <thead>
        {table.getHeaderGroups().map(hg => (
          <tr key={hg.id}>
            {hg.headers.map(h => (
              <th key={h.id}>{h.column.columnDef.header}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map(row => (
          <tr key={row.id}>
            {row.getVisibleCells().map(cell => (
              <td key={cell.id}>{cell.renderCell()}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### Testing
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('UserForm', () => {
  it('submits when valid', async () => {
    const user = userEvent.setup();
    render(<UserForm onSubmit={mockSubmit} />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/name/i), 'John');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(mockSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'test@example.com' })
    );
  });
});
```

---

## Shared Library

### Export Structure
```typescript
// shared/src/types/user.ts
export interface User {
  id: string;
  email: string;
  name: string;
}

export type CreateUserInput = Pick<User, 'email' | 'name'>;

// shared/src/index.ts - Single entry point
export type { User, CreateUserInput } from './types/user';
export type { Role } from './types/role';
export { constants } from './constants';
```

### Tree-Shaking Friendly
```typescript
// ✅ Named exports (tree-shakeable)
export { User };
export { Role };

// ❌ Avoid default export
export default { User, Role };
```

---

## General Rules

### Naming
```typescript
// Functions: verb + noun
- getUserById() ✅
- getUser() ✅
- user() ❌

// Booleans: is/has/should prefix
- isActive ✅
- hasPermission ✅
- shouldRender ✅

// Files: kebab-case
- user-service.ts ✅
- UserService.ts ❌ (except classes/components)

// Components: PascalCase
- UserCard.tsx ✅
- user-card.tsx ❌
```

### Comments
```typescript
// ✅ Why, not what
// User roles are cached for 1 hour to reduce DB load
const cachedRoles = getRoles();

// ✅ Complex logic
const daysUntilExpiry = Math.ceil((expiresAt - now) / MS_PER_DAY);

// ❌ Obvious what the code does
const users = users.filter(u => u.active); // Filter active users
```

### Error Messages
```typescript
// ✅ Actionable
throw new BadRequestException('Email already registered. Log in or reset your password.');

// ❌ Vague
throw new BadRequestException('Invalid input');
```

---

## Pre-Commit Checklist

- [ ] No `console.log` or `debugger`
- [ ] No `any` types
- [ ] No unused variables
- [ ] Linting passes: `npm run lint`
- [ ] Type check passes: `npm run type-check`
- [ ] Tests pass: `npm run test`
- [ ] No commented-out code
- [ ] No large bundle size increases
