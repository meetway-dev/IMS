# IMS Architecture Documentation

## Overview

This document outlines the scalable architecture for the Inventory Management System (IMS), designed to support large-scale applications with multiple modules.

## Architecture Principles

1. **DRY (Don't Repeat Yourself)** - Eliminate code duplication through abstraction
2. **SOLID Principles** - Single responsibility, Open/Closed, Liskov substitution, Interface segregation, Dependency inversion
3. **Separation of Concerns** - Clear boundaries between layers
4. **Type Safety** - Shared types between backend and frontend
5. **Convention over Configuration** - Consistent patterns across modules
6. **Scalability** - Horizontal and vertical scaling ready

## Current Architecture Analysis

### Backend (NestJS)

**Strengths:**
- Modular structure with clear separation (controller, service, module, DTOs)
- Prisma ORM for type-safe database operations
- JWT-based authentication with refresh tokens
- RBAC with permissions decorators
- Audit logging for tracking operations
- Soft delete pattern with `deletedAt` timestamps
- API versioning (`/api/v1`)
- Swagger/OpenAPI documentation

**Areas for Improvement:**
- Repetitive CRUD patterns across services
- Duplicate error handling logic
- Inconsistent pagination implementation
- Manual audit logging in each service
- Repeated validation patterns in DTOs

### Frontend (Next.js)

**Strengths:**
- App Router with server components
- TanStack Query for data fetching and caching
- React Hook Form with Yup validation
- Shadcn/ui component library
- Centralized API client
- Type-safe API calls

**Areas for Improvement:**
- Duplicate service patterns
- Repeated form validation schemas
- Inconsistent error handling
- Manual pagination logic in each page
- Duplicate table configurations

## Proposed Scalable Architecture

### 1. Shared Type System

Create a shared package (`@ims/shared`) that contains:

```
@ims/shared/
├── types/
│   ├── api.types.ts          # API request/response types
│   ├── entity.types.ts       # Entity types (Product, Supplier, etc.)
│   ├── pagination.types.ts   # Pagination types
│   ├── auth.types.ts         # Authentication types
│   └── index.ts
├── constants/
│   ├── api.constants.ts      # API endpoints
│   ├── pagination.constants.ts
│   ├── error.constants.ts    # Error codes and messages
│   └── index.ts
├── enums/
│   ├── entity.enums.ts      # Entity-related enums
│   ├── permission.enums.ts   # Permission enums
│   └── index.ts
├── utils/
│   ├── validation.utils.ts   # Shared validation helpers
│   ├── format.utils.ts       # Shared formatting helpers
│   └── index.ts
└── index.ts
```

**Benefits:**
- Single source of truth for types
- Automatic type synchronization between BE and FE
- Reduced duplication
- Easier refactoring

### 2. Generic CRUD Base Classes

#### Backend: Generic Service Base Class

```typescript
// api/src/common/base/crud.service.base.ts
export abstract class CrudServiceBase<
  TModel,
  TCreateDto,
  TUpdateDto,
  TListQueryDto,
> {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly audit: AuditService,
    protected readonly modelName: string,
  ) {}

  abstract getInclude(): Record<string, any>;
  abstract getSearchFields(): string[];
  abstract getUniqueConstraints(): Record<string, string>;

  async create(dto: TCreateDto, user: AuthUser, ip?: string, userAgent?: string) {
    // Generic create logic with audit logging
  }

  async findAll(query: TListQueryDto) {
    // Generic find all with pagination and search
  }

  async findOne(id: string) {
    // Generic find one
  }

  async update(id: string, dto: TUpdateDto, user: AuthUser, ip?: string, userAgent?: string) {
    // Generic update with audit logging
  }

  async remove(id: string, user: AuthUser, ip?: string, userAgent?: string) {
    // Generic soft delete with audit logging
  }
}
```

#### Frontend: Generic Service Base Class

```typescript
// frontend/src/services/base/crud.service.base.ts
export abstract class CrudServiceBase<T, TCreateDto, TUpdateDto> {
  abstract getEndpoint(): string;

  async getAll(params?: PaginationParams): Promise<PaginatedResponse<T>> {
    return apiClient.getPaginated(this.getEndpoint(), params);
  }

  async getById(id: string): Promise<T> {
    return apiClient.get(`${this.getEndpoint()}/${id}`);
  }

  async create(data: TCreateDto): Promise<T> {
    return apiClient.post(this.getEndpoint(), data);
  }

  async update(id: string, data: TUpdateDto): Promise<T> {
    return apiClient.patch(`${this.getEndpoint()}/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.getEndpoint()}/${id}`);
  }
}
```

