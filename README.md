# IMS — Inventory Management System

A full-stack inventory management system with NestJS backend, Next.js frontend, PostgreSQL database, Redis cache, and local development support.

## Quick Start (Local Development)

### 1. Clone the repository

```powershell
git clone <repository-url>
cd ims
```

### 2. Install backend dependencies

```powershell
cd api
npm install
```

### 3. Install frontend dependencies

```powershell
cd ..\frontend
npm install
```

### 3.1 Install and build the shared package

The `shared/` folder contains shared types, constants, and utilities used by the backend and frontend.

```powershell
cd ..\shared
npm install
npm run build
```

### 4. Configure the backend database

Copy the backend example env file and edit it:

```powershell
cd ..\api
copy .env.local.example .env
```

Open `api/.env` and update the database settings for your local PostgreSQL instance.

Example:

```env
DATABASE_URL="postgresql://ims:ims@localhost:5432/ims?schema=public&sslmode=disable"
REDIS_URL=redis://localhost:6379
```

If you use a different password, update `DATABASE_URL` accordingly.

### 5. Run Prisma setup

```powershell
cd api
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

### 6. Start the backend server

```powershell
cd api
npm run start:dev
```

The API will run at `http://localhost:8080`.

### 7. Start the frontend server

```powershell
cd ..\frontend
copy .env.local.example .env.local
npm run dev
```

The frontend will run at `http://localhost:3001`.

## Optional: Start both services with scripts

From the repo root, you can start both servers with:

```powershell
cd C:\Users\LENOVO\Desktop\ims
.\start-ims.ps1
```

Stop them with:

```powershell
.\stop-ims.ps1
```

## Database setup notes

For a local PostgreSQL database, create the database and user, then grant permissions:

```sql
CREATE USER ims WITH PASSWORD 'ims';
CREATE DATABASE ims;
GRANT ALL PRIVILEGES ON DATABASE ims TO ims;
\c ims;
GRANT ALL PRIVILEGES ON SCHEMA public TO ims;
ALTER SCHEMA public OWNER TO ims;
```

If your `ims` user has a different password, update `api/.env` accordingly.

## Project structure

- `api/` — NestJS backend
- `frontend/` — Next.js frontend
- `shared/` — shared types, constants, and utilities
- `docker/` — Docker configuration and nginx files
- `start-ims.ps1`, `stop-ims.ps1` — local start/stop scripts

## Run with Docker (optional)

If you prefer Docker, use:

```powershell
docker compose up -d --build
```

Stop with:

```powershell
docker compose down
```

## Useful URLs

- Frontend: `http://localhost:3001`
- Backend API: `http://localhost:8080`
- Swagger docs: `http://localhost:8080/docs`
"# IMS" 
