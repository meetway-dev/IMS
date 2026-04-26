# IMS API

NestJS backend for the Inventory Management System.

## Structure

```
api/src/
├── app.module.ts                 Root module -- imports all feature modules
├── app.controller.ts             Health / status endpoint
├── app.service.ts                Root service
│
├── common/                       Shared infrastructure
│   ├── base/
│   │   └── crud.service.base.ts  Generic CRUD service (extend for simple entities)
│   ├── decorators/
│   │   ├── current-user.decorator.ts   Extract AuthUser from request
│   │   ├── permissions.decorator.ts    @Permissions('products.read')
│   │   ├── public.decorator.ts         @Public() -- skip auth guards
│   │   ├── roles.decorator.ts          @Roles('ADMIN')
│   │   ├── audit.decorator.ts          Audit logging decorator
│   │   ├── permission-logic.decorator.ts  AND/OR permission logic
│   │   └── resource-scope.decorator.ts    Scoped resource access
│   ├── dto/
│   │   └── pagination.dto.ts    PaginationQueryDto, buildPaginatedResult
│   ├── errors/
│   │   └── error-handler.ts     Prisma error -> NestJS exception mapper
│   ├── guards/
│   │   └── permission.factory.ts Permission guard factory
│   ├── interceptors/
│   │   └── audit.interceptor.ts  Automatic audit trail interceptor
│   └── utils/
│       ├── decimal.ts           Prisma Decimal -> string/number converters
│       ├── pagination.utils.ts  Fluent PaginationBuilder class
│       └── slug.ts              URL-safe slug generator
│
├── core/
│   └── config/
│       ├── env.schema.ts        Zod schema for environment variables
│       └── env.validation.ts    ConfigModule validation function
│
├── infrastructure/
│   └── prisma/
│       ├── prisma.module.ts     Global PrismaService provider
│       └── prisma.service.ts    Prisma client wrapper
│
├── modules/
│   ├── auth/                    JWT authentication, login, signup, refresh
│   ├── audit/                   Audit logging service
│   ├── categories/              Category CRUD with tree support
│   ├── companies/               Multi-tenant company management
│   ├── inventory/               Stock management + transaction history
│   ├── orders/                  Order lifecycle (draft -> confirmed -> paid)
│   ├── permissions/             Permission CRUD
│   ├── product-types/           Product type reference data
│   ├── products/                Product + variant management
│   ├── rbac/                    Role-based access control engine
│   ├── roles/                   Role CRUD with hierarchy
│   ├── suppliers/               Supplier management
│   ├── unit-of-measures/        Unit of measure reference data
│   ├── users/                   User management
│   ├── warehouses/              Warehouse + location management
│   └── health/                  Health-check endpoint
│
├── types/
│   └── express.d.ts             Extended Express Request with AuthUser
│
└── prisma/
    ├── schema.prisma            Database schema
    ├── seed.ts                  Seed script
    └── migrations/              SQL migration history
```

## Key Patterns

### Authentication & Authorization

- **JWT** with access + refresh tokens (httpOnly cookies supported)
- **RBAC Guard** resolves user roles and permissions from the database
- `@Public()` decorator bypasses all auth guards
- `@Permissions('key')` checks database-backed permissions
- `@Roles('ADMIN')` checks role membership

### Service Layer

- **Simple entities** can extend `CrudServiceBase` for automatic CRUD + audit
- **Complex entities** (orders, inventory) implement their own service with transaction support
- All write operations log to the audit trail via `AuditService`
- Soft deletes (`deletedAt`) across all entities

### Pagination

Every list endpoint returns:

```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### Error Handling

- `ErrorHandler` maps Prisma errors to NestJS HTTP exceptions
- P2002 (unique) -> 409 Conflict
- P2025 (not found) -> 404 Not Found
- P2003 (FK) -> 400 Bad Request

## Development

```bash
# Install dependencies
npm install

# Start in watch mode
npm run start:dev

# Run tests
npm test

# Lint
npm run lint

# Build for production
npm run build
```

## Environment Variables

Copy `.env.local.example` to `.env` and adjust:

| Variable          | Description                    |
| ----------------- | ------------------------------ |
| `DATABASE_URL`    | PostgreSQL connection string   |
| `JWT_SECRET`      | Secret for signing JWTs        |
| `JWT_EXPIRY`      | Access token TTL (e.g. `15m`)  |
| `REFRESH_EXPIRY`  | Refresh token TTL (e.g. `7d`)  |
| `PORT`            | Server port (default `8080`)   |