**Benefits:**
- 80% reduction in service code
- Consistent behavior across all modules
- Easier to add new modules
- Centralized bug fixes

### 3. Generic Error Handling

#### Backend: Centralized Error Handling

```typescript
// api/src/common/errors/error-handler.ts
export class ErrorHandler {
  static handlePrismaError(error: Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        throw new ConflictException('Record already exists');
      case 'P2025':
        throw new NotFoundException('Record not found');
      default:
        throw new BadRequestException('Database error');
    }
  }

  static handleValidationError(errors: ValidationError[]) {
    // Format validation errors
  }
}

// Global exception filter
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Centralized error response formatting
  }
}
```

#### Frontend: Centralized Error Handling

```typescript
// frontend/src/lib/error-handler.ts
export class ErrorHandler {
  static handleApiError(error: AxiosError<ApiError>): string {
    const message = error.response?.data?.message;
    const code = error.response?.data?.code;

    switch (code) {
      case 'P2002':
        return 'This record already exists';
      case 'P2025':
        return 'Record not found';
      default:
        return message || 'An unexpected error occurred';
    }
  }

  static handleFormError(error: any): Record<string, string> {
    // Convert API errors to form errors
  }
}
```

**Benefits:**
- Consistent error messages
- Centralized error code mapping
- Better user experience
- Easier debugging

### 4. Generic Pagination & Filtering

#### Backend: Generic Query Builder

```typescript
// api/src/common/pagination/query-builder.ts
export class QueryBuilder<T> {
  private where: Prisma.WhereInput<T> = {};
  private orderBy: Prisma.Enumerable<Prisma.UserOrderByWithRelationInput> = {};
  private skip = 0;
  private take = 20;

  constructor(private model: Prisma.ModelName) {}

  search(term: string, fields: string[]): this {
    if (term) {
      this.where = {
        OR: fields.map(field => ({ [field]: { contains: term, mode: 'insensitive' } })),
      };
    }
    return this;
  }

  filter(filters: Record<string, any>): this {
    // Apply filters
    return this;
  }

  sort(field: string, order: 'asc' | 'desc' = 'asc'): this {
    this.orderBy = { [field]: order };
    return this;
  }

  paginate(page: number, limit: number): this {
    this.skip = (page - 1) * limit;
    this.take = limit;
    return this;
  }

  async execute<T>(include?: Record<string, any>): Promise<PaginatedResult<T>> {
    const [data, total] = await Promise.all([
      this.prisma[this.model].findMany({
        where: this.where,
        orderBy: this.orderBy,
        skip: this.skip,
        take: this.take,
        include,
      }),
      this.prisma[this.model].count({ where: this.where }),
    ]);

    return buildPaginatedResult(data, total, this.skip / this.take + 1, this.take);
  }
}
```

#### Frontend: Generic Table Component

```typescript
// frontend/src/components/tables/generic-table.tsx
interface GenericTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  searchFields?: (keyof T)[];
}

export function GenericTable<T>({
  data,
  columns,
  loading,
  onEdit,
  onDelete,
  searchFields,
}: GenericTableProps<T>) {
  // Generic table implementation with search, sort, pagination
}
```

**Benefits:**
- Reusable query building logic
- Consistent pagination behavior
- Type-safe filtering
- Reduced boilerplate

### 5. Generic Audit Logging

#### Backend: Decorator-Based Audit Logging

```typescript
// api/src/common/decorators/audit.decorator.ts
export function AuditLog(action: string, entityType: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args);
      
      // Extract user, ip, userAgent from args
      const user = args.find(arg => arg?.id);
      const ip = args.find(arg => typeof arg === 'string' && arg.includes('.'));
      const userAgent = args.find(arg => typeof arg === 'string' && arg.includes('Mozilla'));

      await this.audit.log({
        actorUserId: user?.id,
        action: `${entityType}.${action}`,
        entityType,
        entityId: result?.id,
        metadata: { ...result },
        ip,
        userAgent,
      });

      return result;
    };

    return descriptor;
  };
}

// Usage
export class SuppliersService extends CrudServiceBase {
  @AuditLog('create', 'Supplier')
  async create(dto: CreateSupplierDto, user: AuthUser, ip?: string, userAgent?: string) {
    // No manual audit logging needed
  }
}
```

**Benefits:**
- Automatic audit logging
- No manual logging code
- Consistent audit format
- Easy to add to any method

### 6. Generic RBAC/Permissions

#### Backend: Permission Guard Factory

