# IMS — First-Time Setup
# Run this once after cloning the repo
# Usage: .\setup.ps1

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  IMS — First-Time Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Install & build shared package
Write-Host "[1/7] Building shared package..." -ForegroundColor Yellow
Set-Location shared
npm install
npm run build
Set-Location ..

# 2. Install API dependencies
Write-Host "[2/7] Installing API dependencies..." -ForegroundColor Yellow
Set-Location api
npm install

# 3. Copy env file if missing
if (-not (Test-Path .env)) {
    Write-Host "[3/7] Creating api/.env from .env.local.example..." -ForegroundColor Yellow
    Copy-Item .env.local.example .env
    Write-Host "      >> Edit api/.env with your database credentials before continuing!" -ForegroundColor Red
    Write-Host "      >> Default: postgresql://ims:ims@localhost:5432/ims" -ForegroundColor Gray
} else {
    Write-Host "[3/6] api/.env already exists, skipping..." -ForegroundColor Green
}

# 4. Start database container for Prisma operations
Write-Host "[4/7] Starting database container for Prisma operations..." -ForegroundColor Yellow
docker compose up -d db

# 5. Generate Prisma client & sync schema using Docker
Write-Host "[5/7] Running Prisma generate + db push via Docker..." -ForegroundColor Yellow
docker compose run --rm api npx prisma generate
docker compose run --rm api npx prisma db push

# 6. Seed the database using Docker
Write-Host "[6/7] Seeding database via Docker..." -ForegroundColor Yellow
docker compose run --rm api npx prisma db seed

Set-Location ..

# 7. Install frontend dependencies
Write-Host "[7/7] Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend
npm install

if (-not (Test-Path .env.local)) {
    Copy-Item .env.local.example .env.local
    Write-Host "      Created frontend/.env.local" -ForegroundColor Green
} else {
    Write-Host "      frontend/.env.local already exists, skipping..." -ForegroundColor Green
}

Set-Location ..

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Setup complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Start developing with:" -ForegroundColor White
Write-Host "    .\dev.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Or start individually:" -ForegroundColor White
Write-Host "    cd api && npm run start:dev" -ForegroundColor Gray
Write-Host "    cd frontend && npm run dev" -ForegroundColor Gray
Write-Host ""
