# IMS -- Inventory Management System

A full-stack inventory management system built with **NestJS**, **Next.js**, and **PostgreSQL**.

## Architecture

```
ims/
├── api/            NestJS backend (Prisma ORM + PostgreSQL)
│   ├── src/
│   │   ├── common/         Shared decorators, DTOs, guards, utils
│   │   ├── core/           App config and env validation
│   │   ├── infrastructure/ Prisma service and database layer
│   │   └── modules/        Feature modules (auth, products, orders, ...)
│   ├── prisma/             Schema, migrations, seed
│   └── test/               E2E tests
│
├── frontend/       Next.js 16 frontend (Tailwind + shadcn/ui)
│   └── src/
│       ├── app/            Pages and layouts (App Router)
│       ├── components/     Reusable UI components
│       ├── hooks/          Custom React hooks
│       ├── lib/            API client, constants, utilities
│       ├── schemas/        Form validation schemas
│       ├── services/       API service layer
│       ├── store/          Zustand stores
│       └── types/          TypeScript type definitions
│
├── shared/         Shared types, enums, constants, and utilities
│   └── src/
│       ├── constants/      API endpoints, pagination defaults
│       ├── enums/          Permission, role, and error enums
│       ├── types/          API, entity, auth, and pagination types
│       └── utils/          Format and validation helpers
│
└── docker-compose.yml
```

## Tech Stack

| Layer    | Technology                                          |
| -------- | --------------------------------------------------- |
| Backend  | NestJS 11, Prisma 7, PostgreSQL, JWT, Passport      |
| Frontend | Next.js 16, React 19, Tailwind CSS, shadcn/ui       |
| Shared   | TypeScript types, enums, constants, and utilities    |
| Infra    | Docker, Docker Compose                               |

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL running locally (default: `postgresql://ims:ims@localhost:5432/ims`)

### First-Time Setup

```bash
# Install all packages, generate Prisma client, run migrations, and seed
npm run setup
```

The setup script:
1. Installs and builds the `shared` package
2. Installs API dependencies
3. Runs `prisma generate`, `prisma db push`, and `prisma db seed`
4. Installs frontend dependencies

### Daily Development

Start all three dev servers concurrently:

```bash
npm run app
```

Or start them individually:

```bash
# Terminal 1 -- API (http://localhost:8080)
npm run dev:api

# Terminal 2 -- Frontend (http://localhost:3001)
npm run dev:frontend

# Terminal 3 -- Shared (watch mode)
npm run dev:shared
```

### Docker

```bash
cp .env.local.example .env
npm run docker:up
```

## NPM Scripts

### Development

| Command                | Description                              |
| ---------------------- | ---------------------------------------- |
| `npm run setup`        | First-time install, migrate, seed        |
| `npm run app`          | Start all three dev servers concurrently |
| `npm run dev:api`      | Start API in watch mode                  |
| `npm run dev:frontend` | Start frontend dev server                |
| `npm run dev:shared`   | Watch-build the shared package           |

### Building

| Command                | Description                              |
| ---------------------- | ---------------------------------------- |
| `npm run build`        | Build all packages                       |
| `npm run build:shared` | Build shared package only                |
| `npm run build:api`    | Build API only                           |
| `npm run build:frontend` | Build frontend only                    |

### Linting & Code Quality

| Command                  | Description                                    |
| ----------------------   | ---------------------------------------------- |
| `npm run lint:all`       | Fix linting issues in all workspaces           |
| `npm run lint:api`       | Fix linting issues in API only                 |
| `npm run lint:frontend`  | Fix linting issues in frontend only            |
| `npm run lint:shared`    | Fix linting issues in shared only              |
| `npm run lint:check:all` | Check linting (no fix) in all workspaces       |
| `npm run format:all`     | Format code with Prettier in all workspaces    |

### Database

| Command                | Description                              |
| ---------------------- | ---------------------------------------- |
| `npm run db:migrate`   | Run Prisma migrations                    |
| `npm run db:seed`      | Seed the database                        |
| `npm run db:generate`  | Regenerate Prisma client                 |
| `npm run db:reset`     | Reset database and re-seed               |

### Docker

| Command                | Description                              |
| ---------------------- | ---------------------------------------- |
| `npm run docker:up`    | Start all Docker containers              |
| `npm run docker:down`  | Stop all Docker containers               |