```typescript
// api/src/common/guards/permission.factory.ts
export const RequirePermissions = (...permissions: string[]) => {
  return applyDecorators(
    UseGuards(JwtAuthGuard, RbacGuard),
    Permissions(...permissions),
  );
};

// Usage
@Controller('suppliers')
export class SuppliersController {
  @RequirePermissions('suppliers.read')
  @Get()
  findAll() {
    return this.suppliersService.findAll();
  }

  @RequirePermissions('suppliers.write')
  @Post()
  create() {
    return this.suppliersService.create();
  }
}
```

#### Frontend: Permission-Based UI

```typescript
// frontend/src/components/ui/permission-guard.tsx
interface PermissionGuardProps {
  permissions: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGuard({ permissions, children, fallback }: PermissionGuardProps) {
  const { user } = useAuthStore();
  const hasPermission = permissions.every(p => user?.permissions?.includes(p));

  if (!hasPermission) {
    return fallback || null;
  }

  return <>{children}</>;
}

// Usage
<PermissionGuard permissions={['suppliers.write']}>
  <Button>Create Supplier</Button>
</PermissionGuard>
```

**Benefits:**
- Centralized permission logic
- Type-safe permission checks
- Consistent UI behavior
- Easy to maintain

### 7. Shared Constants & Enums

```typescript
// shared/constants/api.constants.ts
export const API_VERSION = 'v1';
export const API_PREFIX = `/api/${API_VERSION}`;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/signup',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  PRODUCTS: {
    LIST: '/products',
    DETAIL: (id: string) => `/products/${id}`,
    CREATE: '/products',
    UPDATE: (id: string) => `/products/${id}`,
    DELETE: (id: string) => `/products/${id}`,
  },
  // ... other endpoints
} as const;

// shared/enums/permission.enums.ts
export enum Permission {
  // Products
  PRODUCTS_READ = 'products.read',
  PRODUCTS_WRITE = 'products.write',
  PRODUCTS_DELETE = 'products.delete',
  
  // Suppliers
  SUPPLIERS_READ = 'suppliers.read',
  SUPPLIERS_WRITE = 'suppliers.write',
  SUPPLIERS_DELETE = 'suppliers.delete',
  
  // ... other permissions
}

// shared/enums/error.enums.ts
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.VALIDATION_ERROR]: 'Validation failed',
  [ErrorCode.NOT_FOUND]: 'Resource not found',
  [ErrorCode.CONFLICT]: 'Resource already exists',
  [ErrorCode.UNAUTHORIZED]: 'Unauthorized access',
  [ErrorCode.FORBIDDEN]: 'Access forbidden',
  [ErrorCode.INTERNAL_ERROR]: 'Internal server error',
};
```

**Benefits:**
- Single source of truth
- Type-safe constants
- Easy to update
- Consistent across BE and FE

### 8. Generic Response Wrappers

#### Backend: Standardized Response Format

```typescript
// api/src/common/dto/response.dto.ts
export class ApiResponseDto<T> {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  data: T;

  @ApiProperty({ required: false })
  message?: string;

  @ApiProperty({ required: false })
  errors?: ValidationError[];
}

export class PaginatedResponseDto<T> extends ApiResponseDto<T[]> {
  @ApiProperty()
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Interceptor to wrap responses
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => ({
        success: true,
        data,
      })),
    );
  }
}
```

#### Frontend: Type-Safe API Client

```typescript
// frontend/src/lib/api-client.ts
class ApiClient {
  async get<T>(url: string, params?: PaginationParams): Promise<ApiResponse<T>> {
    const response = await axiosInstance.get<ApiResponse<T>>(url, { params });
    return response.data;
  }

  async getPaginated<T>(
    url: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<T>> {
    const response = await axiosInstance.get<PaginatedResponse<T>>(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await axiosInstance.post<ApiResponse<T>>(url, data);
    return response.data;
  }

  // ... other methods
}
```

**Benefits:**
- Consistent response format
- Type-safe API calls
- Better error handling
- Easier to test

## Module Structure

### Backend Module Template

```
api/src/modules/{module}/
├── {module}.controller.ts      # REST endpoints
├── {module}.service.ts         # Business logic (extends CrudServiceBase)
├── {module}.module.ts          # Module configuration
├── dto/
│   ├── {module}.dto.ts         # Request/response DTOs
│   └── index.ts
└── {module}.types.ts           # Module-specific types (optional)
```

### Frontend Module Template

