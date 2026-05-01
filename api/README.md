# IMS API

NestJS backend for the Inventory Management System.

## Purpose

This package contains the API implementation, Prisma schema, migrations, and backend application logic.

## Local usage

Use the repository root commands for workspace-wide behavior.

```bash
# from repo root
npm install
cp .env.example .env
npm run setup
npm run dev
```

For package-specific commands:

```bash
cd api
npm run start:dev
npm run build
npm run start:prod
npm run lint
npm run format
npm run test
```

## Key package files

- `src/main.ts` — Nest application bootstrap
- `src/app.module.ts` — root module
- `src/core/config/env.schema.ts` — Zod environment schema
- `src/core/config/env.validation.ts` — config validation
- `src/infrastructure/prisma/prisma.service.ts` — Prisma client provider
- `prisma/schema.prisma` — database schema
- `prisma/seed.ts` — seed script
- `prisma/migrations/` — migration history

## Environment variables

This package reads configuration from the root `.env` file.

Required values:

- `NODE_ENV` — `development` or `production`
- `PORT` — server port
- `DATABASE_URL` — Postgres connection string
- `JWT_ACCESS_SECRET` — secure JWT access secret
- `JWT_REFRESH_SECRET` — secure JWT refresh secret
- `JWT_ACCESS_TTL_SECONDS` — access token lifetime
- `JWT_REFRESH_TTL_DAYS` — refresh token lifetime
- `CORS_ORIGIN` — allowed frontend origin
- `SWAGGER_PATH` — Swagger UI path

## Notes

- Do not commit `.env`
- Use `.env.example` as the canonical template
- Build the shared package at the root using `npm run build:shared`
