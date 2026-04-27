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