```
frontend/src/modules/{module}/
├── {module}.service.ts         # API calls (extends CrudServiceBase)
├── {module}.schema.ts          # Validation schemas
├── {module}.types.ts           # Module-specific types (optional)
├── components/
│   ├── {module}-form.tsx       # Form component
│   ├── {module}-list.tsx       # List component
│   └── {module}-detail.tsx     # Detail component
└── page.tsx                    # Page component
```

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Create `@ims/shared` package
- [ ] Define shared types and constants
- [ ] Set up monorepo structure (optional)
- [ ] Configure TypeScript project references

### Phase 2: Backend Generic Patterns (Week 3-4)
- [ ] Create `CrudServiceBase` class
- [ ] Implement `QueryBuilder` utility
- [ ] Create `AuditLog` decorator
- [ ] Implement centralized error handling
- [ ] Create response interceptor

### Phase 3: Frontend Generic Patterns (Week 5-6)
- [ ] Create `CrudServiceBase` class
- [ ] Implement `GenericTable` component
- [ ] Create `PermissionGuard` component
- [ ] Implement centralized error handling
- [ ] Create form validation utilities

### Phase 4: Migration (Week 7-8)
- [ ] Migrate existing modules to use generic patterns
- [ ] Update tests
- [ ] Update documentation
- [ ] Performance testing

### Phase 5: Optimization (Week 9-10)
- [ ] Implement caching strategy
- [ ] Add rate limiting
- [ ] Implement request batching
- [ ] Add performance monitoring

## Best Practices

### Backend
1. Always extend `CrudServiceBase` for CRUD operations
2. Use `@AuditLog` decorator for audit logging
3. Use `QueryBuilder` for complex queries
4. Use `RequirePermissions` decorator for authorization
5. Keep controllers thin - business logic in services
6. Use DTOs for all request/response validation
7. Implement soft deletes instead of hard deletes
8. Use transactions for multi-step operations

### Frontend
1. Always extend `CrudServiceBase` for API services
2. Use `GenericTable` for data tables
3. Use `PermissionGuard` for permission-based UI
4. Use TanStack Query for data fetching
5. Implement optimistic updates where possible
6. Use React Hook Form for forms
7. Implement proper error boundaries
8. Use loading states and skeletons

### Shared
1. Keep types in sync between BE and FE
2. Use shared constants for API endpoints
3. Use shared enums for fixed values
4. Document all shared utilities
5. Version shared package properly

## Performance Considerations

### Backend
1. Implement database connection pooling
2. Use Redis for caching
3. Implement query result caching
4. Use database indexes appropriately
5. Implement rate limiting
6. Use compression for large responses
7. Implement pagination for all list endpoints
8. Use database read replicas for read-heavy operations

### Frontend
1. Implement code splitting
2. Use lazy loading for routes
3. Implement virtual scrolling for large lists
4. Cache API responses with TanStack Query
5. Implement optimistic updates
6. Use web workers for heavy computations
7. Implement service worker for offline support
8. Use image optimization

## Security Considerations

1. Always validate input on both client and server
2. Use HTTPS in production
3. Implement CSRF protection
4. Use secure HTTP-only cookies for tokens
5. Implement rate limiting
6. Sanitize user input to prevent XSS
7. Use parameterized queries to prevent SQL injection
8. Implement proper authentication and authorization
9. Log security events
10. Regular security audits

## Testing Strategy

### Backend
1. Unit tests for services
2. Integration tests for controllers
3. E2E tests for critical flows
4. Contract tests for API contracts
5. Performance tests for critical endpoints

### Frontend
1. Unit tests for utilities and hooks
2. Component tests for UI components
3. Integration tests for pages
4. E2E tests for critical user flows
5. Visual regression tests

## Monitoring & Observability

1. Implement structured logging
2. Use APM (Application Performance Monitoring)
3. Track key metrics (response time, error rate, etc.)
4. Set up alerts for critical issues
5. Implement health checks
6. Use distributed tracing
7. Monitor database performance
8. Track user behavior analytics

## Deployment Strategy

1. Use CI/CD pipeline
2. Implement blue-green deployment
3. Use containerization (Docker)
4. Implement auto-scaling
5. Use load balancing
6. Implement database migrations
7. Use feature flags
8. Implement rollback strategy

## Conclusion

This architecture provides a solid foundation for building a large-scale, maintainable IMS application. By implementing generic patterns and shared utilities, we can significantly reduce code duplication, improve consistency, and make it easier to add new modules.

The key to success is:
1. Consistent application of patterns
2. Proper documentation
3. Regular code reviews
4. Continuous refactoring
5. Performance monitoring
6. Security best practices
