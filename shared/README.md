# @ims/shared

Shared TypeScript types, enums, constants, and utility functions used by both the **API** and **Frontend** packages.

## Structure

```
shared/src/
├── constants/
│   └── api.constants.ts      API version, endpoint map, pagination defaults, storage keys
├── enums/
│   ├── error.enums.ts         ErrorCode, PrismaErrorCode, and their message maps
│   └── permission.enums.ts    Permission enum, Role enum, ROLE_PERMISSIONS mapping
├── types/
│   ├── api.types.ts           ApiResponse, PaginatedResponse, ApiError, ValidationError
│   ├── auth.types.ts          LoginCredentials, TokenResponse, AuthUser, AuthTokens
│   ├── entity.types.ts        Domain entities (Product, Order, Category, etc.)
│   └── pagination.types.ts    PaginationMeta, PaginatedResult, PaginationQuery, builder helpers
├── utils/
│   ├── format.utils.ts        Currency, date, text, phone formatting functions
│   └── validation.utils.ts    Email/password validation, VALIDATION_MESSAGES
└── index.ts                   Barrel export
```

## Usage

Both the API and frontend reference this package via a local file link:

```json
{
  "dependencies": {
    "@ims/shared": "file:../shared"
  }
}
```

Import anything directly from the package root:

```ts
import {
  ApiResponse,
  Permission,
  Role,
  formatCurrency,
  validateEmail,
  DEFAULT_PAGE_SIZE,
} from '@ims/shared';
```

## Build

```bash
cd shared
npm install
npm run build    # tsc -> dist/
npm run watch    # tsc --watch
npm run clean    # rm -rf dist
```

After modifying shared types, rebuild the package so downstream consumers pick up the changes. During development, use `npm run dev:shared` from the repo root to watch-build automatically.
