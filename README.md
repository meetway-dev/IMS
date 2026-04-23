# IMS — Inventory Management System

A full-stack inventory management system built with NestJS, Next.js, and PostgreSQL.

## Architecture

```
ims/
├── api/          NestJS backend (Prisma + PostgreSQL)
├── frontend/     Next.js frontend (Tailwind + shadcn/ui)
├── shared/       Shared types, constants, and utilities
└── docker-compose.yml
```

## Quick Start

### First-Time Setup

Run one of these from the repo root:

```powershell
# PowerShell (recommended)
.\setup.ps1

# Command Prompt
setup.bat

# Or via npm
npm run setup
```

This will:
1. Install & build the `shared` package
2. Install API dependencies
3. Create `api/.env` from `.env.local.example`
4. Run Prisma generate + migrate + seed
5. Install frontend dependencies
6. Create `frontend/.env.local` from `.env.local.example`

> **Note:** Make sure PostgreSQL is running locally before setup. Default connection: `postgresql://ims:ims@localhost:5432/ims`

### Daily Development

Start both servers with:

```powershell
# PowerShell (opens separate windows)
.\dev.ps1

# Command Prompt
dev.bat
```

Or start individually:

```bash
# Terminal 1 — API (http://localhost:8080)
npm run dev:api

# Terminal 2 — Frontend (http://localhost:3001)
npm run dev:frontend
```

### Docker

```bash
cp .env.local.example .env
npm run docker:up
```

## NPM Scripts

| Command              | Description                          |
|----------------------|--------------------------------------|
| `npm run setup`      | First-time install, migrate, seed    |
| `npm run dev:api`    | Start API in watch mode              |
| `npm run dev:frontend` | Start frontend dev server          |
| `npm run build`      | Build all packages                   |
| `npm run db:migrate` | Run Prisma migrations                |
| `npm run db:seed`    | Seed the database                    |
| `npm run docker:up`  | Start all Docker containers          |
| `npm run docker:down`| Stop all Docker containers           |

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Backend  | NestJS, Prisma, PostgreSQL, JWT     |
| Frontend | Next.js 14, Tailwind CSS, shadcn/ui |
| Shared   | TypeScript types and constants      |
| Infra    | Docker, Docker Compose              |
