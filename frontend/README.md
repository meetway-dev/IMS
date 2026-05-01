# IMS Frontend

Next.js frontend for the Inventory Management System.

## Purpose

This package contains the UI implementation, app router, and frontend integration with the API.

## Local usage

Use the repository root commands for the workspace.

```bash
# from repo root
npm install
cp .env.example .env
npm run dev
```

For package-specific commands:

```bash
cd frontend
npm run dev
npm run build
npm run start
npm run lint
npm run format
npm run type-check
```

## Key package files

- `src/app/` — Next.js App Router pages and layouts
- `src/components/` — shared UI components
- `src/lib/api-client.ts` — Axios instance with auth handling
- `src/lib/query-client.ts` — React Query client config
- `src/hooks/` — custom hooks
- `src/services/` — frontend service layer
- `src/styles/globals.css` — global styles

## Environment variables

This package reads configuration from the root `.env` file.

Required values:

- `NEXT_PUBLIC_API_URL` — backend API base URL
- `NEXT_PUBLIC_APP_URL` — frontend public URL
- `NODE_ENV` — environment

## Notes

- Do not commit `.env`
- Use `.env.example` as the canonical template
- The frontend consumes shared types from the workspace package `@ims/shared`