## Project Conventions

- **Soft deletes** -- all entities use `deletedAt` rather than hard deletes.
- **Audit logging** -- every write operation records an audit trail.
- **RBAC** -- role-based access control with database-backed permissions.
- **Pagination** -- all list endpoints return `{ data, meta }` with consistent pagination metadata.
- **Shared package** -- types, enums, and utilities live in `shared/` so both API and frontend stay in sync.

```
ims
├─ .claude
│  ├─ ADRs.md
│  ├─ agents
│  ├─ agents.md
│  ├─ CLAUDE.md
│  ├─ GET_STARTED.md
│  ├─ INDEX.md
│  ├─ instructions.md
│  ├─ PERFORMANCE.md
│  ├─ QUICK_REF.md
│  ├─ README.md
│  ├─ settings.json
│  ├─ settings.local.json
│  ├─ STYLE_GUIDE.md
│  ├─ TOKEN_OPTIMIZATION.md
│  └─ WORKFLOW.md
├─ .continue
│  └─ prompts
├─ .roo
│  ├─ mcp.json
│  └─ skills
│     └─ inventory-domain-logic
│        └─ SKILL.md
├─ api
│  ├─ .dockerignore
│  ├─ .prettierrc
│  ├─ Dockerfile
│  ├─ eslint.config.mjs
│  ├─ nest-cli.json
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ prisma
│  │  ├─ migrations
│  │  │  ├─ $(date
│  │  │  ├─ 0001_init
│  │  │  │  └─ migration.sql
│  │  │  ├─ 0002_add_suppliers_table
│  │  │  │  └─ migration.sql
│  │  │  └─ 0003_add_product_type_unit_of_measure_models
│  │  │     └─ migration.sql
│  │  ├─ schema.prisma
│  │  └─ seed.ts
│  ├─ prisma.config.ts
│  ├─ README.md
│  ├─ src
│  │  ├─ app.controller.spec.ts
│  │  ├─ app.controller.ts
│  │  ├─ app.module.ts
│  │  ├─ app.service.ts
│  │  ├─ common
│  │  │  ├─ base
│  │  │  │  └─ crud.service.base.ts
│  │  │  ├─ decorators
│  │  │  │  ├─ audit.decorator.ts
│  │  │  │  ├─ current-user.decorator.ts
│  │  │  │  ├─ permission-logic.decorator.ts
│  │  │  │  ├─ permissions.decorator.ts
│  │  │  │  ├─ public.decorator.ts
│  │  │  │  ├─ resource-scope.decorator.ts
│  │  │  │  └─ roles.decorator.ts
│  │  │  ├─ dto
│  │  │  │  └─ pagination.dto.ts
│  │  │  ├─ errors
│  │  │  │  └─ error-handler.ts
│  │  │  ├─ guards
│  │  │  │  └─ permission.factory.ts
│  │  │  ├─ interceptors
│  │  │  │  └─ audit.interceptor.ts
│  │  │  └─ utils
│  │  │     ├─ decimal.ts
│  │  │     ├─ pagination.utils.ts
│  │  │     └─ slug.ts
│  │  ├─ core
│  │  │  └─ config
│  │  │     ├─ env.schema.ts
│  │  │     └─ env.validation.ts
│  │  ├─ infrastructure
│  │  │  └─ prisma
│  │  │     ├─ prisma.module.ts
│  │  │     └─ prisma.service.ts
│  │  ├─ main.ts
│  │  ├─ modules
│  │  │  ├─ audit
│  │  │  │  ├─ audit.controller.ts
│  │  │  │  ├─ audit.module.ts
│  │  │  │  └─ audit.service.ts
│  │  │  ├─ auth
│  │  │  │  ├─ auth.controller.ts
│  │  │  │  ├─ auth.module.ts
│  │  │  │  ├─ auth.service.ts
│  │  │  │  ├─ dto
│  │  │  │  │  └─ auth.dto.ts
│  │  │  │  ├─ guards
│  │  │  │  │  ├─ jwt-auth.guard.ts
│  │  │  │  │  └─ rbac.guard.ts
│  │  │  │  └─ strategies
│  │  │  │     └─ jwt.strategy.ts
│  │  │  ├─ categories
│  │  │  │  ├─ categories.controller.ts
│  │  │  │  ├─ categories.module.ts
│  │  │  │  ├─ categories.service.ts
│  │  │  │  └─ dto
│  │  │  │     └─ category.dto.ts
│  │  │  ├─ companies
│  │  │  │  ├─ companies.controller.ts
│  │  │  │  ├─ companies.module.ts
│  │  │  │  ├─ companies.service.ts
│  │  │  │  └─ dto
│  │  │  │     └─ company.dto.ts
│  │  │  ├─ health
│  │  │  │  ├─ health.controller.ts
│  │  │  │  └─ health.module.ts
│  │  │  ├─ inventory
│  │  │  │  ├─ API_SERVICE_STRUCTURE.md
│  │  │  │  ├─ BUSINESS_LOGIC_DESIGN.md
│  │  │  │  ├─ dto
│  │  │  │  │  └─ inventory.dto.ts
│  │  │  │  ├─ inventory.controller.ts
│  │  │  │  ├─ inventory.module.ts
│  │  │  │  └─ inventory.service.ts
│  │  │  ├─ locations
│  │  │  │  └─ dto
│  │  │  ├─ orders
│  │  │  │  ├─ dto
│  │  │  │  │  └─ order.dto.ts
│  │  │  │  ├─ orders.controller.ts
│  │  │  │  ├─ orders.module.ts
│  │  │  │  └─ orders.service.ts
│  │  │  ├─ permissions
│  │  │  │  ├─ dto
│  │  │  │  │  ├─ create-permission.dto.ts
│  │  │  │  │  └─ update-permission.dto.ts
│  │  │  │  ├─ entities
│  │  │  │  │  └─ permission.entity.ts
│  │  │  │  ├─ permissions.controller.ts
│  │  │  │  ├─ permissions.module.ts
│  │  │  │  └─ permissions.service.ts
│  │  │  ├─ product-types
│  │  │  │  ├─ dto
│  │  │  │  │  └─ product-type.dto.ts
│  │  │  │  ├─ product-types.controller.ts
│  │  │  │  ├─ product-types.module.ts
│  │  │  │  └─ product-types.service.ts
│  │  │  ├─ products
│  │  │  │  ├─ dto
│  │  │  │  │  └─ product.dto.ts
│  │  │  │  ├─ products.controller.ts
│  │  │  │  ├─ products.module.ts
│  │  │  │  └─ products.service.ts
│  │  │  ├─ purchase-orders
│  │  │  │  └─ dto
│  │  │  ├─ rbac
│  │  │  │  ├─ decorators
│  │  │  │  ├─ guards
│  │  │  │  ├─ rbac.guard.ts
│  │  │  │  ├─ rbac.module.ts
│  │  │  │  ├─ rbac.service.ts
│  │  │  │  └─ rbac.types.ts
│  │  │  ├─ roles
│  │  │  │  ├─ dto
│  │  │  │  │  ├─ assign-permissions.dto.ts
│  │  │  │  │  ├─ clone-role.dto.ts
│  │  │  │  │  ├─ create-role.dto.ts
│  │  │  │  │  ├─ index.ts
│  │  │  │  │  └─ update-role.dto.ts
│  │  │  │  ├─ entities
│  │  │  │  │  └─ role.entity.ts
│  │  │  │  ├─ roles.controller.ts
│  │  │  │  ├─ roles.module.ts
│  │  │  │  └─ roles.service.ts
│  │  │  ├─ suppliers
│  │  │  │  ├─ dto
│  │  │  │  │  └─ supplier.dto.ts
│  │  │  │  ├─ suppliers.controller.ts
│  │  │  │  ├─ suppliers.module.ts
│  │  │  │  └─ suppliers.service.ts
│  │  │  ├─ unit-of-measures
│  │  │  │  ├─ dto
│  │  │  │  │  └─ unit-of-measure.dto.ts
│  │  │  │  ├─ unit-of-measures.controller.ts
│  │  │  │  ├─ unit-of-measures.module.ts
│  │  │  │  └─ unit-of-measures.service.ts
│  │  │  ├─ users
│  │  │  │  ├─ dto
│  │  │  │  │  ├─ create-user.dto.ts
│  │  │  │  │  └─ update-user.dto.ts
│  │  │  │  ├─ entities
│  │  │  │  │  └─ user.entity.ts
│  │  │  │  ├─ users.controller.ts
│  │  │  │  ├─ users.module.ts
│  │  │  │  └─ users.service.ts
│  │  │  └─ warehouses
│  │  │     ├─ dto
│  │  │     │  └─ warehouse.dto.ts
│  │  │     ├─ warehouses.controller.ts
│  │  │     ├─ warehouses.module.ts
│  │  │     └─ warehouses.service.ts
│  │  └─ types
│  │     └─ express.d.ts
│  ├─ test
│  │  ├─ app.e2e-spec.ts
│  │  └─ jest-e2e.json
│  ├─ tsconfig.build.json
│  └─ tsconfig.json
├─ dev.bat
├─ dev.ps1
├─ docker-compose.yml
├─ frontend
│  ├─ .dockerignore
│  ├─ .eslintrc.json
│  ├─ .prettierrc
│  ├─ Dockerfile
│  ├─ docs
│  │  └─ THEMING.md
│  ├─ next.config.js
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ postcss.config.js
│  ├─ README.md
│  ├─ src
│  │  ├─ app
│  │  │  ├─ (auth)
│  │  │  │  ├─ forgot-password
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ login
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ privacy
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ register
│  │  │  │  │  └─ page.tsx
│  │  │  │  └─ terms
│  │  │  │     └─ page.tsx
│  │  │  ├─ dashboard
│  │  │  │  ├─ analytics
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ audit
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ categories
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ companies
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ customers
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ goods-receipts
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ integrations
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ inventory
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ invoices
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ layout.tsx
│  │  │  │  ├─ orders
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ page.tsx
│  │  │  │  ├─ permissions
│  │  │  │  │  ├─ page.tsx
│  │  │  │  │  ├─ PermissionDetailsModal.tsx
│  │  │  │  │  └─ PermissionFormModal.tsx
│  │  │  │  ├─ product-types
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ products
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ profile
│  │  │  │  │  ├─ activity
│  │  │  │  │  │  └─ page.tsx
│  │  │  │  │  ├─ page.tsx
│  │  │  │  │  ├─ security
│  │  │  │  │  │  └─ page.tsx
│  │  │  │  │  └─ settings
│  │  │  │  │     └─ page.tsx
│  │  │  │  ├─ purchase-orders
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ rbac
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ reports
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ roles
│  │  │  │  │  ├─ AssignPermissionsModal.tsx
│  │  │  │  │  ├─ page.tsx
│  │  │  │  │  ├─ RoleDetailsModal.tsx
│  │  │  │  │  ├─ RoleFormModal.tsx
│  │  │  │  │  └─ RolePermissionPreview.tsx
│  │  │  │  ├─ settings
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ suppliers
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ unit-of-measures
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ users
│  │  │  │  │  ├─ AssignRolesPermissionsModal.tsx
│  │  │  │  │  ├─ page.tsx
│  │  │  │  │  ├─ SimpleAssignRolesModal.tsx
│  │  │  │  │  ├─ UserDetailsModal.tsx
│  │  │  │  │  ├─ UserFormModal.tsx
│  │  │  │  │  └─ UserPermissionsDisplay.tsx
│  │  │  │  └─ warehouses
│  │  │  │     ├─ page.tsx
│  │  │  │     └─ [id]
│  │  │  │        └─ page.tsx
│  │  │  ├─ error.tsx
│  │  │  ├─ global-error.tsx
│  │  │  ├─ layout.tsx
│  │  │  ├─ not-found.tsx
│  │  │  └─ page.tsx
│  │  ├─ components
│  │  │  ├─ index.ts
│  │  │  ├─ layout
│  │  │  │  ├─ sidebar.tsx
│  │  │  │  └─ topbar.tsx
│  │  │  ├─ providers
│  │  │  │  ├─ query-provider.tsx
│  │  │  │  └─ theme-provider.tsx
│  │  │  ├─ tables
│  │  │  │  ├─ data-table.tsx
│  │  │  │  └─ table-skeleton.tsx
│  │  │  └─ ui
│  │  │     ├─ action-menu.tsx
│  │  │     ├─ badge.tsx
│  │  │     ├─ button.tsx
│  │  │     ├─ card.tsx
│  │  │     ├─ chart.tsx
│  │  │     ├─ checkbox.tsx
│  │  │     ├─ coming-soon-page.tsx
│  │  │     ├─ confirmation-dialog.tsx
│  │  │     ├─ dialog.tsx
│  │  │     ├─ dropdown-menu.tsx
│  │  │     ├─ form.tsx
│  │  │     ├─ input.tsx
│  │  │     ├─ inventory
│  │  │     │  └─ StockBadge.tsx
│  │  │     ├─ inventory-dashboard.tsx
│  │  │     ├─ label.tsx
│  │  │     ├─ page-header.tsx
│  │  │     ├─ popover.tsx
│  │  │     ├─ progress.tsx
│  │  │     ├─ responsive-modal.tsx
│  │  │     ├─ scroll-area.tsx
│  │  │     ├─ select.tsx
│  │  │     ├─ separator.tsx
│  │  │     ├─ skeleton.tsx
│  │  │     ├─ spinner.tsx
│  │  │     ├─ states.tsx
│  │  │     ├─ stats-card.tsx
│  │  │     ├─ switch.tsx
│  │  │     ├─ table.tsx
│  │  │     ├─ tabs.tsx
│  │  │     ├─ textarea.tsx
│  │  │     ├─ theme-toggle.tsx
│  │  │     ├─ toast.tsx
│  │  │     ├─ toaster.tsx
│  │  │     └─ use-toast.ts
│  │  ├─ context
│  │  ├─ hooks
│  │  │  ├─ inventory
│  │  │  ├─ use-api-query.ts
│  │  │  ├─ use-auth.ts
│  │  │  ├─ use-debounce.ts
│  │  │  ├─ use-permissions.ts
│  │  │  └─ use-server-search.ts
│  │  ├─ lib
│  │  │  ├─ animations.ts
│  │  │  ├─ api-client.ts
│  │  │  ├─ constants.ts
│  │  │  ├─ error-handler.ts
│  │  │  ├─ query-client.ts
│  │  │  └─ utils.ts
│  │  ├─ middleware.ts
│  │  ├─ schemas
│  │  │  ├─ auth.schema.ts
│  │  │  ├─ category.schema.ts
│  │  │  ├─ product.schema.ts
│  │  │  └─ supplier.schema.ts
│  │  ├─ services
│  │  │  ├─ audit.service.ts
│  │  │  ├─ auth.service.ts
│  │  │  ├─ base
│  │  │  │  └─ crud.service.base.ts
│  │  │  ├─ category.service.ts
│  │  │  ├─ company.service.ts
│  │  │  ├─ dashboard.service.ts
│  │  │  ├─ goods-receipt.service.ts
│  │  │  ├─ index.ts
│  │  │  ├─ inventory.service.ts
│  │  │  ├─ order.service.ts
│  │  │  ├─ product-type.service.ts
│  │  │  ├─ product.service.ts
│  │  │  ├─ purchase-order.service.ts
│  │  │  ├─ role-permission.service.ts
│  │  │  ├─ stock-level.service.ts
│  │  │  ├─ supplier.service.ts
│  │  │  ├─ unit-of-measure.service.ts
│  │  │  ├─ user.service.ts
│  │  │  └─ warehouse.service.ts
│  │  ├─ store
│  │  │  ├─ auth-store.ts
│  │  │  └─ ui-store.ts
│  │  ├─ styles
│  │  │  └─ globals.css
│  │  └─ types
│  │     ├─ css.d.ts
│  │     └─ index.ts
│  ├─ tailwind.config.ts
│  └─ tsconfig.json
├─ package-lock.json
├─ package.json
├─ README.md
├─ setup.bat
├─ setup.ps1
├─ shared
│  ├─ .prettierrc
│  ├─ eslint.config.mjs
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ README.md
│  ├─ src
│  │  ├─ constants
│  │  │  └─ api.constants.ts
│  │  ├─ enums
│  │  │  ├─ error.enums.ts
│  │  │  └─ permission.enums.ts
│  │  ├─ index.ts
│  │  ├─ types
│  │  │  ├─ api.types.ts
│  │  │  ├─ auth.types.ts
│  │  │  ├─ entity.types.ts
│  │  │  └─ pagination.types.ts
│  │  └─ utils
│  │     ├─ format.utils.ts
│  │     └─ validation.utils.ts
│  └─ tsconfig.json
├─ SIDEBAR_GROUPING_GUIDE.md
├─ start-ims.ps1
├─ stop-ims.ps1
└─ tsc_errors.txt

```