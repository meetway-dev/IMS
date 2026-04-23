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
echo [1/6] Building shared package...
cd shared
call npm install
call npm run build
cd ..

REM 2. Install API dependencies
echo [2/6] Installing API dependencies...
cd api
call npm install

REM 3. Copy env file if missing
echo [3/6] Setting up environment...
if not exist .env (
    copy .env.local.example .env
    echo       >> Edit api\.env with your database credentials!
) else (
    echo       api\.env already exists, skipping...
)

REM 4. Generate Prisma client & sync schema
echo [4/6] Running Prisma generate + db push...
call npx prisma generate
call npx prisma db push

REM 5. Seed the database
echo [5/6] Seeding database...
call npx prisma db seed

cd ..

REM 6. Install frontend dependencies
echo [6/6] Installing frontend dependencies...
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
