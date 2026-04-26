# IMS Frontend

Next.js 16 frontend for the Inventory Management System.

## Structure

```
frontend/src/
├── app/                          Next.js App Router
│   ├── (auth)/                   Auth pages (login, register)
│   ├── dashboard/                Protected dashboard pages
│   │   ├── orders/
│   │   ├── permissions/
│   │   ├── unit-of-measures/
│   │   ├── users/
│   │   ├── warehouses/
│   │   ├── layout.tsx            Dashboard shell (sidebar, header)
│   │   └── page.tsx              Dashboard home
│   ├── layout.tsx                Root layout (providers, fonts)
│   ├── page.tsx                  Landing / redirect page
│   ├── error.tsx                 Error boundary
│   ├── global-error.tsx          Global error boundary
│   └── not-found.tsx             404 page
│
├── components/
│   └── ui/                       shadcn/ui primitives (button, card, toast, ...)
│
├── hooks/
│   ├── use-api-query.ts          Typed React Query wrappers with toast support
│   ├── use-auth.ts               Authentication hook
│   ├── use-debounce.ts           Input debouncing
│   └── use-server-search.ts      Server-side search with debounce
│
├── lib/
│   ├── api-client.ts             Axios instance with auth interceptors
│   ├── constants.ts              API endpoints, storage keys, app config
│   ├── error-handler.ts          Centralised API error -> message mapper
│   ├── query-client.ts           React Query client configuration
│   ├── utils.ts                  General utility functions (cn, getCookie, etc.)
│   └── animations.ts             Framer Motion animation presets
│
├── schemas/
│   ├── auth.schema.ts            Login / register form validation
│   ├── category.schema.ts
│   ├── product.schema.ts
│   └── supplier.schema.ts
│
├── services/
│   ├── base/
│   │   └── crud.service.base.ts  Generic CRUD service base class
│   ├── auth.service.ts           Login, register, refresh, profile
│   ├── product.service.ts        Products with FE <-> BE data transforms
│   ├── order.service.ts
│   ├── inventory.service.ts
│   ├── ... (one service per domain)
│   └── index.ts                  Barrel export for all services
│
├── store/
│   ├── auth-store.ts             Zustand auth state (tokens, user)
│   └── ui-store.ts               Zustand UI state (sidebar, theme)
│
├── styles/
│   └── globals.css               Tailwind base + custom CSS variables
│
└── types/
    ├── index.ts                  All frontend TypeScript interfaces
    └── css.d.ts                  CSS module type declarations
```

## Key Patterns

### API Layer

- **`api-client.ts`** -- Axios instance with automatic JWT attachment and transparent 401 token refresh.
- **`CrudServiceBase`** -- extend for simple domain services; provides `getAll`, `getById`, `create`, `update`, `delete` out of the box.
- **Domain services** (e.g. `product.service.ts`) handle FE-BE data transformation when field names differ.

### State Management

- **Zustand** for auth and UI state
- **React Query** for server state (caching, invalidation, optimistic updates)
- `useApiQuery` / `useApiMutation` hooks add automatic toast notifications

### Theming

- CSS variables in `globals.css` power both light and dark modes
- `next-themes` handles theme persistence
- See `docs/THEMING.md` for the full theming guide

### Error Handling

- `ErrorHandler` class maps Axios errors to user-friendly strings
- `handleFormError` extracts field-level validation errors for forms
- Type guards: `isNetworkError`, `isAuthError`, `isNotFoundError`, `isConflictError`

## Development

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:3001)
npm run dev

# Type-check without emitting
npm run type-check

# Lint
npm run lint

# Build for production
npm run build
```

## Environment Variables

Copy `.env.local.example` to `.env.local` and adjust:

| Variable                | Description                          |
| ----------------------- | ------------------------------------ |
| `NEXT_PUBLIC_API_URL`   | Backend API base URL                 |
