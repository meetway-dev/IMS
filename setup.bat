@echo off
REM IMS — First-Time Setup
REM Run this once after cloning the repo
REM Usage: setup.bat

echo.
echo ========================================
echo   IMS — First-Time Setup
echo ========================================
echo.

REM 1. Build shared package
echo [1/7] Building shared package...
cd shared
call npm install
call npm run build
cd ..

REM 2. Install API dependencies
echo [2/7] Installing API dependencies...
cd api
call npm install

REM 3. Copy env file if missing
echo [3/7] Setting up environment...
if not exist .env (
    copy .env.local.example .env
    echo       >> Edit api\.env with your database credentials!
) else (
    echo       api\.env already exists, skipping...
)

REM 4. Start database container for Prisma operations
echo [4/7] Starting database container for Prisma operations...
docker compose up -d db

REM 5. Generate Prisma client & sync schema using Docker
echo [5/7] Running Prisma generate + db push via Docker...
docker compose run --rm api npx prisma generate
docker compose run --rm api npx prisma db push

REM 6. Seed the database using Docker
echo [6/7] Seeding database via Docker...
docker compose run --rm api npx prisma db seed

cd ..

REM 7. Install frontend dependencies
echo [7/7] Installing frontend dependencies...
cd frontend
call npm install

if not exist .env.local (
    copy .env.local.example .env.local
    echo       Created frontend\.env.local
) else (
    echo       frontend\.env.local already exists, skipping...
)

cd ..

echo.
echo ========================================
echo   Setup complete!
echo ========================================
echo.
echo   Start developing with: dev.bat
echo.
