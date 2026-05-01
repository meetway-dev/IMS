# IMS -- Inventory Management System

A full-stack inventory management system built with **NestJS**, **Next.js**, and **PostgreSQL**.

## Architecture

```
ims/
├── api/            NestJS backend (Prisma ORM + PostgreSQL)
│   ├── src/
│   ├── prisma/
│   └── test/
├── frontend/       Next.js frontend
│   ├── src/
│   ├── next.config.js
│   └── tsconfig.json
├── shared/         Workspace package for shared types and utils
│   └── src/
├── docker-compose.yml
├── package.json
├── .env.example
├── .env.development.example
└── .env.production.example
```

## Tech Stack

| Layer    | Technology                                          |
| -------- | --------------------------------------------------- |
| Backend  | NestJS 11, Prisma 7, PostgreSQL, JWT, Zod          |
| Frontend | Next.js 16, React 19, Tailwind CSS, MUI            |
| Shared   | TypeScript shared types, enums, constants          |
| Infra    | Docker, Docker Compose                             |

## Environment strategy

Use a single set of root env files.

- `.env` for local development
- `.env.development` for development builds
- `.env.production` for production builds
- `.env.example` as the canonical template

Do not commit `.env`, `.env.local`, or `.env.*.local`.

## Quick Start

### Prerequisites

- **Node.js 20+** - [Download](https://nodejs.org/)
- **PostgreSQL 13+** - Running locally or via Docker

### 1. Setup PostgreSQL (One-time)

Follow [POSTGRES_SETUP.md](./POSTGRES_SETUP.md) to create the `ims` user and database.

### 2. Install & Run

**Automated setup (recommended):**
```bash
npm run setup:local
```

**Manual setup:**
```bash
npm install
npm run validate:env        # Verify environment variables
npm run db:test-connection  # Test database connection
npm run db:setup            # Generate + migrate + seed
npm run dev                 # Start all 3 workspaces
```

Access:
- **API:** http://localhost:8080 (Swagger docs: http://localhost:8080/api-docs)
- **Frontend:** http://localhost:3001

### Troubleshooting

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for comprehensive troubleshooting and architecture decisions.

## Docker Setup

If you prefer containerized PostgreSQL:

```bash
cp .env.docker .env
docker compose up -d postgres  # Start PostgreSQL
npm run db:setup               # Setup database
npm run dev                    # Start development
```

Or start all services:
```bash
docker compose up
```

## NPM scripts

### Setup & Development

| Command                  | Description                                    |
| ------------------------ | ---------------------------------------------- |
| `npm run setup:local`    | **Automated setup** (recommended for first time) |
| `npm run setup`          | Install deps, validate env, initialize DB       |
| `npm run validate:env`   | Check all env variables are set                |
| `npm run db:test-connection` | Test PostgreSQL connection                  |
| `npm run dev`            | Start all 3 workspaces (API, Frontend, Shared) |

### Database

| Command                | Description                              |
| ---------------------- | ---------------------------------------- |
| `npm run db:generate`  | Generate Prisma client                   |
| `npm run db:migrate`   | Apply pending migrations                 |
| `npm run db:seed`      | Populate seed data                       |
| `npm run db:reset`     | ⚠️  Drop and recreate entire database     |
| `npm run db:setup`     | Generate + migrate + seed (full setup)   |

### Build & Deployment

| Command                | Description                              |
| ---------------------- | ---------------------------------------- |
| `npm run build`        | Build all workspace packages             |
| `npm run start`        | Start backend production build           |
| `npm run lint`         | Lint all workspaces                      |
| `npm run format`       | Format all workspaces                    |

### Docker

| Command                | Description                              |
| ---------------------- | ---------------------------------------- |
| `npm run docker:build` | Build Docker images                      |
| `npm run docker:up`    | Start containers                         |
| `npm run docker:down`  | Stop containers                          |
| `npm run docker:logs`  | View container logs                      |

### Per-package scripts

- API: `cd api && npm run build | start:dev | start:prod | lint | format`
- Frontend: `cd frontend && npm run dev | build | start | lint | format | type-check`
- Shared: `cd shared && npm run build | watch | lint | format`

## Environment variables

The root `.env` file should contain:

- `NODE_ENV`
- `API_PORT`
- `FRONTEND_PORT`
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- `DATABASE_URL`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- `JWT_ACCESS_TTL_SECONDS`, `JWT_REFRESH_TTL_DAYS`
- `CORS_ORIGIN`
- `SWAGGER_PATH`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_APP_URL`

## Project conventions

- Soft deletes use `deletedAt`
- Audit logging is stored for write operations
- RBAC is permission-driven
- Shared types and helpers are centralized under `shared/`

## Notes

- Use `npm run dev` for local development.
- Use `docker compose` only when you need containerized infra.
- Keep secrets in `.env.production` or your deployment secret manager.

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