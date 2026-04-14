# @ims/shared

Shared types, constants, and utilities for the Inventory Management System (IMS).

This package contains common code shared between the backend (NestJS) and frontend (Next.js) applications.

## Installation

```bash
npm install @ims/shared
```

## Usage

### Types

```typescript
import { User, Product, Supplier, ApiResponse, PaginatedResponse } from '@ims/shared';

// Use shared types in your application
const user: User = {
  id: '123',
  email: 'user@example.com',
  name: 'John Doe',
  // ...
};
```

### Constants

```typescript
import { API_ENDPOINTS, DEFAULT_PAGINATION, STORAGE_KEYS } from '@ims/shared';

// Use shared constants
const endpoint = API_ENDPOINTS.PRODUCTS.LIST;
const limit = DEFAULT_PAGINATION.LIMIT;
const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
```

### Enums

```typescript
import { Permission, Role, ErrorCode, PrismaErrorCode } from '@ims/shared';

// Use shared enums
if (user.role === Role.ADMIN) {
  // Admin logic
}

if (error.code === PrismaErrorCode.UNIQUE_CONSTRAINT) {
  // Handle unique constraint error
}
```

## Structure

```
@ims/shared/
├── src/
│   ├── types/
│   │   ├── api.types.ts          # API request/response types
│   │   ├── entity.types.ts       # Entity types (Product, Supplier, etc.)
│   │   └── auth.types.ts         # Authentication types
│   ├── constants/
│   │   └── api.constants.ts      # API endpoints and constants
│   ├── enums/
│   │   ├── error.enums.ts        # Error codes and messages
│   │   └── permission.enums.ts   # Permission and role enums
│   └── index.ts                # Main export file
├── package.json
├── tsconfig.json
└── README.md
```

## Development

### Build

```bash
npm run build
```

### Watch

```bash
npm run watch
```

### Clean

```bash
npm run clean
```

## Contributing

When adding new types or constants:

1. Add them to the appropriate file in `src/`
2. Export them from `src/index.ts`
3. Update this README if needed
4. Run `npm run build` to compile TypeScript

## Versioning

This package follows semantic versioning (semver). Update the version in `package.json` when making changes.

## License

MIT
