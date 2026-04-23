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
Write-Host "[1/6] Building shared package..." -ForegroundColor Yellow
Set-Location shared
npm install
npm run build
Set-Location ..

# 2. Install API dependencies
Write-Host "[2/6] Installing API dependencies..." -ForegroundColor Yellow
Set-Location api
npm install

# 3. Copy env file if missing
if (-not (Test-Path .env)) {
    Write-Host "[3/6] Creating api/.env from .env.local.example..." -ForegroundColor Yellow
    Copy-Item .env.local.example .env
    Write-Host "      >> Edit api/.env with your database credentials before continuing!" -ForegroundColor Red
    Write-Host "      >> Default: postgresql://ims:ims@localhost:5432/ims" -ForegroundColor Gray
} else {
    Write-Host "[3/6] api/.env already exists, skipping..." -ForegroundColor Green
}

# 4. Generate Prisma client & sync schema
Write-Host "[4/6] Running Prisma generate + db push..." -ForegroundColor Yellow
npx prisma generate
npx prisma db push

# 5. Seed the database
Write-Host "[5/6] Seeding database..." -ForegroundColor Yellow
npx prisma db seed

Set-Location ..

# 6. Install frontend dependencies
Write-Host "[6/6] Installing frontend dependencies..." -ForegroundColor Yellow
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
